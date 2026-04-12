# INTRU.IN — Full System Literacy & Architecture Reference
**Version**: v15.2 | **Date**: April 12, 2026 | **Production**: https://intru-genz.pages.dev (staging for intru.in) [AG]

> This document is designed to be read by manager of e-commerce website AND used as a context prompt for AI assistants. It contains everything needed to understand, debug, fix, or extend the intru.in codebase.

---

## 1. PROJECT OVERVIEW

**intru.in** is a limited-drop streetwear e-commerce platform built by two friends in Hyderabad, India. It sells exclusive, limited-stock clothing (T-shirts, shirts, crop tops). The core principle: "When it's gone, it's gone."

**Engineering Philosophy:**
The entire platform is mathematically engineered for two outcomes:
1. **High Organic Traffic (SEO Dominance)**: Zero-JS server rendering, dynamic sitemaps, semantic OpenGraph tags, and FAQ/AEO optimization (v15+) to ensure aggressive Google ranking.
2. **High Conversion Funnel (Identity-First)**: A sequential journey optimized for lead capture. Guest users are identified during "Add to Bag", ensuring no lead is lost even if they exit before checkout.
3. **Data-Driven Drop Management**: Granular tracking of funnel events (Identify → ATC → Checkout → Paid) to identify bottlenecks.

*This triple-mandate of SEO, Conversion, and Analytics governs all technical decisions across the stack.*

| Attribute | Value |
|-----------|-------|
| **Framework** | Hono (lightweight, edge-first) |
| **Runtime** | Cloudflare Workers (via Cloudflare Pages) |
| **Database** | Supabase (PostgreSQL + Auth + RLS) |
| **Payments** | Razorpay (Standard + Magic Checkout) |
| **Email** | Resend (transactional emails from noreply@intru.in) |
| **Frontend** | Vanilla HTML/CSS/JS (server-rendered, CDN libraries) |
| **Language** | TypeScript |
| **Hosting** | Cloudflare Pages |
| **GitHub** | https://github.com/Kbs-sol/intru-genz |
| **Currency** | INR (Indian Rupees) |

---

## 2. FILE STRUCTURE

```
webapp/
├── src/
│   ├── index.tsx          # Main Hono app: ALL API routes + page routes
│   ├── data.ts            # Data layer: types, Supabase helpers, R2 Upload (AWS SigV4 [AG]), 
│   │                      #   Razorpay helpers, email templates, seed data, analytics tracking
│   ├── components/
│   │   └── shell.ts       # HTML shell: nav, cart drawer, checkout JS, footer,
│   │                      #   Google auth, identity overlay, payment mode selector
│   └── pages/
│       ├── home.ts        # Homepage: hero, product grid, testimonials, newsletter
│       ├── product.ts     # Product detail: image carousel, size selector, buy now
│       ├── collections.ts # Collections page: category filter, product grid
│       ├── about.ts       # About page: founders story, values
│       ├── legal.ts       # Legal page: renders dynamic legal content
│       └── admin.ts       # Admin panel: orders, products, legal, size chart,
│                          #   IG feed, settings (login-protected)
├── public/                # Static assets (served by Cloudflare Pages)
├── supabase/
│   └── schema.sql         # Complete Supabase schema (v6) — safe to re-run
├── migrations/
│   └── 0001_initial_schema.sql  # D1 migration (unused — we use Supabase)
├── migration_v2.sql       # v15.2 migrations: funnel_events, coupons tables [AG]
├── seed.sql               # Test seed data
├── ecosystem.config.cjs   # PM2 config for local dev
├── wrangler.jsonc         # Cloudflare Pages config
├── vite.config.ts         # Vite build config (SSR for Cloudflare Pages)
├── tsconfig.json          # TypeScript config
├── package.json           # Dependencies + scripts
└── .gitignore
```

### KEY PRINCIPLE: Everything is in 4 files
- **`index.tsx`** — All backend logic (routes, APIs, middleware)
- **`data.ts`** — All data operations (DB queries, payment APIs, email sending)
- **`shell.ts`** — All frontend behavior (cart, checkout, auth, UI)
- **Individual page files** — Just HTML template generation

---

## 3. AUTHENTICATION FLOW

**Philosophy**: No login/register pages. Identity is captured silently only at checkout.

### Flow:
1. User browses freely (no auth required)
2. User clicks "Buy Now" or "Checkout"
3. If `identifiedEmail` is empty in JS, an **Identity Overlay** appears
4. User enters email OR clicks "Continue with Google"

### Email Identity (`/api/auth/identify`):
- POST email to backend
- Backend upserts into `public.users` table
- Returns success; frontend stores email in `localStorage`

### Google One-Tap:
- Rendered via `<div id="g_id_onload">` with `data-itp_support="true"`, `data-auto_select="false"`
- Callback: `handleGoogleAuth(response)` → sends JWT to `/api/auth/google`
- Backend decodes JWT (base64), extracts email/name/picture, upserts `public.users`

### Google Redirect Fallback:
- If One-Tap popup is blocked, `doGoogleRedirect()` fires
- Redirects to Google OAuth with `response_type=id_token`
- Callback URL: `/auth/google/callback`
- Callback page extracts `id_token` from URL fragment (`#id_token=...`)
- Sends to `/api/auth/google`, saves user to localStorage
- Sets `intru_auth_success` in sessionStorage, redirects to `/`
- Homepage detects the flag, restores cart from backup, resumes checkout

### Session Persistence Across Redirect:
- **Before redirect**: cart saved to `sessionStorage` as `intru_cart_backup`, checkout intent saved as `intru_pending_checkout`
- **After redirect**: homepage checks for `intru_auth_success` flag, restores cart, auto-opens drawer, resumes checkout

