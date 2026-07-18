# intru.in — Exclusive Streetwear Platform

## Project Overview
- **Name**: intru.in
- **Goal**: Engineered for High Organic Traffic (SEO) and High Conversion (using deep direct-response psychology)
- **Stack**: Hono + TypeScript + Cloudflare Pages + Supabase + Razorpay + Resend
- **Version**: v17 (Date: July 2, 2026) — Google Merchant feed, coupon visibility, Instagram-WebView dead-click fix, Clarity smart events, X/Pinterest removal, /style-guide 500 fix

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

### Identity-First Funnel (Phase 2)
- `addToCart()` enforces identity gate: if no `intru_user_email` in localStorage, shows login modal
- `intru_pending_atc` sessionStorage preserves item; auto-added post-login without re-click
- `buyNow(pid, size)` adds item + immediately triggers `checkout()` — direct to payment
- Cart count updates via `dispatchEvent` pattern — no hard reload required

### Background Analytics Flow (Zero-TTFB)
- All page views tracked via `c.executionCtx.waitUntil(incrementView(...))` — response sent first
- Funnel events (identify, add_to_cart, checkout_start, payment_success) logged to `funnel_events` table
- Client calls `POST /api/analytics/event` — server responds 200 instantly, logs via `waitUntil`
- Admin Analytics tab shows view_stats + funnel_events breakdown in real-time

### Resend Email Notifications (Phase 2 — Conditional Logic)
- **Prepaid success** → Rich "Order Confirmed" email via `emailOrderConfirmed()` + manager alert
- **COD placed** → "Action Required: Verify Your Order" via `emailCodVerificationRequired()` with idempotent `/verify-order?id=...` link
- **COD verification** → `/verify-order` updates status `pending→verified`, sends "Order Confirmed" — one-shot, idempotent
- **COD verify** is priority (bypasses credit guard); manager alerts are non-priority

### Resend Credit Guard (Phase 2)
- 15-day rolling window, 1200 email limit tracked via `email_logs` table
- Priority types (`verification`, `confirmation`, `order_confirmed`, `cod_verify`) bypass the guard
- Non-priority types (`abandoned_cart`, `newsletter`, `manager_alert`) are blocked when limit exceeded
- `checkResendGuard(sbUrl, sbKey, type)` + `logResendEmail(sbUrl, sbKey, email, type, orderId)` helpers in `data.ts`

### Abandoned Cart (Phase 2)
- **Manual Override**: "Send Recovery Email" button per order row in Admin → Orders tab (for pending/placed orders)
- **Scheduled**: Cron trigger via `POST /api/admin/abandoned/trigger` checks funnel_events > 24h old, unverified, no paid order
- **IMPORTANT**: Cloudflare Workers are stateless — configure a **Cloudflare Cron Trigger** (Scheduled Worker) in `wrangler.jsonc` to call `abandoned/trigger` hourly:
  ```jsonc
  "triggers": { "crons": ["0 * * * *"] }
  ```
  And add a `scheduled` handler in `src/index.tsx` for the cron job to work autonomously

### Dynamic Ratings (Phase 2)
- If no approved ratings: returns pseudo-random deterministic float between 4.1–4.7 (seeded by productId)
- If ratings exist: calculates average, floors at 4.0 (brand prestige floor)
- Source: `ratings` table in Supabase (`product_id`, `rating`, `is_approved`)

## Supabase Schema (v6 + migration_v2)

| Table | Purpose |
|-------|---------|
| `users` | Synced from Supabase Auth; stores email, name, picture, auth_provider |
| `products` | Product catalog + SEO fields (seo_title, seo_description) + size_stock JSONB (per-size inventory) + stock_count JSONB (FOMO display) |
| `orders` | Full order data: customer_phone, customer_email, items JSON, shipping_address JSON, payment_method, cod_fee, status |
| `store_credits` | Store credit ledger |
| `legal_pages` | Dynamic legal content (terms, returns, privacy, shipping) |
| `size_chart` | Size measurements (XS-XXL, chest/length in inches) |
| `subscribers` | "Notify Me" email signups |
| `store_settings` | Admin toggles (USE_MAGIC_CHECKOUT, FOMO_THRESHOLD_LOW, FOMO_THRESHOLD_CRITICAL, etc.) |
| `instagram_feed` | Admin-managed Instagram feed images |
| `view_stats` | Atomic page view counter (path PK, count, last_viewed_at) + `increment_view` RPC |
| `coupons` | Discount codes (code, type: percent/flat, value, min_total, expiry_at, is_active) |
| `ratings` | Product ratings (product_id, rating 1-5, is_approved, customer_name, comment) |
| `email_logs` | Resend quota tracking (email, type, order_id, sent_at) — 1200/15d guard |
| `funnel_events` | Sales funnel tracking (session_id, email, event_type, product_id, metadata) |

