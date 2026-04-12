-- migration_v2.sql: Intru Storefront Funnel Optimization
-- Execute this in your Supabase SQL Editor

-- 1. Atomic Traffic Tracker (RPC)
CREATE TABLE IF NOT EXISTS public.view_stats (
    path TEXT PRIMARY KEY,
    count BIGINT DEFAULT 0,
    last_viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION increment_view(target_path TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.view_stats (path, count, last_viewed_at)
    VALUES (target_path, 1, NOW())
    ON CONFLICT (path) DO UPDATE
    SET count = view_stats.count + 1,
        last_viewed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Coupons System
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT CHECK (type IN ('percent', 'flat')) DEFAULT 'percent',
    value NUMERIC NOT NULL,
    min_total NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expiry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Dynamic Ratings & Reviews
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL,
    customer_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Email Log (Quota Management)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    type TEXT NOT NULL, -- 'abandoned_cart', 'order_confirmation', etc.
    order_id TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enhanced Orders (for History UI)
-- Assuming public.orders already exists, let's ensure it has an index for fast history lookup
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 6. Sales Funnel Events
CREATE TABLE IF NOT EXISTS public.funnel_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT,
    email TEXT,
    event_type TEXT CHECK (event_type IN ('identify', 'add_to_cart', 'checkout_start', 'payment_success')),
    product_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