### localStorage Keys:
| Key | Purpose |
|-----|---------|
| `ic` | Cart items array `[{p: productId, s: size, q: quantity}]` |
| `intru_user` | Full user object `{email, name, picture}` |
| `intru_user_email` | User email string |
| `intru_user_name` | User display name |
| `intru_fname` | Checkout form: First name (for address autofill) |
| `intru_lname` | Checkout form: Last name (for address autofill) |
| `intru_phone` | Checkout form: Phone number (for address autofill) |
| `intru_pincode` | Checkout form: Pincode (for address autofill) |
| `intru_addr` | Checkout form: Address line 1 (for address autofill) |
| `intru_addr2` | Checkout form: Address line 2 (for address autofill) |
| `intru_city` | Checkout form: City (for address autofill) |
| `intru_state` | Checkout form: State (for address autofill) |

> **Autofill Note**: These address keys are written by `saveAddress()` after a successful COD/prepaid checkout. `loadSavedAddress()` reads them to pre-fill the form on the next visit. Additionally, all form inputs use standard HTML `autocomplete` attributes to enable the browser's native keychain autofill.

### sessionStorage Keys:
| Key | Purpose |
|-----|---------|
| `intru_auth_success` | Flag: set to '1' after successful Google auth redirect |
| `intru_cart_backup` | JSON backup of cart before redirect |
| `intru_pending_checkout` | Flag: '1' if checkout was in progress when redirect happened |

---

## 4. CHECKOUT FLOW

### Two Modes (controlled by `USE_MAGIC_CHECKOUT` store_setting):

#### Mode A: Manual COD (default, `USE_MAGIC_CHECKOUT = false`)
- Cart drawer shows **Prepaid/COD selector**
- **Prepaid**: Green badge "SAVE Rs.99 / FREE SHIPPING" → Razorpay standard popup
- **COD**: Gray badge "Rs.99 Convenience Fee added" → inline address form → POST `/api/checkout/cod`

#### Mode B: Magic Checkout (`USE_MAGIC_CHECKOUT = true`)
- Single "Checkout" button → Razorpay Magic handles everything (address, payment, COD)

### Prepaid Flow:
1. Frontend POST `/api/checkout` with items, userEmail, userName, paymentMethod='prepaid'
2. Backend validates items, creates Razorpay order, stores order in Supabase (status='pending')
3. Frontend opens Razorpay popup
4. On payment success: frontend POST `/api/payment/verify` with signature
5. Backend verifies HMAC signature, updates order to status='paid'
6. Backend sends "Drop Secured!" email to customer AND payment alert to manager via Resend

### COD Flow:
1. Frontend POST `/api/checkout/cod` with items, address, phone, email
2. Backend validates items, calculates total + Rs.99 COD fee
3. Backend INSERTs order into Supabase with status='pending', payment_method='cod'
4. Backend sends COD confirmation email to customer + alert email to manager
5. Returns orderId to frontend

### Critical Note — DB Constraint:
The `orders_status_check` constraint in production DB does NOT include 'placed'.
Valid statuses: `pending`, `paid`, `payment_failed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`.
**Always use `status: 'pending'` for new orders.** To add 'placed', run:
```sql
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','placed','paid','payment_failed','processing','shipped','delivered','cancelled','refunded'));
```

---

## 5. DATABASE SCHEMA (Supabase/PostgreSQL)

### Tables:

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Links to auth.users(id) |
| email | TEXT UNIQUE | |
| name | TEXT | |
| picture | TEXT | Google profile picture URL |
| google_id | TEXT UNIQUE | |
| phone | TEXT | |
| auth_provider | TEXT | 'email' or 'google' |
| last_login | TIMESTAMPTZ | |

#### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | e.g. 'p1', 'p2' |
| slug | TEXT UNIQUE | URL slug |
| name | TEXT | |
| tagline | TEXT | Short tagline |
| description | TEXT | Full description |
| price | INTEGER | In INR (not paise) |
| compare_price | INTEGER | Strikethrough price |
| images | JSONB | Array of image URLs |
| sizes | JSONB | Array of size strings |
| category | TEXT | 'T-Shirts', 'Shirts' |
| in_stock | BOOLEAN | |
| featured | BOOLEAN | |
| stock_count | JSONB | Inventory per size e.g. {"S": 10} for FOMO display |
| size_stock | JSONB | Per-size stock gating {"S":10,"M":5,"L":0}. 0=disabled. |
| seo_title | TEXT | Custom SEO Title |
| seo_description | TEXT | Custom SEO Description |
| updated_at | TIMESTAMPTZ | Automatic timestamp |

#### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| razorpay_order_id | TEXT UNIQUE | For prepaid orders |
| razorpay_payment_id | TEXT | After payment |
| customer_name | TEXT | |
| customer_email | TEXT | |
| customer_phone | TEXT | **Backend Only (PII)** |
| items | JSONB | Array of {name, size, quantity, unitPrice, lineTotal, productId, image, slug} |
| subtotal | INTEGER | |
| shipping | INTEGER | |
| total | INTEGER | Includes COD fee if applicable |
| status | TEXT | pending/paid/payment_failed/processing/shipped/delivered/cancelled/refunded |
| payment_method | TEXT | 'prepaid', 'cod', 'pending' |
| cod_fee | INTEGER | 99 for COD, 0 for prepaid |
| shipping_address | JSONB | **Backend Only (PII)** |
| rto_risk_level | TEXT | Default 'unknown' |
| shipping_address_line1/line2 | TEXT | Flat address fields (legacy) |
| shipping_city/state/pincode/country | TEXT | Flat address fields (legacy) |