**Run `supabase/schema.sql` then `migration_v2.sql` in Supabase SQL Editor** to create/migrate all tables.

### New in v15.4: Coupon Management
- New admin tab **🏷️ Coupons** — full UI for creating, toggling active state, and deleting coupon codes
- Supports `percent` (e.g., SUMMER20 = 20% off) and `flat` (e.g., FLAT100 = Rs.100 off) discount types
- Enforces minimum cart total, expiry date, and maximum usage count
- Codes are case-insensitive (auto-uppercased)

### New in v15.4: AI Stylist UX Improvement
- **Header "AI Stylist" button** → now opens the on-page chat popup via `toggleAIChat()` instead of navigating to `/intrustylist`
- Chat opens, closes all drawers, focuses input, and scrolls widget into view on mobile
- Keeps users on page → higher conversion probability

### New in v15.4: Add-to-Cart Email
- When a **new user** submits their email in the identity overlay, a personalized "Access Secured" email is sent via Resend
- Email includes cart preview (up to 3 items) and a "Complete My Order →" CTA
- Zero blocking: uses `ctx.waitUntil()`, guarded by Resend credit guard

## Admin Panel (Konami-protected)

| Tab | Features |
|-----|----------|
| **Orders** | COD rows highlighted yellow, customer name/phone/email, payment method badge, "Copy for Shiprocket" button, **"Send Recovery Email" button for pending/placed orders** |
| **Analytics** | 6 stat cards (Leads, ATC, Checkouts, Payments, Conv Rate, Total Views), page view bars, funnel summary with drop-off %, top products by ATC, recent events table |
| **Products** | Image URL editor (4 slots), price/compare-price, in-stock toggle, per-size stock editor (size_stock JSON), total stock (stock_count JSON), collapsible SEO section |
| **🏷️ Coupons** | Create/activate/deactivate/delete discount codes. Percent and flat types, expiry, min total, max uses |
| **Legal** | HTML editor with live preview for all legal pages |
| **Size Chart** | Full CRUD for chest/length measurements |
| **IG Feed** | ON/OFF toggle (hides homepage section when OFF), add/edit/delete images, instant UI updates |
| **Settings** | Payment mode toggle (Manual COD ↔ Razorpay Magic), manager notification email, COD fee |
| **Upload [AG]** | Direct image upload to Cloudflare R2 with auto-fill logic for product/IG inputs |
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

## 🔁 Self-Improving Growth Loop (daily AI system)

A closed feedback loop that runs **once per day** (or on-demand from chat/admin) with one primary goal: **sell the current stock to Indian buyers**, then grow revenue + traffic.

**Each run:**
1. **Consume** — live funnel/orders/products/stock from Supabase + the *previous* loop run and which actions it applied.
2. **Analyze** — computes KPIs, isolates **real India demand from bot traffic** (the GA4 "Singapore" spike = a monitoring bot: desktop + direct + ~0s engagement on a fixed 6h schedule; real engaged users are ~95% India), finds the biggest funnel leak + the slowest-moving stock.
3. **Decide** — an OpenAI-compatible LLM (falls back to a built-in heuristic engine) returns a **structured plan in the founder's minimalist / individuality brand voice** ("pieces that feel like you", "limited stock, never restocked").
4. **Apply** — safe, reversible changes (a site-wide **announcement bar** via the `AI_ANNOUNCEMENT` store setting) are written **live with no redeploy**. Copy/coupon ideas are suggested for human approval.
5. **Learn** — the run + applied actions + **metric deltas vs. yesterday** are stored in `ai_sales_reports` (`report_type='loop'`), so the next run measures whether the changes worked. That is the loop.

