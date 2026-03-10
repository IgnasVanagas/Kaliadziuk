-- Security hardening phase 2 (2026-03-11)
-- Fixes: C3 (JWT email null-safety), C4 (integer overflow), H6 (missing indexes),
-- H10 (email format validation), H11 (JSONB payload size limits), H12 (GDPR export)

-- ---------------------------------------------------------------------------
-- C4: Widen gift-card amount columns from integer to bigint (prevents overflow)
-- ---------------------------------------------------------------------------
alter table public.gift_cards
  alter column initial_amount_cents type bigint,
  alter column remaining_amount_cents type bigint;

alter table public.gift_card_ledger
  alter column amount_cents type bigint;

alter table public.gift_card_reservations
  alter column amount_cents type bigint;

-- ---------------------------------------------------------------------------
-- H6: Add missing composite index on gift_card_reservations for reservation queries
-- ---------------------------------------------------------------------------
create index if not exists idx_gift_card_reservations_lookup
  on public.gift_card_reservations (gift_card_id, status, expires_at);

-- Also add a functional index for case-insensitive email lookup on customers
create index if not exists idx_customers_email_lower
  on public.customers (lower(email));

-- ---------------------------------------------------------------------------
-- H10: Add email format CHECK constraint on customers table
-- NOT VALID: skip validation of existing rows (some legacy data may not match).
-- New inserts/updates will be enforced immediately.
-- ---------------------------------------------------------------------------
alter table public.customers
  add constraint customers_email_format
  check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$')
  not valid;

-- ---------------------------------------------------------------------------
-- H11: Add JSONB payload size limits via CHECK constraints
-- ---------------------------------------------------------------------------
alter table public.order_events
  add constraint order_events_payload_size
  check (octet_length(payload::text) <= 65536);

alter table public.questionnaire_submissions
  add constraint questionnaire_submissions_payload_size
  check (octet_length(payload::text) <= 32768);

-- ---------------------------------------------------------------------------
-- C3: Fix JWT email null-safety in RLS policies
-- Wrap email extraction with COALESCE to guarantee empty string on NULL
-- ---------------------------------------------------------------------------

-- Helper: immutable function to safely extract email from JWT claims (avoids
-- repeated inline expressions and centralises NULL handling).
create or replace function public.jwt_email()
returns text
language sql
stable
set search_path = public
as $$
  select coalesce(
    lower(
      (coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb) ->> 'email'
    ),
    ''
  );
$$;

-- Recreate the RLS policies that use JWT email with null-safe version

-- Customers
drop policy if exists customers_select on public.customers;
create policy customers_select
on public.customers
for select
to authenticated
using (
  (select public.is_admin())
  or
  lower(email) = (select public.jwt_email())
);

-- Orders
drop policy if exists orders_select on public.orders;
create policy orders_select
on public.orders
for select
to authenticated
using (
  (select public.is_admin())
  or
  auth_user_id = (select auth.uid())
  or
  exists (
    select 1 from public.customers c
    where c.id = orders.customer_id
      and lower(c.email) = (select public.jwt_email())
  )
);

-- Order Items
drop policy if exists order_items_select on public.order_items;
create policy order_items_select
on public.order_items
for select
to authenticated
using (
  (select public.is_admin())
  or
  exists (
    select 1
    from public.orders o
    join public.customers c on o.customer_id = c.id
    where o.id = order_items.order_id
      and (
        o.auth_user_id = (select auth.uid())
        or
        lower(c.email) = (select public.jwt_email())
      )
  )
);

-- ---------------------------------------------------------------------------
-- H12: GDPR data export function (Art. 15 — right of access)
-- ---------------------------------------------------------------------------
create or replace function public.export_customer_data(p_customer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  cust_row record;
begin
  -- Only admins may export customer data
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  select id, email, phone, full_name, marketing_opt_in, locale,
         terms_accepted_at, privacy_accepted_at, created_at
  into cust_row
  from public.customers
  where id = p_customer_id;

  if not found then
    raise exception 'customer_not_found';
  end if;

  result := jsonb_build_object(
    'customer', to_jsonb(cust_row),
    'orders', coalesce((
      select jsonb_agg(to_jsonb(o) order by o.created_at desc)
      from public.orders o
      where o.customer_id = p_customer_id
    ), '[]'::jsonb),
    'order_items', coalesce((
      select jsonb_agg(to_jsonb(oi) order by oi.id)
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where o.customer_id = p_customer_id
    ), '[]'::jsonb),
    'gift_cards_purchased', coalesce((
      select jsonb_agg(to_jsonb(gc) order by gc.created_at desc)
      from public.gift_cards gc
      join public.orders o on o.id = gc.purchased_order_id
      where o.customer_id = p_customer_id
    ), '[]'::jsonb),
    'questionnaire_submissions', coalesce((
      select jsonb_agg(to_jsonb(qs) order by qs.created_at desc)
      from public.questionnaire_submissions qs
      where qs.email = cust_row.email
    ), '[]'::jsonb),
    'exported_at', now()
  );

  return result;
end;
$$;

-- Restrict to service_role and authenticated (admin check is in the function body)
revoke execute on function public.export_customer_data(uuid) from public, anon;
grant execute on function public.export_customer_data(uuid) to authenticated, service_role;
