-- Security hardening migration (2026-03-08)
-- Fixes: atomic rate limiting, anonymize_customer_pii admin check, questionnaire RLS

-- ============================================================================
-- Fix #3: Atomic rate limiter (replaces TOCTOU-vulnerable SELECT+UPDATE pattern)
-- ============================================================================
create or replace function public.check_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  -- Atomic upsert with row-level lock
  insert into public.function_rate_limits (key, window_started_at, count)
  values (p_key, v_window_start, 1)
  on conflict (key) do update
    set
      count = case
        when function_rate_limits.window_started_at = v_window_start
          then function_rate_limits.count + 1
        else 1
      end,
      window_started_at = v_window_start
  returning count into v_count;

  return v_count <= p_limit;
end;
$$;

-- ============================================================================
-- Fix #11: Add admin check to anonymize_customer_pii
-- ============================================================================
create or replace function public.anonymize_customer_pii(p_customer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  -- Only admins may anonymize customer data
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

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

-- ============================================================================
-- Fix #13: Tighten questionnaire_submissions RLS — remove anon/public INSERT
-- Inserts go through the edge function (service_role) which bypasses RLS.
-- ============================================================================
drop policy if exists "Anyone can insert questionnaire_submissions" on public.questionnaire_submissions;

-- Admin read access for the dashboard
create policy "Admin can read questionnaire_submissions"
  on public.questionnaire_submissions
  for select
  to authenticated
  using (public.is_admin());
