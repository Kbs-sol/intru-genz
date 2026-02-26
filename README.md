# intru.in — Premium Indian Streetwear Store

> Limited Drops. No Restocks. Store Credit Only.

## Live URLs

| Environment | URL |
|---|---|
| **Production** | https://intru-in.pages.dev |
| **GitHub** | https://github.com/Kbs-sol/intru-genz |

## Project Overview

A production-ready e-commerce storefront for **intru.in**, a limited-drop Indian streetwear brand. Built with Hono + TypeScript on Cloudflare Pages with Razorpay payment integration and Supabase backend.

### Key Features (Implemented)

- **Razorpay Payment Gateway** — Full checkout flow: Add to Cart -> Server-side price validation -> Razorpay order creation -> Payment popup -> HMAC-SHA256 signature verification -> Order confirmation
- **Razorpay Client-Side SDK** — `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` loaded on all pages
- **Cart System** — localStorage-based cart with add, remove, quantity update, rendered cart drawer with subtotal/shipping/total
- **Size Validation** — "Add to Bag" and "Buy Now" buttons are blocked until a size is selected; shake animation + error message on attempt
- **Buy Now** — Single-item immediate checkout: replaces cart with one item and calls `checkout()` directly
- **Server-Side Price Validation** — `/api/checkout` never trusts client prices; validates products, stock, sizes, and quantities server-side
- **Payment Verification** — `/api/payment/verify` with HMAC-SHA256 signature verification using Web Crypto API
- **Razorpay Webhook** — `/api/webhooks/razorpay` for server-to-server payment.captured / payment.failed events
- **Supabase Integration** — Orders, users, products, store credits stored in Supabase (graceful fallback to static data when not configured)
- **Google One-Tap** — Optional Google authentication (loads only when `GOOGLE_CLIENT_ID` env var is set)
- **Admin Panel** — Password-protected at `/admin` with order management, product editing, legal page editor
- **Legal Pages** — Terms of Service, Returns & Refunds (36h claim window, store credit only), Privacy Policy, Shipping Policy
- **SEO** — Schema.org JSON-LD, Open Graph, Twitter Cards, canonical URLs
- **Responsive Design** — Mobile carousel gallery with touch swipe, desktop 2-column grid, responsive product cards

## Architecture

```
Button Click Flow:
  handleATC() / handleBuyNow()
    -> requireSize() [validates size selection]
    -> addToCart(productId, size, qty) [localStorage]
    -> checkout() [fetch('/api/checkout')]
    -> Server validates prices, creates Razorpay order
    -> new Razorpay(options).open() [payment popup]
    -> handler: fetch('/api/payment/verify')
    -> Server verifies HMAC-SHA256 signature
    -> Updates order status in Supabase
    -> Success toast + cart clear
```

## Tech Stack

- **Framework**: Hono 4.x on Cloudflare Workers
- **Deployment**: Cloudflare Pages
- **Payments**: Razorpay (REST API + Client SDK)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Google One-Tap, Magic Links (via Supabase)
- **Frontend**: Vanilla JS + CSS (no build framework), Tailwind-like utility CSS
- **Fonts**: Space Grotesk + Archivo Black (Google Fonts)
- **Icons**: Font Awesome 6.5

## File Structure

```
src/
  index.tsx          # Hono routes + API endpoints
  data.ts            # Product data, store config, Razorpay/Supabase helpers
  components/
    shell.ts         # HTML shell (nav, cart drawer, footer, Razorpay SDK, checkout JS)
  pages/
    home.ts          # Landing page (hero, product grid, features, newsletter)
    product.ts       # Product detail page (gallery, size selector, ATC/BuyNow)
    legal.ts         # Legal page renderer (terms, returns, privacy, shipping)
    admin.ts         # Admin panel (orders, products, legal editor)
supabase/
  schema.sql         # Complete Supabase schema with RLS policies + seed data
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check with service status |
| GET | `/api/products` | List all products (Supabase or static fallback) |
| GET | `/api/products/:id` | Single product by ID or slug |
| POST | `/api/checkout` | Server-side cart validation + Razorpay order creation |
| POST | `/api/payment/verify` | HMAC-SHA256 payment signature verification |
| POST | `/api/webhooks/razorpay` | Razorpay webhook for payment.captured/failed |
| POST | `/api/auth/google` | Google One-Tap authentication |
| POST | `/api/auth/magic-link` | Supabase magic link auth |
| POST | `/api/admin/auth` | Admin login |
| GET | `/api/admin/orders` | List orders (admin) |
| PATCH | `/api/admin/orders/:id` | Update order status (admin) |
| PATCH | `/api/admin/products/:id` | Update product (admin) |
| POST | `/api/store-credit` | Check store credit balance |

## Setup Guide

### 1. Clone and Install

```bash
git clone https://github.com/Kbs-sol/intru-genz.git
cd intru-genz
npm install
```

### 2. Configure Environment Variables

```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your actual keys
```

**Required keys:**
- `RAZORPAY_KEY_ID` — From https://dashboard.razorpay.com/app/keys
- `RAZORPAY_KEY_SECRET` — Same page, keep secret!
- `SUPABASE_URL` — From Supabase project settings
- `SUPABASE_ANON_KEY` — Public anon key
- `SUPABASE_SERVICE_KEY` — Service role key (server-side only)

### 3. Set Up Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the contents of `supabase/schema.sql`

### 4. Local Development

```bash
npm run build
npm run preview  # or: npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

### 5. Deploy to Cloudflare Pages

```bash
npm run deploy:prod
```

### 6. Set Production Secrets

```bash
npx wrangler pages secret put RAZORPAY_KEY_ID --project-name intru-in
npx wrangler pages secret put RAZORPAY_KEY_SECRET --project-name intru-in
npx wrangler pages secret put SUPABASE_URL --project-name intru-in
npx wrangler pages secret put SUPABASE_ANON_KEY --project-name intru-in
npx wrangler pages secret put SUPABASE_SERVICE_KEY --project-name intru-in
npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name intru-in
```

### 7. Set Up Razorpay Webhook (optional but recommended)

1. Go to Razorpay Dashboard -> Webhooks
2. Add webhook URL: `https://intru-in.pages.dev/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Set a webhook secret and add it:
   ```bash
   npx wrangler pages secret put RAZORPAY_WEBHOOK_SECRET --project-name intru-in
   ```

## Admin Panel

- **URL**: `/admin`
- **Password**: `intru2026admin` (override with `ADMIN_PASSWORD` env var)
- **Features**: Order management, product image/price editing, legal page HTML editor

## Store Policies

- **All sales final** — no cash refunds
- **Store Credit only** — 1:1 INR value, never expires
- **36-hour claim window** — for defects/damage only
- **36-hour dispatch** — orders processed within 36 hours
- **Free shipping** — on orders above Rs.1,999
- **Flat Rs.99 shipping** — for orders below Rs.1,999

## Deployment Status

- **Platform**: Cloudflare Pages
- **Status**: Active
- **Last Updated**: 2026-02-26