**Endpoints** (protected by `CRON_SECRET` or admin password):
- `POST /api/ai/loop?days=7` — run the loop (auto-applies + emails + stores)
- `GET  /api/ai/loop?days=7&dry=1` — preview only (no apply/email/store)
- `GET  /api/ai/sales-report?days=7` — the simpler daily funnel report
- `GET  /api/admin/sales-reports` — history (admin)

**Trigger:** the `Daily AI Sales Agent` GitHub Actions workflow runs both the report and the loop at 03:30 UTC (~9 AM IST). It needs secret `AI_AGENT_CRON_SECRET` (= Cloudflare `CRON_SECRET`) and optional var `SITE_URL`. Admins can also click **"▶ Run growth loop now"** in the admin Analytics settings.

**LLM key (optional):** the loop reuses the AI Stylist's existing OpenRouter/Groq key from store settings if present, or a dedicated `OPENAI_API_KEY`. With no key it runs in heuristic mode.

```bash
# Optional — richer LLM-authored loop decisions
npx wrangler pages secret put OPENAI_API_KEY --project-name intru-in
npx wrangler pages secret put CRON_SECRET --project-name intru-in   # required for cron auth
```

## 🤖 GEO / AEO — Built to be Recommended by AI Assistants

Intru is engineered so answer engines (ChatGPT, Gemini, Perplexity, Claude, Copilot, Grok, Meta AI) can **understand, retrieve, cite, compare and recommend** the brand.

**Entity graph (one brand, one identity):** every page emits a Schema.org `@graph` with stable `@id` nodes so AI resolves "Intru" as a single entity:
- `https://intru.in/#organization` — `Organization + OnlineStore + ClothingStore` (slogan, founders, `knowsAbout`, `paymentAccepted`, `priceRange`, `sameAs`).
- `https://intru.in/#brand` — the `Brand` node.
- `https://intru.in/#website` — `WebSite` (`inLanguage: en-IN`, `publisher` → `#organization`).
- Product pages: `Product` gets `@id …/product/<slug>#product`, `productID`, and `brand`/`manufacturer` linked back to `#brand`/`#organization`, plus `audience` (India), `AggregateRating`, `speakable`.

**Answer-engine content:**
- **`/guide`** — Buying Guide & Answer Hub: buying guide (`HowTo`), size chart, neutral brand-comparison framework, streetwear glossary (`DefinedTermSet`), and an 8-question `FAQPage`. This is the canonical source for comparison/definition answers.
- **`/style-guide`** — styling article (`Article`).
- **`/llms.txt`** — includes "Why AI can recommend Intru", comparison/recommendation answers (best minimalist brand / vs fast-fashion / is Intru legit / who should buy), an inline size table, and canonical entity IDs.
- **`/llms-full.txt`** — full machine-readable catalog.

**Machine data endpoints:** `/sitemap.xml`, `/sitemap-images.xml`, `/merchant-feed.xml` (Google Shopping), `/api/products` (JSON), `/manifest.json`, `/robots.txt` (explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.).

**Speakable markup** on product + guide pages supports voice/assistant answers. All JSON-LD validated (3/3 blocks per page).

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

## v14 Changes (March 12, 2026)
- **AI Stylist Live Catalog**: The AI assistant now knows exactly what is in stock and provides deep-links to products.
- **Per-Size Stock Gating**: Server-side and client-side protection against overselling sizes.

- **Documentation**: Updated `SYSTEM_LITERACY.md` to reflect the new sticky footer architecture.

## v14.4 Changes (March 20, 2026)
### v14.4 - Sequential Checkout & Premium Payments
- **Sequential Journey**: Customers must now confirm their shipping address before revealing payment options, ensuring zero-loss of data and a guided flow.
- **Service-Level Payment Selection**: Reframed Prepaid vs COD as quality-of-service choices. Prepaid is branded as "Fastest Drop" (⚡) and COD as "Standard Delivery" (🚚).
- **Manager Alert Parity**: Implemented immediate Resend alerts for all prepaid and magic checkout payments, ensuring the store manager is notified for every successful sale.
- **Backend Consolidation**: Unified redundant Razorpay webhook handlers and centralized email notification logic in `index.tsx`.
- **UX Sensitivity**: Removed all "penalty" and "scare" terminology (e.g., "Logistics Heavy", "COD Fee Warning") in favor of premium, benefit-driven language.
- **Address Persistence**: Implemented `localStorage` caching for successful address entries to streamline the experience for repeat customers.