> [!CAUTION]
> **PII Leakage Prevention (`/api/user/orders`)**
> The `orders` endpoint is restricted. Queries intentionally omit `shipping_address` and `customer_phone` from returning to the frontend. Form autofill exclusively relies on the browser's native keychain using HTML `autocomplete` tags to prevent data scraping over the network.

#### `store_settings`
| Key | Default Value | Purpose |
|-----|---------------|---------|
| USE_MAGIC_CHECKOUT | 'false' | Toggle Razorpay Magic vs Manual COD |
| MANAGER_EMAIL | 'shop@intru.in' | COD alert recipient |
| COD_FEE | '99' | COD convenience fee in INR |
| INSTAGRAM_FEED_ENABLED | 'true' | Show/hide IG section on homepage |
| FOMO_THRESHOLD_LOW | '10' | Stock count to trigger "Low Stock" badge |
| FOMO_THRESHOLD_CRITICAL | '3' | Stock count to trigger "CRITICAL" badge |

#### `analytics`
| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL PK | |
| page_path | TEXT | e.g. '/', '/product/slug' |
| view_count | INTEGER | Incremented on every visit |
| last_viewed | TIMESTAMPTZ | |

#### `funnel_events`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | TEXT | Target user |
| cart_subtotal | INTEGER | |
| items | JSONB | Saved cart snapshot |
| converted | BOOLEAN | Turned into a sale? |
| created_at/updated_at | TIMESTAMPTZ | Used for 24h abandoned cart queries |

#### `coupons`
| Column | Type | Notes |
|--------|------|-------|
| code | TEXT PK | The uppercase code e.g. "WELCOME10" |
| discount_type | TEXT | "percentage" or "fixed" |
| discount_value | INTEGER | e.g., 10 (%), or 500 (INR) |
| current_uses | INTEGER | Track claim counts |
| max_uses | INTEGER | Nullable for infinity |

#### Other Tables:
- **`legal_pages`**: slug (PK), title, content (HTML), updated_at
- **`size_chart`**: size_label (PK), chest, length, shoulder, sleeve, product_category, sort_order
- **`subscribers`**: email (UNIQUE), source, subscribed_at
- **`instagram_feed`**: image_url, link_url, caption, sort_order, active
- **`store_credits`**: email, amount, reason, order_id

### Row Level Security (RLS):
- **All tables have RLS enabled**
- **Public reads** allowed for: products, legal_pages, size_chart, store_settings, instagram_feed
- **Service role** required for all writes (INSERT/UPDATE/DELETE)
- **Users** can only view their own profile and orders
- **IMPORTANT**: All API writes MUST use `SUPABASE_SERVICE_KEY`, not `SUPABASE_ANON_KEY`

### Auto-Seeding:
- If `products` table is empty, app auto-seeds 6 products from `SEED_PRODUCTS` in data.ts
- If `legal_pages` table is empty, app auto-seeds 4 legal pages from `SEED_LEGAL_PAGES`
- Uses `resolution=merge-duplicates` header for upsert behavior

---

## 6. API REFERENCE

### Public APIs:

| Method | Path | Request Body | Response | Notes |
|--------|------|-------------|----------|-------|
| GET | `/api/health` | — | `{status, store, timestamp, services}` | Shows connected services |
| GET | `/api/products` | — | `{products[], source}` | source: 'supabase'/'seed'/'static' |
| GET | `/api/products/:id` | — | `{product}` | 404 if not found |
| GET | `/api/size-chart` | — | `{sizes[], source}` | Fallback to static data |
| GET | `/api/instagram-feed` | — | `{feed[], enabled, source}` | Respects INSTAGRAM_FEED_ENABLED |
| POST | `/api/checkout` | `{items, userEmail, userName, paymentMethod}` | `{success, items, total, razorpayOrderId}` | paymentMethod: 'prepaid' or 'magic' |
| POST | `/api/checkout/cod` | `{items, userEmail, userName, userPhone, address}` | `{success, orderId, total, codFee}` | address: {name, phone, pincode, line1, city, state} |
| POST | `/api/payment/verify` | `{razorpay_order_id, razorpay_payment_id, razorpay_signature}` | `{success, orderId}` | HMAC SHA-256 verification |
| POST | `/api/webhooks/razorpay` | Raw JSON | `{status: 'ok'}` | Signature-verified webhook |
| POST | `/api/auth/identify` | `{email}` | `{success, name?, existing}` | Silent identity upsert |
| POST | `/api/auth/google` | `{credential}` | `{success, user}` | JWT id_token from Google |
| POST | `/api/auth/google-userinfo` | `{email, name, picture}` | `{success}` | Fallback for access_token |
| POST | `/api/subscribe` | `{email}` | `{success, message}` | Newsletter signup |
| POST | `/api/store-credit` | `{email}` | `{email, balance}` | Check store credit balance |
| POST | `/api/shipping-info` | `{addresses}` | `{addresses}` | For Razorpay Magic |
| GET | `/api/user/orders` | `?email=` | `{success, orders[]}` | Customer order history (safe fields only — no PII) |
| POST | `/api/coupons/validate` | `{code, total}` | `{valid, discount, final_total}` | Validate & apply coupon code |
| POST | `/api/funnel/track` | `{email, items, subtotal}` | `{success}` | Record/update funnel event for abandoned cart |
| GET | `/robots.txt` | — | Text | SEO crawl-control |
| GET | `/sitemap.xml` | — | XML | SEO sitemap with product timestamps |

