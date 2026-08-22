# intru.in — Exclusive Streetwear Platform

## Project Overview
- **Name**: intru.in
- **Goal**: Engineered for High Organic Traffic (SEO) and High Conversion (using deep direct-response psychology)
- **Stack**: Hono + TypeScript + Cloudflare Pages + Supabase + Razorpay + Resend
- **Version**: v19 (Date: August 22, 2026) — GA4-driven refresh: AI Stylist model fallbacks (multi-model per provider + auth short-circuit), maintenance mode retired, admin dashboard consolidated (14 tabs → 6 grouped nav), COD/prepaid order rows unified visually, cookie banner is now admin-toggleable (default OFF), 4 legal pages fully rewritten (DPDP Act 2023-aligned Privacy, plain-English Terms/Returns/Shipping), organic-traffic AEO improvements (llms.txt refreshed, India-city Q&A, home FAQ Schema expanded with 4 new answer-engine questions), footer grammar/brand-claim cleanup. All prior v18 work retained.

## URLs
- **Production**: https://intru-genz.pages.dev (staging) → https://intru.in (custom domain pending)
- **GitHub**: https://github.com/Kbs-sol/intru-genz
- **Admin**: Hidden — enter Robust Konami Code (↑↑↓↓←→←→ba) on any page

## v19 Changes (August 22, 2026) — GA4-Driven UX & AEO Refresh

Ground truth from `_ga4_clarity_data.xlsx` (real GA4 export, 66 days): **3,078 users → 3 purchases (0.097% CVR)**, **ChatGPT.com = 4.5% of traffic** (AEO already working), Hyderabad 301 users / Mumbai 209 / Bangalore ~ (strong metro concentration), Singapore 1,726 sessions (bot inflation — excluded from real-user maths). Every v19 change targets one of these signals.

