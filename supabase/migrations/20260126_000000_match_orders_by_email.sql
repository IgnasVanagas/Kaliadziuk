-- Allow authenticated users to see their own customer data based on email matching.
-- This is necessary for the orders policy to work (since it joins/checks customers).
create policy customers_user_select_own
on public.customers
for select
to authenticated
using (
  lower(email) = lower((select coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb) ->> 'email')
);

-- Update orders policy to allow access if auth_user_id matches OR if customer email matches.
drop policy if exists orders_user_select_own on public.orders;
create policy orders_user_select_own
on public.orders
for select
to authenticated
using (
  auth_user_id = auth.uid()
  or
  exists (
    select 1 from public.customers c
    where c.id = orders.customer_id
      and lower(c.email) = lower((select coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb) ->> 'email')
  )
);

-- Update order_items policy to match orders access.
drop policy if exists order_items_user_select_own on public.order_items;
create policy order_items_user_select_own
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    join public.customers c on o.customer_id = c.id
    where o.id = order_items.order_id
      and (
        o.auth_user_id = auth.uid()
        or
        lower(c.email) = lower((select coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb) ->> 'email')
      )
  )
);