## v15.2 Changes (April 12, 2026)
### Sales Funnel & Zero-Token Analytics
- **Identity First Validation**: Captures user emails on "Add to Bag" to secure items and build customer pipelines.
- **Order History**: Accounts feature immediate viewing access to past orders and statuses.
- **Zero-Token Tracking**: Implemented scalable, background funnel analytics (page views, checkout events) using `ctx.waitUntil()` on CF workers to bypass free-tier caps.
- **Abandoned Carts**: Automated tracking of leads >24h without purchase, with manual trigger from Admin panel scaling through Resend.
- **Coupons Engine**: Discount integration mapping to percent & flat limits, strictly validated server-side.
- **Data Privacy Patch**: Restricted `/api/user/orders` to block `shipping_address` or `customer_phone` from API responses to prevent unauthenticated PII leakage.
- **Zero-Friction Checkout**: Added universal `autocomplete` standard tags to the COD form to trigger native iOS/Chrome/Safari saved address autofill securely.

## v16 Changes — GA4 + Microsoft Clarity & Revenue CRO
### Third-Party Analytics (config-driven, privacy-safe)
- **Google Analytics 4**: `gtag.js` injected only when a Measurement ID is configured. IP anonymization on by default.
- **Microsoft Clarity**: heatmaps + session recordings injected only when a Project ID is configured.
- **Google Tag Manager (GTM)**: container `GTM-PCQCS3JV` auto-injected on every page (head script + `<body>` noscript). Config-driven via store-setting/env `GTM_CONTAINER_ID` (set to `off` to disable). Runs **alongside** GA4 without duplication — use GTM to add future tags (e.g. Meta Pixel for IG-ad retargeting, Google Ads conversions) with no code changes. **Important: do not also add GTM's GA4 tag inside the container, since GA4 already loads directly — that would double-count.**
- **Zero hardcoded IDs**: configure from **Admin → Settings → Analytics** (`GA4_MEASUREMENT_ID`, `CLARITY_PROJECT_ID`). Falls back to Cloudflare secrets. For GA4 **either** `GA4_MEASUREMENT_ID` (preferred — same name as the admin key) **or** the legacy `GA_MEASUREMENT_ID` is accepted; for Clarity use `CLARITY_PROJECT_ID`. Empty = fully disabled (safe no-op).
  - **Fix (v16.1):** previously only the env name `GA_MEASUREMENT_ID` was read, so a Cloudflare secret named `GA4_MEASUREMENT_ID` was silently ignored (GA4 never loaded while Clarity worked). The env fallback now accepts both names.
- **No redeploy needed** — IDs are read from store settings at render time.

### Full GA4 E-commerce Funnel (drives revenue decisions)
A unified `window.track()` helper forwards every funnel event to GA4 **and** Clarity **and** the existing internal `/api/analytics/event` pipeline (via `sendBeacon`).
- `view_item` — product page load
- `add_to_cart` — with item id, variant (size), price, quantity, value
- `begin_checkout` — full cart snapshot + coupon + value
- `purchase` — **accurate revenue**: `/api/payment/verify` now returns `total`; fired for prepaid, Magic Checkout, and COD with `transaction_id`, `value`, `coupon`, `payment_type`, and line items.

### Conversion Rate Optimization (revenue lift)
- **Exit-intent recovery** (desktop, toggleable via `EXIT_INTENT_ENABLED`): re-uses the email-capture gate to recover abandoning visitors; fires `exit_intent_shown`.
- **Scroll-depth tracking** (`scroll_depth` 25/50/75/90%): pinpoints where visitors disengage.
- **Engaged-session signal** (`engaged_session`): flags high-intent visitors who haven't converted — ideal for remarketing audiences.

> **How this increases sales:** GA4 + Clarity reveal *where* the funnel leaks (e.g. drop-off between `add_to_cart` and `begin_checkout`), Clarity recordings show *why*, and the `purchase` event with revenue lets you measure ROI per channel/campaign and build remarketing/lookalike audiences. Exit-intent directly recovers otherwise-lost visitors.

