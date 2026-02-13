-- Fix RLS performance warnings (initplan and multiple permissive policies)
-- Consolidate overlapping policies and ensure stable function calls are optimized.

-- 1. Admin Users: fix initplan
drop policy if exists admin_users_self_select on public.admin_users;
create policy admin_users_self_select
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

-- 2. Customers: fix multiple permissive policies & initplan
drop policy if exists customers_admin_select on public.customers;
drop policy if exists customers_user_select_own on public.customers;

create policy customers_select
on public.customers
for select
to authenticated
using (
  (select public.is_admin())
  or
  lower(email) = (select lower((coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb) ->> 'email'))
);

-- 3. Orders: fix multiple permissive policies & initplan
drop policy if exists orders_admin_select on public.orders;
drop policy if exists orders_user_select_own on public.orders;

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
      and lower(c.email) = (select lower((coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb) ->> 'email'))
  )
);

-- 4. Order Items: fix multiple permissive policies & initplan
drop policy if exists order_items_admin_select on public.order_items;
drop policy if exists order_items_user_select_own on public.order_items;

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
        lower(c.email) = (select lower((coalesce(current_setting('request.jwt.claims', true), '{}')::jsonb) ->> 'email'))
      )
  )
);
