-- MVP schema for plans + orders + gift cards + Stripe idempotency.

create extension if not exists pgcrypto;

-- Admin users (must exist before helper functions)
create table if not exists public.admin_users (
  user_id uuid primary key,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('plan','service','gift_card')),
  active boolean not null default true,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR',
  stripe_product_id text null,
  stripe_price_id text null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_translations (
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null check (locale in ('lt','en')),
  name text not null,
  description text null,
  primary key (product_id, locale)
);

-- Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text null,
  full_name text null,
  locale text not null check (locale in ('lt','en')),
  marketing_opt_in boolean not null default false,
  terms_accepted_at timestamptz null,
  privacy_accepted_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (email)
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null check (status in ('pending','paid','failed','expired','refunded','disputed')),
  fulfillment_status text not null default 'needs_contact' check (fulfillment_status in ('needs_contact','contacted','in_progress','delivered')),
  internal_notes text null,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'EUR',
  locale text not null check (locale in ('lt','en')),
  stripe_checkout_session_id text unique null,
  stripe_payment_intent_id text unique null,
  stripe_customer_id text null,
  created_at timestamptz not null default now(),
  paid_at timestamptz null
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid null references public.products(id) on delete set null,
  kind text not null default 'product' check (kind in ('product','gift_card')),
  name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  qty integer not null default 1 check (qty > 0),
  meta jsonb not null default '{}'::jsonb
);

