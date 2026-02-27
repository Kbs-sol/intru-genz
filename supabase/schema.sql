-- =============================================================
-- intru.in Supabase Schema (v2)
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor
-- 
-- CHANGES from v1:
-- - RLS policies fixed: products + legal_pages use TRUE for anon reads
-- - Seed data uses intru.in CDN image URLs
-- - Orders INSERT policy added for anon/authenticated
-- - Full legal page content included in seed
-- =============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  google_id TEXT UNIQUE,
  phone TEXT,
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  price INTEGER NOT NULL,
  compare_price INTEGER,
  currency TEXT DEFAULT 'INR',
  images JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  store_credit_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'payment_failed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  shipping_address JSONB,
  tracking_number TEXT,
  tracking_url TEXT,
  failure_reason TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 4. STORE CREDITS TABLE
CREATE TABLE IF NOT EXISTS store_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('refund', 'defect', 'wrong_item', 'goodwill', 'promotional')),
  order_id UUID REFERENCES orders(id),
  issued_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_credits_email ON store_credits(email);

-- 5. LEGAL PAGES TABLE
CREATE TABLE IF NOT EXISTS legal_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at DATE DEFAULT CURRENT_DATE
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- CRITICAL FIX: Use TRUE for public tables so anon key works
-- =============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are editable by service role" ON products;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Service role has full access to orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own store credits" ON store_credits;
DROP POLICY IF EXISTS "Service role has full access to store credits" ON store_credits;
DROP POLICY IF EXISTS "Legal pages are viewable by everyone" ON legal_pages;
DROP POLICY IF EXISTS "Legal pages are editable by service role" ON legal_pages;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Service role has full access to users" ON users;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

-- Products: public SELECT (anon + authenticated), service-role full CRUD
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);

CREATE POLICY "Products are editable by service role"
  ON products FOR ALL USING (auth.role() = 'service_role');

-- Legal Pages: public SELECT, service-role full CRUD
CREATE POLICY "Legal pages are viewable by everyone"
  ON legal_pages FOR SELECT USING (true);

CREATE POLICY "Legal pages are editable by service role"
  ON legal_pages FOR ALL USING (auth.role() = 'service_role');

-- Orders: anyone can INSERT (checkout creates orders), service-role full access
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role has full access to orders"
  ON orders FOR ALL USING (auth.role() = 'service_role');

-- Store Credits: service-role full access
CREATE POLICY "Service role has full access to store credits"
  ON store_credits FOR ALL USING (auth.role() = 'service_role');

-- Users: service-role full access (upsert on Google auth)
CREATE POLICY "Service role has full access to users"
  ON users FOR ALL USING (auth.role() = 'service_role');

-- =============================================================
-- SEED DATA: Products (p1-p6) with intru.in CDN images
-- =============================================================

