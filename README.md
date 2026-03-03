# intru.in — Exclusive Streetwear Platform

## Project Overview
- **Name**: intru.in
- **Goal**: High-conversion streetwear e-commerce with frictionless checkout
- **Stack**: Hono + TypeScript + Cloudflare Pages + Supabase + Razorpay + Resend

## URLs
- **Production**: https://intru-in.pages.dev
- **GitHub**: https://github.com/Kbs-sol/intru-genz
- **Admin**: Hidden — enter Konami Code (↑↑↓↓←→←→BA) on any page

## Architecture

### Silent Identity (No Login Pages)
- Guests can browse, add to cart, and reach checkout freely
- At checkout, a "Identify Yourself" overlay asks for email OR Google sign-in
- New users are silently created in `public.users`; existing users are linked
- Google One-Tap auto-prompt appears on all pages (when `GOOGLE_CLIENT_ID` is set)
- No `/login` or `/register` routes — identity is captured only when needed

### Hybrid Checkout (Admin-Toggleable)
**Option A — Manual COD Mode (default, `USE_MAGIC_CHECKOUT = false`):**
- **Prepaid**: Green badge "⚡ SAVE ₹99 / FREE SHIPPING" → Razorpay standard checkout
- **COD**: Gray badge "Standard Delivery" + ₹99 convenience fee → inline address form
- Payment mode selector visible in cart drawer

**Option B — Razorpay Magic Mode (`USE_MAGIC_CHECKOUT = true`):**
- Single "Checkout" button → Razorpay Magic Checkout handles everything
- Payment mode selector hidden; Razorpay manages address/COD/1-click

### Resend Email Notifications
- **Prepaid success** → "Drop Secured" email to customer
- **COD success** → "COD Received" email to customer (mentions verification call)
- **COD success** → "NEW COD ALERT" email to manager (name, phone, full address, items, total)
- Emails triggered server-side; requires `RESEND_API_KEY` in Cloudflare secrets

## Supabase Schema (v5)

| Table | Purpose |
|-------|---------|
| `users` | Synced from Supabase Auth; stores email, name, picture, auth_provider |
| `products` | Product catalog (id, slug, name, price, images, sizes, category) |
| `orders` | Full order data including structured COD address fields, payment_method, cod_fee |
| `store_credits` | Store credit ledger |
| `legal_pages` | Dynamic legal content (terms, returns, privacy, shipping) |
| `size_chart` | Size measurements (XS-XXL, chest/length in inches) |
| `subscribers` | "Notify Me" email signups |
| `store_settings` | Admin toggles (USE_MAGIC_CHECKOUT, MANAGER_EMAIL, COD_FEE) |
| `instagram_feed` | Admin-managed Instagram feed images |

**Run `supabase/schema.sql` in Supabase SQL Editor** to create/migrate all tables.

## Admin Panel (Konami-protected)

| Tab | Features |
|-----|----------|
| **Orders** | COD rows highlighted yellow, customer name/phone/email, payment method badge, "Copy for Shiprocket" button |
| **Products** | Image URL editor (4 slots), price/compare-price, in-stock toggle |
| **Legal** | HTML editor with live preview for all legal pages |
| **Size Chart** | Full CRUD for chest/length measurements |
| **IG Feed** | Add/edit/delete Instagram feed images |
| **Settings** | Payment mode toggle (Manual COD ↔ Razorpay Magic), manager email, COD fee |

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
2. Add webhook URL: `https://intru-in.pages.dev/api/webhooks/razorpay`
3. Select events: `order.created`, `payment.captured`, `payment.failed`
4. Set webhook secret and add to Cloudflare secrets as `RAZORPAY_WEBHOOK_SECRET`

## Supabase Auth Setup

1. **Google**: Enable Google provider in Supabase Dashboard → Auth → Providers
2. **Email/Magic Link**: Enable Email provider with "Enable Email Confirmations" OFF for frictionless flow
3. Set redirect URLs to `https://intru-in.pages.dev`

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
| GET | `/api/instagram-feed` | Instagram feed images |
| POST | `/api/checkout` | Create prepaid/magic checkout order |
| POST | `/api/checkout/cod` | Create COD order with address |
| POST | `/api/payment/verify` | Verify Razorpay payment signature |
| POST | `/api/webhooks/razorpay` | Razorpay webhook handler |
| POST | `/api/auth/identify` | Silent Identity — upsert user by email |
| POST | `/api/auth/google` | Google One-Tap authentication |
| POST | `/api/subscribe` | Newsletter subscription |
| POST | `/api/admin/auth` | Admin authentication |
| GET | `/api/admin/orders` | List orders (admin) |
| PATCH | `/api/admin/orders/:id` | Update order status |
| PATCH | `/api/admin/products/:id` | Update product |
| GET/PUT | `/api/admin/settings/:key` | Store settings CRUD |
| POST/PATCH/DELETE | `/api/admin/instagram-feed` | IG feed CRUD |

## Design
- **Typography**: Archivo Black (headings), Space Grotesk (body)
- **Colors**: High-contrast B&W (#0a0a0a / #fafafa)
- **Logo**: SVG inline "INTRU.in"
- **Footer**: Registered office Bangalore, KA; Grievance officer shop@intru.in

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active
- **Last Updated**: 2026-03-03
