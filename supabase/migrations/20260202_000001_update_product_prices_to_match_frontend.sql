-- Align product prices with intended frontend pricing.
-- Note: prices live on public.products (shared across locales).

begin;

update public.products set price_cents = 20000
where id = '11111111-1111-1111-1111-111111111111'::uuid;

update public.products set price_cents = 20000
where id = '22222222-2222-2222-2222-222222222222'::uuid;

update public.products set price_cents = 15000
where id = '33333333-3333-3333-3333-333333333333'::uuid;

update public.products set price_cents = 10000
where id = '44444444-4444-4444-4444-444444444444'::uuid;

commit;
