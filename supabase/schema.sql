-- =============================================================
-- intru.in Supabase Schema (v3 — Production-Grade)
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor
--
-- SAFE TO RE-RUN: Uses IF NOT EXISTS / IF EXISTS everywhere
-- Handles both fresh installs AND migrations from v2
--
-- v3 changes:
-- - users.id references auth.users(id) ON DELETE CASCADE
-- - Auth sync trigger: auto-create public.users on signup
-- - CHECK constraints: price >= 0, total >= 0
-- - orders.user_id + store_credits.user_id added (migration-safe)
-- - RLS: orders/credits tied to user_id via auth.uid()
-- - No public INSERT on orders (server-side service_role only)
-- - Legal pages with Grievance Redressal (Indian compliance)
-- - New 6-product catalog with intru.in CDN URLs
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
  last_login TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: add FK to auth.users if not already present
-- (Cannot use IF NOT EXISTS for constraints, so we use DO block)
DO $$
BEGIN
  -- Add FK users.id -> auth.users(id) if missing
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
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, picture)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = COALESCE(EXCLUDED.name, users.name),
    picture = COALESCE(EXCLUDED.picture, users.picture),
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

-- Migration: add CHECK constraints if missing
DO $$
BEGIN
  -- price >= 0
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'products_price_check'
  ) THEN
    BEGIN
      ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
  -- compare_price >= 0 (or NULL)
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
-- 3. ORDERS TABLE
-- =============================================================
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
  status TEXT DEFAULT 'pending',
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

-- Migration: add user_id column + Magic Checkout columns + CHECK constraints to existing orders table
DO $$
BEGIN
  -- Add user_id column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN user_id UUID;
  END IF;

  -- Add payment_method column (Magic Checkout: 'prepaid', 'cod', 'upi', 'card', etc.)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'pending';
  END IF;

  -- Add cod_fee column (COD fee in paise from Magic Checkout)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'cod_fee'
  ) THEN
    ALTER TABLE orders ADD COLUMN cod_fee INTEGER DEFAULT 0;
  END IF;

  -- Add rto_risk_level column (Magic Checkout COD Intelligence)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'rto_risk_level'
  ) THEN
    ALTER TABLE orders ADD COLUMN rto_risk_level TEXT DEFAULT 'unknown';
  END IF;

  -- Add FK orders.user_id -> auth.users(id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_user_id_fkey' AND table_name = 'orders'
  ) THEN
    BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  -- CHECK constraints
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_subtotal_check'
  ) THEN
    BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_subtotal_check CHECK (subtotal >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_shipping_check'
  ) THEN
    BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_shipping_check CHECK (shipping >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_total_check'
  ) THEN
    BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_total_check CHECK (total >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_store_credit_check'
  ) THEN
    BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_store_credit_check CHECK (store_credit_used >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'orders_status_check'
  ) THEN
    BEGIN
      ALTER TABLE orders ADD CONSTRAINT orders_status_check
        CHECK (status IN ('pending', 'placed', 'paid', 'payment_failed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);


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

-- Migration: add user_id column + CHECK constraints
DO $$
BEGIN
  -- Add user_id column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_credits' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE store_credits ADD COLUMN user_id UUID;
  END IF;

  -- Add FK store_credits.user_id -> auth.users(id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'store_credits_user_id_fkey' AND table_name = 'store_credits'
  ) THEN
    BEGIN
      ALTER TABLE store_credits ADD CONSTRAINT store_credits_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  -- CHECK amount >= 0
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'store_credits_amount_check'
  ) THEN
    BEGIN
      ALTER TABLE store_credits ADD CONSTRAINT store_credits_amount_check CHECK (amount >= 0);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;

  -- CHECK reason enum
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'store_credits_reason_check'
  ) THEN
    BEGIN
      ALTER TABLE store_credits ADD CONSTRAINT store_credits_reason_check
        CHECK (reason IN ('refund', 'defect', 'wrong_item', 'goodwill', 'promotional'));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
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
-- ROW LEVEL SECURITY (RLS) — Production-Grade
-- =============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Drop all old policies (safe to re-run)
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

-- PRODUCTS: public SELECT, service-role full CRUD
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (true);

CREATE POLICY "Products are editable by service role"
  ON products FOR ALL USING (auth.role() = 'service_role');

-- LEGAL PAGES: public SELECT, service-role full CRUD
CREATE POLICY "Legal pages are viewable by everyone"
  ON legal_pages FOR SELECT USING (true);

CREATE POLICY "Legal pages are editable by service role"
  ON legal_pages FOR ALL USING (auth.role() = 'service_role');

