# intru.in — Exclusive Streetwear Platform

## Project Overview
- **Name**: intru.in
- **Goal**: Engineered for High Organic Traffic (SEO) and High Conversion (using deep direct-response psychology)
- **Stack**: Hono + TypeScript + Cloudflare Pages + Supabase + Razorpay + Resend
- **Version**: v13 (Date: March 12, 2026) — Conversion & SEO Optimization Complete

## URLs
- **Production**: https://intru-genz.pages.dev (staging) → https://intru.in (custom domain pending)
- **GitHub**: https://github.com/Kbs-sol/intru-genz
- **Admin**: Hidden — enter Robust Konami Code (↑↑↓↓←→←→ba) on any page

## Architecture

### Silent Identity (No Login Pages)
- Guests can browse, add to cart, and reach checkout freely
- At checkout, a "Identify Yourself" overlay asks for email OR Google sign-in
- New users are silently created in `public.users`; existing users are linked
- Google One-Tap with `data-itp_support="true"`, `data-auto_select="false"`, and redirect fallback
- No `/login` or `/register` routes — identity is captured only when needed

### Google Auth (v7 — Popup-Block Fix)
- **One-Tap flow**: `data-itp_support="true"`, `data-auto_select="false"`, `data-auto_prompt="false"`
- **Redirect fallback** (`doGoogleRedirect()`): uses `response_type=id_token` (JWT), redirects to `/auth/google/callback`
- **Callback page** (`/auth/google/callback`): extracts `id_token` from URL fragment, sends to `/api/auth/google` API, saves user to localStorage, sets `intru_auth_success` sessionStorage flag, then redirects to homepage
- **Access token fallback**: if only `access_token` received (legacy), calls Google userinfo API to get email/name
- **Session persistence**: cart backed up to sessionStorage before redirect; restored + checkout auto-resumes after auth
- High-contrast "Sign in with Google" button in Identity overlay
- All auth prompts reference `shop@intru.in`

### Unified Checkout Flow (v6+v7)
**Both "Buy Now" and "Checkout from Bag" open the same Hybrid Payment Selection UI:**
- "Buy Now" adds item to a temporary session cart and opens the cart drawer
- Cart drawer shows the Prepaid/COD payment mode selector
- User selects payment method, then clicks "Checkout"
- **Session persistence**: checkout intent survives Google redirect; auto-resumes

**Option A — Manual COD Mode (default, `USE_MAGIC_CHECKOUT = false`):**
- **Prepaid**: Bright green badge "⚡ SAVE Rs.99 / FREE SHIPPING" → Razorpay standard checkout
- **COD**: Gray badge "Rs.99 Convenience Fee added" + Rs.99 fee → inline address form
- Payment mode selector visible in cart drawer

**Option B — Razorpay Magic Mode (`USE_MAGIC_CHECKOUT = true`):**
- Single "Checkout" button → Razorpay Magic Checkout handles everything
- Payment mode selector hidden; Razorpay manages address/COD/1-click

**Psychological Conversion Engineering (v12+v13):**
The entire platform is systematically architected to drive high conversion rates using proven micro-psychological principles:
- **Identity Overlay**: Reframed as an exclusive "Secure Access" portal ("WHERE SHOULD WE SEND YOUR DROP?") to increase opt-in rates through exclusivity.
- **Friction-Killer Trust Row**: Immediate trust injection (FREE SHIPPING, NO RESTOCKS, 36H DISPATCH) positioned directly adjacent to buy buttons to neutralize hesitation.
- **Prepaid VIP Upgrades**: Prepaid orders get "PRIORITY DISPATCH" ⚡ branding and skip-the-queue messaging to drive immediate revenue over COD.
- **High-Stakes Scarcity & FOMO Counters**: Dynamic inventory badges ("Low Stock: [X] left", "CRITICAL: ONLY [X] LEFT") that visually pulse to induce urgency.
- **Sold-Out Preservation (Scarcity Proof)**: Product pages remain live with "VAULTED: SOLD OUT" badges and "NOTIFY ME" CTAs to capture high-intent leads and provide social proof.
- **COD Friction**: COD is rebranded as "Logistics Heavy" with subject-to-verification warnings to gently push users toward prepaid logic.
- **"INTRU ADVISOR" AI Stylist**: An immersive, full-screen funnel disguised as a chat. It acts as a subliminal salesperson, leveraging VIP access hooks ("I have access to the vault..."), Quick Reply chips for zero-typing friction, and massive "SECURE NOW" product cards.

### Core SEO Infrastructure (High Organic Traffic)
Beyond conversion, intru.in is engineered for aggressive organic search dominance:
- **Zero-JS Render**: As a server-rendered Hono app, HTML is served instantly to Googlebot — zero client-side rendering delays.
- **Dynamic Meta Management**: Page-specific, strongly-typed SEO tags via `buildHead()` covering Title, Description, OpenGraph, and Twitter Cards to maximize click-through rates.
- **Automated XML Sitemap**: Dynamic `/sitemap.xml` with automatic `lastmod` timestamps to ensure Google indexes new drops within hours.
- **Bulk Metadata Injection**: Semantic keyword optimization directly within the catalog, delivering 100% SEO coverage.
- **Lighthouse Dominance**: Lean CSS, aggressive caching, and minimal frontend JS architecture ensure near-perfect Core Web Vitals, a critical search ranking factor.

