-- ============================================================
-- KEMUT.STORE — Marketplace migration (multi-seller)
-- Run this AFTER supabase/schema.sql, in the SQL Editor.
-- ============================================================

-- 1. Extend role enum with 'seller'
alter type user_role add value if not exists 'seller';

-- 2. SELLERS table -----------------------------------------------------
create type seller_status as enum ('pending', 'approved', 'rejected', 'suspended');

create table public.sellers (
  id uuid primary key references public.profiles(id) on delete cascade,
  store_name text not null,
  store_slug text not null unique,
  description text,
  phone text,
  status seller_status not null default 'pending',
  rejection_reason text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index sellers_status_idx on public.sellers(status);

-- 3. Link products to a seller -----------------------------------------
alter table public.products
  add column seller_id uuid references public.sellers(id) on delete cascade;

create index products_seller_idx on public.products(seller_id);

-- 4. Link order_items to a seller (so sellers can see their own sales) --
alter table public.order_items
  add column seller_id uuid references public.sellers(id) on delete set null;

create index order_items_seller_idx on public.order_items(seller_id);

-- ============================================================
-- ROW LEVEL SECURITY UPDATES
-- ============================================================
alter table public.sellers enable row level security;

-- helper: is current user an approved seller, returns their seller_id (or null)
create function public.current_seller_id()
returns uuid as $$
  select id from public.sellers where id = auth.uid() and status = 'approved';
$$ language sql stable security definer;

-- SELLERS policies
create policy "view own seller profile" on public.sellers
  for select using (auth.uid() = id or is_admin());
create policy "approved sellers are publicly visible" on public.sellers
  for select using (status = 'approved');
create policy "user can apply as seller" on public.sellers
  for insert with check (auth.uid() = id);
create policy "seller updates own store info" on public.sellers
  for update using (auth.uid() = id and status = 'approved')
  with check (auth.uid() = id);
create policy "admin manages sellers" on public.sellers
  for update using (is_admin());

-- Replace PRODUCTS policies so sellers can manage their own products
drop policy if exists "admin manages products" on public.products;
drop policy if exists "admin updates products" on public.products;
drop policy if exists "admin deletes products" on public.products;

create policy "seller or admin creates products" on public.products
  for insert with check (
    is_admin() or seller_id = public.current_seller_id()
  );
create policy "seller or admin updates own products" on public.products
  for update using (
    is_admin() or seller_id = public.current_seller_id()
  );
create policy "seller or admin deletes own products" on public.products
  for delete using (
    is_admin() or seller_id = public.current_seller_id()
  );

-- Replace PRODUCT IMAGES policy similarly
drop policy if exists "admin manages product images" on public.product_images;
create policy "seller or admin manages product images" on public.product_images
  for all using (
    is_admin() or exists (
      select 1 from public.products p
      where p.id = product_id and p.seller_id = public.current_seller_id()
    )
  )
  with check (
    is_admin() or exists (
      select 1 from public.products p
      where p.id = product_id and p.seller_id = public.current_seller_id()
    )
  );

-- ORDER ITEMS: allow sellers to see line items belonging to their store
create policy "seller views own sales" on public.order_items
  for select using (seller_id = public.current_seller_id());