### Admin APIs (require admin auth):

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/admin/auth` | `{password}` → `{success}` |
| GET | `/api/admin/orders` | List all orders (desc by date) |
| PATCH | `/api/admin/orders/:id` | Update order fields (status, tracking, etc.) |
| PATCH | `/api/admin/products/:id` | Update product fields |
| PATCH | `/api/admin/legal/:slug` | Update legal page content |
| GET/PUT | `/api/admin/settings/:key` | Read/write store settings |
| PUT | `/api/admin/size-chart/:label` | Upsert size chart entry |
| DELETE | `/api/admin/size-chart/:label` | Delete size chart entry |
| POST | `/api/admin/instagram-feed` | Add IG feed item |
| PATCH | `/api/admin/instagram-feed/:id` | Update IG feed item |
| DELETE | `/api/admin/instagram-feed/:id` | Delete IG feed item |
| POST | `/api/admin/upload` | Upload image to Cloudflare R2 (S3-compatible [AG]) |
| GET | `/api/admin/analytics` | Fetch granular page/product view data |
| GET | `/api/admin/abandoned-carts` | List emails with cart > 24h without purchase |
| POST | `/api/admin/send-recovery` | Trigger abandoned cart recovery email (Resend) |

### Page Routes:

| Path | Handler |
|------|---------|
| `/` | Homepage (hero, products, testimonials, newsletter) |
| `/product/:slug` | Product detail page |
| `/p/:slug` | Legal page (terms, returns, privacy, shipping) |
| `/collections` | Collections with category filter |
| `/about` | About page |
| `/admin` | Admin panel (Konami code protected) |
| `/auth/google/callback` | Google OAuth redirect callback |
| `*` | 404 page |

---

## 7. ENVIRONMENT VARIABLES

All secrets are stored as Cloudflare Pages secrets (not in code).

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key (reads) |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key (writes — bypasses RLS) |
| `RAZORPAY_KEY_ID` | Yes | Razorpay key ID (starts with `rzp_`) |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay key secret |
| `ADMIN_PASSWORD` | Yes | Admin panel password |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID (for One-Tap + redirect) |
| `RESEND_API_KEY` | Optional | Resend API key for transactional emails |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Razorpay webhook signature verification key |

### Setting secrets:
```bash
npx wrangler pages secret put SUPABASE_URL --project-name intru-genz
# (Paste value when prompted)
```

### Local development:
Create `.dev.vars` file (gitignored):
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
ADMIN_PASSWORD=xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
RESEND_API_KEY=re_xxx
```

---

## 8. EMAIL SYSTEM (Resend)

### Setup Requirements:
1. Verify domain `intru.in` in Resend dashboard
2. Add DKIM, SPF, DMARC DNS records as instructed by Resend
3. Set `RESEND_API_KEY` in Cloudflare secrets
4. Emails sent from: `intru.in <noreply@intru.in>`

### Email Templates (defined in `data.ts`):
| `emailDropSecured()` | Prepaid payment verified | Customer |
| `emailAdminPaymentAlert()` | Prepaid/Magic payment captured | Manager (MANAGER_EMAIL or fallback) |
| `emailCodReceived()` | COD order placed | Customer |
| `emailCodManagerAlert()` | COD order placed | Manager (MANAGER_EMAIL setting) |

### Common Issues:
- **Emails not sending**: Check if `RESEND_API_KEY` is set. Check if domain is verified in Resend.
- **"From address not verified"**: Domain `intru.in` must be verified in Resend with proper DNS records.
- **Order placed but no email**: Order might have failed silently (check `dbWarning` in response). Also: emails only fire if orderId exists or as fallback with a generated COD ID.

---

## 9. PAYMENT SYSTEM (Razorpay)

### Prepaid Flow:
1. App creates Razorpay order via API (`POST https://api.razorpay.com/v1/orders`)
2. Frontend opens Razorpay checkout popup
3. On success: frontend sends signature to `/api/payment/verify`
4. Backend verifies: `HMAC-SHA256(order_id|payment_id, key_secret) == signature`
5. Updates order status to 'paid'

### Magic Checkout:
- Same as prepaid but with `one_click_checkout: true` and `line_items` in the order
- Razorpay handles address collection, COD intelligence, 1-click UPI

### Webhook Events:
| Event | Action |
|-------|--------|
| `order.created` | Create/update order in DB (for Magic COD orders) |
| `payment.captured` | Mark order as 'paid', save payment_id |
| `payment.failed` | Mark order as 'payment_failed' |

### Webhook URL: `https://intru-genz.pages.dev/api/webhooks/razorpay`
(Change to `https://intru.in/api/webhooks/razorpay` after custom domain setup)

---

## 10. FRONTEND ARCHITECTURE

### No Build Framework:
- All pages are **server-rendered HTML strings** returned by Hono
- Frontend JS is embedded inline in `shell.ts`
- CDN libraries: Tailwind CSS, Font Awesome, Chart.js, Razorpay SDK
- Fonts: Archivo Black (headings), Space Grotesk (body)

### Cart System (in-memory + localStorage):
- **Cart Architecture**: Uses a flexbox-based side-drawer. The `.cbdy` (body) has `min-height: 0` and `overflow-y: auto` to ensure scrolling. 
- **Sticky Footer & Visibility**: The `.cftr` (footer) is ultra-compact (padding reduced by 50%) and uses `flex-shrink: 0` to remain sticky. The COD Address Form is moved INSIDE the scrollable `.cbdy` to ensure input fields are visible even on small screens without being obscured by the checkout button.
- **Data Persistence**: Address fields in the cart are auto-populated from `localStorage` (`intru_name`, `intru_phone`, etc.) to reduce friction.
- **Cart Logic**: Stored as `ic` in localStorage: `[{p: "p1", s: "M", q: 1}]`. Product data pre-loaded as `PM` object. Totals recalculated on every render.
- **Conversion Psychology**: Features dynamic progress bars, trust-injected icons, and VIP prepaid badges.

