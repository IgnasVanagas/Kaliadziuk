-- Atomic gift card reservation (originally 20260309_100000)
-- Prevents double-spend race condition by using a single serialised operation.

create or replace function public.reserve_gift_card_cents(
  p_gift_card_id uuid,
  p_order_id     uuid,
  p_max_cents    integer
)
returns integer
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_available integer;
  v_reserve   integer;
begin
  -- Lock the gift card row to prevent concurrent reservations.
  perform 1
    from gift_cards
   where id = p_gift_card_id
     and status = 'active'
     and expires_at > now()
   for update;

  if not found then
    return 0;
  end if;

  -- Available = remaining minus active (unexpired) reservations.
  select coalesce(gc.remaining_amount_cents, 0)
         - coalesce((
             select sum(r.amount_cents)
               from gift_card_reservations r
              where r.gift_card_id = p_gift_card_id
                and r.status = 'active'
                and r.expires_at > now()
           ), 0)
    into v_available
    from gift_cards gc
   where gc.id = p_gift_card_id;

  v_reserve := least(greatest(v_available, 0), p_max_cents);

  if v_reserve <= 0 then
    return 0;
  end if;

  insert into gift_card_reservations
         (gift_card_id, order_id, amount_cents, status, expires_at)
  values (p_gift_card_id, p_order_id, v_reserve, 'active',
          now() + interval '30 minutes');

  insert into gift_card_ledger
         (gift_card_id, type, order_id, amount_cents)
  values (p_gift_card_id, 'reserve', p_order_id, -v_reserve);

  return v_reserve;
end;
$$;

-- Security hardening migration (2026-03-10)
-- Fixes: C1 (is_admin volatility), C3 (admin_adjust search_path),
--        C4 (restrict gift card reservation functions to service_role)

-- ============================================================================
-- C1: is_admin() — change from STABLE to VOLATILE and ensure search_path.
-- STABLE can be cached within a single statement/transaction, which means a
-- revoked admin could still pass the check inside the same query that loaded
-- the cached result.  VOLATILE forces a fresh evaluation every call.
-- The ALTER FUNCTION in 20260212 already set search_path but did NOT change
-- volatility, so we must CREATE OR REPLACE the whole function.
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
volatile
security invoker
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid()
  );
$$;

-- ============================================================================
-- C3: admin_adjust_gift_card_balance() — add set search_path = public.
-- This was the only SECURITY DEFINER function missed by the 20260212 migration.
-- ============================================================================
create or replace function public.admin_adjust_gift_card_balance(
  p_gift_card_id uuid,
  p_delta_cents integer
)
returns void
language plpgsql
security definer
set search_path = public
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

-- ============================================================================
-- C4: Restrict gift-card reservation functions to service_role only.
-- These are called exclusively from Edge Functions (which use the service_role
-- key).  Revoking EXECUTE from public/authenticated/anon prevents any direct
-- RPC call from the browser through PostgREST.
-- ============================================================================
revoke execute on function public.release_gift_card_reservation(uuid) from public;
revoke execute on function public.release_gift_card_reservation(uuid) from anon;
revoke execute on function public.release_gift_card_reservation(uuid) from authenticated;
grant  execute on function public.release_gift_card_reservation(uuid) to service_role;

revoke execute on function public.consume_gift_card_reservation(uuid) from public;
revoke execute on function public.consume_gift_card_reservation(uuid) from anon;
revoke execute on function public.consume_gift_card_reservation(uuid) from authenticated;
grant  execute on function public.consume_gift_card_reservation(uuid) to service_role;

revoke execute on function public.reserve_gift_card_cents(uuid, uuid, integer) from public;
revoke execute on function public.reserve_gift_card_cents(uuid, uuid, integer) from anon;
revoke execute on function public.reserve_gift_card_cents(uuid, uuid, integer) from authenticated;
grant  execute on function public.reserve_gift_card_cents(uuid, uuid, integer) to service_role;

-- Also lock down the admin balance adjustment — only admins call it via RPC,
-- but the is_admin() check inside is the real guard.  Keep authenticated so the
-- Admin page can call supabase.rpc('admin_adjust_gift_card_balance', ...).
-- No change needed for admin_adjust_gift_card_balance: already has is_admin() check.

-- ============================================================================
-- Bonus: Deny-all RLS on function_rate_limits.
-- The table already has RLS enabled (init_mvp) but no policies, which means
-- only service_role / SECURITY DEFINER functions can access it.  This is
-- correct by design — adding a comment for auditability.
-- ============================================================================
comment on table public.function_rate_limits is
  'Service-only table for DB-level rate limiting. RLS enabled with no permissive policies (deny-all for authenticated/anon).';
