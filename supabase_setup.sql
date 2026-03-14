-- ============================================================
-- SERVICE CONNECT PRO — Complete Supabase Schema Setup
-- Safe to re-run: uses IF NOT EXISTS and ALTER TABLE for existing tables
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'customer',
  preferred_language TEXT DEFAULT 'en',
  saved_providers UUID[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS saved_providers UUID[] DEFAULT '{}';

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile"   ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"   ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. SERVICE CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS service_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  icon        TEXT,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read categories"    ON service_categories;
DROP POLICY IF EXISTS "Admins can manage categories"  ON service_categories;
CREATE POLICY "Anyone can read categories" ON service_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage categories" ON service_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed categories (skip if already exist by name)
INSERT INTO service_categories (name, icon, description, sort_order) VALUES
  ('AI & Automation',   '🤖', 'AI tools, chatbots, workflow automation',    1),
  ('Plumbing',          '🔧', 'Pipe repairs, installations, leak fixing',    2),
  ('Electrical',        '⚡', 'Wiring, repairs, installations',              3),
  ('Cleaning',          '🧹', 'Home and office cleaning services',           4),
  ('Catering',          '🍽️', 'Event catering and meal preparation',        5),
  ('Data Science',      '📊', 'Data analysis, ML models, dashboards',       6),
  ('Web Development',   '💻', 'Websites, apps, and web services',           7),
  ('Tutoring',          '📚', 'Academic tutoring and skill coaching',        8),
  ('Moving & Delivery', '🚚', 'Moving, packing, and delivery services',     9),
  ('Photography',       '📷', 'Events, portraits, commercial photography',  10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. SERVICE PROVIDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS service_providers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id     UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  business_name   TEXT NOT NULL,
  owner_name      TEXT,
  owner_email     TEXT,
  phone           TEXT,
  description     TEXT,
  location        TEXT,
  avatar_url      TEXT,
  hourly_rate     NUMERIC(10,2),
  experience_years INT DEFAULT 0,
  rating          NUMERIC(3,2) DEFAULT 0,
  total_reviews   INT DEFAULT 0,
  total_orders    INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  availability    TEXT DEFAULT 'available',
  working_days    TEXT[] DEFAULT '{}',
  documents       JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS total_orders INT DEFAULT 0;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available';
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS working_days TEXT[] DEFAULT '{}';
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}';
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0;
ALTER TABLE service_providers ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;

ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active providers"            ON service_providers;
DROP POLICY IF EXISTS "Providers can update own profile"            ON service_providers;
DROP POLICY IF EXISTS "Authenticated users can create provider"     ON service_providers;
DROP POLICY IF EXISTS "Admins can delete providers"                 ON service_providers;
CREATE POLICY "Anyone can read active providers"  ON service_providers FOR SELECT USING (TRUE);
CREATE POLICY "Providers can update own profile"  ON service_providers FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can create provider" ON service_providers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete providers" ON service_providers FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 4. SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id         UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  price               NUMERIC(10,2),
  price_type          TEXT DEFAULT 'fixed',
  duration_minutes    INT,
  is_active           BOOLEAN DEFAULT TRUE,
  is_instant_booking  BOOLEAN DEFAULT FALSE,
  is_featured         BOOLEAN DEFAULT FALSE,
  images              TEXT[] DEFAULT '{}',
  faqs                JSONB DEFAULT '[]',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'fixed';
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration_minutes INT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_instant_booking BOOLEAN DEFAULT FALSE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE services ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]';

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active services"    ON services;
DROP POLICY IF EXISTS "Providers can manage own services"  ON services;
CREATE POLICY "Anyone can read active services"    ON services FOR SELECT USING (TRUE);
CREATE POLICY "Providers can manage own services"  ON services FOR ALL USING (
  EXISTS (SELECT 1 FROM service_providers WHERE id = provider_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 5. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number      TEXT UNIQUE DEFAULT 'ORD-' || UPPER(SUBSTR(uuid_generate_v4()::TEXT, 1, 8)),
  provider_id       UUID REFERENCES service_providers(id) ON DELETE SET NULL,
  service_id        UUID REFERENCES services(id) ON DELETE SET NULL,
  customer_email    TEXT,
  customer_name     TEXT,
  customer_phone    TEXT,
  service_name      TEXT,
  provider_name     TEXT,
  scheduled_date    DATE,
  scheduled_time    TEXT,
  address           TEXT,
  subtotal          NUMERIC(10,2) DEFAULT 0,
  commission_rate   NUMERIC(5,2) DEFAULT 10,
  commission_amount NUMERIC(10,2) DEFAULT 0,
  tax_rate          NUMERIC(5,2) DEFAULT 0,
  tax_amount        NUMERIC(10,2) DEFAULT 0,
  tip_amount        NUMERIC(10,2) DEFAULT 0,
  total_amount      NUMERIC(10,2) DEFAULT 0,
  status            TEXT DEFAULT 'pending',
  payment_status    TEXT DEFAULT 'pending',
  payment_method    TEXT DEFAULT 'wallet',
  notes             TEXT,
  created_date      TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE DEFAULT 'ORD-' || UPPER(SUBSTR(uuid_generate_v4()::TEXT, 1, 8));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS provider_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tip_amount NUMERIC(10,2) DEFAULT 0;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Customers can read own orders"          ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders"  ON orders;
DROP POLICY IF EXISTS "Providers and admins can update orders" ON orders;
CREATE POLICY "Customers can read own orders" ON orders FOR SELECT USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM service_providers WHERE id = provider_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Providers and admins can update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM service_providers WHERE id = provider_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 6. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_email  TEXT,
  customer_name   TEXT,
  rating          INT,
  comment         TEXT,
  created_date    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS customer_email TEXT;

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read reviews"               ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can delete reviews"             ON reviews;
CREATE POLICY "Anyone can read reviews"               ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete reviews"             ON reviews FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT,
  recipient_type  TEXT,
  type            TEXT,
  title           TEXT,
  message         TEXT,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  channels        TEXT[] DEFAULT ARRAY['email'],
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS channels TEXT[] DEFAULT ARRAY['email'];
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own notifications"            ON notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications"          ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (
  recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can create notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (
  recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- ============================================================
-- 8. ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email  TEXT,
  label           TEXT DEFAULT 'Home',
  street          TEXT,
  city            TEXT,
  postal_code     TEXT,
  is_default      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- ============================================================
-- 9. WALLETS
-- ============================================================
CREATE TABLE IF NOT EXISTS wallets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email  TEXT UNIQUE,
  balance         NUMERIC(10,2) DEFAULT 0,
  total_added     NUMERIC(10,2) DEFAULT 0,
  total_spent     NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_added NUMERIC(10,2) DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_spent NUMERIC(10,2) DEFAULT 0;

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own wallet" ON wallets;
CREATE POLICY "Users can manage own wallet" ON wallets FOR ALL USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 10. TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email  TEXT,
  type            TEXT,
  amount          NUMERIC(10,2),
  payment_method  TEXT,
  description     TEXT,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_date    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own transactions"             ON transactions;
DROP POLICY IF EXISTS "Authenticated users can create transactions" ON transactions;
CREATE POLICY "Users can read own transactions" ON transactions FOR SELECT USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can create transactions" ON transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 11. PAYOUTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payouts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     UUID REFERENCES service_providers(id) ON DELETE SET NULL,
  provider_email  TEXT,
  amount          NUMERIC(10,2),
  status          TEXT DEFAULT 'pending',
  requested_date  TIMESTAMPTZ DEFAULT NOW(),
  processed_date  TIMESTAMPTZ,
  bank_name       TEXT,
  bank_account    TEXT,
  notes           TEXT
);
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS processed_date TIMESTAMPTZ;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Providers can manage own payouts" ON payouts;
CREATE POLICY "Providers can manage own payouts" ON payouts FOR ALL USING (
  provider_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 12. TAX CONFIGS
-- ============================================================
CREATE TABLE IF NOT EXISTS tax_configs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city        TEXT NOT NULL,
  tax_rate    NUMERIC(5,2) DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tax_configs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE tax_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read tax configs"   ON tax_configs;
DROP POLICY IF EXISTS "Admins can manage tax configs" ON tax_configs;
CREATE POLICY "Anyone can read tax configs"   ON tax_configs FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage tax configs" ON tax_configs FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

INSERT INTO tax_configs (city, tax_rate, is_active) VALUES
  ('Default',     5.00,  TRUE),
  ('New York',    8.875, TRUE),
  ('Los Angeles', 10.25, TRUE),
  ('Chicago',     10.25, TRUE),
  ('Mumbai',      18.00, TRUE),
  ('London',      20.00, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 13. PROMOTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS promotions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              TEXT UNIQUE NOT NULL,
  discount_type     TEXT,
  discount_value    NUMERIC(10,2),
  max_discount      NUMERIC(10,2),
  min_order_value   NUMERIC(10,2) DEFAULT 0,
  valid_until       TIMESTAMPTZ,
  is_active         BOOLEAN DEFAULT TRUE,
  current_usage     INT DEFAULT 0,
  max_usage         INT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS max_discount NUMERIC(10,2);
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS min_order_value NUMERIC(10,2) DEFAULT 0;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS max_usage INT;
ALTER TABLE promotions ADD COLUMN IF NOT EXISTS current_usage INT DEFAULT 0;

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can manage promotions"      ON promotions;
CREATE POLICY "Anyone can read active promotions" ON promotions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage promotions" ON promotions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 14. REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_email  TEXT,
  referred_email  TEXT,
  referred_type   TEXT,
  status          TEXT DEFAULT 'pending',
  reward_type     TEXT DEFAULT 'credit',
  reward_amount   NUMERIC(10,2) DEFAULT 50,
  completion_date TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referred_type TEXT;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT 'credit';
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reward_amount NUMERIC(10,2) DEFAULT 50;
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS completion_date TIMESTAMPTZ;

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own referrals"            ON referrals;
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON referrals;
CREATE POLICY "Users can read own referrals" ON referrals FOR SELECT USING (
  referrer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can create referrals" ON referrals FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 15. CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_email    TEXT,
  sender_type     TEXT,
  message         TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_type TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Order participants can read messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON chat_messages;
CREATE POLICY "Order participants can read messages" ON chat_messages FOR SELECT USING (
  sender_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Authenticated users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 16. SUBSCRIPTION PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  price           NUMERIC(10,2),
  commission_rate NUMERIC(5,2),
  features        TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can manage plans"      ON subscription_plans;
CREATE POLICY "Anyone can read active plans" ON subscription_plans FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage plans"      ON subscription_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

INSERT INTO subscription_plans (name, price, commission_rate, features, sort_order) VALUES
  ('Free',       0,     15.0, ARRAY['5 services','Basic profile','Standard support'], 1),
  ('Starter',    19.99, 10.0, ARRAY['20 services','Featured listing','Priority support','Analytics'], 2),
  ('Pro',        49.99,  7.0, ARRAY['Unlimited services','Top listing','Dedicated support','Advanced analytics','Instant payouts'], 3),
  ('Enterprise', 99.99,  5.0, ARRAY['Everything in Pro','Custom branding','API access','Account manager'], 4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 17. PROVIDER SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS provider_subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  provider_email  TEXT,
  plan_id         UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'active',
  start_date      TIMESTAMPTZ DEFAULT NOW(),
  renewal_date    TIMESTAMPTZ,
  auto_renew      BOOLEAN DEFAULT TRUE,
  payment_method  TEXT DEFAULT 'card',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE provider_subscriptions ADD COLUMN IF NOT EXISTS renewal_date TIMESTAMPTZ;
ALTER TABLE provider_subscriptions ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT TRUE;
ALTER TABLE provider_subscriptions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';

ALTER TABLE provider_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Providers can manage own subscriptions" ON provider_subscriptions;
CREATE POLICY "Providers can manage own subscriptions" ON provider_subscriptions FOR ALL USING (
  provider_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', TRUE)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Anyone can read uploads"        ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Anyone can read uploads"
  ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- ============================================================
-- Done!
-- ============================================================