## v16.2 — Daily AI Sales Agent
An autonomous agent runs **once a day** to analyse the funnel and recommend concrete actions to increase sales.

**How it works**
1. A GitHub Actions cron (`.github/workflows/ai-sales-agent.yml`, 03:30 UTC ≈ 09:00 IST) hits the protected endpoint `GET /api/ai/sales-report?key=<CRON_SECRET>`.
2. The endpoint (`src/ai-sales-agent.ts`) pulls the last 7 days from Supabase (`view_stats`, `funnel_events`, `orders`, `products`, `coupons`), computes the conversion funnel + KPIs, and identifies the biggest leak (browse→cart, cart→checkout, checkout→purchase) and zero-converting products.
3. It asks an **OpenAI-compatible LLM** (`OPENAI_API_KEY`) for prioritised, store-specific recommendations. **If no key is set, a built-in heuristic engine produces useful recommendations** — the agent never fails silently.
4. It **emails the manager** (`MANAGER_EMAIL`, via the existing Resend integration) and **stores the report** in the `ai_sales_reports` table.

**Endpoints**
- `GET /api/ai/sales-report?key=<CRON_SECRET|admin_password>&days=7[&dry=1]` — run the agent (`dry=1` = compute metrics only, no email/store).
- `GET /api/admin/sales-reports` — list the last 30 stored reports (admin).

**Admin UI:** Admin → Settings → **AI Sales Agent** card — "Run sales report now" button + collapsible report history.

**Required/optional secrets (Cloudflare):**
| Secret | Required | Purpose |
|--------|----------|---------|
| `CRON_SECRET` | ✅ | Protects the cron endpoint. Must match the GitHub secret `AI_AGENT_CRON_SECRET`. |
| `OPENAI_API_KEY` | optional | Enables richer LLM recommendations (else heuristic fallback). |
| `OPENAI_BASE_URL` / `OPENAI_MODEL` | optional | Override endpoint / model (default `gpt-4o-mini`). |
| `MANAGER_EMAIL` | optional | Report recipient (defaults to `shop@intru.in`). |

**DB migration:** run the appended `ai_sales_reports` block in `migration_v2.sql` (Supabase SQL Editor).

## v17 Changes (July 2, 2026) — Organic Growth, Merchant Feed & CRO Fixes

> Full user-facing playbook (Merchant Center setup, free traffic sources, smart-events reference): see **[GROWTH_AND_ANALYTICS_GUIDE.md](./GROWTH_AND_ANALYTICS_GUIDE.md)**.

### Google Merchant Center Product Feed (Google Shopping)
- **New route `GET /merchant-feed.xml`** (`src/index.tsx`) — a valid **RSS 2.0** feed with the `g:` (Google) namespace, one `<item>` per **size variant**, grouped by `g:item_group_id` (shared product), so the whole catalog auto-syncs to the **Google Shopping** tab and **free listings**.
- **Correct sale pricing**: `g:price` = MRP (`comparePrice` when a sale is active), `g:sale_price` = the actual selling price. Verified live (e.g. `price=1499`, `sale_price=999`).
- **India shipping** included per item: `Rs.99` flat, **free** for orders ≥ `Rs.1999` (matches `STORE_CONFIG.freeShippingThreshold`).
- Feed is referenced from `robots.txt`.
- **No Content API required** for basic Shopping — the user registers the feed in Merchant Center via **Scheduled fetch** of `https://intru.in/merchant-feed.xml`. Step-by-step user setup (account creation, site verification, shipping/returns, feed registration, disapproval fixes, enabling free listings + optional Shopping ads) is in **GROWTH_AND_ANALYTICS_GUIDE.md → Part 1**.

### Additional Free Organic Traffic Sources
- **GROWTH_AND_ANALYTICS_GUIDE.md → Part 2** documents 10 free channels: Google Search Console, Bing Webmaster, Google Business Profile, Instagram Shopping, Pinterest organic, WhatsApp share, YouTube/Reels, Reddit/Threads, rich results, and AI/GEO discovery.

