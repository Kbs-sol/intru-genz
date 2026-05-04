-- ============================================================
-- Migration: 0002_combo_buy.sql
-- Adds the combo-buy feature:
--   • combos          — combo definitions (CRUD by admin)
--   • combo_products  — which products/categories are required
--   • orders gets combo_discount column
-- ============================================================

-- 1. combos table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS combos (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT    NOT NULL,
  description   TEXT    NOT NULL DEFAULT '',
  -- 'percent' | 'fixed'
  discount_type TEXT    NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 10 CHECK (discount_value >= 0),
  -- minimum number of distinct products required to trigger the combo
  min_products  INTEGER NOT NULL DEFAULT 2 CHECK (min_products >= 2),
  -- optional: require items from these specific product IDs (NULL = any products)
  -- stored as a JSON array of product-id strings, e.g. ["p1","p2"]
  -- if NULL / empty, combo fires on ANY combination of min_products items
  required_product_ids JSONB  DEFAULT NULL,
  -- optional: restrict to specific category names (JSONB array)
  required_categories  JSONB  DEFAULT NULL,
  -- optional: minimum cart subtotal (before combo discount) to activate
  min_subtotal  NUMERIC(10,2) DEFAULT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  -- how many times this combo has been applied (informational)
  apply_count   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. auto-update updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_combos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_combos_updated_at ON combos;
CREATE TRIGGER trg_combos_updated_at
  BEFORE UPDATE ON combos
  FOR EACH ROW EXECUTE FUNCTION update_combos_updated_at();

-- 3. RLS ──────────────────────────────────────────────────────
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;

-- public can read active combos (needed for cart-side validation)
CREATE POLICY "combos_public_read"
  ON combos FOR SELECT
  USING (is_active = true);

-- service role can do everything
CREATE POLICY "combos_service_all"
  ON combos FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Add combo_discount column to orders if not present ───────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS combo_discount   NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applied_combo_id UUID          DEFAULT NULL;

-- 5. Seed example combos ──────────────────────────────────────
INSERT INTO combos (name, description, discount_type, discount_value, min_products, is_active)
VALUES
  (
    'Any 2 Tees Deal',
    'Buy any 2 products and get 10% off your order.',
    'percent', 10, 2, true
  ),
  (
    'Pick 3 – Save More',
    'Add 3 or more items and get Rs.150 off instantly.',
    'fixed', 150, 3, false
  )
ON CONFLICT DO NOTHING;