-- ORDERS: users SELECT their own rows via auth.uid() = user_id
-- NO public INSERT — order creation is server-side via service_role only
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to orders"
  ON orders FOR ALL USING (auth.role() = 'service_role');

-- STORE CREDITS: users SELECT their own balance, service-role full access
CREATE POLICY "Users can view their own store credits"
  ON store_credits FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to store credits"
  ON store_credits FOR ALL USING (auth.role() = 'service_role');

-- USERS: users can view own profile, service-role full access
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Service role has full access to users"
  ON users FOR ALL USING (auth.role() = 'service_role');


-- =============================================================
-- SEED DATA: Products (p1-p6) — New Catalog
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
  slug = EXCLUDED.slug,
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
-- SEED DATA: Legal Pages (Indian E-commerce Compliant)
-- Includes Grievance Redressal per Indian Consumer Protection Act
-- =============================================================

INSERT INTO legal_pages (slug, title, content, updated_at) VALUES
  ('terms', 'Terms of Service',
   '<h2>1. Agreement to Terms</h2>
<p>By accessing, browsing, or using this website (<strong>intru.in</strong>), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, including our <a href="/p/shipping">Shipping</a> and <a href="/p/returns">Store-Credit-only Refund Policy</a>. If you do not agree, please discontinue use immediately.</p>
<h2>2. Limited Drop Model</h2>
<p>intru.in operates on a <strong>limited-drop model</strong>. Products are released in small, exclusive batches. Due to the limited nature of our drops, <strong>all sales are final</strong>. We do not offer cash refunds under any circumstances. Approved claims are issued as Store Credit only.</p>
<h2>3. Order Processing</h2>
<p>We strive to process and hand over all orders to our courier partners within a <strong>36-hour window</strong> from the time of order confirmation. Orders placed on weekends or public holidays will be processed on the next business day.</p>
<h2>4. Shipping Disclaimer</h2>
<p>Delivery timelines provided at checkout are estimates only. <strong>intru.in is not responsible for any logistical delays, damages during transit, or failures to deliver caused by the independent delivery partner.</strong></p>
<h2>5. Pricing &amp; Payment</h2>
<p>All product prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Payment is processed securely through Razorpay. We accept UPI, credit/debit cards, net banking, and popular digital wallets.</p>
<h2>6. Store Credit</h2>
<p>Store Credit issued by intru.in is valued at a 1:1 ratio with INR. Store Credit never expires and can be applied to any future purchase. Store Credit is non-transferable and cannot be converted to cash.</p>
<h2>7. Intellectual Property</h2>
<p>All content on intru.in — including logos, graphics, product images, and text — is our intellectual property and may not be reproduced without prior written consent.</p>
<h2>8. Limitation of Liability</h2>
<p>intru.in shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed the amount paid for the specific product in question.</p>
<h2>9. Governing Law &amp; Jurisdiction</h2>
<p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>
<h2>10. Grievance Redressal</h2>
<p>In accordance with the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong> and the Information Technology Act, 2000, our designated Grievance Officer / Nodal Officer is:</p>
<p><strong>Nodal Officer:</strong> intru.in Grievance Desk<br><strong>Email:</strong> <a href="mailto:hello@intru.in">hello@intru.in</a><br><strong>Response Time:</strong> All grievances will be acknowledged within 48 hours and resolved within 30 days of receipt.</p>
<h2>11. Changes to Terms</h2>
<p>We reserve the right to update these Terms at any time. Continued use constitutes acceptance of the new Terms.</p>',
   '2026-02-27'),

  ('returns', 'Returns, Exchanges & Refunds',
   '<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:32px;font-size:14px;line-height:1.7">
<strong>Important:</strong> intru.in operates on a limited-drop model. All sales are final. We do not offer cash refunds. Approved claims receive <strong>Store Credit only</strong>.
</div>
<h2>1. Limited Drop Policy</h2>
<p>Due to the exclusive and limited nature of intru.in products, <strong>all sales are final</strong>. Once a drop sells out, it is never restocked.</p>
<h2>2. Store Credit Only — No Cash Refunds</h2>
<p>Approved returns receive <strong>Store Credit at 1:1 value with INR</strong>. Store Credit can be used for any future drop, never expires, and is non-transferable. Cash refunds are not available under any circumstances.</p>
<h2>3. 36-Hour Defect Claim Window</h2>
<p>Customers must raise a claim within <strong>36 hours of receiving the order</strong>. To file a claim, email <a href="mailto:returns@intru.in">returns@intru.in</a> with:</p>
<ul><li>Your order number</li><li>Clear photographs of the defect or issue</li><li>A brief description of the problem</li></ul>
<h2>4. Eligible Claims</h2>
<p><strong>Store Credit approved for:</strong> Manufacturing defects, wrong item received, significantly damaged product during transit.</p>
<p><strong>NOT eligible:</strong> Change of mind, wrong size ordered, minor color variations between screen and product, claims submitted after the 36-hour window.</p>
<h2>5. Exchange Process</h2>
<p>For size exchanges on eligible items, email us within 36 hours. If approved and replacement size is in stock, we ship at no additional cost. If out of stock, Store Credit is issued.</p>
<h2>6. Grievance Redressal</h2>
<p>If you are unsatisfied with the resolution of your claim, you may escalate to our Nodal Officer at <a href="mailto:hello@intru.in">hello@intru.in</a>. All escalations are acknowledged within 48 hours and resolved within 30 days.</p>
<h2>7. Contact</h2>
<p>For all return queries: <a href="mailto:returns@intru.in">returns@intru.in</a></p>',
   '2026-02-27'),

  ('privacy', 'Privacy Policy',
   '<h2>1. Information We Collect</h2>
<p>We collect information you provide directly: name, email address, phone number, shipping address, and payment details. We also collect browsing data through cookies and analytics tools.</p>
<h2>2. How We Use Your Data</h2>
<p>Your data is used to: process orders, send order updates and tracking, manage Store Credit balances, improve our services, and communicate about new drops (with your consent). <strong>We do not sell or rent your personal information to any third party.</strong></p>
<h2>3. Data Security</h2>
<p>We implement SSL/TLS encryption across the entire site. Payment processing is handled by Razorpay, a PCI-DSS Level 1 compliant payment gateway. We never store full card details on our servers.</p>
<h2>4. Cookies</h2>
<p>We use essential cookies for cart management and session authentication. Optional analytics cookies help us understand traffic and improve the shopping experience. You may disable non-essential cookies in your browser settings.</p>
<h2>5. Third-Party Services</h2>
<p>We use the following third-party services, each governed by their own privacy policies: Supabase (database), Razorpay (payments), Google (authentication), and our delivery partners (shipping).</p>
<h2>6. Data Retention</h2>
<p>We retain your personal data for as long as your account is active or as needed to provide services. Order records are retained for 7 years as required by Indian tax regulations.</p>
<h2>7. Your Rights</h2>
<p>You have the right to request access, correction, or deletion of your personal data at any time. Contact us at <a href="mailto:hello@intru.in">hello@intru.in</a>.</p>
<h2>8. Grievance Redressal</h2>
<p>For privacy-related grievances, contact our Nodal Officer at <a href="mailto:hello@intru.in">hello@intru.in</a>. Grievances will be acknowledged within 48 hours and resolved within 30 days.</p>
<h2>9. Updates</h2>
<p>This policy may be updated periodically. Significant changes will be communicated via email to registered users.</p>',
   '2026-02-27'),

  ('shipping', 'Shipping Policy',
   '<h2>1. Processing Time</h2>
<p>All orders are processed within a <strong>36-hour window</strong> from order confirmation (excluding weekends and public holidays).</p>
<h2>2. Delivery Coverage</h2>
<p>We ship across India via trusted courier partners. International shipping is not available at this time.</p>
<h2>3. Estimated Delivery</h2>
<ul><li><strong>Metro cities (Delhi, Mumbai, Bangalore, etc.):</strong> 3–5 business days</li><li><strong>Tier 2 cities:</strong> 5–7 business days</li><li><strong>Remote / rural areas:</strong> 7–10 business days</li></ul>
<p>These are estimates and may vary based on courier partner capacity and external factors.</p>
<h2>4. Shipping Costs</h2>
<ul><li><strong>Free shipping</strong> on orders above Rs.1,999</li><li>Flat <strong>Rs.99</strong> for orders below Rs.1,999</li></ul>
<h2>5. Order Tracking</h2>
<p>A tracking link will be sent to your registered email and phone number once your order ships. You can also check order status by emailing <a href="mailto:hello@intru.in">hello@intru.in</a>.</p>
<h2>6. Delivery Liability</h2>
<p><strong>Once the order is handed over to our courier partner, intru.in is not responsible for transit delays, theft, or carrier-caused damage.</strong> We will, however, assist you in filing a claim with the courier and provide necessary documentation.</p>
<h2>7. Undeliverable Orders</h2>
<p>If an order is returned to us due to an incorrect address or failed delivery attempts, we will contact you to arrange re-shipment. Additional shipping charges may apply.</p>',
   '2026-02-27')
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
