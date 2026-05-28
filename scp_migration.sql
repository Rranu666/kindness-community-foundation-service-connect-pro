-- ================================================================
-- Service Connect Pro — Full Database Migration
-- Run this in your new Supabase project → SQL Editor
-- ================================================================


-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── service_categories ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  icon text,
  description text,
  color text,
  growth text,
  sort_order integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ── service_providers ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_email text,
  business_name text,
  owner_name text,
  description text,
  category_id uuid REFERENCES service_categories(id),
  hourly_rate numeric,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  location text,
  city text,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  instant_booking boolean DEFAULT false,
  avatar_url text,
  portfolio_urls text[],
  tech_stack text[],
  languages text[],
  availability text,
  experience_years integer,
  phone text,
  working_days text[],
  documents jsonb,
  total_reviews integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── services ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric,
  price_type text DEFAULT 'fixed',
  duration integer,
  duration_minutes integer,
  is_active boolean DEFAULT true,
  is_instant_booking boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  images text[],
  faqs jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── orders ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email text NOT NULL,
  provider_id uuid REFERENCES service_providers(id),
  service_id uuid REFERENCES services(id),
  status text DEFAULT 'pending',
  scheduled_date timestamptz,
  scheduled_time text,
  total_amount numeric,
  subtotal numeric,
  commission numeric,
  commission_rate numeric,
  commission_amount numeric,
  tax_amount numeric,
  tax_rate numeric,
  tip_amount numeric,
  discount_amount numeric,
  payment_method text,
  notes text,
  address text,
  order_number text,
  customer_name text,
  customer_phone text,
  service_name text,
  provider_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── reviews ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES service_providers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id),
  customer_email text,
  customer_name text,
  rating integer,
  comment text,
  created_at timestamptz DEFAULT now()
);

-- ── notifications ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email text NOT NULL,
  recipient_type text,
  title text,
  message text,
  type text,
  is_read boolean DEFAULT false,
  channels text[],
  order_id uuid,
  created_at timestamptz DEFAULT now()
);

-- ── subscription_plans ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  price numeric,
  price_monthly numeric,
  price_yearly numeric,
  features text[],
  max_services integer,
  commission_rate numeric,
  sort_order integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ── subscriptions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text NOT NULL,
  plan_name text,
  amount numeric,
  frequency text,
  status text DEFAULT 'active',
  next_payment_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── provider_subscriptions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS provider_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_email text NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id),
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  renewal_date timestamptz,
  auto_renew boolean DEFAULT true,
  payment_method text
);

-- ── payouts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_email text NOT NULL,
  provider_id uuid REFERENCES service_providers(id),
  amount numeric,
  status text DEFAULT 'pending',
  requested_date timestamptz DEFAULT now(),
  processed_date timestamptz,
  bank_name text,
  bank_account text,
  notes text
);

-- ── wallets ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email text NOT NULL,
  balance numeric DEFAULT 0,
  total_added numeric DEFAULT 0,
  total_spent numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- ── transactions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id uuid REFERENCES wallets(id),
  customer_email text,
  amount numeric,
  type text,
  description text,
  payment_method text,
  order_id uuid REFERENCES orders(id),
  created_at timestamptz DEFAULT now()
);

-- ── referrals ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_email text NOT NULL,
  referred_email text,
  code text,
  status text DEFAULT 'pending',
  reward_amount numeric,
  reward_type text,
  referred_type text,
  completion_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ── promotions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL,
  discount_percent numeric,
  discount_amount numeric,
  valid_from timestamptz,
  valid_until timestamptz,
  min_order_value numeric,
  max_uses integer,
  uses_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ── analytics ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type text NOT NULL,
  metric_value text,
  metric_date date,
  user_id uuid,
  user_email text,
  created_at timestamptz DEFAULT now()
);

-- ── seo_settings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path text NOT NULL,
  page_name text,
  meta_title text,
  meta_description text,
  og_title text,
  og_description text,
  og_image text,
  keywords text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── site_settings ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  setting_type text,
  description text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── site_content ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path text NOT NULL,
  section_key text NOT NULL,
  language text DEFAULT 'en',
  content_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  full_name text,
  role text DEFAULT 'user',
  avatar_url text,
  bio text,
  phone text,
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── user_profiles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user',
  phone text,
  preferred_language text DEFAULT 'en',
  saved_providers uuid[],
  created_at timestamptz DEFAULT now()
);

-- ── chat_messages ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email text,
  sender_email text,
  sender_type text,
  conversation_id text,
  role text,
  content text,
  message text,
  context text,
  is_read boolean DEFAULT false,
  order_id uuid,
  created_at timestamptz DEFAULT now()
);

-- ── chat_groups ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  icon_emoji text,
  description text,
  created_by_email text,
  created_at timestamptz DEFAULT now()
);

-- ── user_badges ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  badge_key text NOT NULL,
  badge_name text,
  badge_emoji text,
  earned_at timestamptz DEFAULT now()
);

-- ── addresses ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email text NOT NULL,
  label text,
  address_line text,
  street text,
  city text,
  country text,
  postal_code text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- ROW LEVEL SECURITY (allow all for now — tighten per your auth)
-- ================================================================

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON service_categories FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON service_providers FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON services FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON orders FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON reviews FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON notifications FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON subscription_plans FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE provider_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON provider_subscriptions FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON payouts FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON wallets FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON transactions FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON referrals FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON promotions FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON analytics FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON seo_settings FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON site_settings FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON site_content FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON users FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE chat_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON chat_groups FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON user_badges FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_access" ON addresses FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- DATA MIGRATION
-- ================================================================