### Resend Email Notifications
- **Prepaid success** → "Drop Secured!" email to customer
- **COD success** → "Action Required: Confirm your intru.in COD Order #[ID]" email to customer
- **COD success** → "NEW COD ORDER - Action Required — [name] — Rs.[total]" email to manager
- Emails triggered server-side; requires `RESEND_API_KEY` in Cloudflare secrets
- Only sent when orderId exists (prevents empty email sends)

## Supabase Schema (v6)

| Table | Purpose |
|-------|---------|
| `users` | Synced from Supabase Auth; stores email, name, picture, auth_provider |
| `products` | Product catalog + SEO fields (seo_title, seo_description) + stock_count JSONB |
| `orders` | Full order data: customer_phone, customer_email, items JSON, shipping_address JSON, payment_method, cod_fee, status |
| `store_credits` | Store credit ledger |
| `legal_pages` | Dynamic legal content (terms, returns, privacy, shipping) |
| `size_chart` | Size measurements (XS-XXL, chest/length in inches) |
| `subscribers` | "Notify Me" email signups |
| `store_settings` | Admin toggles (USE_MAGIC_CHECKOUT, FOMO_THRESHOLD_LOW, FOMO_THRESHOLD_CRITICAL, etc.) |
| `instagram_feed` | Admin-managed Instagram feed images |

**Run `supabase/schema.sql` in Supabase SQL Editor** to create/migrate all tables.

## Admin Panel (Konami-protected)

| Tab | Features |
|-----|----------|
| **Orders** | COD rows highlighted yellow, customer name/phone/email, payment method badge, "Copy for Shiprocket" button |
| **Products** | Image URL editor (4 slots), price/compare-price, in-stock toggle |
| **Legal** | HTML editor with live preview for all legal pages |
| **Size Chart** | Full CRUD for chest/length measurements |
| **IG Feed** | ON/OFF toggle (hides homepage section when OFF), add/edit/delete images, instant UI updates |
| **Settings** | Payment mode toggle (Manual COD ↔ Razorpay Magic), manager notification email, COD fee |
| **Upload [AG]** | Direct image upload to Supabase with auto-fill logic for product/IG inputs |
| **Maintenance** | Configure Soft (banner/modal) or Full (locked) maintenance modes |

## Environment Variables (Cloudflare Secrets)

```bash
# Required
npx wrangler pages secret put SUPABASE_URL --project-name intru-in
npx wrangler pages secret put SUPABASE_ANON_KEY --project-name intru-in
npx wrangler pages secret put SUPABASE_SERVICE_KEY --project-name intru-in
npx wrangler pages secret put RAZORPAY_KEY_ID --project-name intru-in
npx wrangler pages secret put RAZORPAY_KEY_SECRET --project-name intru-in
npx wrangler pages secret put ADMIN_PASSWORD --project-name intru-in

# Optional but recommended
npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name intru-in
npx wrangler pages secret put RESEND_API_KEY --project-name intru-in
npx wrangler pages secret put RAZORPAY_WEBHOOK_SECRET --project-name intru-in
```

## Razorpay Webhook Setup

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://intru.in/api/webhooks/razorpay` (after custom domain setup)
3. Select events: `order.created`, `payment.captured`, `payment.failed`
4. Set webhook secret and add to Cloudflare secrets as `RAZORPAY_WEBHOOK_SECRET`

## Supabase Auth Setup

1. **Google**: Enable Google provider in Supabase Dashboard → Auth → Providers
2. **Email/Magic Link**: Enable Email provider with "Enable Email Confirmations" OFF for frictionless flow
3. Set redirect URLs to `https://intru.in`

## Resend Setup

1. Create account at resend.com
2. Add and verify domain `intru.in` for sending emails
3. Create API key and add to Cloudflare as `RESEND_API_KEY`
4. Emails sent from `noreply@intru.in`

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check (shows connected services) |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Single product |
| GET | `/api/size-chart` | Size chart data |
| GET | `/api/instagram-feed` | Instagram feed images (respects INSTAGRAM_FEED_ENABLED toggle) |
| POST | `/api/checkout` | Create prepaid/magic checkout order |
| POST | `/api/checkout/cod` | Create COD order with full address, phone, items JSON |
| POST | `/api/payment/verify` | Verify Razorpay payment signature |
| POST | `/api/webhooks/razorpay` | Razorpay webhook handler |
| POST | `/api/auth/identify` | Silent Identity — upsert user by email |
| POST | `/api/auth/google` | Google One-Tap authentication |
| POST | `/api/auth/google-userinfo` | Google OAuth access_token fallback |
| GET | `/auth/google/callback` | Google OAuth redirect callback page |
| POST | `/api/subscribe` | Newsletter subscription |
| POST | `/api/admin/auth` | Admin authentication |
| GET | `/api/admin/orders` | List orders (admin) |
| PATCH | `/api/admin/orders/:id` | Update order status |
| PATCH | `/api/admin/products/:id` | Update product |
| GET/PUT | `/api/admin/settings/:key` | Store settings CRUD |
| POST/PATCH/DELETE | `/api/admin/instagram-feed` | IG feed CRUD |
| POST | `/api/admin/upload` | Direct image upload to Supabase Storage [AG] |