### Important JS Variables (in shell.ts):
| Variable | Type | Purpose |
|----------|------|---------|
| `S` | Object | Store config: `{cs, ft, sc, rk, magic}` |
| `PM` | Object | Product map: `{p1: {id, n, s, p, i, sz}}` |
| `cart` | Array | Current cart items |
| `payMode` | String | 'prepaid' or 'cod' |
| `identifiedEmail` | String | Current user email |
| `identifiedName` | String | Current user name |
| `pendingCheckout` | Boolean | True if checkout was interrupted for auth |
| `orderToastFired` | Boolean | Prevents duplicate order toasts |

### Key Functions:
| Function | Purpose |
|----------|---------|
| `addToCart(productId, size, qty)` | Add item to cart |
| `buyNow(productId, size)` | Replace cart with single item + open drawer |
| `checkout()` | Main checkout entry point |
| `doPrepaidCheckout()` | Razorpay standard flow |
| `doCodCheckout()` | COD order flow |
| `doMagicCheckout()` | Razorpay Magic flow |
| `handleGoogleAuth(response)` | Google One-Tap callback |
| `doGoogleRedirect()` | Google OAuth redirect fallback |
| `openIdentify()` / `closeIdentify()` | Identity overlay |
| `submitIdentity()` | Email identity flow |
| `setPayMode(mode)` | Switch prepaid/cod |
| `toast(msg, type)` | Show notification |

---

## 11. ADMIN PANEL

### Access: Konami Code on any page (up up down down left right left right B A)
### Authentication: POST `/api/admin/auth` with `{password: "..."}`
### Key Metrics [v15.2 AG]:
- **Identified Leads**: Total unique emails captured at Add to Bag.
- **Checkouts**: Total checkout sessions initiated.
- **Funnel Events**: Granular tracking of user journey steps.
- **Manual Trigger**: Forced abandoned cart recovery for leads >24h old.

---

## 12. SALES FUNNEL & ANALYTICS ENGINE [v15.2 AG]

### Funnel Identification
The system captures identity at the earliest possible intent (Add to Bag).
- **Endpoint**: `POST /api/auth/identify`
- **Logic**: Upserts to `public.users`.
- **UI Resume**: Uses `sessionStorage['intru_pending_atc']` to resume actions after login.

### Analytics Tracking
Built for Cloudflare Free Tier limits (zero extra worker invocations).
- **Page Views**: `incrementView(env, target)` logged in `view_stats`.
- **Funnel Events**: `logFunnelEvent(env, email, type, meta)` logged in `funnel_events`.
- **Technique**: Uses `ctx.waitUntil()` to execute database writes after the response is sent to the user.

### Abandoned Cart Recovery
- **Logic**: Identifies users who triggered `identify` or `add_to_cart` but NOT `order_placed` within 24 hours.
- **Trigger**: `POST /api/admin/abandoned/trigger` (Manual trigger in Admin Panel).
- **Service**: Resend API (noreply@intru.in) with high-converting "Drop Secured" templates.

### Coupon System
- **Endpoint**: `POST /api/coupons/validate`
- **Supported**: Percent-based (`PROMO20`) and Flat-discount (`FIXED500`).
- **Enforcement**: Minimum subtotal and active/expiry verification.

### Tabs:
1. **Orders**: View all orders, COD highlighted yellow, update status, copy Shiprocket details
2. **Products**: Edit images (4 URL slots), price, compare price, in_stock toggle
3. **Legal**: HTML editor with live preview for terms/returns/privacy/shipping
4. **Size Chart**: Add/edit/delete size measurements (XS-XXL)
5. **IG Feed**: Toggle feed on/off, manage images with sort order
6. **Settings**: Toggle Magic Checkout, set manager email, set COD fee
7. **Image Upload [AG]**: Direct upload to **Cloudflare R2** via AWS Signature V4. Returns public URLs from the `intru-products` bucket.
8. **Maintenance [AG v11]**: Interactive control over Server-Rendered Maintenance UI (Soft/Full/Off).
9. **Analytics View [AG v15]**: Real-time snapshot of product performance, page views, and total drop engagement.

---

## 12. KNOWN ISSUES & FIXES

### Issue: Orders not saving to database
**Root Cause**: `orders_status_check` constraint in production DB doesn't include 'placed'.
**Fix**: Orders now insert with `status: 'pending'`. To add 'placed', run SQL above.

### Issue: shipping_address stored as double-encoded string
**Root Cause**: `JSON.stringify(address)` was called, then wrapped again by `JSON.stringify(orderPayload)`.
**Fix**: Pass `address` object directly (not stringified).

### Issue: Emails not sending after COD order
**Root Cause**: If order INSERT fails, `orderId` is empty. Emails now send with fallback ID.
**Fix**: Resend emails fire even without orderId using generated COD shortcode.

### Issue: Google sign-in redirect loses cart
**Root Cause**: Page reload clears JS memory.
**Fix**: Cart backed up to `sessionStorage` before redirect; restored after.

### Issue: Duplicate /api/auth/google-redirect handlers
**Root Cause**: Old handler was overriding the new redirect.
**Fix**: Removed duplicate handler.

### Issue: TypeScript Lint Errors & Web APIs [AG]
**Root Cause**: `tsconfig.json` was missing `DOM` and `DOM.Iterable` in the `lib` section, causing errors for `fetch`, `console`, `File`, etc.
**Fix**: Added `DOM` and `DOM.Iterable` to `tsconfig.json` libs.

### Issue: Admin API Security [AG]
**Root Cause**: Public exposure of internal admin endpoints.
**Fix**: Implemented `x-admin-token` middleware in `index.tsx` for all `/api/admin/*` routes.

