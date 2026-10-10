-- Run this migration in Supabase Dashboard → SQL Editor.
-- Admin access is granted to authenticated users. Disable public sign-ups and
-- create the store administrator manually in Authentication → Users.

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text not null check (char_length(trim(description)) between 1 and 2000),
  price numeric(12, 2) check (price is null or price >= 0),
  image text not null default '/frames/desktop/064.webp',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Preserve the two products already in the local JSON catalog when setting up
-- this Supabase project for the first time.
insert into public.products (id, name, description, price, image, created_at, updated_at)
values
  ('295cbb39-4b71-4a8a-9fd9-afaf82b35e64', 'Earrings', 'Sutiable for Functions', 40000, 'https://i.etsystatic.com/18244334/r/il/333883/5880079504/il_1080xN.5880079504_6p9z.jpg', '2026-10-10T11:20:53.559Z', '2026-10-10T11:20:53.559Z'),
  ('verde-necklace', 'The Verdé Necklace', 'A rose-gold necklace set with pale green and clear stones, presented with matching drop earrings.', null, '/frames/desktop/064.webp', '2026-10-10T00:00:00.000Z', '2026-10-10T00:00:00.000Z')
on conflict (id) do nothing;

create table if not exists public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  email text not null check (char_length(trim(email)) between 3 and 254),
  subject text not null check (char_length(trim(subject)) between 1 and 180),
  message text not null check (char_length(trim(message)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.contact_enquiries enable row level security;

drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products" on public.products
  for select to anon, authenticated using (true);

drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products" on public.products
  for insert to authenticated with check (true);

drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products" on public.products
  for update to authenticated using (true) with check (true);

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
  for delete to authenticated using (true);

drop policy if exists "Visitors can submit enquiries" on public.contact_enquiries;
create policy "Visitors can submit enquiries" on public.contact_enquiries
  for insert to anon, authenticated with check (true);

drop policy if exists "Admins can view enquiries" on public.contact_enquiries;
create policy "Admins can view enquiries" on public.contact_enquiries
  for select to authenticated using (true);

drop policy if exists "Admins can add enquiries" on public.contact_enquiries;
create policy "Admins can add enquiries" on public.contact_enquiries
  for insert to authenticated with check (true);

drop policy if exists "Admins can edit enquiries" on public.contact_enquiries;
create policy "Admins can edit enquiries" on public.contact_enquiries
  for update to authenticated using (true) with check (true);

drop policy if exists "Admins can delete enquiries" on public.contact_enquiries;
create policy "Admins can delete enquiries" on public.contact_enquiries
  for delete to authenticated using (true);

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert on public.contact_enquiries to anon;
grant select, insert, update, delete on public.contact_enquiries to authenticated;
