create or replace view public.products_active_localized with (security_invoker=true) as
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
