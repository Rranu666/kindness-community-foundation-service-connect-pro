-- ============================================================
-- Service Connect Pro — Missing Tables Migration
-- Run this in Supabase dashboard → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. BLOG POSTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  slug           TEXT UNIQUE,
  excerpt        TEXT,
  content        TEXT,
  author         TEXT DEFAULT 'Service Connect Pro',
  author_avatar  TEXT,
  category       TEXT,
  tags           TEXT[] DEFAULT '{}',
  featured_image TEXT,
  is_published   BOOLEAN DEFAULT FALSE,
  published_date TIMESTAMPTZ,
  views          INTEGER DEFAULT 0,
  read_time      INTEGER DEFAULT 5,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published posts" ON blog_posts;
CREATE POLICY "Public read published posts" ON blog_posts
  FOR SELECT USING (is_published = TRUE);
DROP POLICY IF EXISTS "Admins manage blog_posts" ON blog_posts;
CREATE POLICY "Admins manage blog_posts" ON blog_posts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, author, category, tags, featured_image, is_published, published_date, views, read_time) VALUES
(
  'How to Find a Reliable Plumber in Los Angeles',
  'find-reliable-plumber-los-angeles',
  'Finding a trustworthy plumber in LA doesn''t have to be stressful. Here''s everything you need to know.',
  '<h2>Why Plumbing Matters</h2><p>Los Angeles homeowners face unique plumbing challenges — from aging pipes to hard water issues. Finding a licensed, vetted plumber is the first step to protecting your home.</p><h2>What to Look For</h2><p>Always verify a California State License Board (CSLB) license number. Check for insurance, read recent reviews, and confirm upfront pricing before any work begins.</p><h2>How Service Connect Pro Helps</h2><p>Every plumber on our platform is license-verified, background-checked, and rated by real customers. You get locked-in pricing before work starts — no surprises.</p>',
  'Service Connect Pro',
  'plumbing',
  ARRAY['plumbing', 'los-angeles', 'tips', 'licensing'],
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW() - INTERVAL '5 days',
  1240,
  6
),
(
  'AC Maintenance Tips for California Summers',
  'ac-maintenance-tips-california',
  'Keep your air conditioning running efficiently all summer long with these expert HVAC tips.',
  '<h2>California Summers Are No Joke</h2><p>With temperatures regularly exceeding 100°F in parts of Southern California, a properly functioning AC system isn''t a luxury — it''s a necessity.</p><h2>Change Your Filters</h2><p>HVAC filters should be replaced every 1–3 months. A clogged filter forces your system to work harder, increasing energy bills and shortening equipment life.</p><h2>Schedule Annual Tune-Ups</h2><p>A professional HVAC technician can catch small problems before they become expensive emergencies. Book your tune-up in spring before demand peaks.</p>',
  'Service Connect Pro',
  'hvac',
  ARRAY['hvac', 'air-conditioning', 'summer', 'maintenance'],
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW() - INTERVAL '10 days',
  987,
  5
),
(
  'The Ultimate House Cleaning Checklist',
  'ultimate-house-cleaning-checklist',
  'A room-by-room guide to a spotless home, from a professional cleaning crew''s perspective.',
  '<h2>Kitchen Deep Clean</h2><p>Start with appliances: clean inside the microwave, degrease the stovetop, and wipe down the refrigerator. Don''t forget cabinet fronts and the area behind the stove.</p><h2>Bathroom Essentials</h2><p>Scrub tiles and grout, disinfect the toilet (inside and out), clean mirrors streak-free, and replace any worn caulking.</p><h2>Living Areas</h2><p>Dust ceiling fans and light fixtures first, then work down to furniture, baseboards, and finally vacuum or mop floors.</p>',
  'Service Connect Pro',
  'cleaning',
  ARRAY['cleaning', 'checklist', 'deep-clean', 'tips'],
  'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW() - INTERVAL '15 days',
  2100,
  8
),
(
  '5 Signs You Need Emergency Plumbing Right Now',
  '5-signs-emergency-plumbing',
  'Don''t wait until it''s too late. These warning signs mean you need a plumber immediately.',
  '<h2>1. Burst or Leaking Pipes</h2><p>If you see water spraying or hear rushing water inside walls, shut off your main water valve immediately and call an emergency plumber.</p><h2>2. No Hot Water</h2><p>A failed water heater can indicate gas or electrical issues. Don''t attempt repairs yourself — call a licensed tech.</p><h2>3. Sewage Backup</h2><p>Multiple drains backing up simultaneously is a sign of a main sewer line blockage — a serious health hazard requiring immediate professional attention.</p>',
  'Service Connect Pro',
  'emergency_repairs',
  ARRAY['emergency', 'plumbing', 'warning-signs', 'urgent'],
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW() - INTERVAL '20 days',
  3450,
  4
),
(
  'Why Recurring Home Maintenance Saves You Money',
  'recurring-maintenance-saves-money',
  'Preventive care for your home costs a fraction of emergency repairs. Here''s the math.',
  '<h2>The Real Cost of Deferred Maintenance</h2><p>A $20 filter replacement today can prevent a $2,000 HVAC replacement in two years. Deferred maintenance is the #1 reason homeowners face unexpected large bills.</p><h2>Monthly vs. Annual Plans</h2><p>Recurring service plans typically offer 15–30% savings over one-time bookings. Plus, you get priority scheduling and dedicated professionals who know your home.</p>',
  'Service Connect Pro',
  'maintenance',
  ARRAY['recurring', 'maintenance', 'savings', 'tips'],
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW() - INTERVAL '25 days',
  876,
  6
),
(
  'How to Spot a Fake Contractor (And Avoid Them)',
  'spot-fake-contractor-avoid',
  'Unlicensed contractors cost California homeowners millions each year. Here''s how to protect yourself.',
  '<h2>The License Check</h2><p>Every licensed contractor in California has a CSLB number. Verify it at cslb.ca.gov before any work begins. An unlicensed contractor cannot legally perform most home improvement work over $500.</p><h2>Red Flags</h2><p>Demands for large cash payments upfront, no written contract, and pressure to decide immediately are classic signs of a scam contractor.</p><h2>Our Guarantee</h2><p>Service Connect Pro pre-verifies every provider''s license before they can join our platform. You never have to worry about unlicensed work.</p>',
  'Service Connect Pro',
  'tips',
  ARRAY['tips', 'scam', 'contractor', 'licensing', 'california'],
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  TRUE,
  NOW() - INTERVAL '30 days',
  4200,
  7
)
ON CONFLICT (slug) DO NOTHING;