-- service_categories (10 rows)
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('01c8aab0-6079-49df-8e35-97b54676ecc2', 'AI & Automation', 'ü§ñ', 'AI tools, chatbots, workflow automation', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 1, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('a9891396-e92c-475c-af21-851f22c15943', 'Plumbing', 'üîß', 'Pipe repairs, installations, leak fixing', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 2, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('3664ef98-08f7-4228-b2cb-60f329f02912', 'Electrical', '‚ö°', 'Wiring, repairs, installations', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 3, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('8031584d-ead5-4da2-a570-de07368caf47', 'Cleaning', 'üßπ', 'Home and office cleaning services', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 4, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('8a1ded1a-9ea9-43f1-89f7-dbabe4b82473', 'Catering', 'üçΩÔ∏è', 'Event catering and meal preparation', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 5, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('59de2876-d8e4-4fa9-9cd9-f9783d0f85cf', 'Data Science', 'üìä', 'Data analysis, ML models, dashboards', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 6, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('8eef7b31-d839-428d-af2e-15b6401177c4', 'Web Development', 'üíª', 'Websites, apps, and web services', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 7, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('7a0fdb96-1e94-4492-b1b2-9c33508dbd9b', 'Tutoring', 'üìö', 'Academic tutoring and skill coaching', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 8, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('885963a8-d06d-49a4-ae49-d84a3f6a88f5', 'Moving & Delivery', 'üöö', 'Moving, packing, and delivery services', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 9, true) ON CONFLICT (id) DO NOTHING;
INSERT INTO service_categories ("id", "name", "icon", "description", "color", "growth", "created_at", "sort_order", "is_active") VALUES ('b4fd5643-69ec-4721-b94d-b21bcd9b1da6', 'Photography', 'üì∑', 'Events, portraits, commercial photography', NULL, NULL, '2026-03-13T01:32:50.927743+00:00', 10, true) ON CONFLICT (id) DO NOTHING;

-- service_providers (21 rows)
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('d6a24cf7-c047-4031-9320-12f7cb3f89f1', 'james@eliteai.us', 'Elite AI Solutions', 'James Carter', 'Top-rated AI automation expert specializing in business process automation, LLM integration, and custom AI pipelines.', '01c8aab0-6079-49df-8e35-97b54676ecc2', 120, 4.9, 0, 'New York, NY', 'New York', true, true, true, false, 'https://randomuser.me/api/portraits/men/32.jpg', NULL, NULL, NULL, '2026-04-17T09:05:22.67582+00:00', NULL, 87, 42, 'available', 8, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri"], '{}'::jsonb, '2026-04-17T09:05:22.67582+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('e1153f08-c804-48ae-8cb0-ae3f5569b2c4', 'maria@sparkleclean.us', 'Sparkle Clean Co.', 'Maria Gonzalez', 'Professional residential and commercial cleaning services across Greater LA. Eco-friendly products only.', '8031584d-ead5-4da2-a570-de07368caf47', 55, 4.8, 0, 'Los Angeles, CA', 'Los Angeles', true, true, false, false, 'https://randomuser.me/api/portraits/women/44.jpg', NULL, NULL, NULL, '2026-04-17T09:05:23.039231+00:00', NULL, 132, 78, 'available', 6, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat"], '{}'::jsonb, '2026-04-17T09:05:23.039231+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('c19bcc7d-e270-4695-9509-a9643de12dcc', 'matt@yopmail.com', 'Test M', 'Matt', '', '3664ef98-08f7-4228-b2cb-60f329f02912', NULL, 0, 0, '', NULL, true, true, false, false, NULL, NULL, NULL, NULL, '2026-03-13T01:47:35.223673+00:00', NULL, 0, 0, 'available', 0, NULL, ARRAY[]::text[], '{}'::jsonb, '2026-03-13T01:47:35.223673+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('14bf8c8d-b4cd-43af-80cd-28232eae810f', 'rob@proplumb.us', 'ProPlumb Chicago', 'Robert Williams', 'Licensed master plumber covering all Chicago suburbs. 24/7 emergency service available.', 'a9891396-e92c-475c-af21-851f22c15943', 85, 4.7, 0, 'Chicago, IL', 'Chicago', true, true, true, false, 'https://randomuser.me/api/portraits/men/52.jpg', NULL, NULL, NULL, '2026-04-17T09:05:23.401967+00:00', NULL, 204, 91, 'available', 12, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], '{}'::jsonb, '2026-04-17T09:05:23.401967+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('7a10cfd6-7ef9-440c-912b-367c3704c7eb', 'sarah@datapulse.us', 'DataPulse Analytics', 'Sarah Chen', 'Data science and ML engineering. Specializing in predictive models, dashboards, and ETL pipelines.', '59de2876-d8e4-4fa9-9cd9-f9783d0f85cf', 145, 5, 0, 'San Francisco, CA', 'San Francisco', true, true, true, false, 'https://randomuser.me/api/portraits/women/68.jpg', NULL, NULL, NULL, '2026-04-17T09:05:23.669257+00:00', NULL, 43, 31, 'available', 7, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri"], '{}'::jsonb, '2026-04-17T09:05:23.669257+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('4bbb1a31-6c18-40bb-a0dc-5e3f31837e1d', 'ashley@pixelperfect.us', 'Pixel Perfect Web', 'Ashley Thompson', 'Full-stack web development in React, Next.js, and Tailwind CSS. Beautiful, fast, and SEO-optimized sites.', '8eef7b31-d839-428d-af2e-15b6401177c4', 110, 4.8, 0, 'Austin, TX', 'Austin', true, true, true, false, 'https://randomuser.me/api/portraits/women/22.jpg', NULL, NULL, NULL, '2026-04-17T09:05:24.147025+00:00', NULL, 91, 55, 'available', 9, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri"], '{}'::jsonb, '2026-04-17T09:05:24.147025+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('3b10dde5-6ec5-4847-848b-054f8b4f1cd2', 'sofia@gourmetcatering.us', 'Gourmet Catering by Sofia', 'Sofia Ramirez', 'Corporate events, weddings, and private dinners. Authentic Latin and international fusion cuisine.', '8a1ded1a-9ea9-43f1-89f7-dbabe4b82473', 75, 4.9, 0, 'Miami, FL', 'Miami', true, true, false, false, 'https://randomuser.me/api/portraits/women/55.jpg', NULL, NULL, NULL, '2026-04-17T09:05:24.379313+00:00', NULL, 67, 38, 'available', 11, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], '{}'::jsonb, '2026-04-17T09:05:24.379313+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('bde274a9-349b-4064-b314-f62625b809f2', 'david@mindbridge.us', 'MindBridge Tutors', 'David Park', 'SAT/ACT prep, math, science, and coding tutoring for K-12 and college students. Online and in-person.', '7a0fdb96-1e94-4492-b1b2-9c33508dbd9b', 65, 4.7, 0, 'Seattle, WA', 'Seattle', true, true, false, false, 'https://randomuser.me/api/portraits/men/18.jpg', NULL, NULL, NULL, '2026-04-17T09:05:24.600507+00:00', NULL, 115, 63, 'available', 5, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat"], '{}'::jsonb, '2026-04-17T09:05:24.600507+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('6b601d54-9412-4cc0-b9f6-b82ce99ab529', 'tyler@swiftmove.us', 'SwiftMove Logistics', 'Tyler Brooks', 'Residential and commercial movers. Local and long-distance. Packing, storage, and specialty item handling.', '885963a8-d06d-49a4-ae49-d84a3f6a88f5', 80, 4.5, 0, 'Dallas, TX', 'Dallas', true, true, true, false, 'https://randomuser.me/api/portraits/men/41.jpg', NULL, NULL, NULL, '2026-04-17T09:05:24.813319+00:00', NULL, 289, 114, 'available', 7, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], '{}'::jsonb, '2026-04-17T09:05:24.813319+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('8c3e3f21-8136-4905-9b12-1d0b5c063908', 'emma@lensart.us', 'LensArt Photography', 'Emma Wilson', 'Award-winning photographer specializing in weddings, portraits, and corporate events across the Southeast.', 'b4fd5643-69ec-4721-b94d-b21bcd9b1da6', 150, 5, 0, 'Nashville, TN', 'Nashville', true, true, true, false, 'https://randomuser.me/api/portraits/women/36.jpg', NULL, NULL, NULL, '2026-04-17T09:05:25.029029+00:00', NULL, 58, 29, 'available', 10, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat"], '{}'::jsonb, '2026-04-17T09:05:25.029029+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('4bcb187d-ddd3-4281-b99b-a54fbada8601', 'kevin@neuralbuild.us', 'NeuralBuild AI', 'Kevin Zhang', 'Custom LLM applications, RAG systems, AI agents, and enterprise automation. Python and cloud-native.', '01c8aab0-6079-49df-8e35-97b54676ecc2', 160, 4.9, 0, 'San Jose, CA', 'San Jose', true, true, true, false, 'https://randomuser.me/api/portraits/men/62.jpg', NULL, NULL, NULL, '2026-04-17T09:05:25.250858+00:00', NULL, 34, 22, 'available', 6, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri"], '{}'::jsonb, '2026-04-17T09:05:25.250858+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('9c99cbc5-bfbf-4322-8b9a-fbf9a95847a7', 'jessica@greenclean.us', 'Green Clean Denver', 'Jessica Miller', '100% eco-friendly residential cleaning. Non-toxic products, locally sourced. Serving Denver metro area.', '8031584d-ead5-4da2-a570-de07368caf47', 50, 4.6, 0, 'Denver, CO', 'Denver', true, true, false, false, 'https://randomuser.me/api/portraits/women/81.jpg', NULL, NULL, NULL, '2026-04-17T09:05:25.46642+00:00', NULL, 97, 47, 'available', 4, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat"], '{}'::jsonb, '2026-04-17T09:05:25.46642+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('d870f043-fa61-4258-b959-0e7ac92abf9a', 'amanda@codecraft.us', 'CodeCraft Studio', 'Amanda Lee', 'Web and mobile app development. Vue.js, React Native, Node.js. Startups to enterprise.', '8eef7b31-d839-428d-af2e-15b6401177c4', 115, 4.8, 0, 'Portland, OR', 'Portland', true, true, false, false, 'https://randomuser.me/api/portraits/women/14.jpg', NULL, NULL, NULL, '2026-04-17T09:05:25.889095+00:00', NULL, 72, 36, 'available', 8, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri"], '{}'::jsonb, '2026-04-17T09:05:25.889095+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('661c3cf6-55c3-4ba4-8236-87ee378fd9c9', 'derek@premierplumb.us', 'Premier Plumbing ATL', 'Derek Harris', 'Full-service plumbing in Atlanta. Water heaters, drain cleaning, leak detection, and bathroom remodels.', 'a9891396-e92c-475c-af21-851f22c15943', 90, 4.5, 0, 'Atlanta, GA', 'Atlanta', true, false, false, false, 'https://randomuser.me/api/portraits/men/85.jpg', NULL, NULL, NULL, '2026-04-17T09:05:26.104481+00:00', NULL, 161, 73, 'available', 10, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat"], '{}'::jsonb, '2026-04-17T09:05:26.104481+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('05495ccb-43f1-4690-9520-82e31e503726', 'rachel@insightdata.us', 'Insight Data Labs', 'Rachel Kim', 'Advanced analytics, A/B testing, and BI dashboard development for SaaS companies.', '59de2876-d8e4-4fa9-9cd9-f9783d0f85cf', 135, 4.9, 0, 'Boston, MA', 'Boston', true, true, true, false, 'https://randomuser.me/api/portraits/women/92.jpg', NULL, NULL, NULL, '2026-04-17T09:05:26.330293+00:00', NULL, 29, 19, 'available', 9, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri"], '{}'::jsonb, '2026-04-17T09:05:26.330293+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('9e147cd2-3779-461f-9b45-69e72cdabdbd', 'luis@tastefulevents.us', 'Tasteful Events Catering', 'Luis Hernandez', 'Full-service catering for corporate, wedding, and social events. Tex-Mex, BBQ, and American cuisine.', '8a1ded1a-9ea9-43f1-89f7-dbabe4b82473', 70, 4.6, 0, 'San Antonio, TX', 'San Antonio', true, true, false, false, 'https://randomuser.me/api/portraits/men/47.jpg', NULL, NULL, NULL, '2026-04-17T09:05:26.541925+00:00', NULL, 84, 41, 'available', 8, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], '{}'::jsonb, '2026-04-17T09:05:26.541925+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('8a429109-697c-4d83-a472-bcf445cc85dd', 'nicole@snapstory.us', 'Snap & Story Media', 'Nicole Foster', 'Commercial photography and videography. Brand shoots, product photography, and social media content.', 'b4fd5643-69ec-4721-b94d-b21bcd9b1da6', 140, 4.8, 0, 'Los Angeles, CA', 'Los Angeles', true, true, false, false, 'https://randomuser.me/api/portraits/women/63.jpg', NULL, NULL, NULL, '2026-04-17T09:05:26.777339+00:00', NULL, 46, 24, 'available', 7, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat"], '{}'::jsonb, '2026-04-17T09:05:26.777339+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('d2bf56c4-78c1-46bb-8e9d-e4f701873014', 'michael@academiapro.us', 'AcademiaPro Tutors', 'Michael Brown', 'Expert tutoring in math, science, English, and test prep. College application essay coaching available.', '7a0fdb96-1e94-4492-b1b2-9c33508dbd9b', 60, 4.7, 0, 'Philadelphia, PA', 'Philadelphia', true, true, false, false, 'https://randomuser.me/api/portraits/men/11.jpg', NULL, NULL, NULL, '2026-04-17T09:05:26.993271+00:00', NULL, 138, 58, 'available', 6, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat"], '{}'::jsonb, '2026-04-17T09:05:26.993271+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('d810717d-f2d4-401e-9f3c-9fe097ed06aa', 'marcus@voltelectric.us', 'Volt Electric Houston', 'Marcus Johnson', 'Licensed electrician in Texas. Residential wiring, panel upgrades, EV charger installs, and commercial electrical.', '3664ef98-08f7-4228-b2cb-60f329f02912', 95, 4.6, 0, 'Houston, TX', 'Houston', true, true, false, false, 'https://randomuser.me/api/portraits/men/76.jpg', NULL, NULL, NULL, '2026-04-17T09:05:23.916111+00:00', NULL, 178, 67, 'available', 15, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat"], '{}'::jsonb, '2026-04-17T09:05:23.916111+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('b0352d48-2ecc-444d-b6ce-fb392f6675c2', 'chris@brightspark.us', 'Bright Spark Electric', 'Chris Anderson', 'Licensed AZ electrician. Smart home wiring, solar connections, and commercial electrical services.', '3664ef98-08f7-4228-b2cb-60f329f02912', 88, 4.7, 0, 'Phoenix, AZ', 'Phoenix', true, true, false, false, 'https://randomuser.me/api/portraits/men/29.jpg', NULL, NULL, NULL, '2026-04-17T09:05:25.675429+00:00', NULL, 143, 59, 'available', 13, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat"], '{}'::jsonb, '2026-04-17T09:05:25.675429+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO service_providers ("id", "owner_email", "business_name", "owner_name", "description", "category_id", "hourly_rate", "rating", "review_count", "location", "city", "is_active", "is_verified", "is_featured", "instant_booking", "avatar_url", "portfolio_urls", "tech_stack", "languages", "created_at", "user_id", "total_reviews", "total_orders", "availability", "experience_years", "phone", "working_days", "documents", "updated_at") VALUES ('42b646cd-a385-4424-b49f-8aff226bd1a7', 'brian@atlasmoving.us', 'Atlas Moving Group', 'Brian Scott', 'Affordable, professional movers. Full-service packing, furniture assembly, and storage options.', '885963a8-d06d-49a4-ae49-d84a3f6a88f5', 75, 4.5, 0, 'Charlotte, NC', 'Charlotte', true, false, false, false, 'https://randomuser.me/api/portraits/men/73.jpg', NULL, NULL, NULL, '2026-04-17T09:05:27.216426+00:00', NULL, 217, 96, 'available', 9, NULL, ARRAY["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], '{}'::jsonb, '2026-04-17T09:05:27.216426+00:00') ON CONFLICT (id) DO NOTHING;

-- services (60 rows)
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('c24f763e-7db3-400f-836a-c22f98400059', 'd6a24cf7-c047-4031-9320-12f7cb3f89f1', 'AI Workflow Automation', 'End-to-end business process automation using LLMs and custom agents.', 1200, NULL, true, '2026-04-17T09:19:03.739135+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:03.739135+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('190412fb-da16-49b8-b3bd-1d21502ceec2', 'd6a24cf7-c047-4031-9320-12f7cb3f89f1', 'Custom Chatbot Development', 'Build and deploy a GPT-powered chatbot trained on your business data.', 800, NULL, true, '2026-04-17T09:19:04.052457+00:00', 'fixed', 360, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:04.052457+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('45cce1c8-40dd-48e2-850e-c0c29f203936', 'd6a24cf7-c047-4031-9320-12f7cb3f89f1', 'AI Consulting Session', '1-hour strategy session to identify automation opportunities for your business.', 150, NULL, true, '2026-04-17T09:19:04.297709+00:00', 'hourly', 60, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:04.297709+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('5f9f913b-8e9c-409d-b4f6-f0c93eeff900', 'e1153f08-c804-48ae-8cb0-ae3f5569b2c4', 'Deep Home Cleaning', 'Thorough top-to-bottom cleaning of your entire home including kitchen and bathrooms.', 180, NULL, true, '2026-04-17T09:19:05.347165+00:00', 'fixed', 240, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:05.347165+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('65efc626-0ca5-4e05-872e-c3204098bbee', 'e1153f08-c804-48ae-8cb0-ae3f5569b2c4', 'Regular Weekly Clean', 'Weekly maintenance cleaning for homes up to 2,000 sq ft.', 120, NULL, true, '2026-04-17T09:19:05.577146+00:00', 'fixed', 150, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:05.577146+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('060c5312-ee67-4d6f-80f8-9c5781db4132', 'e1153f08-c804-48ae-8cb0-ae3f5569b2c4', 'Move-In / Move-Out Clean', 'Complete cleaning for property transitions, includes appliances and cabinets.', 280, NULL, true, '2026-04-17T09:19:05.806738+00:00', 'fixed', 360, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:05.806738+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('6d5d676e-9ea7-4055-a915-933e4818181c', '14bf8c8d-b4cd-43af-80cd-28232eae810f', 'Leak Detection & Repair', 'Diagnose and fix water leaks in pipes, faucets, and fixtures.', 90, NULL, true, '2026-04-17T09:19:06.720449+00:00', 'hourly', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:06.720449+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('9a5db95c-14f3-4881-952e-415c12a7048d', '14bf8c8d-b4cd-43af-80cd-28232eae810f', 'Water Heater Installation', 'Supply and install a new water heater — gas or electric.', 650, NULL, true, '2026-04-17T09:19:06.940388+00:00', 'fixed', 240, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:06.940388+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('746fceef-c70f-4a0e-9d3c-feb5f7d93440', '14bf8c8d-b4cd-43af-80cd-28232eae810f', 'Drain Cleaning', 'Professional unclogging of kitchen, bathroom, and main sewer drains.', 150, NULL, true, '2026-04-17T09:19:07.149419+00:00', 'fixed', 90, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:07.149419+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('35095a51-352c-42ff-9c6a-4c4505ff57e8', '7a10cfd6-7ef9-440c-912b-367c3704c7eb', 'Data Analysis & Dashboard', 'Build interactive dashboards from your raw data using Power BI or Tableau.', 950, NULL, true, '2026-04-17T09:19:08.009375+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:08.009375+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('d13fd713-e9ff-4f5c-aa98-038ec687e8da', '7a10cfd6-7ef9-440c-912b-367c3704c7eb', 'Machine Learning Model', 'Design, train, and deploy a custom ML model for classification or prediction.', 2000, NULL, true, '2026-04-17T09:19:08.218675+00:00', 'fixed', 960, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:08.218675+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('3958bc12-3637-4ba8-8121-3172db7210c1', '7a10cfd6-7ef9-440c-912b-367c3704c7eb', 'Data Strategy Consultation', '2-hour deep dive into your data infrastructure and analytics roadmap.', 300, NULL, true, '2026-04-17T09:19:08.42958+00:00', 'fixed', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:08.42958+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('a430e36a-ee23-4d0f-97ea-04222a99e737', '4bbb1a31-6c18-40bb-a0dc-5e3f31837e1d', 'Business Website Design', 'Custom 5-page responsive website built with React and Tailwind CSS.', 1800, NULL, true, '2026-04-17T09:19:09.29619+00:00', 'fixed', 1440, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:09.29619+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('f2b4579c-2b6e-4504-b8df-fe72e3839a2a', '4bbb1a31-6c18-40bb-a0dc-5e3f31837e1d', 'E-Commerce Store', 'Full online store with payment integration, inventory, and admin panel.', 3500, NULL, true, '2026-04-17T09:19:09.514294+00:00', 'fixed', 2880, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:09.514294+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('5b7fc7f7-e749-41d3-a575-c4d08667003a', '4bbb1a31-6c18-40bb-a0dc-5e3f31837e1d', 'Website Maintenance', 'Monthly updates, security patches, and content changes for your site.', 200, NULL, true, '2026-04-17T09:19:09.730579+00:00', 'fixed', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:09.730579+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('67be4fb4-706d-4591-909a-96a0553dfefc', '3b10dde5-6ec5-4847-848b-054f8b4f1cd2', 'Corporate Lunch Catering', 'Buffet-style lunch for 20–100 guests. Includes setup and cleanup.', 850, NULL, true, '2026-04-17T09:19:10.586209+00:00', 'fixed', 240, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:10.586209+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('c652defe-bb44-4ace-bc0e-818bd66fd065', '3b10dde5-6ec5-4847-848b-054f8b4f1cd2', 'Wedding Catering Package', 'Full wedding reception catering for up to 150 guests. 4-course meal.', 4500, NULL, true, '2026-04-17T09:19:10.805786+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:10.805786+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('96439d9e-e87f-458c-8d22-59475d9cfa6f', '3b10dde5-6ec5-4847-848b-054f8b4f1cd2', 'Private Dinner Party', 'Intimate dinner for 8–20 guests. Chef prepares and serves at your home.', 600, NULL, true, '2026-04-17T09:19:11.02298+00:00', 'fixed', 300, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:11.02298+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('cab80f5d-8aad-457b-8ad7-354548e46d34', 'bde274a9-349b-4064-b314-f62625b809f2', 'SAT / ACT Prep', '10-session intensive prep course covering all sections of the SAT or ACT.', 600, NULL, true, '2026-04-17T09:19:11.874731+00:00', 'fixed', 600, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:11.874731+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('1e7f13c4-3b5d-4edb-82d8-be2205a312dd', 'bde274a9-349b-4064-b314-f62625b809f2', 'Math Tutoring (K-12)', 'One-on-one math tutoring from basic arithmetic through calculus.', 65, NULL, true, '2026-04-17T09:19:12.090973+00:00', 'hourly', 60, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:12.090973+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('51da871d-a049-4f1a-9f52-8dd9a3d88e1d', 'bde274a9-349b-4064-b314-f62625b809f2', 'Coding Bootcamp for Teens', '8-week Python programming course for beginners aged 12–18.', 480, NULL, true, '2026-04-17T09:19:12.30626+00:00', 'fixed', 2400, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:12.30626+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('f6a0fb6f-fffd-4aca-a318-42f96eccff23', '6b601d54-9412-4cc0-b9f6-b82ce99ab529', 'Local Moving Service', 'Full-service local move including packing, loading, transport, and unloading.', 80, NULL, true, '2026-04-17T09:19:13.220719+00:00', 'hourly', 240, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:13.220719+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('5b6e4342-2502-47d8-8b02-bd65b06e0ed7', '6b601d54-9412-4cc0-b9f6-b82ce99ab529', 'Furniture Assembly', 'Assemble flatpack furniture from IKEA, Wayfair, or any brand.', 120, NULL, true, '2026-04-17T09:19:13.433666+00:00', 'fixed', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:13.433666+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('886a7f23-bb17-4071-b7a7-f6c0fe358bff', '6b601d54-9412-4cc0-b9f6-b82ce99ab529', 'Long-Distance Move', 'Interstate moving service with full insurance coverage.', 2200, NULL, true, '2026-04-17T09:19:13.640792+00:00', 'fixed', 960, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:13.640792+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('afb925c1-e32f-4251-8ac3-717bebdd4d94', '8c3e3f21-8136-4905-9b12-1d0b5c063908', 'Portrait Session', '1-hour outdoor or studio portrait session. 30 edited digital photos.', 250, NULL, true, '2026-04-17T09:19:14.477028+00:00', 'fixed', 60, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:14.477028+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('b5343aac-ca7e-438e-a69b-85fdcddd3d01', '8c3e3f21-8136-4905-9b12-1d0b5c063908', 'Wedding Photography', 'Full-day wedding coverage (8 hours). 500+ edited high-res photos.', 2800, NULL, true, '2026-04-17T09:19:14.69149+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:14.69149+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('3bcfaa4b-02da-4f92-8c28-d92e652915f5', '8c3e3f21-8136-4905-9b12-1d0b5c063908', 'Brand Photo Shoot', 'Professional brand photos for your website, LinkedIn, and marketing materials.', 450, NULL, true, '2026-04-17T09:19:14.902877+00:00', 'fixed', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:14.902877+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('7ea0315f-80e7-418a-ade7-c5738ed11c62', '4bcb187d-ddd3-4281-b99b-a54fbada8601', 'AI Workflow Automation', 'End-to-end business process automation using LLMs and custom agents.', 1200, NULL, true, '2026-04-17T09:19:15.758552+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:15.758552+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('106c3e50-7063-4035-99e4-a9f12d11d25c', '4bcb187d-ddd3-4281-b99b-a54fbada8601', 'Custom Chatbot Development', 'Build and deploy a GPT-powered chatbot trained on your business data.', 800, NULL, true, '2026-04-17T09:19:15.981661+00:00', 'fixed', 360, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:15.981661+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('74200b06-07a6-42eb-b5a4-4704ff73699f', '4bcb187d-ddd3-4281-b99b-a54fbada8601', 'AI Consulting Session', '1-hour strategy session to identify automation opportunities for your business.', 150, NULL, true, '2026-04-17T09:19:16.190537+00:00', 'hourly', 60, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:16.190537+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('9c120a9f-3e27-492e-82f9-00cca6a98626', '9c99cbc5-bfbf-4322-8b9a-fbf9a95847a7', 'Deep Home Cleaning', 'Thorough top-to-bottom cleaning of your entire home including kitchen and bathrooms.', 180, NULL, true, '2026-04-17T09:19:17.045602+00:00', 'fixed', 240, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:17.045602+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('a721267a-c131-4f8b-9107-8970e776b3f3', '9c99cbc5-bfbf-4322-8b9a-fbf9a95847a7', 'Regular Weekly Clean', 'Weekly maintenance cleaning for homes up to 2,000 sq ft.', 120, NULL, true, '2026-04-17T09:19:17.271877+00:00', 'fixed', 150, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:17.271877+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('e11545d8-1ff6-43b0-a04d-75b634105f79', '9c99cbc5-bfbf-4322-8b9a-fbf9a95847a7', 'Move-In / Move-Out Clean', 'Complete cleaning for property transitions, includes appliances and cabinets.', 280, NULL, true, '2026-04-17T09:19:17.481602+00:00', 'fixed', 360, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:17.481602+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('990260f2-f157-4793-a27f-a90e0469fab2', 'd870f043-fa61-4258-b959-0e7ac92abf9a', 'Business Website Design', 'Custom 5-page responsive website built with React and Tailwind CSS.', 1800, NULL, true, '2026-04-17T09:19:18.346358+00:00', 'fixed', 1440, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:18.346358+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('b6221ef7-5dfb-42da-85f5-2d2d5055acaa', 'd870f043-fa61-4258-b959-0e7ac92abf9a', 'E-Commerce Store', 'Full online store with payment integration, inventory, and admin panel.', 3500, NULL, true, '2026-04-17T09:19:18.572383+00:00', 'fixed', 2880, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:18.572383+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('af863395-d36e-4865-bd98-74106726faf4', 'd870f043-fa61-4258-b959-0e7ac92abf9a', 'Website Maintenance', 'Monthly updates, security patches, and content changes for your site.', 200, NULL, true, '2026-04-17T09:19:18.785351+00:00', 'fixed', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:18.785351+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('d7dab54b-e72c-48b5-95a2-f951fa1b3e81', '661c3cf6-55c3-4ba4-8236-87ee378fd9c9', 'Leak Detection & Repair', 'Diagnose and fix water leaks in pipes, faucets, and fixtures.', 90, NULL, true, '2026-04-17T09:19:19.64564+00:00', 'hourly', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:19.64564+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('3170c5df-2191-4439-8aff-276bf02ea762', '05495ccb-43f1-4690-9520-82e31e503726', 'Data Strategy Consultation', '2-hour deep dive into your data infrastructure and analytics roadmap.', 300, NULL, true, '2026-04-17T09:19:21.381076+00:00', 'fixed', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:21.381076+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('54562dad-b81f-4a2a-b4f3-87d8cdab7f6f', '9e147cd2-3779-461f-9b45-69e72cdabdbd', 'Corporate Lunch Catering', 'Buffet-style lunch for 20–100 guests. Includes setup and cleanup.', 850, NULL, true, '2026-04-17T09:19:22.220772+00:00', 'fixed', 240, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:22.220772+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('3948d574-064f-411b-9104-b712443c7688', '8a429109-697c-4d83-a472-bcf445cc85dd', 'Brand Photo Shoot', 'Professional brand photos for your website, LinkedIn, and marketing materials.', 450, NULL, true, '2026-04-17T09:19:23.922047+00:00', 'fixed', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:23.922047+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('1d42d6c3-4f92-4000-a09f-6874a0839514', 'd2bf56c4-78c1-46bb-8e9d-e4f701873014', 'SAT / ACT Prep', '10-session intensive prep course covering all sections of the SAT or ACT.', 600, NULL, true, '2026-04-17T09:19:24.771606+00:00', 'fixed', 600, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:24.771606+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('99b70193-357f-420a-9223-75f98c6e3e80', 'd810717d-f2d4-401e-9f3c-9fe097ed06aa', 'Outlet & Wiring Repair', 'Fix faulty outlets, switches, or wiring throughout your home.', 95, NULL, true, '2026-04-17T09:19:26.467792+00:00', 'hourly', 90, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:26.467792+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('4757f516-3855-44fd-810f-0d549138b50e', 'b0352d48-2ecc-444d-b6ce-fb392f6675c2', 'Electrical Panel Upgrade', 'Replace outdated electrical panel with modern 200-amp service.', 1400, NULL, true, '2026-04-17T09:19:27.307202+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:27.307202+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('45388bba-deb2-4a0a-9716-67f7a930fa09', '42b646cd-a385-4424-b49f-8aff226bd1a7', 'Long-Distance Move', 'Interstate moving service with full insurance coverage.', 2200, NULL, true, '2026-04-17T09:19:29.020607+00:00', 'fixed', 960, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:29.020607+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('c83eeaac-2c51-44c5-b5fe-b00438273c4e', '661c3cf6-55c3-4ba4-8236-87ee378fd9c9', 'Water Heater Installation', 'Supply and install a new water heater — gas or electric.', 650, NULL, true, '2026-04-17T09:19:19.86451+00:00', 'fixed', 240, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:19.86451+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('7216736f-5a89-4854-bd83-fc52b878d3e2', '9e147cd2-3779-461f-9b45-69e72cdabdbd', 'Wedding Catering Package', 'Full wedding reception catering for up to 150 guests. 4-course meal.', 4500, NULL, true, '2026-04-17T09:19:22.436595+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:22.436595+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('686d8a67-7b39-461d-9bc4-cde8d97951b1', 'd2bf56c4-78c1-46bb-8e9d-e4f701873014', 'Math Tutoring (K-12)', 'One-on-one math tutoring from basic arithmetic through calculus.', 65, NULL, true, '2026-04-17T09:19:24.984404+00:00', 'hourly', 60, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:24.984404+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('560d4a95-9693-40f8-89fc-ce515a08b8ab', 'b0352d48-2ecc-444d-b6ce-fb392f6675c2', 'EV Charger Installation', 'Install Level 2 EV charger in your garage with permit and inspection.', 550, NULL, true, '2026-04-17T09:19:27.519876+00:00', 'fixed', 180, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:27.519876+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('530a7404-772a-4c42-80c3-766aaf73e91f', '661c3cf6-55c3-4ba4-8236-87ee378fd9c9', 'Drain Cleaning', 'Professional unclogging of kitchen, bathroom, and main sewer drains.', 150, NULL, true, '2026-04-17T09:19:20.081292+00:00', 'fixed', 90, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:20.081292+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('9dce7f8b-8450-4aa0-96c4-bec8ea9b0485', '05495ccb-43f1-4690-9520-82e31e503726', 'Data Analysis & Dashboard', 'Build interactive dashboards from your raw data using Power BI or Tableau.', 950, NULL, true, '2026-04-17T09:19:20.957445+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:20.957445+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('e60ed80f-ee4a-43c7-a6cb-ece471380364', '9e147cd2-3779-461f-9b45-69e72cdabdbd', 'Private Dinner Party', 'Intimate dinner for 8–20 guests. Chef prepares and serves at your home.', 600, NULL, true, '2026-04-17T09:19:22.645298+00:00', 'fixed', 300, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:22.645298+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('a16b2f0d-4626-47f0-bb22-10c4acbf2f47', '8a429109-697c-4d83-a472-bcf445cc85dd', 'Portrait Session', '1-hour outdoor or studio portrait session. 30 edited digital photos.', 250, NULL, true, '2026-04-17T09:19:23.501277+00:00', 'fixed', 60, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:23.501277+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('61fae54e-770b-41ff-8a12-67da35724022', 'd2bf56c4-78c1-46bb-8e9d-e4f701873014', 'Coding Bootcamp for Teens', '8-week Python programming course for beginners aged 12–18.', 480, NULL, true, '2026-04-17T09:19:25.200134+00:00', 'fixed', 2400, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:25.200134+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('5647110e-03dd-4737-b3e7-de65c0dd730d', 'd810717d-f2d4-401e-9f3c-9fe097ed06aa', 'Electrical Panel Upgrade', 'Replace outdated electrical panel with modern 200-amp service.', 1400, NULL, true, '2026-04-17T09:19:26.03269+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:26.03269+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('f1272402-41ad-4aaa-83c3-daac514139a2', 'b0352d48-2ecc-444d-b6ce-fb392f6675c2', 'Outlet & Wiring Repair', 'Fix faulty outlets, switches, or wiring throughout your home.', 95, NULL, true, '2026-04-17T09:19:27.73705+00:00', 'hourly', 90, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:27.73705+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('48eb6406-36d0-41d3-ad1c-ce80006a0d03', '42b646cd-a385-4424-b49f-8aff226bd1a7', 'Local Moving Service', 'Full-service local move including packing, loading, transport, and unloading.', 80, NULL, true, '2026-04-17T09:19:28.590668+00:00', 'hourly', 240, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:28.590668+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('dbc55e4f-c8e8-4455-b7fe-5b94fbb425a7', '05495ccb-43f1-4690-9520-82e31e503726', 'Machine Learning Model', 'Design, train, and deploy a custom ML model for classification or prediction.', 2000, NULL, true, '2026-04-17T09:19:21.165378+00:00', 'fixed', 960, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:21.165378+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('ccddce7a-d9f5-4b90-8a08-25565677a3c0', '8a429109-697c-4d83-a472-bcf445cc85dd', 'Wedding Photography', 'Full-day wedding coverage (8 hours). 500+ edited high-res photos.', 2800, NULL, true, '2026-04-17T09:19:23.708969+00:00', 'fixed', 480, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:23.708969+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('683e3697-4474-46f5-8728-8a68c79fee28', 'd810717d-f2d4-401e-9f3c-9fe097ed06aa', 'EV Charger Installation', 'Install Level 2 EV charger in your garage with permit and inspection.', 550, NULL, true, '2026-04-17T09:19:26.255659+00:00', 'fixed', 180, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:26.255659+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO services ("id", "provider_id", "name", "description", "price", "duration", "is_active", "created_at", "price_type", "duration_minutes", "is_instant_booking", "is_featured", "images", "faqs", "updated_at") VALUES ('9ab69ad2-98d2-4c32-b143-ce527fb6a8b1', '42b646cd-a385-4424-b49f-8aff226bd1a7', 'Furniture Assembly', 'Assemble flatpack furniture from IKEA, Wayfair, or any brand.', 120, NULL, true, '2026-04-17T09:19:28.810788+00:00', 'fixed', 120, true, false, ARRAY[]::text[], ARRAY[]::text[], '2026-04-17T09:19:28.810788+00:00') ON CONFLICT (id) DO NOTHING;

-- reviews (60 rows)
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('22d58113-5af5-451e-ad76-9684acc03a17', 'd6a24cf7-c047-4031-9320-12f7cb3f89f1', 'sarah.w@email.com', NULL, 4, 'Highly recommend! Responsive, skilled, and delivered exactly what we needed.', '2026-04-17T09:19:04.534819+00:00', 'Sarah Williams') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('0369b84c-1405-4069-a4c8-267ac2adc3d7', 'd6a24cf7-c047-4031-9320-12f7cb3f89f1', 'tom.b@email.com', NULL, 5, 'Fantastic experience from start to finish. Will be my go-to provider going forward.', '2026-04-17T09:19:04.771917+00:00', 'Tom Baker') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('3358c658-41ba-477f-8cb6-6b604660951a', 'd6a24cf7-c047-4031-9320-12f7cb3f89f1', 'nina.r@email.com', NULL, 5, 'Top-notch work. They really took the time to understand my needs before starting.', '2026-04-17T09:19:05.004174+00:00', 'Nina Rodriguez') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('6e76a85c-c630-43c9-b005-b92d9afa61e7', 'e1153f08-c804-48ae-8cb0-ae3f5569b2c4', 'daniel.k@email.com', NULL, 4, 'Professional, punctual, and produced excellent results. 5 stars all the way.', '2026-04-17T09:19:06.04111+00:00', 'Daniel Kim') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('2a7c7702-eb87-4aee-abff-130187d984cf', 'e1153f08-c804-48ae-8cb0-ae3f5569b2c4', 'olivia.s@email.com', NULL, 5, 'Super happy with the outcome. Made the whole process easy and stress-free.', '2026-04-17T09:19:06.275163+00:00', 'Olivia Smith') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('41f01a00-5423-40cd-922a-d90356f0452e', 'e1153f08-c804-48ae-8cb0-ae3f5569b2c4', 'alex.j@email.com', NULL, 5, 'Absolutely incredible service! Exceeded all my expectations. Will definitely hire again.', '2026-04-17T09:19:06.492154+00:00', 'Alex Johnson') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('064d617a-0c0b-4dfb-89e8-ca07b1eba882', '14bf8c8d-b4cd-43af-80cd-28232eae810f', 'priya.p@email.com', NULL, 4, 'Very professional and knowledgeable. Completed the job on time and within budget.', '2026-04-17T09:19:07.362229+00:00', 'Priya Patel') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('13bf863e-ad57-4815-9b0c-ee4d38812499', '14bf8c8d-b4cd-43af-80cd-28232eae810f', 'marcus.l@email.com', NULL, 5, 'Great communication throughout. The quality of work was outstanding.', '2026-04-17T09:19:07.571345+00:00', 'Marcus Lee') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('fe017b6c-36d9-46c5-b8f8-10020907ce2c', '14bf8c8d-b4cd-43af-80cd-28232eae810f', 'sarah.w@email.com', NULL, 5, 'Highly recommend! Responsive, skilled, and delivered exactly what we needed.', '2026-04-17T09:19:07.784241+00:00', 'Sarah Williams') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('c47a215b-d11a-43d8-bd24-5d51a9eafb43', '7a10cfd6-7ef9-440c-912b-367c3704c7eb', 'tom.b@email.com', NULL, 4, 'Fantastic experience from start to finish. Will be my go-to provider going forward.', '2026-04-17T09:19:08.645989+00:00', 'Tom Baker') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('9d149ca4-4804-4a3c-9a00-e42b002110f1', '7a10cfd6-7ef9-440c-912b-367c3704c7eb', 'nina.r@email.com', NULL, 5, 'Top-notch work. They really took the time to understand my needs before starting.', '2026-04-17T09:19:08.870797+00:00', 'Nina Rodriguez') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('9ff35e25-5dc0-47f1-8711-6c6628c39d05', '7a10cfd6-7ef9-440c-912b-367c3704c7eb', 'daniel.k@email.com', NULL, 5, 'Professional, punctual, and produced excellent results. 5 stars all the way.', '2026-04-17T09:19:09.079849+00:00', 'Daniel Kim') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('39e13e4e-6a92-4561-93ea-1a2e5b8b3757', '4bbb1a31-6c18-40bb-a0dc-5e3f31837e1d', 'olivia.s@email.com', NULL, 4, 'Super happy with the outcome. Made the whole process easy and stress-free.', '2026-04-17T09:19:09.943572+00:00', 'Olivia Smith') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('c415d68f-3baa-43b5-af65-0fdfb4bef32d', '4bbb1a31-6c18-40bb-a0dc-5e3f31837e1d', 'alex.j@email.com', NULL, 5, 'Absolutely incredible service! Exceeded all my expectations. Will definitely hire again.', '2026-04-17T09:19:10.158221+00:00', 'Alex Johnson') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('0a12a14b-0c54-458b-9fe3-2b81dcc9d3fe', '4bbb1a31-6c18-40bb-a0dc-5e3f31837e1d', 'priya.p@email.com', NULL, 5, 'Very professional and knowledgeable. Completed the job on time and within budget.', '2026-04-17T09:19:10.369388+00:00', 'Priya Patel') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('bd54e024-d38c-416a-8694-96b1d6853c1e', '3b10dde5-6ec5-4847-848b-054f8b4f1cd2', 'marcus.l@email.com', NULL, 4, 'Great communication throughout. The quality of work was outstanding.', '2026-04-17T09:19:11.237522+00:00', 'Marcus Lee') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('31de9c51-180c-4f74-9d22-53a4eca395a3', '3b10dde5-6ec5-4847-848b-054f8b4f1cd2', 'sarah.w@email.com', NULL, 5, 'Highly recommend! Responsive, skilled, and delivered exactly what we needed.', '2026-04-17T09:19:11.448207+00:00', 'Sarah Williams') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('d06c80fa-e7f9-4900-8c3c-acf964a60b5e', '3b10dde5-6ec5-4847-848b-054f8b4f1cd2', 'tom.b@email.com', NULL, 5, 'Fantastic experience from start to finish. Will be my go-to provider going forward.', '2026-04-17T09:19:11.66318+00:00', 'Tom Baker') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('6bcb249c-1e4a-4402-a6a2-b6d1f7bcf2a0', 'bde274a9-349b-4064-b314-f62625b809f2', 'nina.r@email.com', NULL, 4, 'Top-notch work. They really took the time to understand my needs before starting.', '2026-04-17T09:19:12.564365+00:00', 'Nina Rodriguez') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('b643f2bd-cd7c-45ae-a08c-cda039b4b5af', 'bde274a9-349b-4064-b314-f62625b809f2', 'daniel.k@email.com', NULL, 5, 'Professional, punctual, and produced excellent results. 5 stars all the way.', '2026-04-17T09:19:12.776533+00:00', 'Daniel Kim') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('9f0dce0d-88c9-41c4-91d8-b528c8256fa7', 'bde274a9-349b-4064-b314-f62625b809f2', 'olivia.s@email.com', NULL, 5, 'Super happy with the outcome. Made the whole process easy and stress-free.', '2026-04-17T09:19:12.995552+00:00', 'Olivia Smith') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('8f2a42bd-baff-43ea-9a68-b8db1a842df2', '6b601d54-9412-4cc0-b9f6-b82ce99ab529', 'alex.j@email.com', NULL, 4, 'Absolutely incredible service! Exceeded all my expectations. Will definitely hire again.', '2026-04-17T09:19:13.849864+00:00', 'Alex Johnson') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('eda39d36-f400-4b48-a987-b1f3b55bea83', '6b601d54-9412-4cc0-b9f6-b82ce99ab529', 'priya.p@email.com', NULL, 5, 'Very professional and knowledgeable. Completed the job on time and within budget.', '2026-04-17T09:19:14.060388+00:00', 'Priya Patel') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('9eb08c3e-f264-4303-9aed-490e06468077', '6b601d54-9412-4cc0-b9f6-b82ce99ab529', 'marcus.l@email.com', NULL, 5, 'Great communication throughout. The quality of work was outstanding.', '2026-04-17T09:19:14.268482+00:00', 'Marcus Lee') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('f0e9b376-582a-4e1b-ad03-90eafc9c5855', '8c3e3f21-8136-4905-9b12-1d0b5c063908', 'sarah.w@email.com', NULL, 4, 'Highly recommend! Responsive, skilled, and delivered exactly what we needed.', '2026-04-17T09:19:15.114843+00:00', 'Sarah Williams') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('bf99d2e7-3bdd-4da3-a263-d0e88cd3c910', '8c3e3f21-8136-4905-9b12-1d0b5c063908', 'tom.b@email.com', NULL, 5, 'Fantastic experience from start to finish. Will be my go-to provider going forward.', '2026-04-17T09:19:15.335563+00:00', 'Tom Baker') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('fd1bdf5f-9605-4a85-80d6-80f40139e81e', '8c3e3f21-8136-4905-9b12-1d0b5c063908', 'nina.r@email.com', NULL, 5, 'Top-notch work. They really took the time to understand my needs before starting.', '2026-04-17T09:19:15.551894+00:00', 'Nina Rodriguez') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('031dda97-1d23-42a3-b499-d49df6810d8d', '4bcb187d-ddd3-4281-b99b-a54fbada8601', 'daniel.k@email.com', NULL, 4, 'Professional, punctual, and produced excellent results. 5 stars all the way.', '2026-04-17T09:19:16.405735+00:00', 'Daniel Kim') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('37db103a-ec78-4921-bd2b-e6426d39762a', '4bcb187d-ddd3-4281-b99b-a54fbada8601', 'olivia.s@email.com', NULL, 5, 'Super happy with the outcome. Made the whole process easy and stress-free.', '2026-04-17T09:19:16.617203+00:00', 'Olivia Smith') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('8a747a1e-1b78-4b30-abe7-9c72800a4614', '4bcb187d-ddd3-4281-b99b-a54fbada8601', 'alex.j@email.com', NULL, 5, 'Absolutely incredible service! Exceeded all my expectations. Will definitely hire again.', '2026-04-17T09:19:16.83247+00:00', 'Alex Johnson') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('e993ad71-e372-4036-92d7-7f603820f3f1', '9c99cbc5-bfbf-4322-8b9a-fbf9a95847a7', 'priya.p@email.com', NULL, 4, 'Very professional and knowledgeable. Completed the job on time and within budget.', '2026-04-17T09:19:17.700072+00:00', 'Priya Patel') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('8fb2b0e3-b430-44cd-a059-c7e012e75292', '9c99cbc5-bfbf-4322-8b9a-fbf9a95847a7', 'marcus.l@email.com', NULL, 5, 'Great communication throughout. The quality of work was outstanding.', '2026-04-17T09:19:17.908512+00:00', 'Marcus Lee') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('019f7856-af11-44e4-8d19-3af7db494f3c', '9c99cbc5-bfbf-4322-8b9a-fbf9a95847a7', 'sarah.w@email.com', NULL, 5, 'Highly recommend! Responsive, skilled, and delivered exactly what we needed.', '2026-04-17T09:19:18.133164+00:00', 'Sarah Williams') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('3fcd291f-80aa-49a5-886c-b837bcace960', 'd870f043-fa61-4258-b959-0e7ac92abf9a', 'tom.b@email.com', NULL, 4, 'Fantastic experience from start to finish. Will be my go-to provider going forward.', '2026-04-17T09:19:19.002779+00:00', 'Tom Baker') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('a28e5797-a53f-4940-908d-ff58a31f4c95', 'd870f043-fa61-4258-b959-0e7ac92abf9a', 'nina.r@email.com', NULL, 5, 'Top-notch work. They really took the time to understand my needs before starting.', '2026-04-17T09:19:19.228902+00:00', 'Nina Rodriguez') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('76bccd4f-6a01-4f00-b936-6f3859c7e809', 'd870f043-fa61-4258-b959-0e7ac92abf9a', 'daniel.k@email.com', NULL, 5, 'Professional, punctual, and produced excellent results. 5 stars all the way.', '2026-04-17T09:19:19.439246+00:00', 'Daniel Kim') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('8ca18ca6-51da-45a3-911e-d5a76066775c', '661c3cf6-55c3-4ba4-8236-87ee378fd9c9', 'olivia.s@email.com', NULL, 4, 'Super happy with the outcome. Made the whole process easy and stress-free.', '2026-04-17T09:19:20.2933+00:00', 'Olivia Smith') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('d7ed4c35-5b40-4626-8643-63de27daf78b', '661c3cf6-55c3-4ba4-8236-87ee378fd9c9', 'alex.j@email.com', NULL, 5, 'Absolutely incredible service! Exceeded all my expectations. Will definitely hire again.', '2026-04-17T09:19:20.520394+00:00', 'Alex Johnson') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('b989d3f4-449b-47d5-98cf-ec01a8c4fbd1', '661c3cf6-55c3-4ba4-8236-87ee378fd9c9', 'priya.p@email.com', NULL, 5, 'Very professional and knowledgeable. Completed the job on time and within budget.', '2026-04-17T09:19:20.748225+00:00', 'Priya Patel') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('e4344a9f-e879-4277-b11b-f1c1e6cbbe5c', '05495ccb-43f1-4690-9520-82e31e503726', 'marcus.l@email.com', NULL, 4, 'Great communication throughout. The quality of work was outstanding.', '2026-04-17T09:19:21.594391+00:00', 'Marcus Lee') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('a65f29bb-2df3-4c59-bb0f-4dfe142fa7e7', '05495ccb-43f1-4690-9520-82e31e503726', 'sarah.w@email.com', NULL, 5, 'Highly recommend! Responsive, skilled, and delivered exactly what we needed.', '2026-04-17T09:19:21.804661+00:00', 'Sarah Williams') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('26cc8ef6-1591-4482-b542-4df736ee4c7e', '05495ccb-43f1-4690-9520-82e31e503726', 'tom.b@email.com', NULL, 5, 'Fantastic experience from start to finish. Will be my go-to provider going forward.', '2026-04-17T09:19:22.014087+00:00', 'Tom Baker') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('cda627aa-e5ba-4bb8-b65a-9a857fb50ad6', '9e147cd2-3779-461f-9b45-69e72cdabdbd', 'nina.r@email.com', NULL, 4, 'Top-notch work. They really took the time to understand my needs before starting.', '2026-04-17T09:19:22.865226+00:00', 'Nina Rodriguez') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('3aa85896-f1e6-4536-8cd3-a51c27df9a44', '8a429109-697c-4d83-a472-bcf445cc85dd', 'marcus.l@email.com', NULL, 5, 'Great communication throughout. The quality of work was outstanding.', '2026-04-17T09:19:24.560439+00:00', 'Marcus Lee') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('48a7eece-0587-44e5-8cf5-0eff0d11f494', 'd2bf56c4-78c1-46bb-8e9d-e4f701873014', 'sarah.w@email.com', NULL, 4, 'Highly recommend! Responsive, skilled, and delivered exactly what we needed.', '2026-04-17T09:19:25.410472+00:00', 'Sarah Williams') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('06c22d41-191e-486f-a169-ab407c3a49b6', 'd810717d-f2d4-401e-9f3c-9fe097ed06aa', 'alex.j@email.com', NULL, 5, 'Absolutely incredible service! Exceeded all my expectations. Will definitely hire again.', '2026-04-17T09:19:27.104463+00:00', 'Alex Johnson') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('82c41a1d-2b39-48e9-8faa-71cbf75e5f67', 'b0352d48-2ecc-444d-b6ce-fb392f6675c2', 'priya.p@email.com', NULL, 4, 'Very professional and knowledgeable. Completed the job on time and within budget.', '2026-04-17T09:19:27.961757+00:00', 'Priya Patel') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('5b2dcbcd-f270-4970-9b83-8cb184e1fbb1', '42b646cd-a385-4424-b49f-8aff226bd1a7', 'daniel.k@email.com', NULL, 5, 'Professional, punctual, and produced excellent results. 5 stars all the way.', '2026-04-17T09:19:29.672638+00:00', 'Daniel Kim') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('f9980984-5777-43fc-b0af-9b38bfa2e39c', '9e147cd2-3779-461f-9b45-69e72cdabdbd', 'daniel.k@email.com', NULL, 5, 'Professional, punctual, and produced excellent results. 5 stars all the way.', '2026-04-17T09:19:23.070407+00:00', 'Daniel Kim') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('7821ef48-947b-4b23-bd97-0b21915cc1d2', 'd2bf56c4-78c1-46bb-8e9d-e4f701873014', 'tom.b@email.com', NULL, 5, 'Fantastic experience from start to finish. Will be my go-to provider going forward.', '2026-04-17T09:19:25.61447+00:00', 'Tom Baker') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('984cb2dc-f95d-42cc-9b5d-021599adbfae', 'b0352d48-2ecc-444d-b6ce-fb392f6675c2', 'marcus.l@email.com', NULL, 5, 'Great communication throughout. The quality of work was outstanding.', '2026-04-17T09:19:28.166166+00:00', 'Marcus Lee') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('c3052363-51fd-493e-990e-2e1df549b5db', '9e147cd2-3779-461f-9b45-69e72cdabdbd', 'olivia.s@email.com', NULL, 5, 'Super happy with the outcome. Made the whole process easy and stress-free.', '2026-04-17T09:19:23.290011+00:00', 'Olivia Smith') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('53a215b3-8f57-4079-b61e-9d017548f357', '8a429109-697c-4d83-a472-bcf445cc85dd', 'alex.j@email.com', NULL, 4, 'Absolutely incredible service! Exceeded all my expectations. Will definitely hire again.', '2026-04-17T09:19:24.138605+00:00', 'Alex Johnson') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('68782ff2-4b37-43c7-a7a8-5027490023e1', 'd2bf56c4-78c1-46bb-8e9d-e4f701873014', 'nina.r@email.com', NULL, 5, 'Top-notch work. They really took the time to understand my needs before starting.', '2026-04-17T09:19:25.826758+00:00', 'Nina Rodriguez') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('a49bed97-3aec-47ec-a373-55296752c201', 'd810717d-f2d4-401e-9f3c-9fe097ed06aa', 'daniel.k@email.com', NULL, 4, 'Professional, punctual, and produced excellent results. 5 stars all the way.', '2026-04-17T09:19:26.681897+00:00', 'Daniel Kim') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('875f955d-747f-40ff-9e22-f6aaed5f5033', 'b0352d48-2ecc-444d-b6ce-fb392f6675c2', 'sarah.w@email.com', NULL, 5, 'Highly recommend! Responsive, skilled, and delivered exactly what we needed.', '2026-04-17T09:19:28.383594+00:00', 'Sarah Williams') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('054b07d3-4e1a-447e-8775-194deed2f611', '42b646cd-a385-4424-b49f-8aff226bd1a7', 'tom.b@email.com', NULL, 4, 'Fantastic experience from start to finish. Will be my go-to provider going forward.', '2026-04-17T09:19:29.249365+00:00', 'Tom Baker') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('afb2a66f-162a-4c8a-af2d-d4c5a5a8e962', '8a429109-697c-4d83-a472-bcf445cc85dd', 'priya.p@email.com', NULL, 5, 'Very professional and knowledgeable. Completed the job on time and within budget.', '2026-04-17T09:19:24.342515+00:00', 'Priya Patel') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('18f218f1-134f-4e16-8f8d-3f6ad40b0a6c', 'd810717d-f2d4-401e-9f3c-9fe097ed06aa', 'olivia.s@email.com', NULL, 5, 'Super happy with the outcome. Made the whole process easy and stress-free.', '2026-04-17T09:19:26.891632+00:00', 'Olivia Smith') ON CONFLICT (id) DO NOTHING;
INSERT INTO reviews ("id", "provider_id", "customer_email", "order_id", "rating", "comment", "created_at", "customer_name") VALUES ('c2dceb3b-2f3f-4f9e-a0a1-9ea3050eaf43', '42b646cd-a385-4424-b49f-8aff226bd1a7', 'nina.r@email.com', NULL, 5, 'Top-notch work. They really took the time to understand my needs before starting.', '2026-04-17T09:19:29.46222+00:00', 'Nina Rodriguez') ON CONFLICT (id) DO NOTHING;

-- subscription_plans (4 rows)
INSERT INTO subscription_plans ("id", "name", "price_monthly", "price_yearly", "features", "max_services", "is_active", "created_at", "price", "commission_rate", "sort_order") VALUES ('cb7c57fa-08d1-418d-a677-846789a82598', 'Free', NULL, NULL, ARRAY["5 services","Basic profile","Standard support"], NULL, true, '2026-03-13T01:32:50.927743+00:00', 0.0, 15.0, 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO subscription_plans ("id", "name", "price_monthly", "price_yearly", "features", "max_services", "is_active", "created_at", "price", "commission_rate", "sort_order") VALUES ('ddcc409c-b973-4b14-bc24-153bdb7ebede', 'Starter', NULL, NULL, ARRAY["20 services","Featured listing","Priority support","Analytics"], NULL, true, '2026-03-13T01:32:50.927743+00:00', 19.99, 10.0, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO subscription_plans ("id", "name", "price_monthly", "price_yearly", "features", "max_services", "is_active", "created_at", "price", "commission_rate", "sort_order") VALUES ('9d1e19ae-49dc-4745-83a3-00c3bde3363d', 'Pro', NULL, NULL, ARRAY["Unlimited services","Top listing","Dedicated support","Advanced analytics","Instant payouts"], NULL, true, '2026-03-13T01:32:50.927743+00:00', 49.99, 7.0, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO subscription_plans ("id", "name", "price_monthly", "price_yearly", "features", "max_services", "is_active", "created_at", "price", "commission_rate", "sort_order") VALUES ('a84800a6-e351-444d-828d-88e26bf76a99', 'Enterprise', NULL, NULL, ARRAY["Everything in Pro","Custom branding","API access","Account manager"], NULL, true, '2026-03-13T01:32:50.927743+00:00', 99.99, 5.0, 4) ON CONFLICT (id) DO NOTHING;

-- site_settings (10 rows)
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('f45e471b-6c0e-471c-9b69-2d50fb7e86bd', 'site_name', 'Kindness Community Foundation', 'text', 'Site display name', 'general', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('d24dc8e1-3677-4ecd-846c-b9d9991869ba', 'site_tagline', 'Structured Community Infrastructure', 'text', 'Site tagline', 'general', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('df5f8aac-183f-40a2-bc0b-a47aeed8614f', 'contact_email', 'contact@kindnesscommunityfoundation.com', 'text', 'Contact email', 'general', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('d530ae12-4cff-4285-9193-1ea43ee73ac9', 'social_facebook', '', 'url', 'Facebook URL', 'social', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('bafdd609-88f3-4e31-906e-c19777b4bdf2', 'social_twitter', '', 'url', 'Twitter/X URL', 'social', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('efee29c0-4aa5-4ddc-82e7-6093c9421836', 'social_instagram', '', 'url', 'Instagram URL', 'social', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('03c7ab55-8d87-4a55-802e-9610479ae8f5', 'social_linkedin', '', 'url', 'LinkedIn URL', 'social', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('8f32736f-d705-4f28-8be7-2edcc6a379a2', 'enable_volunteer', 'true', 'boolean', 'Show Volunteer section', 'features', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('3a3639ef-1003-4058-875f-c84a1762f0d8', 'enable_giving', 'true', 'boolean', 'Show Giving section', 'features', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO site_settings ("id", "setting_key", "setting_value", "setting_type", "description", "category", "created_at", "updated_at") VALUES ('73cfdb26-2267-4b87-87bd-587686af29c4', 'enable_team_portal', 'true', 'boolean', 'Show Team Portal', 'features', '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;

-- seo_settings (7 rows)
INSERT INTO seo_settings ("id", "page_path", "page_name", "meta_title", "meta_description", "og_title", "og_description", "og_image", "keywords", "created_at", "updated_at") VALUES ('876742ab-60c4-4d78-b7d7-674c19a4f105', '/', 'Home', 'Kindness Community Foundation', 'Building structured community infrastructure for volunteer, giving, and team collaboration.', NULL, NULL, NULL, NULL, '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO seo_settings ("id", "page_path", "page_name", "meta_title", "meta_description", "og_title", "og_description", "og_image", "keywords", "created_at", "updated_at") VALUES ('689f2a90-8e56-4cf6-b20b-a370233e1ef8', '/VolunteerDashboard', 'Volunteer Dashboard', 'Volunteer Dashboard | KCF', 'Track your volunteer hours, badges, and initiatives.', NULL, NULL, NULL, NULL, '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO seo_settings ("id", "page_path", "page_name", "meta_title", "meta_description", "og_title", "og_description", "og_image", "keywords", "created_at", "updated_at") VALUES ('017a5ac3-7dde-420d-8f35-7d5af404a7a0', '/GivingDashboard', 'Giving Dashboard', 'Giving Dashboard | KCF', 'Manage donations, subscriptions, and giving goals.', NULL, NULL, NULL, NULL, '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO seo_settings ("id", "page_path", "page_name", "meta_title", "meta_description", "og_title", "og_description", "og_image", "keywords", "created_at", "updated_at") VALUES ('2f3109e0-a0cb-44a2-8e8b-b5c8b627755d', '/TeamPortal', 'Team Portal', 'Team Portal | KCF', 'Team collaboration hub for messages, tasks, and documents.', NULL, NULL, NULL, NULL, '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO seo_settings ("id", "page_path", "page_name", "meta_title", "meta_description", "og_title", "og_description", "og_image", "keywords", "created_at", "updated_at") VALUES ('a4c0feea-be9d-43f3-a26e-5f2d0ec10e65', '/Analytics', 'Analytics', 'Analytics | KCF', 'System analytics and metrics dashboard.', NULL, NULL, NULL, NULL, '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO seo_settings ("id", "page_path", "page_name", "meta_title", "meta_description", "og_title", "og_description", "og_image", "keywords", "created_at", "updated_at") VALUES ('604fb4c9-ee14-4b06-a0f9-f8ea51492133', '/KindnessConnect', 'Kindness Connect', 'Kindness Connect | KCF', 'Connect and give back through Kindness Connect.', NULL, NULL, NULL, NULL, '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO seo_settings ("id", "page_path", "page_name", "meta_title", "meta_description", "og_title", "og_description", "og_image", "keywords", "created_at", "updated_at") VALUES ('440a0236-36c3-4a43-85e9-4b6308d987f5', '/Admin', 'Admin Panel', 'Admin Panel | KCF', 'Admin dashboard for managing the Kindness Community site.', NULL, NULL, NULL, NULL, '2026-03-17T02:22:29.394434+00:00', '2026-03-17T02:22:29.394434+00:00') ON CONFLICT (id) DO NOTHING;

-- users (5 rows)
INSERT INTO users ("id", "email", "full_name", "role", "avatar_url", "bio", "phone", "department", "created_at", "updated_at") VALUES ('1ec6fc08-9a12-4d50-bb2b-d573bc2b616e', 'akkumaralok1988@gmail.com', 'Steve', 'user', NULL, NULL, NULL, NULL, '2026-03-16T16:09:09.679449+00:00', '2026-03-16T16:09:09.679449+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO users ("id", "email", "full_name", "role", "avatar_url", "bio", "phone", "department", "created_at", "updated_at") VALUES ('f733d1ee-a7ff-4096-a9aa-28869cf4b3e7', 'manojrajauriya@zohomail.in', NULL, 'user', NULL, NULL, NULL, NULL, '2026-03-17T01:26:57.378329+00:00', '2026-03-17T01:26:57.378329+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO users ("id", "email", "full_name", "role", "avatar_url", "bio", "phone", "department", "created_at", "updated_at") VALUES ('368a7ce0-366d-4682-8263-9ebb31665047', 'admin@gmail.com', 'Admin', 'user', NULL, NULL, NULL, NULL, '2026-03-17T02:26:05.302695+00:00', '2026-03-17T02:26:05.302695+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO users ("id", "email", "full_name", "role", "avatar_url", "bio", "phone", "department", "created_at", "updated_at") VALUES ('8827ae0b-3416-4e10-b5fc-a670801ee94a', 'ranu.rajoriya@gmail.com', 'Ranu', 'admin', NULL, NULL, NULL, NULL, '2026-03-17T01:03:12.30711+00:00', '2026-03-17T01:03:12.30711+00:00') ON CONFLICT (id) DO NOTHING;
INSERT INTO users ("id", "email", "full_name", "role", "avatar_url", "bio", "phone", "department", "created_at", "updated_at") VALUES ('290fb67c-4bf6-441b-b6a3-fd8aa933af0f', 'fred@kindnesscommunity.ai', NULL, 'user', NULL, NULL, NULL, NULL, '2026-03-17T16:36:52.566946+00:00', '2026-03-17T16:36:52.566946+00:00') ON CONFLICT (id) DO NOTHING;

-- user_profiles (1 rows)
INSERT INTO user_profiles ("id", "user_id", "email", "full_name", "avatar_url", "role", "phone", "created_at", "preferred_language", "saved_providers") VALUES ('72764f8d-c96c-44e7-949e-a4ea68615f20', NULL, 'contact@kindnesscommunityfoundation.com', 'Admin', NULL, 'admin', NULL, '2026-03-13T00:59:51.450805+00:00', 'en', ARRAY[]::text[]) ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- Done! All tables created and data migrated.
-- ================================================================