## Design
- **Typography**: Archivo Black (headings), Space Grotesk (body)
- **Colors**: High-contrast B&W (#0a0a0a / #fafafa)
- **Logo**: SVG inline "INTRU.in"
- **Footer**: Registered office Hyderabad, Telangana, India; Grievance officer shop@intru.in

## Compliance
- All support emails: `shop@intru.in`
- Grievance Officer: `shop@intru.in`
- Legal jurisdiction: Hyderabad, Telangana
- Consumer Protection (E-Commerce) Rules, 2020 compliant

## v13 Changes (March 12, 2026)

### Cart Drawer Complete Redesign
- **NO RED, NO ✗, NO WARNINGS**: Completely neutral, invitation-only language
- **Black & White Only**: Strict B&W palette (#0a0a0a / #fafafa)
- **Payment Cards**: Side-by-side Prepaid/COD selector with:
  - Prepaid: "BEST" badge (top-right), white bg, black text, "⚡ Free Shipping · Ships first"
  - COD: Transparent bg, "+Rs.99 · Pay on arrival"
- **Nudge Line**: Context-aware copy below payment cards ("⚡ Free shipping · Your order ships before COD batch" for prepaid, "Switch to Prepaid to save Rs.99 and ship faster" for COD)
- **COD Form**: Floating label inputs with slideIn animation (200ms), black with opacity
- **Trust Row**: "⚡ 3–5 Day Dispatch · 🔄 36h Exchange · 🛡 Authentic" (thin borders, centered)
- **CTA Button**: "Secure Your Drop →" (prepaid) / "Place Your Order →" (COD), Archivo Black, white bg

### Product Page Enhancements
- **Trust Row**: Replaced 3-icon row with badge-style: "⚡ 3–5 Day Dispatch · 🔄 36h Exchange · 🛡 100% Authentic"
- **Shipping Copy**: "Free Shipping · All Prepaid Orders" (no threshold)
- **Policy Copy**: "Exchanges only — report defects within 36h" (no "store credit" language)
- **FOMO Stock Counter**: Dynamic copy based on `stockCount`:
  - `null` or `>10`: "Available Now"
  - `4-10`: "Only X left in this drop. Never restocked." (low stock style)
  - `1-3`: "X left — final units. Never restocked." (critical style with pulse)
  - `0`: "Dropped. Gone."
- **Per-Size Stock Gating**: Sizes with `sizeStock[size] = 0` render greyed out, line-through, `pointer-events:none`
- **Sold-Out Preservation**: Products with `stockCount = 0` show "DROPPED. GONE." heading, "This drop is closed. We never restock." copy, and "NOTIFY ME FOR THE NEXT DROP" button. Page returns 200 (not 404).

### Size Chart System
- **API Endpoint**: `/api/size-chart?category={product.category}` filters by `product_category` column
- **Dynamic Columns**: Renders 4 columns (Size, Chest, Length, Shoulder) OR 5 columns (adds Sleeve) based on data presence
- **T-Shirts/Crop Tops**: Show Sleeve column
- **Shirts**: No Sleeve column
- **Frontend**: Fetches with category param, automatically detects and renders correct columns

### SEO Infrastructure
- **robots.txt**: Added `Disallow: /admin`, `Disallow: /api/`, `Disallow: /auth/`
- **sitemap.xml**: Includes sold-out products (they're preservation pages, not 404s)
- **Admin Panel**: SEO Title & Description fields wrapped in collapsible `<details><summary>SEO (Optional)</summary>` section with placeholders "Leave blank to auto-generate"

### Copy Changes
- **Identity Overlay**: "SECURE ACCESS" → "Get Access →", added "One tap. You're in." below button
- **Footer Links**: "Returns & Credit" → "Exchanges"
- **Cart Legal**: "Store-Credit-only Refund Policy" → "Exchange Policy"

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active
- **Last Updated**: 2026-03-12 (v13) — Complete Conversion & SEO Overhaul: Cart redesign (B&W only, no red), FOMO counters, per-size stock gating, per-product size charts, sold-out preservation pages, SEO fields in admin.

## Full System Documentation

See **[SYSTEM_LITERACY.md](./SYSTEM_LITERACY.md)** for complete architecture reference, including:
- All API endpoints with request/response formats
- Database schema with column types
- Authentication & checkout flows
- Frontend JS architecture
- Troubleshooting guide
- AI assistant quick reference

## Custom Domain Setup (intru.in from GoDaddy)

See DOMAIN_SETUP.md for step-by-step guide.
