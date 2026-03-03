-- =============================================================
-- intru.in Supabase Schema (v6 — Unified Checkout + IG Toggle)
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor
--
-- SAFE TO RE-RUN: Uses IF NOT EXISTS / IF EXISTS everywhere
-- Handles both fresh installs AND migrations from v4/v5
--
-- v6 changes:
-- - INSTAGRAM_FEED_ENABLED store_setting for homepage toggle
-- - COD email subjects updated to "Action Required" format
-- - Footer/legal jurisdiction: Hyderabad, Telangana
-- - Unified checkout: Buy Now → Hybrid Payment Selection UI
-- =============================================================


-- =============================================================
-- 1. USERS TABLE (synced from Supabase Auth)
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture TEXT,
  google_id TEXT UNIQUE,
  phone TEXT,
  auth_provider TEXT DEFAULT 'email',
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: add auth_provider column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_provider'
  ) THEN
    ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email';
  END IF;
END $$;

-- Migration: add FK to auth.users if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_id_fkey' AND table_name = 'users'
  ) THEN
    BEGIN
      ALTER TABLE users ADD CONSTRAINT users_id_fkey
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Auth sync: auto-create public.users row when a new auth user signs up
-- Handles Google, Spotify, Email (magic link) providers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _provider TEXT;
  _name TEXT;
  _picture TEXT;
  _phone TEXT;
BEGIN
  -- Determine auth provider
  _provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

  -- Map name from various metadata fields (Google, Spotify, etc.)
  _name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'preferred_username',
    ''
  );

  -- Map picture/avatar from various metadata fields
  _picture := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'image_url',
    ''
  );

  -- Map phone
  _phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    ''
  );

  INSERT INTO public.users (id, email, name, picture, phone, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    _name,
    _picture,
    _phone,
    _provider
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = COALESCE(NULLIF(EXCLUDED.name, ''), users.name),
    picture = COALESCE(NULLIF(EXCLUDED.picture, ''), users.picture),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), users.phone),
    auth_provider = EXCLUDED.auth_provider,
    last_login = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =============================================================
-- 2. PRODUCTS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'products_price_check'
  ) THEN
    BEGIN
      ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'products_compare_price_check'
  ) THEN
    BEGIN
      ALTER TABLE products ADD CONSTRAINT products_compare_price_check
        CHECK (compare_price IS NULL OR compare_price >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);


-- =============================================================
-- 3. ORDERS TABLE (v5 — full COD address fields)
-- =============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  store_credit_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'pending',
  cod_fee INTEGER DEFAULT 0,
  rto_risk_level TEXT DEFAULT 'unknown',
  -- Structured address fields for COD
  shipping_address JSONB,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_pincode TEXT,
  shipping_country TEXT DEFAULT 'India',
  latitude NUMERIC,
  longitude NUMERIC,
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

