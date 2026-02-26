-- =============================================================
-- intru.in Supabase Schema
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================

-- 1. USERS TABLE (Google One-Tap + Magic Link auth)
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

-- 2. PRODUCTS TABLE (mirrors static data, editable via admin)
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

-- 3. ORDERS TABLE (created on checkout, updated on payment verification)
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

-- 4. STORE CREDITS TABLE (1:1 INR value, never expires)
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

-- 5. LEGAL PAGES TABLE (editable via admin panel)
CREATE TABLE IF NOT EXISTS legal_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at DATE DEFAULT CURRENT_DATE
);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Products: public read, service-key write
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);

CREATE POLICY "Products are editable by service role"
  ON products FOR ALL USING (auth.role() = 'service_role');

-- Orders: customers see their own, service-key sees all
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Service role has full access to orders"
  ON orders FOR ALL USING (auth.role() = 'service_role');

-- Store Credits: customers see their own balance
CREATE POLICY "Users can view their own store credits"
  ON store_credits FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Service role has full access to store credits"
  ON store_credits FOR ALL USING (auth.role() = 'service_role');

-- Legal Pages: public read, service-key write
CREATE POLICY "Legal pages are viewable by everyone"
  ON legal_pages FOR SELECT USING (true);

CREATE POLICY "Legal pages are editable by service role"
  ON legal_pages FOR ALL USING (auth.role() = 'service_role');

-- Users: users see their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Service role has full access to users"
  ON users FOR ALL USING (auth.role() = 'service_role');

-- =============================================================
-- SEED DATA: Products (matches src/data.ts)
-- =============================================================

INSERT INTO products (id, slug, name, tagline, description, price, compare_price, currency, images, sizes, category, in_stock, featured) VALUES
  ('p1', 'essential-oversized-tee', 'Essential Oversized Tee', 'The foundation of every outfit',
   'Our signature oversized tee crafted from 240 GSM premium cotton. Drop shoulders, ribbed neckline, and a relaxed fit that drapes perfectly. Pre-shrunk and garment-dyed for that lived-in softness from day one.',
   1299, 1799, 'INR',
   '["https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=1000&fit=crop&q=80&auto=format"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 'Tops', true, true),

  ('p2', 'midnight-cargo-joggers', 'Midnight Cargo Joggers', 'Utility meets comfort',
   'Relaxed-fit cargo joggers in washed black. Six-pocket design with snap closures, elastic waistband with drawcord, and tapered ankles with adjustable toggles. Built from heavyweight French terry.',
   1999, 2499, 'INR',
   '["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1519235624215-85175d5eb36e?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=1000&fit=crop&q=80&auto=format"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 'Bottoms', true, true),

  ('p3', 'structured-minimal-hoodie', 'Structured Minimal Hoodie', 'Clean lines, warm soul',
   'A heavyweight 360 GSM hoodie with a structured silhouette. Kangaroo pocket, flat drawcord, and double-needle stitching throughout. The hood holds its shape without feeling stiff.',
   2499, 3199, 'INR',
   '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop&q=80&auto=format"]'::jsonb,
   '["S","M","L","XL"]'::jsonb, 'Tops', true, true),

  ('p4', 'everyday-slim-chinos', 'Everyday Slim Chinos', 'From desk to dinner',
   'Slim-fit chinos in stone wash. Stretch cotton twill with a soft hand-feel. Clean front, slant pockets, and a tapered leg that works with sneakers or boots. Wrinkle-resistant finish.',
   1799, NULL, 'INR',
   '["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&h=1000&fit=crop&q=80&auto=format"]'::jsonb,
   '["28","30","32","34","36"]'::jsonb, 'Bottoms', true, false),

  ('p5', 'graphic-art-tee-vol1', 'Graphic Art Tee Vol. 1', 'Wearable expression',
   'Limited-edition graphic tee featuring original artwork by independent Indian artists. Screen-printed on our signature 240 GSM cotton base. Each print is unique.',
   1499, NULL, 'INR',
   '["https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1529374255404-311a2a4f3fd5?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=800&h=1000&fit=crop&q=80&auto=format"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 'Tops', true, true),

  ('p6', 'monochrome-zip-jacket', 'Monochrome Zip Jacket', 'Layer with intent',
   'Lightweight zip-up jacket in matte black. Water-resistant shell with a soft mesh lining. Minimal branding, hidden pockets, and a clean stand collar. Packs into its own pocket for travel.',
   2999, 3999, 'INR',
   '["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=1000&fit=crop&q=80&auto=format","https://images.unsplash.com/photo-1548712841-f30f0e498523?w=800&h=1000&fit=crop&q=80&auto=format"]'::jsonb,
   '["S","M","L","XL"]'::jsonb, 'Outerwear', true, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- SEED DATA: Legal Pages
-- =============================================================

INSERT INTO legal_pages (slug, title, content, updated_at) VALUES
  ('terms', 'Terms of Service', '<h2>1. Agreement to Terms</h2><p>By accessing intru.in, you agree to be bound by these Terms.</p>', '2026-02-26'),
  ('returns', 'Returns, Exchanges & Refunds', '<h2>1. Limited Drop Policy</h2><p>All sales are final. Store Credit only.</p>', '2026-02-26'),
  ('privacy', 'Privacy Policy', '<h2>1. Information We Collect</h2><p>We collect information you provide directly.</p>', '2026-02-26'),
  ('shipping', 'Shipping Policy', '<h2>1. Processing Time</h2><p>All orders processed within 36 hours.</p>', '2026-02-26')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- UPDATED_AT TRIGGER (auto-update timestamps)
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