-- ── 2. FAVORITES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email TEXT NOT NULL,
  provider_id    UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_email, provider_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own favorites" ON favorites;
CREATE POLICY "Users manage own favorites" ON favorites FOR ALL USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);


-- ── 3. INVOICES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email TEXT NOT NULL,
  order_id       UUID REFERENCES orders(id) ON DELETE SET NULL,
  provider_id    UUID REFERENCES service_providers(id) ON DELETE SET NULL,
  amount         NUMERIC(10,2),
  tax_amount     NUMERIC(10,2) DEFAULT 0,
  total_amount   NUMERIC(10,2),
  status         TEXT DEFAULT 'pending',
  description    TEXT,
  invoice_number TEXT,
  due_date       TIMESTAMPTZ,
  paid_date      TIMESTAMPTZ,
  created_date   TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own invoices" ON invoices;
CREATE POLICY "Users read own invoices" ON invoices FOR SELECT USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Auth insert invoices" ON invoices;
CREATE POLICY "Auth insert invoices" ON invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Auth update invoices" ON invoices;
CREATE POLICY "Auth update invoices" ON invoices FOR UPDATE USING (auth.role() = 'authenticated');


-- ── 4. CHAT CONVERSATIONS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_conversations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email   TEXT,
  customer_name    TEXT,
  provider_id      UUID REFERENCES service_providers(id) ON DELETE SET NULL,
  provider_email   TEXT,
  provider_name    TEXT,
  last_message     TEXT,
  last_message_at  TIMESTAMPTZ,
  unread_count     INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'active',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Participants read own conversations" ON chat_conversations;
CREATE POLICY "Participants read own conversations" ON chat_conversations FOR SELECT USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR provider_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
DROP POLICY IF EXISTS "Auth all chat_conversations" ON chat_conversations;
CREATE POLICY "Auth all chat_conversations" ON chat_conversations FOR ALL USING (auth.role() = 'authenticated');


-- ── 5. PROVIDER AVAILABILITY ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS provider_availability (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id  UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  day_of_week  INTEGER, -- 0=Sun, 1=Mon, ..., 6=Sat
  start_time   TEXT,    -- e.g. '09:00'
  end_time     TEXT,    -- e.g. '17:00'
  is_available BOOLEAN DEFAULT TRUE,
  date_override DATE,   -- for specific date overrides
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read provider_availability" ON provider_availability;
CREATE POLICY "Public read provider_availability" ON provider_availability
  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Providers manage own availability" ON provider_availability;
CREATE POLICY "Providers manage own availability" ON provider_availability FOR ALL USING (
  EXISTS (
    SELECT 1 FROM service_providers
    WHERE id = provider_id AND owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);


-- ── 6. TAX CONFIGS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tax_configs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city       TEXT NOT NULL,
  tax_rate   NUMERIC(5,2) DEFAULT 0,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tax_configs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read tax configs" ON tax_configs;
CREATE POLICY "Anyone can read tax configs" ON tax_configs FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins manage tax_configs" ON tax_configs;
CREATE POLICY "Admins manage tax_configs" ON tax_configs FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

INSERT INTO tax_configs (city, tax_rate, is_active) VALUES
  ('Default',       0.00,  TRUE),
  ('Los Angeles',  10.25,  TRUE),
  ('San Diego',     7.75,  TRUE),
  ('San Francisco', 8.625, TRUE),
  ('San Jose',      9.375, TRUE),
  ('Sacramento',    8.75,  TRUE),
  ('Orange County', 7.75,  TRUE),
  ('Fresno',        8.35,  TRUE),
  ('Riverside',     8.75,  TRUE)
ON CONFLICT DO NOTHING;


-- ── Done! ────────────────────────────────────────────────────────────────────
