-- ============================================================
-- Supabase Schema for Service Connect Pro
-- Run this in your Supabase dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- ============================================================
-- Core tables
-- ============================================================

create table if not exists service_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  icon text,
  description text,
  color text,
  growth text,
  created_at timestamptz default now()
);

create table if not exists service_providers (
  id uuid primary key default uuid_generate_v4(),
  owner_email text,
  business_name text,
  owner_name text,
  description text,
  category_id uuid references service_categories(id),
  hourly_rate numeric,
  rating numeric default 0,
  review_count integer default 0,
  location text,
  city text,
  is_active boolean default true,
  is_verified boolean default false,
  is_featured boolean default false,
  instant_booking boolean default false,
  avatar_url text,
  portfolio_urls text[],
  tech_stack text[],
  languages text[],
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references service_providers(id),
  name text not null,
  description text,
  price numeric,
  duration integer, -- minutes
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_email text not null,
  provider_id uuid references service_providers(id),
  service_id uuid references services(id),
  status text default 'pending', -- pending, confirmed, in_progress, completed, cancelled
  scheduled_date timestamptz,
  total_amount numeric,
  commission numeric,
  tax_amount numeric,
  tip_amount numeric,
  discount_amount numeric,
  payment_method text,
  notes text,
  address text,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references service_providers(id),
  customer_email text,
  order_id uuid references orders(id),
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_email text not null,
  title text,
  message text,
  type text, -- booking_confirmed, order_update, etc.
  is_read boolean default false,
  channels text[],
  created_at timestamptz default now()
);

create table if not exists wallets (
  id uuid primary key default uuid_generate_v4(),
  customer_email text unique not null,
  balance numeric default 0,
  updated_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid references wallets(id),
  customer_email text,
  amount numeric,
  type text, -- credit, debit
  description text,
  order_id uuid references orders(id),
  created_at timestamptz default now()
);

create table if not exists payouts (
  id uuid primary key default uuid_generate_v4(),
  provider_email text not null,
  amount numeric,
  status text default 'pending', -- pending, approved, paid, rejected
  requested_date timestamptz default now(),
  processed_date timestamptz,
  notes text
);

create table if not exists tax_configs (
  id uuid primary key default uuid_generate_v4(),
  city text not null,
  tax_rate numeric not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists promotions (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_percent numeric,
  discount_amount numeric,
  valid_from timestamptz,
  valid_until timestamptz,
  min_order_value numeric default 0,
  max_uses integer,
  uses_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  customer_email text not null,
  label text,
  address_line text,
  city text,
  country text,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_email text not null,
  referred_email text,
  code text unique,
  status text default 'pending', -- pending, completed
  reward_amount numeric default 0,
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_email text,
  conversation_id text,
  role text, -- user, assistant
  content text,
  context text,
  created_at timestamptz default now()
);

create table if not exists user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'customer',
  phone text,
  created_at timestamptz default now()
);

create table if not exists subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_monthly numeric,
  price_yearly numeric,
  features text[],
  max_services integer,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists provider_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  provider_email text not null,
  plan_id uuid references subscription_plans(id),
  status text default 'active',
  started_at timestamptz default now(),
  expires_at timestamptz
);

-- ============================================================
-- Storage bucket for file uploads
-- ============================================================
-- Run this separately in Supabase dashboard → Storage → New bucket
-- Name: "uploads", Public: true

-- ============================================================
-- Row Level Security (RLS) — basic public read policies
-- Adjust these to your auth requirements
-- ============================================================

alter table service_categories enable row level security;
alter table service_providers enable row level security;
alter table services enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table payouts enable row level security;
alter table tax_configs enable row level security;
alter table promotions enable row level security;
alter table addresses enable row level security;
alter table referrals enable row level security;
alter table chat_messages enable row level security;
alter table user_profiles enable row level security;
alter table subscription_plans enable row level security;
alter table provider_subscriptions enable row level security;

-- Allow public read on reference tables
create policy "Public read service_categories" on service_categories for select using (true);
create policy "Public read service_providers" on service_providers for select using (true);
create policy "Public read services" on services for select using (true);
create policy "Public read reviews" on reviews for select using (true);
create policy "Public read subscription_plans" on subscription_plans for select using (true);
create policy "Public read promotions" on promotions for select using (true);
create policy "Public read tax_configs" on tax_configs for select using (true);

-- Allow authenticated users to insert/update their own data
create policy "Auth insert orders" on orders for insert with check (auth.role() = 'authenticated');
create policy "Auth select own orders" on orders for select using (auth.jwt()->> 'email' = customer_email);
create policy "Auth update own orders" on orders for update using (auth.jwt()->> 'email' = customer_email);

create policy "Auth select own notifications" on notifications for select using (auth.jwt()->> 'email' = recipient_email);
create policy "Auth update own notifications" on notifications for update using (auth.jwt()->> 'email' = recipient_email);

create policy "Auth select own wallet" on wallets for select using (auth.jwt()->> 'email' = customer_email);

create policy "Auth all chat_messages" on chat_messages for all using (auth.role() = 'authenticated');
create policy "Auth all addresses" on addresses for all using (auth.jwt()->> 'email' = customer_email);
create policy "Auth all referrals" on referrals for all using (auth.jwt()->> 'email' = referrer_email);
create policy "Auth all payouts" on payouts for all using (auth.role() = 'authenticated');
create policy "Auth select own provider_subscriptions" on provider_subscriptions for select using (auth.role() = 'authenticated');
create policy "Auth all user_profiles" on user_profiles for all using (auth.role() = 'authenticated');

-- Service providers can manage their own records
create policy "Provider manage own record" on service_providers for all using (auth.jwt()->> 'email' = owner_email);