### Issue: Mobile Nav Overlap [AG]
**Root Cause**: Header links overlapped logo on small screens.
**Fix**: Refactored header to grid layout with centered logo and implemented a slide-in hamburger menu drawer in `shell.ts`.

### Issue: AI Assistant Discoverability [AG]
**Root Cause**: Visitors missed the AI bot button.
**Fix**: Added automated CTA bubble ("Ask my AI Stylist"), modern magic icon, and premium shimmer pulse in `shell.ts`.

### Issue: AI Stylist Greeting Syntax Error [AG v11]
**Root Cause**: Unescaped single quote in `'Hi! I'm your...'` broke the script block.
**Fix**: Correctly escaped as `'Hi! I\\'m your...'`.

### Issue: Maintenance UI JS Race Conditions [AG v11]
**Root Cause**: Initial display relied on `DOMContentLoaded` causing a "flash" or failure.
**Fix**: Implemented Server-Side visibility logic in `shell.ts` and isolated core maintenance functions in an early script tag.

### Issue: Konami Code Precision [AG v11]
**Root Cause**: Legacy `keyCode` was unreliable; sequence reset on modifier keys (like Shift).
**Fix**: Migrated to `e.key`, added `e.repeat` protection, and added a whitelist for modifier keys to prevent accidental resets during capital 'b' and 'a'.

### Version 12+13+14 — Psychological Optimization, SEO, & Stock Management [AG v14]
**Enhancements (Conversion & Organic Traffic)**: 
- **Psychological Conversion Engine**: Rebranded identity overlay as an exclusive "Secure Access" portal to increase opt-in velocity.
- **Friction Elimination**: Injected "Trust Row" elements directly surrounding the buy buttons to neutralize hesitation.
- **Urgency Vectors**: Dynamic FOMO stock counters based on threshold settings.
- **Demand Capture**: Sold-out preservation logic with "Notify Me" capture.
- **AI Salesperson Funnel**: Immersive "INTRU ADVISOR" chat with psychological pacing, Quick Reply chips, and massive "SECURE NOW" product anchors.
- **SEO Infrastructure**: Zero-JS server rendering, dynamic `buildHead`, `robots.txt`, and automated `sitemap.xml` with automatic timestamps. Bulk SEO semantic keyword injection into the catalog.
- **Per-Size Stock Management (v14)**: `size_stock` JSONB column tracks inventory per size. Sizes with stock=0 are greyed out on product pages and rejected server-side in checkout APIs.
- **Zero-Stock Protection (v14)**: Frontend `addToCart()` guards against sold-out sizes. Both `/api/checkout` and `/api/checkout/cod` reject orders for zero-stock sizes.
- **AI Stylist Live Catalog (v14)**: `/api/ai/chat` now fetches live products from Supabase (not static SEED_PRODUCTS), builds a dynamic catalog string, and injects it into the system prompt. Supports `%%PRODUCT_CARD:slug%%` markers for rich product card rendering.
- **AI Product Cards (v14)**: `buildProductCard()` renders product cards with image, name, price, available sizes, stock badge, and CTA/sold-out state. Both shell.ts widget and stylist.ts full-page use the same rendering logic.
- **New Quick-Action Chips (v14)**: "🔥 What's dropping now?", "📦 Help me pick a size", "🎁 Best gift under Rs.1,000".

### Version 14.4 — Sequential Checkout & Premium Payments [AG]
- **Sequential User Journey**: Implemented a guiding flow where address confirmation is required before payment modes are revealed. This ensures data capture before decision-making.
- **Payment Reframing (Psychology)**: Shifted terminology from penalty-based (Rs.99 Fee) to service-based. Prepaid is now "Fastest Drop" (⚡) and COD is "Standard Delivery" (🚚).
- **Softer Visuals**: Removed alarming red symbols and warnings. Introduced subtle icons, clean layout cards, and benefit-driven badges.
- **Address Persistence**: Frontend JS now auto-saves address data to `localStorage` on every successful COD order, providing one-click checkout for repeat users.
- **Unified Webhook Architecture**: Consolidated redundant Razorpay webhook handlers into a single robust entry point (`/api/webhooks/razorpay`) in `index.tsx`.
- **Manager Alert Integration**: Integrated Resend-powered manager notifications for all successful prepaid and magic checkout payments, ensuring parity with the COD alert flow.
- **Zero-Friction Identity**: Replaced "Identity Overlay" with a more integrated "Secure Your Drop" portal that captures email/name seamlessly.

### Version 15 — Brutalist Modernization & Granular Insights [AG]
- **Brutalist Typography Hero**: Migrated from lifestyle imagery to a raw, high-impact typographic hero using massive **Archivo Black** text and industrial grain textures.
- **Quick Add Overlays**: Implemented a "one-click" size selection system on product cards. Hovering reveals interactive size chips; clicking adds to bag and instantly opens the checkout drawer.
- **Trust Portal Integration**: Added a dedicated site-wide footer section for "Express Ship", "Check Order", and "Secure Pay" to build immediate credibility.
- **Cloudflare R2 Migration**: Fully migrated product storage from Supabase to **Cloudflare R2**. Implemented custom AWS SigV4 signing in `data.ts` to allow secure uploads without bloated SDKs.
- **Dual-Layer Analytics**: 
  - **Global**: Cloudflare Web Analytics beacon for traffic stats.
  - **Granular**: Custom `analytics` table in Supabase tracks specific views for every product and legal page. Incremented via non-blocking `c.executionCtx.waitUntil` for zero performance impact.
- **Type Safety Polish**: Resolved extensive linting errors by explicitly typing Hono `Context` and `Next` parameters across the entire API surface.

---

## 18. ASSET STORAGE (Cloudflare R2)