INSERT INTO products (id, slug, name, tagline, description, price, compare_price, currency, images, sizes, category, in_stock, featured) VALUES
  ('p1', 'essential-oversized-tee', 'Essential Oversized Tee', 'The foundation of every outfit',
   'Our signature oversized tee crafted from 240 GSM premium cotton. Drop shoulders, ribbed neckline, and a relaxed fit that drapes perfectly. Pre-shrunk and garment-dyed for that lived-in softness from day one.',
   1299, 1799, 'INR',
   '["https://intru.in/cdn/shop/files/3.png?v=1748498083&width=800","https://intru.in/cdn/shop/files/1_83d03bc1-1a42-4357-8d82-76fbd6a2b651.png?v=1748498083&width=800","https://intru.in/cdn/shop/files/2_a58345be-8c36-4db5-a9a5-f88e19e3c22d.png?v=1748498083&width=800","https://intru.in/cdn/shop/files/4_28b80a7c-be7e-4f21-bf58-f64b90c11d19.png?v=1748498083&width=800"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 'Tops', true, true),

  ('p2', 'midnight-cargo-joggers', 'Midnight Cargo Joggers', 'Utility meets comfort',
   'Relaxed-fit cargo joggers in washed black. Six-pocket design with snap closures, elastic waistband with drawcord, and tapered ankles with adjustable toggles. Built from heavyweight French terry.',
   1999, 2499, 'INR',
   '["https://intru.in/cdn/shop/files/jogger1.png?v=1748500000&width=800","https://intru.in/cdn/shop/files/jogger2.png?v=1748500000&width=800","https://intru.in/cdn/shop/files/jogger3.png?v=1748500000&width=800","https://intru.in/cdn/shop/files/jogger4.png?v=1748500000&width=800"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 'Bottoms', true, true),

  ('p3', 'structured-minimal-hoodie', 'Structured Minimal Hoodie', 'Clean lines, warm soul',
   'A heavyweight 360 GSM hoodie with a structured silhouette. Kangaroo pocket, flat drawcord, and double-needle stitching throughout. The hood holds its shape without feeling stiff.',
   2499, 3199, 'INR',
   '["https://intru.in/cdn/shop/files/hoodie1.png?v=1748500100&width=800","https://intru.in/cdn/shop/files/hoodie2.png?v=1748500100&width=800","https://intru.in/cdn/shop/files/hoodie3.png?v=1748500100&width=800","https://intru.in/cdn/shop/files/hoodie4.png?v=1748500100&width=800"]'::jsonb,
   '["S","M","L","XL"]'::jsonb, 'Tops', true, true),

  ('p4', 'everyday-slim-chinos', 'Everyday Slim Chinos', 'From desk to dinner',
   'Slim-fit chinos in stone wash. Stretch cotton twill with a soft hand-feel. Clean front, slant pockets, and a tapered leg that works with sneakers or boots. Wrinkle-resistant finish.',
   1799, NULL, 'INR',
   '["https://intru.in/cdn/shop/files/chinos1.png?v=1748500200&width=800","https://intru.in/cdn/shop/files/chinos2.png?v=1748500200&width=800","https://intru.in/cdn/shop/files/chinos3.png?v=1748500200&width=800","https://intru.in/cdn/shop/files/chinos4.png?v=1748500200&width=800"]'::jsonb,
   '["28","30","32","34","36"]'::jsonb, 'Bottoms', true, false),

  ('p5', 'graphic-art-tee-vol1', 'Graphic Art Tee Vol. 1', 'Wearable expression',
   'Limited-edition graphic tee featuring original artwork by independent Indian artists. Screen-printed on our signature 240 GSM cotton base. Each print is unique.',
   1499, NULL, 'INR',
   '["https://intru.in/cdn/shop/files/graphic1.png?v=1748500300&width=800","https://intru.in/cdn/shop/files/graphic2.png?v=1748500300&width=800","https://intru.in/cdn/shop/files/graphic3.png?v=1748500300&width=800","https://intru.in/cdn/shop/files/graphic4.png?v=1748500300&width=800"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 'Tops', true, true),

  ('p6', 'monochrome-zip-jacket', 'Monochrome Zip Jacket', 'Layer with intent',
   'Lightweight zip-up jacket in matte black. Water-resistant shell with a soft mesh lining. Minimal branding, hidden pockets, and a clean stand collar. Packs into its own pocket for travel.',
   2999, 3999, 'INR',
   '["https://intru.in/cdn/shop/files/jacket1.png?v=1748500400&width=800","https://intru.in/cdn/shop/files/jacket2.png?v=1748500400&width=800","https://intru.in/cdn/shop/files/jacket3.png?v=1748500400&width=800","https://intru.in/cdn/shop/files/jacket4.png?v=1748500400&width=800"]'::jsonb,
   '["S","M","L","XL"]'::jsonb, 'Outerwear', true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  compare_price = EXCLUDED.compare_price,
  images = EXCLUDED.images,
  sizes = EXCLUDED.sizes,
  category = EXCLUDED.category,
  in_stock = EXCLUDED.in_stock,
  featured = EXCLUDED.featured;

-- =============================================================
-- SEED DATA: Legal Pages (full content)
-- =============================================================

INSERT INTO legal_pages (slug, title, content, updated_at) VALUES
  ('terms', 'Terms of Service',
   '<h2>1. Agreement to Terms</h2><p>By accessing intru.in, you agree to be bound by these Terms, including our <a href="/p/shipping">Shipping</a> and <a href="/p/returns">Store-Credit-only Refund Policy</a>.</p><h2>2. Limited Drop Model</h2><p>All sales are final. Store Credit only for approved claims.</p><h2>3. Order Processing</h2><p>Orders processed within 36 hours.</p><h2>4. Shipping Disclaimer</h2><p>intru.in is not responsible for transit delays caused by delivery partners.</p><h2>5. Pricing &amp; Payment</h2><p>Prices in INR, inclusive of taxes. Payment via Razorpay.</p><h2>6. Store Credit</h2><p>1:1 INR value. Never expires. Non-transferable.</p><h2>7. Intellectual Property</h2><p>All content is our IP.</p><h2>8. Governing Law</h2><p>Governed by Indian law. Courts in Bangalore, Karnataka.</p>',
   '2026-02-26'),

  ('returns', 'Returns, Exchanges & Refunds',
   '<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:32px;font-size:14px;line-height:1.7"><strong>Important:</strong> All sales are final. Store Credit only for approved claims.</div><h2>1. Limited Drop Policy</h2><p>All sales are final.</p><h2>2. Store Credit Only</h2><p>1:1 INR value. Never expires.</p><h2>3. 36-Hour Claim Window</h2><p>Email returns@intru.in within 36 hours with order number and photos.</p><h2>4. Eligible Claims</h2><p>Manufacturing defects, wrong item, or significant damage only.</p><h2>5. Contact</h2><p><a href="mailto:returns@intru.in">returns@intru.in</a></p>',
   '2026-02-26'),

  ('privacy', 'Privacy Policy',
   '<h2>1. Information We Collect</h2><p>Name, email, phone, shipping address, payment details, and browsing data.</p><h2>2. How We Use Your Data</h2><p>Order processing, communication, Store Credit management. We do not sell your data.</p><h2>3. Data Security</h2><p>SSL/TLS encryption. Razorpay is PCI-DSS compliant.</p><h2>4. Third-Party Services</h2><p>Supabase, Razorpay, Google.</p><h2>5. Your Rights</h2><p>Contact hello@intru.in for data access, correction, or deletion.</p>',
   '2026-02-26'),

  ('shipping', 'Shipping Policy',
   '<h2>1. Processing Time</h2><p>Orders processed within 36 hours (excluding weekends/holidays).</p><h2>2. Delivery Coverage</h2><p>India only. No international shipping.</p><h2>3. Estimated Delivery</h2><ul><li><strong>Metro:</strong> 3-5 days</li><li><strong>Tier 2:</strong> 5-7 days</li><li><strong>Remote:</strong> 7-10 days</li></ul><h2>4. Shipping Costs</h2><ul><li>Free over Rs.1,999</li><li>Rs.99 flat fee under Rs.1,999</li></ul><h2>5. Delivery Liability</h2><p>intru.in is not responsible for carrier delays after handover.</p>',
   '2026-02-26')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = EXCLUDED.updated_at;

-- =============================================================
-- UPDATED_AT TRIGGER
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
