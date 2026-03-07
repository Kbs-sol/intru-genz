# intru.in — Exclusive Streetwear Platform

## Project Overview
- **Name**: intru.in
- **Goal**: High-conversion streetwear e-commerce with frictionless checkout
- **Stack**: Hono + TypeScript + Cloudflare Pages + Supabase + Razorpay + Resend
- **Version**: v11 [AG] (2026-03-07)

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

**Psychological Nudges:**
- Prepaid always shows bright green "⚡ SAVE Rs.99 / FREE SHIPPING"
- COD always shows gray "Rs.99 Convenience Fee added"
- Only one toast notification fires per order (prevents duplicate alerts)

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
| `products` | Product catalog (id, slug, name, price, images, sizes, category) |
| `orders` | Full order data: customer_phone, customer_email, items JSON, shipping_address JSON, payment_method, cod_fee, status |
| `store_credits` | Store credit ledger |
| `legal_pages` | Dynamic legal content (terms, returns, privacy, shipping) |
| `size_chart` | Size measurements (XS-XXL, chest/length in inches) |
| `subscribers` | "Notify Me" email signups |
| `store_settings` | Admin toggles (USE_MAGIC_CHECKOUT, MANAGER_EMAIL, COD_FEE, INSTAGRAM_FEED_ENABLED) |
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

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active
- **Last Updated**: 2026-03-07 (v11) - Robust Maintenance Mode (Zero-JS Flash), Enhanced Konami Code, and AI Stylist Bug Fixes.

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
