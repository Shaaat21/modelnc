create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id text not null,
  product_id text not null,
  name text not null,
  price numeric(10, 2) not null,
  description text,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "public read cart items"
on public.cart_items
for select
to anon
using (true);

create policy "public insert cart items"
on public.cart_items
for insert
to anon
with check (true);

create policy "public update cart items"
on public.cart_items
for update
to anon
using (true)
with check (true);

create policy "public delete cart items"
on public.cart_items
for delete
to anon
using (true);
