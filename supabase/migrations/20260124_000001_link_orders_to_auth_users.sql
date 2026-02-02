-- Link paid purchases to authenticated Supabase users.

alter table public.orders
  add column if not exists auth_user_id uuid null references auth.users(id) on delete set null;

create index if not exists orders_auth_user_id_idx on public.orders (auth_user_id);

-- Allow authenticated users to read their own orders.
drop policy if exists orders_user_select_own on public.orders;
create policy orders_user_select_own
on public.orders
for select
to authenticated
using (auth_user_id = auth.uid());

-- Allow authenticated users to read items belonging to their orders.
drop policy if exists order_items_user_select_own on public.order_items;
create policy order_items_user_select_own
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.auth_user_id = auth.uid()
  )
);
