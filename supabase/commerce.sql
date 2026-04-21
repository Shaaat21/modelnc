create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  currency text not null default 'usd' check (char_length(currency) = 3),
  unit_amount integer not null check (unit_amount > 0),
  active boolean not null default true,
  image_url text,
  stripe_price_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0 and quantity <= 10),
  currency text not null check (char_length(currency) = 3),
  amount_subtotal integer not null check (amount_subtotal >= 0),
  amount_total integer not null check (amount_total >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'canceled', 'failed')),
  checkout_session_id text unique,
  payment_intent_id text unique,
  customer_email text,
  product_snapshot jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_idx on public.products(active);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_checkout_session_id_idx on public.orders(checkout_session_id);
create index if not exists orders_payment_intent_id_idx on public.orders(payment_intent_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "active products are public" on public.products;
create policy "active products are public"
on public.products
for select
to anon, authenticated
using (active = true);

drop policy if exists "authenticated users can read own orders" on public.orders;
create policy "authenticated users can read own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

-- No client insert/update/delete policies are intentionally defined for orders.
-- Orders are created and paid only by Supabase Edge Functions with the service role key.

insert into public.products (slug, name, description, currency, unit_amount, active)
values
  ('lady-suit', 'Lady Suit', 'Structured studio suit with a refined formal fit.', 'usd', 15000, true),
  ('studio-look-02', 'Studio Look 02', 'Editorial ready-to-wear piece from the current collection.', 'usd', 12500, true),
  ('studio-look-03', 'Studio Look 03', 'Editorial ready-to-wear piece from the current collection.', 'usd', 12500, true),
  ('studio-look-04', 'Studio Look 04', 'Editorial ready-to-wear piece from the current collection.', 'usd', 12500, true),
  ('studio-look-05', 'Studio Look 05', 'Editorial ready-to-wear piece from the current collection.', 'usd', 12500, true),
  ('studio-look-06', 'Studio Look 06', 'Editorial ready-to-wear piece from the current collection.', 'usd', 12500, true),
  ('studio-look-07', 'Studio Look 07', 'Editorial ready-to-wear piece from the current collection.', 'usd', 12500, true),
  ('studio-look-09', 'Studio Look 09', 'Editorial ready-to-wear piece from the current collection.', 'usd', 12500, true),
  ('studio-look-10', 'Studio Look 10', 'Editorial ready-to-wear piece from the current collection.', 'usd', 12500, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  currency = excluded.currency,
  unit_amount = excluded.unit_amount,
  active = excluded.active;
