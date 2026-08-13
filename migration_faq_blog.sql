-- ============================================================
-- Migration: FAQ + Blog Post tables for CRUD-managed content
-- Run this AFTER migration_v2.sql on your Supabase project.
--
-- Pattern: Public site reads only rows where is_active=true / is_published=true.
-- Admin API (service_role) has full read/write access.
-- The app falls back to hardcoded SEED_FAQS / SEED_BLOG_POSTS in src/data.ts
-- when these tables are empty or unreachable — so /faq and /blog stay live
-- for crawlers and users even before the DB is populated.
-- ============================================================

-- ────────────── FAQs ──────────────
CREATE TABLE IF NOT EXISTS public.faqs (
  id BIGSERIAL PRIMARY KEY,
  question   TEXT    NOT NULL,
  answer     TEXT    NOT NULL,        -- inline HTML allowed (<a>, <strong>, <em>)
  category   TEXT    NOT NULL,        -- e.g. "Shipping & Delivery", "Sizing & Fit"
  sort_order INTEGER NOT NULL DEFAULT 0,   -- lower = shown first within category
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faqs_cat_sort ON public.faqs(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_active   ON public.faqs(is_active);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_active_faqs" ON public.faqs;
CREATE POLICY "anon_read_active_faqs"
  ON public.faqs FOR SELECT TO anon
  USING (is_active = true);

DROP POLICY IF EXISTS "authenticated_read_active_faqs" ON public.faqs;
CREATE POLICY "authenticated_read_active_faqs"
  ON public.faqs FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "service_role_all_faqs" ON public.faqs;
CREATE POLICY "service_role_all_faqs"
  ON public.faqs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ────────────── Blog posts ──────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
  slug           TEXT    PRIMARY KEY,           -- URL slug is the identity
  title          TEXT    NOT NULL,
  seo_title      TEXT,
  seo_desc       TEXT,
  excerpt        TEXT,
  cover          TEXT,                          -- HTTPS URL to cover image
  category       TEXT    NOT NULL DEFAULT 'Style',
  read_mins      INTEGER NOT NULL DEFAULT 5,
  published_iso  DATE    NOT NULL DEFAULT CURRENT_DATE,
  updated_iso    DATE    NOT NULL DEFAULT CURRENT_DATE,
  author         TEXT    NOT NULL DEFAULT 'Intru Editorial',
  keywords       TEXT,                          -- comma-separated
  body           TEXT    NOT NULL,              -- article HTML
  is_published   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_published ON public.blog_posts(is_published, published_iso DESC);
CREATE INDEX IF NOT EXISTS idx_blog_category  ON public.blog_posts(category);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_published_blogs" ON public.blog_posts;
CREATE POLICY "anon_read_published_blogs"
  ON public.blog_posts FOR SELECT TO anon
  USING (is_published = true);

DROP POLICY IF EXISTS "authenticated_read_published_blogs" ON public.blog_posts;
CREATE POLICY "authenticated_read_published_blogs"
  ON public.blog_posts FOR SELECT TO authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "service_role_all_blog_posts" ON public.blog_posts;
CREATE POLICY "service_role_all_blog_posts"
  ON public.blog_posts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ────────────── updated_at auto-touch ──────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_faqs_updated_at ON public.faqs;
CREATE TRIGGER trg_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- Optional: seed the tables with the same content that ships as
-- hardcoded fallback in src/data.ts. The app auto-seeds on first
-- request when tables are empty — running this manually is only
-- useful if you want the rows visible in Supabase Studio right away.
-- ============================================================