-- Migration: add columns to existing orders table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='user_id') THEN
    ALTER TABLE orders ADD COLUMN user_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='customer_name') THEN
    ALTER TABLE orders ADD COLUMN customer_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='customer_phone') THEN
    ALTER TABLE orders ADD COLUMN customer_phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='cod_fee') THEN
    ALTER TABLE orders ADD COLUMN cod_fee INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='rto_risk_level') THEN
    ALTER TABLE orders ADD COLUMN rto_risk_level TEXT DEFAULT 'unknown';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_address_line1') THEN
    ALTER TABLE orders ADD COLUMN shipping_address_line1 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_address_line2') THEN
    ALTER TABLE orders ADD COLUMN shipping_address_line2 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_city') THEN
    ALTER TABLE orders ADD COLUMN shipping_city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_state') THEN
    ALTER TABLE orders ADD COLUMN shipping_state TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_pincode') THEN
    ALTER TABLE orders ADD COLUMN shipping_pincode TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='shipping_country') THEN
    ALTER TABLE orders ADD COLUMN shipping_country TEXT DEFAULT 'India';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='latitude') THEN
    ALTER TABLE orders ADD COLUMN latitude NUMERIC;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='longitude') THEN
    ALTER TABLE orders ADD COLUMN longitude NUMERIC;
  END IF;

  -- FK
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='orders_user_id_fkey' AND table_name='orders') THEN
    BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  -- CHECK constraints
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name='orders_subtotal_check') THEN
    BEGIN ALTER TABLE orders ADD CONSTRAINT orders_subtotal_check CHECK (subtotal >= 0); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name='orders_shipping_check') THEN
    BEGIN ALTER TABLE orders ADD CONSTRAINT orders_shipping_check CHECK (shipping >= 0); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name='orders_total_check') THEN
    BEGIN ALTER TABLE orders ADD CONSTRAINT orders_total_check CHECK (total >= 0); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name='orders_store_credit_check') THEN
    BEGIN ALTER TABLE orders ADD CONSTRAINT orders_store_credit_check CHECK (store_credit_used >= 0); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name='orders_status_check') THEN
    BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_status_check
        CHECK (status IN ('pending','placed','paid','payment_failed','processing','shipped','delivered','cancelled','refunded'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- FIX: If the constraint already exists but is missing 'placed', drop and recreate
-- Run this ONCE in Supabase SQL Editor to fix existing databases:
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
-- ALTER TABLE orders ADD CONSTRAINT orders_status_check
--   CHECK (status IN ('pending','placed','paid','payment_failed','processing','shipped','delivered','cancelled','refunded'));

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);


-- =============================================================
-- 4. STORE CREDITS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS store_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  issued_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='store_credits' AND column_name='user_id') THEN
    ALTER TABLE store_credits ADD COLUMN user_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='store_credits_user_id_fkey' AND table_name='store_credits') THEN
    BEGIN ALTER TABLE store_credits ADD CONSTRAINT store_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name='store_credits_amount_check') THEN
    BEGIN ALTER TABLE store_credits ADD CONSTRAINT store_credits_amount_check CHECK (amount >= 0); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name='store_credits_reason_check') THEN
    BEGIN ALTER TABLE store_credits ADD CONSTRAINT store_credits_reason_check CHECK (reason IN ('refund','defect','wrong_item','goodwill','promotional')); EXCEPTION WHEN duplicate_object THEN NULL; END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_store_credits_email ON store_credits(email);
CREATE INDEX IF NOT EXISTS idx_store_credits_user_id ON store_credits(user_id);


-- =============================================================
-- 5. LEGAL PAGES TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS legal_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  updated_at DATE DEFAULT CURRENT_DATE
);


-- =============================================================
-- 6. SIZE CHART TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS size_chart (
  size_label TEXT PRIMARY KEY,
  chest NUMERIC NOT NULL,
  length NUMERIC NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='size_chart' AND column_name='sort_order') THEN
    ALTER TABLE size_chart ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;


-- =============================================================
-- 7. SUBSCRIBERS TABLE ("Notify Me" emails)
-- =============================================================
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'notify_me',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);


-- =============================================================
-- 8. STORE SETTINGS TABLE (NEW in v5 — admin toggles)
-- =============================================================
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================================
-- 9. INSTAGRAM FEED TABLE (NEW in v5 — admin-managed feed)
-- =============================================================
CREATE TABLE IF NOT EXISTS instagram_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link_url TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instagram_feed_sort ON instagram_feed(sort_order);


-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE size_chart ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_feed ENABLE ROW LEVEL SECURITY;

-- Drop old policies
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
DROP POLICY IF EXISTS "Size chart is viewable by everyone" ON size_chart;
DROP POLICY IF EXISTS "Size chart is editable by service role" ON size_chart;
DROP POLICY IF EXISTS "Service role has full access to subscribers" ON subscribers;
DROP POLICY IF EXISTS "Store settings are viewable by everyone" ON store_settings;
DROP POLICY IF EXISTS "Store settings are editable by service role" ON store_settings;
DROP POLICY IF EXISTS "Instagram feed is viewable by everyone" ON instagram_feed;
DROP POLICY IF EXISTS "Instagram feed is editable by service role" ON instagram_feed;

-- PRODUCTS
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by service role" ON products FOR ALL USING (auth.role() = 'service_role');

-- LEGAL PAGES
CREATE POLICY "Legal pages are viewable by everyone" ON legal_pages FOR SELECT USING (true);
CREATE POLICY "Legal pages are editable by service role" ON legal_pages FOR ALL USING (auth.role() = 'service_role');

-- SIZE CHART
CREATE POLICY "Size chart is viewable by everyone" ON size_chart FOR SELECT USING (true);
CREATE POLICY "Size chart is editable by service role" ON size_chart FOR ALL USING (auth.role() = 'service_role');

-- STORE SETTINGS
CREATE POLICY "Store settings are viewable by everyone" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Store settings are editable by service role" ON store_settings FOR ALL USING (auth.role() = 'service_role');

-- INSTAGRAM FEED
CREATE POLICY "Instagram feed is viewable by everyone" ON instagram_feed FOR SELECT USING (true);
CREATE POLICY "Instagram feed is editable by service role" ON instagram_feed FOR ALL USING (auth.role() = 'service_role');

