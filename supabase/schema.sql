-- ============================================================
-- KEMUT.STORE — Supabase schema
-- Run this in Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- 1. PROFILES (extends auth.users) ----------------------------------------
create type user_role as enum ('customer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CATEGORIES -------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 3. PRODUCTS -----------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2),
  stock integer not null default 0 check (stock >= 0),
  category_id uuid references public.categories(id) on delete set null,
  brand text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_active_idx on public.products(is_active);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  alt text
);

-- 4. CART -----------------------------------------------------------------
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- 5. ADDRESSES --------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  line1 text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 6. ORDERS -----------------------------------------------------------------
create type order_status as enum (
  'pending_payment', 'paid', 'processing', 'shipped', 'completed', 'cancelled', 'expired'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  address_id uuid references public.addresses(id) on delete set null,
  shipping_snapshot jsonb not null,
  subtotal numeric(12,2) not null,
  shipping_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  status order_status not null default 'pending_payment',
  midtrans_order_id text unique,
  midtrans_transaction_id text,
  payment_type text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(12,2) not null,
  quantity integer not null,
  line_total numeric(12,2) not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- helper: is current user an admin?
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- PROFILES
create policy "view own profile" on public.profiles for select using (auth.uid() = id or is_admin());
create policy "update own profile" on public.profiles for update using (auth.uid() = id or is_admin());

-- CATEGORIES (public read, admin write)
create policy "categories are public" on public.categories for select using (true);
create policy "admin manages categories" on public.categories for all using (is_admin()) with check (is_admin());

-- PRODUCTS (public read active products, admin manages all)
create policy "active products are public" on public.products for select using (is_active = true or is_admin());
create policy "admin manages products" on public.products for insert with check (is_admin());
create policy "admin updates products" on public.products for update using (is_admin());
create policy "admin deletes products" on public.products for delete using (is_admin());

-- PRODUCT IMAGES
create policy "product images are public" on public.product_images for select using (true);
create policy "admin manages product images" on public.product_images for all using (is_admin()) with check (is_admin());

-- CART (owner only)
create policy "own cart select" on public.cart_items for select using (auth.uid() = user_id);
create policy "own cart insert" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "own cart update" on public.cart_items for update using (auth.uid() = user_id);
create policy "own cart delete" on public.cart_items for delete using (auth.uid() = user_id);

-- ADDRESSES (owner only)
create policy "own addresses select" on public.addresses for select using (auth.uid() = user_id);
create policy "own addresses insert" on public.addresses for insert with check (auth.uid() = user_id);
create policy "own addresses update" on public.addresses for update using (auth.uid() = user_id);
create policy "own addresses delete" on public.addresses for delete using (auth.uid() = user_id);

-- ORDERS (owner can read own, admin can read/update all; inserts happen via server using service role)
create policy "own orders select" on public.orders for select using (auth.uid() = user_id or is_admin());
create policy "admin updates orders" on public.orders for update using (is_admin());

-- ORDER ITEMS
create policy "own order items select" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
);

-- ============================================================
-- SEED: categories
-- ============================================================
insert into public.categories (name, slug) values
  ('Apparel', 'apparel'),
  ('Footwear', 'footwear'),
  ('Accessories', 'accessories'),
  ('Home', 'home')
on conflict do nothing;