### Architecture:
We use Cloudflare R2 for all product imagery to ensure global edge performance and escape Supabase storage limits.

### Implementation Details:
- **Bucket**: `intru-products`
- **Public URL**: `https://83b25481410c2463525f8e8cbc087bbd.r2.cloudflarestorage.com/intru-products/products/{filename}`
- **Authentication**: Custom implementation of **AWS Signature V4** using `crypto.subtle` in `src/data.ts`.
- **Upload Flow**: 
  1. Admin selects file.
  2. Frontend sends to `/api/admin/upload`.
  3. Backend generates SigV4 headers, performs `PUT` to R2, and returns the public URL.

---

## 19. ANALYTICS ENGINE

### Methodology:
We track both high-level traffic and low-level product interest to identify which drops are heating up.

### Components:
1. **Cloudflare Beacon**: Injected in `shell.ts`, provides core privacy-first web analytics.
2. **Custom Tracker**: `incrementView(path)` in `data.ts` uses Supabase UPSERT logic to track page-level views.
3. **Execution Context**: Uses `c.executionCtx.waitUntil()` in Hono to ensure tracking doesn't slow down the user's page load.
4. **Dashboard**: The Admin Panel's "Analytics" tab renders this data in a readable table sorted by most-viewed items.

---

## 13. DEPLOYMENT

### Build & Deploy:
```bash
cd /home/user/webapp
npm run build                                          # Vite SSR build → dist/
npx wrangler pages deploy dist --project-name intru-genz  # Deploy to Cloudflare
```

### Local Development:
```bash
npm run build
pm2 start ecosystem.config.cjs    # Starts wrangler pages dev on port 3000
```

### GitHub:
```bash
git add -A && git commit -m "description"
git push origin main
```

### Production URLs:
- **Staging**: https://intru-genz.pages.dev
- **Custom domain** (after setup): https://intru.in

---

## 14. CUSTOM DOMAIN SETUP (intru.in)

### Step 1: Add Custom Domain in Cloudflare Pages
1. Cloudflare Dashboard → Pages → intru-genz → Custom Domains
2. Add `intru.in` and `www.intru.in`

### Step 2: Point DNS (GoDaddy → Cloudflare)
**Option A (Recommended): Use Cloudflare DNS**
1. Add intru.in to Cloudflare (free plan)
2. Copy the assigned nameservers (e.g., ada.ns.cloudflare.com, ben.ns.cloudflare.com)
3. In GoDaddy: change nameservers to Cloudflare's
4. Wait 1-48h for propagation

**Option B: Keep GoDaddy DNS**
1. In GoDaddy DNS: add CNAME record `@` → `intru-genz.pages.dev`
2. Add CNAME record `www` → `intru-genz.pages.dev`

### Step 3: Update External Services
- **Google Cloud Console**: Add `https://intru.in` to Authorized JS origins + `https://intru.in/auth/google/callback` to redirect URIs
- **Razorpay Webhook**: Update URL to `https://intru.in/api/webhooks/razorpay`
- **Supabase Auth**: Add `https://intru.in` to redirect URLs in Auth settings
- **Resend**: Verify domain `intru.in`, add DKIM/SPF DNS records

### Step 4: Verify
```bash
curl -I https://intru.in          # Should return 200
curl https://intru.in/api/health  # Should return connected services
```

---

## 15. TROUBLESHOOTING GUIDE

### Order not appearing in admin:
1. Check `/api/admin/orders` response
2. Look for `dbWarning` in checkout response
3. Common: DB constraint violation → use `status: 'pending'`
4. Common: RLS blocking → ensure `SUPABASE_SERVICE_KEY` is set

### Emails not sending:
1. Check `/api/health` → Resend should show 'connected'
2. Verify domain in Resend dashboard
3. Check Resend dashboard for delivery logs
4. If domain not verified, emails will be rejected silently

### Google sign-in not working:
1. Check if `GOOGLE_CLIENT_ID` is set in Cloudflare secrets
2. Verify authorized origins in Google Cloud Console include your domain
3. Check browser console for Google GSI errors

### Razorpay payments failing:
1. Check if `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
2. Verify keys match (test vs live)
3. Check Razorpay dashboard for order creation logs

### Products not loading:
1. Check `/api/products` → should show `source: 'supabase'`
2. If `source: 'static'`, Supabase connection failed
3. Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct

---

## 16. DATA RESILIENCE & MAINTENANCE [AG]

To prevent Supabase free-tier hibernation and ensure data safety, the following systems are in place via GitHub Actions:

### 1. Supabase Keep-Alive
- **Workflow**: `.github/workflows/supabase-maintenance.yml`
- **Schedule**: Every day at 00:00 UTC.
- **Action**: Pings the `/api/products` endpoint to trigger a database read.
- **Benefit**: Prevents Supabase projects from pausing due to inactivity.

### 2. Encrypted Cloudflare R2 Backups
- **Workflow**: Same as above.
- **Action**: Performs a full `pg_dump`, compresses it into a **password-protected ZIP**, and uploads it to **Cloudflare R2** (S3-compatible storage).
- **Benefit**: 
    - **10GB Free Tier**: More than enough for many years of backups.
    - **Independent**: Safely stored outside GitHub and Supabase.
    - **Zero Cost**: Stays entirely within Cloudflare's free limits.

### 3. Required GitHub Secrets
To enable these features, you MUST add the following Secrets to your GitHub Repository:
1. `DB_HOST`: The **Pooler Hostname** (e.g., `aws-1-ap-northeast-1.pooler.supabase.com`).
2. `DB_USER`: Your **Database User** (e.g., `postgres.pxhiwuldnytfrqajywup`).
3. `DB_NAME`: Your **Database Name** (Usually `postgres`).
4. `SUPABASE_DB_PASSWORD`: Your raw Supabase password (e.g., `Intru@may28`). **NO ENCODING NEEDED.**
5. `DB_BACKUP_PASSWORD`: A secure password to encrypt the backup files.
6. `R2_ACCESS_KEY_ID`: Your Cloudflare R2 Access Key.
7. `R2_SECRET_ACCESS_KEY`: Your Cloudflare R2 Secret Key.
8. `R2_BUCKET_NAME`: The name of your R2 bucket (e.g., `intru-backups`).
9. `R2_ENDPOINT`: Your R2 S3 API endpoint.

### ⚙️ How to set up Cloudflare R2 Backups:
1. **Find your Database Details**:
   - Open your project on the [Supabase Dashboard](https://supabase.com/dashboard/projects).
   - Click the **Settings (Gear Icon ⚙️)** at the bottom left.
   - Click **Database** under Project Settings.
   - Look for the **Connection Pooler** section.
   - **DB_HOST**: Copy the Host (ends in `.pooler.supabase.com`).
   - **DB_USER**: Copy the User (usually `postgres.your-id`).
   - **DB_NAME**: Usually `postgres`.
   - **SUPABASE_DB_PASSWORD**: Your raw password (no `[]` or `%40` needed).

2. **Create the Cloudflare R2 Bucket**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2** → **Create Bucket**.
   - Name it `intru-backups` and click **Create Bucket**.
   - Copy the **S3 API URL** from the bucket page (e.g., `https://<id>.r2.cloudflarestorage.com`). This is your `R2_ENDPOINT`.

