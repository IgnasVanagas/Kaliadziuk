-- Security audit fixes (2026-03-09)
-- Fix #7: anonymize_customer_pii must NOT store the previous email in the audit log
-- Fix #6: Re-assert security_invoker on the products view as a safety net

-- ============================================================================
-- Fix #7: Remove PII leakage from anonymize audit log
-- The previous implementation stored the original email in order_events.payload,
-- defeating the purpose of anonymization. Now we only record the anonymization
-- event without any recoverable PII.
-- ============================================================================
create or replace function public.anonymize_customer_pii(p_customer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only admins may anonymize customer data
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;

  if not exists (select 1 from public.customers where id = p_customer_id) then
    return;
  end if;

  update public.customers
    set email = concat('anonymized+', p_customer_id::text, '@example.invalid'),
        phone = null,
        full_name = null,
        marketing_opt_in = false
  where id = p_customer_id;

  -- Log the event WITHOUT the previous email (GDPR: no residual PII)
  insert into public.order_events (order_id, actor_type, actor_user_id, event_type, payload)
  select o.id, 'admin', auth.uid(), 'customer_anonymized', '{}'::jsonb
  from public.orders o
  where o.customer_id = p_customer_id;
end;
$$;

-- ============================================================================
-- Fix #6: Ensure products_active_localized always has security_invoker
-- This is a safety net in case a future migration recreates the view without it.
-- ============================================================================
create or replace view public.products_active_localized
with (security_invoker=true) as
select
  p.id as product_id,
  p.type,
  p.price_cents,
  p.currency,
  p.created_at,
  pt.locale,
  pt.name,
  pt.description,
  pt.metadata
from public.products p
join public.product_translations pt on pt.product_id = p.id
where p.active = true;