-- Gift cards
create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  initial_amount_cents integer not null check (initial_amount_cents >= 0),
  remaining_amount_cents integer not null check (remaining_amount_cents >= 0),
  currency text not null default 'EUR',
  status text not null check (status in ('active','disabled','expired','depleted')),
  purchased_order_id uuid null references public.orders(id) on delete restrict,
  recipient_name text null,
  recipient_email text null,
  buyer_name text null,
  buyer_email text null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.gift_card_ledger (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.gift_cards(id) on delete cascade,
  type text not null check (type in ('issue','reserve','release','redeem','manual_adjust')),
  order_id uuid null references public.orders(id) on delete set null,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.gift_card_reservations (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.gift_cards(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  status text not null check (status in ('active','released','consumed')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (order_id)
);

-- Stripe webhook idempotency
create table if not exists public.stripe_events (
  event_id text primary key,
  type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz null,
  status text not null default 'received' check (status in ('received','processed','failed')),
  last_error text null
);

-- Audit
create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor_type text not null check (actor_type in ('system','admin')),
  actor_user_id uuid null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  locale text not null check (locale in ('lt','en')),
  related_order_id uuid null references public.orders(id) on delete set null,
  provider_message_id text null,
  status text not null check (status in ('sent','failed')),
  created_at timestamptz not null default now()
);

-- GDPR MVP: anonymize customer PII on request (admin-only via application / service role)
create or replace function public.anonymize_customer_pii(p_customer_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_email text;
begin
  select email into v_email from public.customers where id = p_customer_id;
  if not found then
    return;
  end if;

  update public.customers
    set email = concat('anonymized+', p_customer_id::text, '@example.invalid'),
        phone = null,
        full_name = null,
        marketing_opt_in = false
  where id = p_customer_id;

  insert into public.order_events (order_id, actor_type, actor_user_id, event_type, payload)
  select o.id, 'admin', auth.uid(), 'customer_anonymized', jsonb_build_object('previous_email', v_email)
  from public.orders o
  where o.customer_id = p_customer_id;
end;
$$;

-- Simple DB-based rate limiting (IP key)
create table if not exists public.function_rate_limits (
  key text primary key,
  window_started_at timestamptz not null,
  count integer not null
);

-- Public-facing view for products localized
create or replace view public.products_active_localized as
select
  p.id as product_id,
  p.type,
  p.price_cents,
  p.currency,
  p.created_at,
  pt.locale,
  pt.name,
  pt.description
from public.products p
join public.product_translations pt on pt.product_id = p.id
where p.active = true;

-- Gift card helpers
create or replace function public.gift_card_available_cents(p_gift_card_id uuid)
returns integer
language sql
stable
as $$
  select
    greatest(
      gc.remaining_amount_cents
      - coalesce((select sum(r.amount_cents) from public.gift_card_reservations r where r.gift_card_id = gc.id and r.status = 'active' and r.expires_at > now()), 0),
      0
    )
  from public.gift_cards gc
  where gc.id = p_gift_card_id;
$$;

create or replace function public.release_gift_card_reservation(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  r public.gift_card_reservations%rowtype;
begin
  select * into r from public.gift_card_reservations where order_id = p_order_id and status = 'active' for update;
  if not found then
    return;
  end if;

  update public.gift_card_reservations
    set status = 'released'
  where id = r.id;

  insert into public.gift_card_ledger (gift_card_id, type, order_id, amount_cents)
  values (r.gift_card_id, 'release', r.order_id, r.amount_cents);
end;
$$;

create or replace function public.consume_gift_card_reservation(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  r public.gift_card_reservations%rowtype;
  other_reserved integer;
begin
  select * into r from public.gift_card_reservations where order_id = p_order_id and status = 'active' for update;
  if not found then
    return;
  end if;

  select coalesce(sum(amount_cents), 0)
    into other_reserved
  from public.gift_card_reservations
  where gift_card_id = r.gift_card_id
    and status = 'active'
    and expires_at > now()
    and id <> r.id;

  -- Ensure remaining covers this reservation plus other active reservations.
  if (select remaining_amount_cents from public.gift_cards where id = r.gift_card_id) < (r.amount_cents + other_reserved) then
    raise exception 'Gift card insufficient available balance';
  end if;

  update public.gift_card_reservations
    set status = 'consumed'
  where id = r.id;

  update public.gift_cards
    set remaining_amount_cents = remaining_amount_cents - r.amount_cents,
        status = case
          when remaining_amount_cents - r.amount_cents <= 0 then 'depleted'
          else status
        end
  where id = r.gift_card_id;

  insert into public.gift_card_ledger (gift_card_id, type, order_id, amount_cents)
  values (r.gift_card_id, 'redeem', r.order_id, -r.amount_cents);
end;
$$;

-- Admin: manual gift card balance adjustment with ledger entry
create or replace function public.admin_adjust_gift_card_balance(p_gift_card_id uuid, p_delta_cents integer)
returns void
language plpgsql
security definer
as $$
declare
  v_prev integer;
  v_next integer;
  v_status text;
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  select remaining_amount_cents, status into v_prev, v_status
  from public.gift_cards
  where id = p_gift_card_id
  for update;

  if not found then
    raise exception 'gift_card_not_found';
  end if;

  v_next := greatest(v_prev + coalesce(p_delta_cents, 0), 0);

  update public.gift_cards
    set remaining_amount_cents = v_next,
        status = case
          when v_next <= 0 then 'depleted'
          when status = 'depleted' then 'active'
          else status
        end
  where id = p_gift_card_id;

  insert into public.gift_card_ledger (gift_card_id, type, order_id, amount_cents)
  values (p_gift_card_id, 'manual_adjust', null, coalesce(p_delta_cents, 0));
end;
$$;

-- RLS
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;
alter table public.gift_cards enable row level security;
alter table public.gift_card_ledger enable row level security;
alter table public.gift_card_reservations enable row level security;
alter table public.stripe_events enable row level security;
alter table public.order_events enable row level security;
alter table public.email_log enable row level security;
alter table public.function_rate_limits enable row level security;

-- Public: read active products + translations
create policy products_public_select_active
on public.products
for select
to anon, authenticated
using (active = true);

create policy product_translations_public_select
on public.product_translations
for select
to anon, authenticated
using (
  exists (select 1 from public.products p where p.id = product_translations.product_id and p.active = true)
);

-- Admin-only: everything else (reads)
create policy customers_admin_select
on public.customers
for select
to authenticated
using (public.is_admin());

create policy orders_admin_select
on public.orders
for select
to authenticated
using (public.is_admin());

create policy order_items_admin_select
on public.order_items
for select
to authenticated
using (public.is_admin());

create policy gift_cards_admin_select
on public.gift_cards
for select
to authenticated
using (public.is_admin());

create policy gift_card_ledger_admin_select
on public.gift_card_ledger
for select
to authenticated
using (public.is_admin());

create policy gift_card_reservations_admin_select
on public.gift_card_reservations
for select
to authenticated
using (public.is_admin());

create policy stripe_events_admin_select
on public.stripe_events
for select
to authenticated
using (public.is_admin());

create policy order_events_admin_select
on public.order_events
for select
to authenticated
using (public.is_admin());

create policy email_log_admin_select
on public.email_log
for select
to authenticated
using (public.is_admin());

-- IMPORTANT: do NOT use public.is_admin() in admin_users policies.
-- is_admin() checks admin_users; if a policy on admin_users calls is_admin(), it recurses and can throw
-- "stack depth limit exceeded" when calling rpc('is_admin').
-- We only need users to be able to read their own row for the admin check.
drop policy if exists admin_users_admin_select on public.admin_users;
create policy admin_users_self_select
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

-- Admin updates (fulfillment + internal notes, gift card status)
create policy orders_admin_update
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy gift_cards_admin_update
on public.gift_cards
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- function_rate_limits is service-only in practice (no policies on purpose)

-- Seed products (MVP)
insert into public.products (id, type, active, price_cents, currency)
values
  ('11111111-1111-1111-1111-111111111111', 'plan', true, 10000, 'EUR'),
  ('22222222-2222-2222-2222-222222222222', 'plan', true, 10000, 'EUR'),
  ('33333333-3333-3333-3333-333333333333', 'plan', true, 10000, 'EUR'),
  ('44444444-4444-4444-4444-444444444444', 'plan', true, 10000, 'EUR')
on conflict do nothing;

insert into public.product_translations (product_id, locale, name, description)
values
  ('11111111-1111-1111-1111-111111111111', 'lt', 'Svorio metimo planas', 'Treniruočių ir mitybos planas.'),
  ('11111111-1111-1111-1111-111111111111', 'en', 'Weight loss plan', 'Training and nutrition plan.'),
  ('22222222-2222-2222-2222-222222222222', 'lt', 'Raumenų auginimo planas', 'Treniruočių ir mitybos planas.'),
  ('22222222-2222-2222-2222-222222222222', 'en', 'Muscle gain plan', 'Training and nutrition plan.'),
  ('33333333-3333-3333-3333-333333333333', 'lt', 'Namų treniruotės planas', 'Treniruočių ir mitybos planas.'),
  ('33333333-3333-3333-3333-333333333333', 'en', 'Home training plan', 'Training and nutrition plan.'),
  ('44444444-4444-4444-4444-444444444444', 'lt', 'Mobilumo lavinimo planas', 'Treniruočių ir mitybos planas.'),
  ('44444444-4444-4444-4444-444444444444', 'en', 'Mobility plan', 'Training and nutrition plan.')
on conflict do nothing;
