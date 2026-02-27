# intru.in — Premium Indian Streetwear

> Limited Drops. No Restocks. Store Credit Only.

## Live URLs

| Environment | URL |
|---|---|
| **Production** | https://intru-in.pages.dev |
| **GitHub** | https://github.com/Kbs-sol/intru-genz |
| **Debug DB** | https://intru-in.pages.dev/api/debug-db |
| **Admin** | https://intru-in.pages.dev/admin |

## Architecture

```
Browser → Cloudflare Pages (Edge)
             ↓
        Hono Framework (src/index.tsx)
             ↓
    ┌────────┴────────┐
    │                 │
 Supabase          Razorpay
 (Products,        (Order creation,
  Orders,           Payment verify,
  Legal,            Webhook handler)
  Users,
  Store Credits)
```

### Data Flow (v2 — Supabase-first)

Every page and API route fetches data from **Supabase in real-time**:

1. **Page routes** (`/`, `/product/:slug`, `/p/:slug`, `/admin`) — `async` handlers that call `fetchProducts()` and `fetchLegalPages()` from Supabase before rendering
2. **Cart engine** — `shell.ts` receives `products[]` parameter (no more hardcoded `PRODUCTS` import)
3. **Checkout** — `/api/checkout` validates prices by fetching each product from Supabase DB
4. **Auto-seed** — if Supabase products table is empty, `SEED_PRODUCTS` from `data.ts` are auto-inserted
5. **Fallback** — if Supabase is not configured, static `SEED_PRODUCTS` are used (no crash)

### Files Changed (v2)

| File | Change |
|---|---|
| `src/data.ts` | Removed `PRODUCTS`/`LEGAL_PAGES` exports. Added `SEED_PRODUCTS`, `SEED_LEGAL_PAGES`, `fetchProducts()`, `fetchProductBySlug()`, `fetchProductById()`, `fetchLegalPages()` with auto-seed |
| `src/index.tsx` | All page routes now `async`. Checkout validates from DB. Added `/api/debug-db`, `/api/admin/legal/:slug` |
| `src/components/shell.ts` | Accepts `products[]` and `legalPages[]` params instead of importing `PRODUCTS` |
| `src/pages/home.ts` | Accepts `{ products, legalPages }` — renders from dynamic data |
| `src/pages/product.ts` | Accepts `{ products, legalPages }` — related items from DB |
| `src/pages/legal.ts` | Accepts `{ products, legalPages }` — nav links from DB |
| `src/pages/admin.ts` | Live CRUD: orders from API, products save via PATCH, legal save via PATCH |
| `supabase/schema.sql` | Fixed RLS (`true` for anon SELECT), added orders INSERT policy, `ON CONFLICT DO UPDATE` seed |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Service health + connection status |
| GET | `/api/debug-db` | **Hidden** — DB connection test, product count, env status |
| GET | `/api/products` | All products (source: supabase/seed/static) |
| GET | `/api/products/:id` | Single product by ID |
| POST | `/api/checkout` | Cart → server-validated → Razorpay order |
| POST | `/api/payment/verify` | HMAC-SHA256 signature verification |
| POST | `/api/webhooks/razorpay` | Server-to-server webhook handler |
| POST | `/api/auth/google` | Google One-Tap JWT decode + Supabase upsert |
| POST | `/api/auth/magic-link` | Supabase magic link |
| POST | `/api/admin/auth` | Admin password check |
| GET | `/api/admin/orders` | Latest 50 orders from Supabase |
| PATCH | `/api/admin/orders/:id` | Update order status |
| PATCH | `/api/admin/products/:id` | Update product (name, price, images, stock) |
| PATCH | `/api/admin/legal/:slug` | Update legal page content |
| POST | `/api/store-credit` | Check store credit balance |

## Products (p1-p6)

| ID | Name | Price | Compare | Sizes | Category |
|---|---|---|---|---|---|
| p1 | Essential Oversized Tee | Rs.1,299 | Rs.1,799 | S,M,L,XL,XXL | Tops |
| p2 | Midnight Cargo Joggers | Rs.1,999 | Rs.2,499 | S,M,L,XL,XXL | Bottoms |
| p3 | Structured Minimal Hoodie | Rs.2,499 | Rs.3,199 | S,M,L,XL | Tops |
| p4 | Everyday Slim Chinos | Rs.1,799 | — | 28,30,32,34,36 | Bottoms |
| p5 | Graphic Art Tee Vol. 1 | Rs.1,499 | — | S,M,L,XL,XXL | Tops |
| p6 | Monochrome Zip Jacket | Rs.2,999 | Rs.3,999 | S,M,L,XL | Outerwear |

## Setup

### 1. Supabase
1. Create a Supabase project
2. Run `supabase/schema.sql` in SQL Editor
3. Set secrets:
```bash
npx wrangler pages secret put SUPABASE_URL --project-name intru-in
npx wrangler pages secret put SUPABASE_ANON_KEY --project-name intru-in
npx wrangler pages secret put SUPABASE_SERVICE_KEY --project-name intru-in
```

### 2. Razorpay
1. Get keys from https://dashboard.razorpay.com/app/keys
2. Set secrets:
```bash
npx wrangler pages secret put RAZORPAY_KEY_ID --project-name intru-in
npx wrangler pages secret put RAZORPAY_KEY_SECRET --project-name intru-in
```

### 3. Deploy
```bash
npm run build && npx wrangler pages deploy dist --project-name intru-in
```

### 4. Update product images
Run the updated `supabase/schema.sql` in SQL Editor — it uses `ON CONFLICT DO UPDATE` to replace Unsplash URLs with intru.in CDN URLs.

## Tech Stack
- **Runtime**: Cloudflare Pages (Edge)
- **Framework**: Hono
- **Database**: Supabase (PostgreSQL + REST API)
- **Payments**: Razorpay
- **Auth**: Google One-Tap + Magic Link
- **Build**: Vite
- **Styling**: Custom CSS (B&W streetwear aesthetic)