-- ORDERS
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role has full access to orders" ON orders FOR ALL USING (auth.role() = 'service_role');

-- STORE CREDITS
CREATE POLICY "Users can view their own store credits" ON store_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role has full access to store credits" ON store_credits FOR ALL USING (auth.role() = 'service_role');

-- USERS
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Service role has full access to users" ON users FOR ALL USING (auth.role() = 'service_role');

-- SUBSCRIBERS
CREATE POLICY "Service role has full access to subscribers" ON subscribers FOR ALL USING (auth.role() = 'service_role');


-- =============================================================
-- SEED DATA: Size Chart (XS-XXL)
-- =============================================================
INSERT INTO size_chart (size_label, chest, length, sort_order) VALUES
  ('XS', 36, 26, 1),
  ('S',  38, 27, 2),
  ('M',  40, 28, 3),
  ('L',  42, 29, 4),
  ('XL', 44, 30, 5),
  ('XXL', 46, 31, 6)
ON CONFLICT (size_label) DO UPDATE SET
  chest = EXCLUDED.chest, length = EXCLUDED.length, sort_order = EXCLUDED.sort_order;


-- =============================================================
-- SEED DATA: Store Settings (defaults)
-- =============================================================
INSERT INTO store_settings (key, value) VALUES
  ('USE_MAGIC_CHECKOUT', 'false'),
  ('MANAGER_EMAIL', 'shop@intru.in'),
  ('COD_FEE', '99'),
  ('INSTAGRAM_FEED_ENABLED', 'true')
ON CONFLICT (key) DO NOTHING;