3. **Generate R2 API Keys**:
   - Go to the main **R2** page → **Manage R2 API Tokens** → **Create API Token**.
   - Name: `Backup Bot`, Permissions: **Edit**, TTL: **Never**.
   - Copy the **Access Key ID** and **Secret Access Key** immediately into GitHub Secrets.

---

## 17. QUICK REFERENCE FOR AI ASSISTANTS

When asked to fix/modify this project:
1. **Main backend logic**: `src/index.tsx` — all routes and API handlers
2. **Data layer & helpers**: `src/data.ts` — Supabase, Razorpay, Resend, email templates
3. **Frontend behavior**: `src/components/shell.ts` — cart, checkout, auth, all client-side JS
4. **Page templates**: `src/pages/*.ts` — HTML generation for each page
5. **DB schema**: `supabase/schema.sql` — complete schema with RLS policies
6. **v15.2 DB migrations**: `migration_v2.sql` — run this in Supabase SQL Editor to add `funnel_events` and `coupons` tables
7. **Build**: `npm run build` then `npx wrangler pages deploy dist --project-name intru-genz`
8. **All writes to Supabase MUST use service key** (RLS blocks anon writes)
9. **Status values for orders**: pending, paid, payment_failed, processing, shipped, delivered, cancelled, refunded (NOT 'placed' unless constraint is updated)
10. **COD fee**: Rs.99 (configurable via store_settings)
11. **Free shipping**: Prepaid always free; COD free above Rs.1999 threshold
12. **PII Rule**: `shipping_address` and `customer_phone` must NEVER be returned from `/api/user/orders` — only id, created_at, status, total, currency, items are exposed
13. **Address autofill**: Uses `localStorage` keys (`intru_fname`, `intru_phone`, etc.) loaded by `loadSavedAddress()` + native browser keychain via HTML `autocomplete` attributes

---

## 18. CHANGELOG

### v15.2 (April 12, 2026) — Sales Funnel & Security
- **Identity-First Funnel**: Users must identify via email before "Add to Bag"; captures all leads even if they don't purchase
- **Order History** (`/api/user/orders`): Safe endpoint returning the customer's past orders with status tracking; PII fields blocked
- **Zero-Token Analytics**: Page view tracking via `ctx.waitUntil()` — non-blocking background writes to `analytics` table
- **Abandoned Cart System**: `funnel_events` table tracks checkout attempts; admin `/api/admin/abandoned-carts` + `/api/admin/send-recovery` triggers re-engagement emails via Resend
- **Coupons Engine**: `coupons` table + `/api/coupons/validate` — supports `percentage` and `fixed` discount types with usage caps
- **Data Privacy Patch**: `/api/user/orders` intentionally omits `shipping_address` & `customer_phone` via `?select=` column filtering to prevent unauthenticated PII scraping
- **Native Browser Autofill**: COD form inputs decorated with HTML standard `autocomplete` attributes (`given-name`, `postal-code`, `address-line1`, etc.) to trigger iOS/Chrome/Safari address keychain; no server roundtrip needed
- **DB Migration**: `migration_v2.sql` added to repo — creates `funnel_events` and `coupons` tables safely

### v14.4 (March 20, 2026) — Sequential Checkout & Premium Payments
- Sequential address-before-payment checkout journey
- Prepaid/COD reframed as quality-of-service tiers (not penalties)
- Manager alert parity for all payment types
- `localStorage` address caching via `saveAddress()` / `loadSavedAddress()`

### v14 (March 12, 2026) — AI Stylist & Per-Size Stock
- AI Stylist live catalog integration (Gemini / Groq / OpenRouter fallback chain)
- Per-size stock gating: disabled sizes are greyed out, line-through, no interaction
- SEO: `robots.txt` updated, sitemap includes sold-out preservation pages

### v13 (March 12, 2026) — Cart Redesign & FOMO
- Full cart drawer redesign (B&W palette, no red warnings)
- FOMO stock counters with pulsing critical badges
- Sold-out preservation pages (200 status, "VAULTED: SOLD OUT")
- Dynamic size chart with category-based column rendering