### Coupon / Promo Visibility (conversion)
- The active promo was **mislabelled**: the live combo API returns "FINAL CLEARANCE = **Any 3 products for Rs.1499**" (a bundle), not "Rs.1499 OFF". The old ambiguous badge had only ~1.7% CTR.
- New **`comboOfferLabel(c)`** helper (`shell.ts`) prefers the human-readable `description` and normalizes `₹`→`Rs.`, so the promo bar now reads clearly ("Any 3 for Rs.1499").
- Promo badge is **brighter and gently pulses** (`@keyframes cpnPulse`) — noticeable but non-intrusive.
- New **in-cart promo banner** (`renderCartPromoBanner()`, shown on cart open) surfaces the active deal exactly where it drives conversion, with an **"Add N more to unlock this deal"** nudge for bundle combos.
- Fires a `promo_shown` analytics event when a promo is displayed.

### Instagram-WebView Dead-Click Fix
- **Root cause**: on the Instagram in-app browser (~69% of traffic), the single large inline bottom `<script>` loaded late / could throw during init, leaving inline `onclick` handlers (nav, cart, menu) undefined → **Clarity logged "dead clicks"** even though users were tapping (matches the shared recording).
- **Fix** (`shell.ts`): an **EARLY NAV BOOTSTRAP** `<script>` right after `</nav>` defensively defines `toggleMobNav`, `toggleCart`, `openIdentifyOrOrders`, `closeAllDrawers`, `toggleAIChat`, `shareProductLink` before the main script runs, plus a **capture-phase delegated click fallback** for `.menu-btn/.mob-close/.ncart/.ccls`, and the INIT block is now **guarded** (`try/catch` around `renderCart`/`updateAccountBtn`/`loadSavedAddress`). Taps now always register.

### Clarity Smart Events (12 events connected)
- Unified **`window.track()`** now maps internal event names to the Clarity smart-event names via a **`CLARITY_EVENT_ALIAS`** map (`purchase`→`Purchase`, `login`→`Login`, `contact`/`contact_us`→`Contact us`) and forwards `value`/`item_id` via `clarity('set', ...)`.
- Newly wired: **Login** (identity submit + Google token), **Contact us** (mailto/wa.me/tel links), **Purchase** (correct casing), **share**, **promo_shown**. Already present: `view_item`, `add_to_cart`, `begin_checkout`, `scroll_depth`, `engaged_session`, `exit_intent_shown`. See guide **Part 3** for the full table.

### Removed X (Twitter) & Pinterest
- Removed the homepage-footer **Twitter/Pinterest icons**, the `twitter:site`/`twitter:creator` + Pinterest **meta tags**, and both handles from **schema `sameAs`** (`shell.ts` + `home.ts`). Only `https://www.instagram.com/intru.in/` remains. The `twitter:card` (`summary_large_image`) is kept — it only controls link-preview rendering, not a profile link.
- Product page **X/Twitter share button** replaced with a **copy-link** button (`shareProductLink()`); WhatsApp share kept.

### Bug fix: `/style-guide` 500 → 200
- The `/style-guide` route returned the raw `shell()` HTML **string** instead of a `Response`, throwing *"the Promise did not resolve to 'Response'"*. Fixed by wrapping in **`c.html(...)`** and using a **static `shell` import**. This page is in the sitemap + nav, so the 500 was an SEO liability — now returns **200 live**.

### Note: Cloudflare Web Analytics RUM beacon
- The Cloudflare Web Analytics beacon (`cloudflareinsights.com`) emits a benign cross-origin CORS console message on the browser; it is Cloudflare's own beacon behaviour and is **left as-is** (redundant with GA4/Clarity/GTM; removing it would lose an analytics source).

### Optional / not implemented
- **Clarity Data Export API** (JWT) integration was left optional (user: "if you think useful"); the built-in Clarity dashboard + GA4 already cover current needs.

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active
- **Last Updated**: 2026-07-02 (v17) — Google Merchant feed (`/merchant-feed.xml`), coupon visibility, Instagram-WebView dead-click fix, Clarity smart events, X/Pinterest removal, `/style-guide` 500 fix. Prior: 2026-06-18 (v16.2) GA4 secret-name fix + daily AI sales agent.

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