-- =============================================================
-- SEED DATA: Products (p1-p6)
-- =============================================================
INSERT INTO products (id, slug, name, tagline, description, price, compare_price, currency, images, sizes, category, in_stock, featured) VALUES
  ('p1', 'doodles-t-shirt', 'Doodles T-Shirt', 'Warmth and joy',
   'Playful doodle-art printed tee that radiates warmth. Crafted from premium cotton with puff-print detailing. Pre-shrunk, garment-dyed, and designed to feel like it was made just for you.',
   999, 1499, 'INR',
   '["https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1946","https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1000","https://intru.in/cdn/shop/files/3.png?v=1748692106&width=800","https://intru.in/cdn/shop/files/3.png?v=1748692106&width=600"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 'T-Shirts', true, true),
  ('p2', 'no-risk-porsche', 'No Risk Porsche', 'Bold edge',
   'A statement tee for those who move without hesitation. Bold graphic print, premium cotton, and a fit that commands attention. No risk, no reward.',
   999, 1499, 'INR',
   '["https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=1920","https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=1000","https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=800","https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=600"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 'T-Shirts', true, true),
  ('p3', 'orange-puff-printed-t-shirt', 'Orange Puff', 'Caffeine-core',
   'Orange puff-printed tee with a texture you can feel. Caffeine-core energy meets streetwear minimalism. Premium cotton, relaxed fit, limited run.',
   899, 1499, 'INR',
   '["https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=1445","https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=1000","https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=800","https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=600"]'::jsonb,
   '["S","M","L","XL"]'::jsonb, 'T-Shirts', true, true),
  ('p4', 'romanticise-crop-tee', 'Romanticise Crop', 'Breezy ease',
   'Cropped silhouette meets everyday comfort. Soft cotton, clean cut, and an effortless vibe. Designed over two months because we refused to rush perfection.',
   699, 999, 'INR',
   '["https://intru.in/cdn/shop/files/4_f2aa413e-6e91-49bd-8f16-2efd41b4d6ea.png?v=1748190572&width=1946","https://intru.in/cdn/shop/files/4_f2aa413e-6e91-49bd-8f16-2efd41b4d6ea.png?v=1748190572&width=1000","https://intru.in/cdn/shop/files/4_f2aa413e-6e91-49bd-8f16-2efd41b4d6ea.png?v=1748190572&width=800","https://intru.in/cdn/shop/files/4_f2aa413e-6e91-49bd-8f16-2efd41b4d6ea.png?v=1748190572&width=600"]'::jsonb,
   '["XS","S","M","L"]'::jsonb, 'T-Shirts', true, true),
  ('p5', 'stripe-18-shirt', 'Stripe 18 Shirt', 'Cool tones',
   'Cool-toned striped shirt with a structured collar and relaxed body. Premium woven fabric, mother-of-pearl buttons, and a fit that bridges casual and smart.',
   1099, 1699, 'INR',
   '["https://intru.in/cdn/shop/files/99.png?v=1748173436&width=1946","https://intru.in/cdn/shop/files/99.png?v=1748173436&width=1000","https://intru.in/cdn/shop/files/99.png?v=1748173436&width=800","https://intru.in/cdn/shop/files/99.png?v=1748173436&width=600"]'::jsonb,
   '["S","M","L","XL","XXL"]'::jsonb, 'Shirts', true, true),
  ('p6', 'summer-shirt', 'Summer Shirt', 'Sunshine staple',
   'Your go-to summer layer. Lightweight, breathable, and effortlessly styled. Made for golden-hour walks and spontaneous weekend plans.',
   999, 1599, 'INR',
   '["https://intru.in/cdn/shop/files/03.png?v=1756359941&width=1946","https://intru.in/cdn/shop/files/03.png?v=1756359941&width=1000","https://intru.in/cdn/shop/files/03.png?v=1756359941&width=800","https://intru.in/cdn/shop/files/03.png?v=1756359941&width=600"]'::jsonb,
   '["S","M","L","XL"]'::jsonb, 'Shirts', true, true)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug, name = EXCLUDED.name, tagline = EXCLUDED.tagline,
  description = EXCLUDED.description, price = EXCLUDED.price,
  compare_price = EXCLUDED.compare_price, images = EXCLUDED.images,
  sizes = EXCLUDED.sizes, category = EXCLUDED.category,
  in_stock = EXCLUDED.in_stock, featured = EXCLUDED.featured;


-- =============================================================
-- SEED DATA: Legal Pages
-- =============================================================
INSERT INTO legal_pages (slug, title, content, updated_at) VALUES
  ('terms', 'Terms of Service',
   '<h2>1. Agreement to Terms</h2><p>By accessing intru.in you agree to these Terms, our <a href="/p/shipping">Shipping</a> and <a href="/p/returns">Store-Credit-only Refund Policy</a>.</p><h2>2. Limited Drop Model</h2><p>All sales are final. Store Credit only for approved claims.</p><h2>3. Order Processing</h2><p>Orders processed within 36 hours.</p><h2>4. Shipping Disclaimer</h2><p>intru.in is not responsible for transit delays by courier partners.</p><h2>5. Pricing</h2><p>Prices in INR, inclusive of taxes. Razorpay payments.</p><h2>6. Store Credit</h2><p>1:1 INR ratio, never expires, non-transferable.</p><h2>7. Grievance Redressal</h2><p>Nodal Officer: <a href="mailto:shop@intru.in">shop@intru.in</a>. Response within 48h, resolution within 30 days per Consumer Protection (E-Commerce) Rules, 2020.</p>', '2026-03-03'),
  ('returns', 'Returns, Exchanges & Refunds',
   '<h2>All sales are final. Store Credit only.</h2><p>36-hour defect claim window. Email <a href="mailto:shop@intru.in">shop@intru.in</a> with order number and photos.</p><h2>Eligible</h2><p>Manufacturing defects, wrong item, transit damage.</p><h2>Not Eligible</h2><p>Change of mind, wrong size, minor color variation.</p>', '2026-03-03'),
  ('privacy', 'Privacy Policy',
   '<h2>Data We Collect</h2><p>Name, email, phone, address, payment info, browsing data.</p><h2>Usage</h2><p>Order processing, updates, service improvement. We never sell your data.</p><h2>Security</h2><p>SSL/TLS, Razorpay PCI-DSS Level 1.</p><h2>Rights</h2><p>Contact <a href="mailto:shop@intru.in">shop@intru.in</a> for access, correction, or deletion.</p>', '2026-03-03'),
  ('shipping', 'Shipping Policy',
   '<h2>Processing</h2><p>36-hour window from confirmation.</p><h2>Delivery</h2><p>Metro: 3-5 days. Tier 2: 5-7 days. Remote: 7-10 days.</p><h2>Costs</h2><p>Free above Rs.1,999. Flat Rs.99 below. COD +Rs.99 convenience fee.</p><h2>Tracking</h2><p>Sent via email/SMS on dispatch.</p>', '2026-03-03')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title, content = EXCLUDED.content, updated_at = EXCLUDED.updated_at;


-- =============================================================
-- TRIGGERS
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_products_updated_at ON products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_size_chart_updated_at ON size_chart;
CREATE TRIGGER set_size_chart_updated_at BEFORE UPDATE ON size_chart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_store_settings_updated_at ON store_settings;
CREATE TRIGGER set_store_settings_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