### AI Stylist — Multi-Model Fallback per Provider
- **Root cause of "shows the popular product" behavior**: OpenRouter's `google/gemini-2.0-flash-001` was sunset (404), Groq returned 401 (key rotation needed), and Gemini direct's `gemini-2.0-flash` was deprecated (404). All 3 providers failed within seconds → chat auto-fell-back to the static "popular product" reply.
- **Fix**: each provider now walks a **model array** with correct 2026-current defaults — `google/gemini-2.5-flash-lite` → `meta-llama/llama-3.3-70b-instruct:free` → `google/gemini-flash-1.5` for OpenRouter; `llama-3.3-70b-versatile` → `llama-3.1-8b-instant` for Groq; `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash` for Gemini direct.
- **Auth short-circuit** — 401/403/429 skips the entire provider (bad key won't get better with another model); 404/400 walks to the next model in the same provider.
- **Health probe** (`/api/admin/ai/health`) updated to use the same current primary models so the ✅/❌ per-provider dot in admin reflects live reality.

### Admin Dashboard — 14 Flat Tabs → 6 Grouped Sections
User said the admin dashboard was "too scattered." New two-level navigation:
- **Orders** → Orders panel
- **Catalog** → Products · Coupons · Combos · Sizes
- **Content** → Legal · FAQ · Blog · Instagram Feed
- **Analytics** → GA4/Clarity insights
- **AI & Auto** → AI Stylist · Free-tier limits
- **Settings** → Store settings (analytics IDs, exit intent, cookie banner toggle, AI sales agent)

All existing panel IDs (`tord`, `tprod`, `tcpn`, etc.) preserved so downstream JS keeps working. Legacy `showTab()` calls still work via a back-compat shim that maps panel → parent group.

### Maintenance Mode — Retired
User: "remove the maintainance mmode i think it of no use now." Removed the middleware in `src/index.tsx`, the `/maintenance` route, the banner + full-page overlay in `src/components/shell.ts`, the entire admin tab, its save handler and the badge updater — plus the corresponding CSS. Nothing about maintenance ships to end-users anymore.

### COD vs Prepaid Order Rows — Now Visually Consistent
User: "cod orders formatting is scattered vs prepaid." Two root causes: the `codBadge` used two different inline-style layouts for verified vs pending, and the pricing column had a stray "+ Rs.99 COD handle" sub-line that shifted row height only for COD orders. Fix: unified `.pay-badge` class with the same padding/font/border for all three states (`pay-cod`, `pay-cod-ok`, `pay-prepaid`) and a matching `.price-sub` sub-line applied to **both** COD and prepaid so column heights match ("Paid online" vs "+ Rs.99 COD handling").

### Cookie Banner — Now Admin-Toggleable (Default OFF)
User: "remove the cookie consent banner or make it toggleable via admin." Compromise: the banner is gated behind a new store-setting `COOKIE_CONSENT_ENABLED` (default OFF, so it disappears from the live site immediately). Admin dashboard → Settings tab has a toggle to flip it back ON if legal ever asks. When OFF, no cookie-banner HTML or JS ships to visitors.

### Legal Pages — Fully Rewritten (Terms, Returns, Privacy, Shipping)
User: "should be more clear and informational." All four pages rebuilt from scratch to be:
- **Plain-English & scannable** (short paragraphs, bullet lists, quick-glance tables where useful)
- **Aligned to Indian law** — DPDP Act 2023 (Privacy), Consumer Protection E-Commerce Rules 2020 (Terms + Returns), IT Reasonable Security Practices Rules 2011 (Privacy)
- **Complete list of vendors & data flows** (Supabase, Cloudflare, Razorpay, Google, Clarity, Resend, Shiprocket, Meta, AI providers)
- **Real answers to common buyer questions** — how COD verification works, what the 36-hour window covers, how Store Credit is calculated, why we don't offer cash refunds, RTO handling

### Organic-Traffic AEO Improvements (GA4-Driven)
GA4 shows ChatGPT.com already sends 4.5% of traffic — that channel is the biggest untapped growth lever.
- **`/llms.txt`** — refreshed with 12 new answer-engine Q&A written the way ChatGPT users actually phrase them ("Is Intru legit?", "Does Intru deliver to Mumbai?", "Where can I buy Intru in India?", oversized-fit clarifications, comparison-answer templates for "best minimalist brand in India").
- **Home FAQPage JSON-LD** expanded from 5 to 9 questions — added India-city delivery, legitimacy, oversized-fit accuracy, drop-access questions.
- **Meta description** on home rewritten to include India-city coverage (Hyderabad, Mumbai, Bangalore, Delhi, Pune, Chennai, Kolkata) — matches the geo-concentration of real users.
- **Removed stale brand claims** — "designed over 2 months," "two best friends" narrative and "founder-designed" verbiage retired from `/llms.txt` (kept in the About page as a stylistic origin story).

### Footer / Store Description Rewrite
User: "grammar error beside uncompromising streetwear text… has 'it's' in the information." The `STORE_CONFIG.description` was rewritten to a shorter brand-line format without redundant "it's" contractions; the "Two best friends design pieces…" claim was also retired.

### File Ledger (v19)
| File | Change |
|---|---|
| `src/index.tsx` | AI Stylist model fallback arrays (OR/GQ/GM) with auth short-circuit · maintenance middleware + `/maintenance` route removed · `/llms.txt` refreshed |
| `src/components/shell.ts` | Maintenance banner, overlay, dismiss JS all removed · cookie banner gated behind `ss.COOKIE_CONSENT_ENABLED === 'true'` |
| `src/pages/admin.ts` | 14 tabs → 6 grouped nav (CSS + HTML + `showGroup()`/`showPanel()`/`showTab()` shim) · maintenance tab, save handler and badge updater removed · Settings gets `COOKIE_CONSENT_ENABLED` toggle · unified `.pay-badge` + `.price-sub` order-row visuals |
| `src/pages/home.ts` | FAQPage schema expanded to 9 Q&A · home meta description rewritten for India-city coverage |
| `src/data.ts` | 4 legal pages fully rewritten (Terms, Returns, Privacy, Shipping) · store description brand-line rewrite |

## v18 Changes (August 21, 2026) — Meta Ads Ready, Conversion Fixes, Data Ops
This release is a **conversion-rescue + ads-readiness sweep** based on real Clarity + GA4 data (613 sessions, 11.75% dead clicks, 14.68% quick backs, 140 hits to /404, purchase events only 2-3 in 3.5 months). Every change is data-driven.

### AI Stylist — Full Chain Recovery
- **Root cause**: `SUPABASE_SERVICE_KEY` unset ⇒ RLS blocked anon reads ⇒ all 3 provider keys (OpenRouter/Groq/Gemini) resolved as `null` ⇒ chat 500'd.
- **Fix**: new `resolveAIKey(c, envName, settingKey)` helper — always tries `c.env[envName]` first, falls back to `store_settings` only if env is empty. Any single key working now unblocks the whole chain.
- **`GET /api/admin/ai/health`** — live-probe each provider with a 1-token ping. Admin sees ✅ / ❌ per provider without leaving the panel.
- **System prompt rewrite** — uses the new authoritative brand voice (no more "premium"): *"minimalist streetwear for individuals — clean, intentional, oversized tees designed to feel like YOU"*. Product context is pulled live from Supabase every request.
- **Timeouts + graceful fallback** — every provider call is `AbortController`-guarded; the failure of one triggers the next in the chain.

### Meta Ads (Pixel + Conversions API) — Ready for Ads Manager
- **Meta Pixel** installed via `src/components/shell.ts` (`buildAnalytics()`) — standard `fbq('init', PIXEL_ID)` + `PageView` + `<noscript>` fallback.
- **Server-side Conversions API** (`sendMetaCAPI()` in `src/index.tsx`) POSTs to `graph.facebook.com/v18.0/{PIXEL_ID}/events` for **every** funnel event with SHA-256-hashed email/phone + IP + UA + `_fbp` + `_fbc` cookies.
- **Browser ↔ server dedup** — the same `event_id` UUID is passed to both `fbq()` (client) and CAPI (server). Meta stitches them into one event ⇒ **zero double-counting** in Ads Manager.
- **Event alias map** (`META_EVENT_ALIAS`) — translates our internal names (`add_to_cart`, `identify`, `checkout_start`, `payment_success`) to Meta Standard Events (`AddToCart`, `Lead`, `InitiateCheckout`, `Purchase`).
- **Test Events** — set `META_CAPI_TEST_EVENT_CODE` env to route into Meta's Test Events panel while wiring ads.
- **Zero-TTFB dispatch** — CAPI POSTs happen inside `c.executionCtx.waitUntil()` so pages stay instant.

### Cookie Consent — India DPDP-lite, non-invasive
- **Bottom ribbon** (never a full-screen block) appears 1.8s after page load.
- **Analytics-by-default** (GA4 + Clarity load immediately — legitimate interest).
- **Meta Pixel is opt-out** — loaded only if `localStorage.intru_analytics_consent !== '0'`. Deferred via `window._intruLoadFbq`.
- **Decline** ⇒ beacon adds `no_capi:1` and server skips `sendMetaCAPI()`. Fully honored.

### Promo Visibility — the SILENT KILLER of your conversions
Clarity data showed the "FINAL CLEARANCE / Any 3 for ₹1499 AUTO-APPLIED" combo was **invisible** to users:
- **Combo progress bar** — now **always visible** when cart isn't yet 3 items ("Add X more to unlock ₹1499 clearance"), not just at 2/3.
- **Clickable top combo bar** — every item in the promo bar links to `/collections` with `promo_bar_click` tracking. Final CTA is a real button, not passive text.
- **Cart drawer promo box** — gradient background + "🎁 SAVE MORE" chip + `#publicCoupons` chip area for quick-apply of active codes.
- **`GET /api/coupons/public`** — returns codes where `is_public=true` (falls back to 2 newest active codes). Cart drawer renders them as one-click chips.
- **Enhanced 404 handler** — `140 views to /404` in GA4 is a huge leak. The handler now logs every hit to `funnel_events` (find the broken links in admin) and renders a **3-CTA rescue page** (Collections / AI Stylist / Instagram DM) with the combo callout + `noindex`.

### Admin Panel — Order-management upgrades
- **Orders table** now has a **Date & Time column** with relative time (Xm/Xh/Xd ago) + full IST timestamp; 🔥 badge on orders <24h old.
- **Newest-first sort** — no more scrolling to find today's orders.
- **COD Verified badge** — visual pill next to status for verified COD orders.
- **"Send Custom Email" button** per order — opens compose modal ⇒ `POST /api/admin/orders/:id/email` fires branded HTML email via Resend, logs to `funnel_events` for audit.

### Email Templates — All 5 rewritten
- **Instagram DM first** — every footer has a gradient "📩 DM us on Instagram" button.
- **No more "Reply to this email" or "shop@intru.in"** verbiage (was confusing customers).
- **Grievance officer email** embedded as HTML comment `<!-- Grievance officer: grievance@intru.in -->` (compliance-visible, user-invisible).
- **New brand tagline** in headers, IST timestamps in manager alerts.

### SEO / GEO scrub
- 30+ occurrences of "premium" replaced with **authoritative brand copy**: *"Tired of everyone wearing the same thing? Intru is minimalist streetwear for individuals — clean, intentional, oversized tees designed to feel like YOU"* across `data.ts` (SEED_PRODUCTS + blog + emails), all page files, JSON-LD, `llms.txt`, sitemap captions.
- Product spec: "Premium 240 GSM" ⇒ "240 GSM heavyweight cotton".

### Clarity Findings — Fixed
- **Dead clicks 11.75%** (target <2%): `initA11yNormalizer()` IIFE in shell.ts adds `role="button" tabindex="0"` to 13 non-button clickable divs/spans + a `MutationObserver` for dynamic content + keyboard binding.
- **JS errors 3.1%** — top errors ("java object is gone", "java exception was raised during postmessage") come from `InstagramApp`/`GoogleApp` WebView bridges (36% of Indian mobile users). Now swallowed by a targeted `window.onerror` handler — not our bugs, don't spam Clarity.
- **Singapore 1005 sessions vs 4 real in Clarity** — GA4 doesn't filter bots. Meta Pixel + Clarity already do. Loop-agent detection covers the rest.

### Security & Abuse Hardening
Full audit + fixes:
- **Rate limiting** (per-IP, per-isolate sliding window) added to 6 public endpoints:
  - `/api/ai/chat` — 20 calls / 5min (LLM cost defense)
  - `/api/analytics/event` — 300 / 1min (log flood defense; silent 204 fail)
  - `/api/subscribe` — 10 / 1hr (spam)
  - `/api/auth/magic-link` — 5 / 1hr (email-send abuse)
  - `/api/checkout/cod` — 8 / 1hr (fake order defense)
  - `/api/coupons/validate` — 30 / 10min (code enumeration defense)
- **Input size caps** — AI chat: 40 msgs max, 4KB per msg; coupons: 40 chars max; emails: 254 chars max.
- **HTML escape** verified on admin custom-email endpoint (XSS defense on order-recipient side).
- **Admin gate unchanged** — every `/api/admin/*` still requires `x-admin-token` header (middleware at src/index.tsx:2110).

### Data Export — GA4 + Clarity + Supabase
Google Apps Script at **`tools/GA4_Clarity_Exporter.gs`** pulls everything into a single Google Sheet. See "Analytics Export" section below for setup.

## Environment Variables — Full Secret Reference (v18)
The new secrets added in v18 for Meta Ads + AI keys sit alongside the existing ones. All are set via `npx wrangler pages secret put <NAME> --project-name intru-in`:

| Secret | Purpose | Required? |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | RLS-limited public key | Yes |
| `SUPABASE_SERVICE_KEY` | Bypasses RLS (server-only) — **critical for AI Stylist** | Yes |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payments | Yes |
| `ADMIN_PASSWORD` | Admin panel auth (also `x-admin-token`) | Yes |
| `GOOGLE_CLIENT_ID` | One-Tap sign-in | Recommended |
| `RESEND_API_KEY` | Transactional email | Recommended |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook HMAC | Recommended |
| `CRON_SECRET` | Daily AI cron auth | Recommended |
| `OPENAI_API_KEY` / `AI_OPENROUTER_KEY` / `AI_GROQ_KEY` / `AI_GEMINI_KEY` | AI Stylist provider chain (any one works) | At least one |
| **`META_PIXEL_ID`** | Meta Pixel + CAPI (e.g. `123456789012345`) | **v18** |
| **`META_CAPI_ACCESS_TOKEN`** | Server-side CAPI auth | **v18** |
| **`META_CAPI_TEST_EVENT_CODE`** | Test Events panel (e.g. `TEST12345`) | Optional |
| `GA4_MEASUREMENT_ID` | GA4 property (`G-XXXXXXX`) | Recommended |
| `CLARITY_PROJECT_ID` | Clarity project | Recommended |
| `GTM_CONTAINER_ID` | GTM (defaults to `GTM-PCQCS3JV`) | Optional |

### Meta Ads — Setup in 5 minutes
1. Meta Business ⇒ Events Manager ⇒ **Copy the 15-digit Pixel ID**. Set `META_PIXEL_ID` secret.
2. Events Manager ⇒ Settings ⇒ **Conversions API ⇒ Generate Access Token**. Set `META_CAPI_ACCESS_TOKEN` secret.
3. (Optional) Events Manager ⇒ Test Events ⇒ copy test code. Set `META_CAPI_TEST_EVENT_CODE` (leave unset in production).
4. Redeploy: `git push origin main` — Cloudflare Pages auto-deploys.
5. Verify: open intru.in in DevTools → Network → filter `facebook.com/tr` — you should see `PageView` fire. In Events Manager → Test Events, browser + server events with matching `event_id` will show `Deduplicated`.

## Supabase RLS Notes (Critical for AI Stylist)
The v18 AI Stylist chain reads its provider keys from `store_settings` if `env` is empty. **This requires `SUPABASE_SERVICE_KEY` set** — because the `store_settings` table has RLS enabled and the `anon` role cannot read secret rows. Symptoms of a missing service key: AI chat returns 500 or "no provider configured" even with keys visibly present in Supabase. Fix: `npx wrangler pages secret put SUPABASE_SERVICE_KEY --project-name intru-in` then redeploy.

Public coupons rely on an **`is_public` boolean column** on `coupons`. Migration:
```sql
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
-- Mark codes that should show as cart-drawer chips:
UPDATE public.coupons SET is_public = true WHERE code IN ('CLEARANCE1499', 'WELCOME10');
```

## Analytics Export — Google Apps Script (v18)
`tools/GA4_Clarity_Exporter.gs` pulls **all** GA4 (last 730d), Microsoft Clarity (last 3d — API cap), and optionally Supabase `funnel_events` (last 90d) into a Google Sheet.

**One-time setup (10 minutes):**
1. Create a new Google Sheet. Extensions → Apps Script → paste `tools/GA4_Clarity_Exporter.gs`.
2. In the Apps Script editor, **Services (+)** → add "Google Analytics Data API" (identifier `AnalyticsData`).
3. **Project Settings → Script Properties**:
   - `GA4_PROPERTY_ID` = `properties/<numeric-id>` (find in GA4 Admin → Property Settings)
   - `CLARITY_API_TOKEN` = from clarity.microsoft.com → Settings → Data Export
   - `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (optional — for `funnel_events` dump)
4. Run `exportAll()` once (approve OAuth). Run `setupTriggers()` for daily 6 AM auto-refresh.

**Sheet tabs created:**
- `GA4_Users` — country/city/device × totalUsers/newUsers/sessions/engagement
- `GA4_Events` — every event × count × unique users
- `GA4_Pages` — pagePath × views × entrances × bounce
- `GA4_Traffic` — source/medium/campaign × sessions × conversions × revenue
- `GA4_Ecommerce` — itemName × purchases × views × revenue
- `GA4_Daily` — day-by-day trend
- `Clarity_Metrics` / `Clarity_URLs` / `Clarity_Devices` — dead clicks, rage clicks, quick backs, script errors, device split
- `Supabase_Events` — full funnel_events dump (optional)
- `_Run_Log` — timestamps, duration, errors

The Apps Script menu **"INTRU Exporter"** appears on sheet open for one-click re-runs of any specific export.

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

### FAQ + Blog: Supabase-first with Hardcoded Fallback
Both `/faq` and `/blog` follow the same pattern as `/p/:slug` legal pages: **live from Supabase when available, hardcoded seed as fallback**. This guarantees crawlers and users always see content, even before the DB is populated or during a Supabase outage.
- **Data source**: `fetchFAQs()` / `fetchBlogPosts()` in `src/data.ts`. Reads only `is_active=true` / `is_published=true` rows.
- **Fallback pool**: `SEED_FAQS` (25 curated FAQs across 6 categories) and `SEED_BLOG_POSTS` (5 long-form organic-traffic articles) in the same file — scrubbed to only include claims Intru can factually stand behind (no fabricated batch sizes, drop cadences, or testing durations).
- **Auto-seed**: If Supabase is configured but the tables are empty, the fetcher POSTs the seed rows once using the service key so the admin sees them in the DB immediately.
- **Admin CRUD**: `❓ FAQs` and `📝 Blog` tabs in `/admin` provide full create/edit/delete on the DB rows (writes require `SUPABASE_SERVICE_KEY`).
- **SQL migration**: `migration_faq_blog.sql` (append to your existing `migration_v2.sql` workflow). Creates `public.faqs` and `public.blog_posts` with RLS policies: `anon` reads active/published only, `service_role` full access.
- **SEO**: `FAQPage` + `BlogPosting` + `BreadcrumbList` JSON-LD emitted on every render. `/sitemap.xml` includes all published blog slugs with their `updated_iso` as `lastmod`.

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
| **❓ FAQs** | Full CRUD for `/faq` entries — create/edit/delete Q&A, category grouping, sort order, active toggle. Auto-seed on first request; falls back to hardcoded `SEED_FAQS` when Supabase empty/offline (crawlers always see content) |
| **📝 Blog** | Full CRUD for `/blog` posts — title/slug (auto-generated)/category/cover (with upload)/excerpt/SEO title & desc/keywords/HTML body/published toggle. Falls back to hardcoded `SEED_BLOG_POSTS` when Supabase empty/offline |
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
