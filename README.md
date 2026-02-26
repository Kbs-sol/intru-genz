# INTRU.IN — Premium Indian Streetwear

## Project Overview
- **Name**: intru.in
- **Goal**: Premium, minimalist 6-product e-commerce site with a black-and-white, high-contrast aesthetic
- **Stack**: Hono + TypeScript + Tailwind-inspired inline CSS, deployed on Cloudflare Pages
- **Theme**: Inspired by [Sabina Framer](https://sabina.framer.wiki/) — clean, premium streetwear

## Live URLs
- **Sandbox**: [Dev Preview](https://3000-ioenzsvi35kexko87nhfy-0e616f0a.sandbox.novita.ai)

## Features Implemented

### Pages
- **Homepage** (`/`): Hero section, marquee, brand story, 6-product grid with hover effects, trust badges, testimonial, Instagram grid placeholder, newsletter signup
- **Product Page** (`/product/:slug`): 4-image gallery (desktop: 2x2 grid, mobile: swipe carousel with dots), lightbox zoom, size selector, Add to Bag / Buy Now, store credit tooltip, accordion details, related products
- **Legal Pages** (`/p/:slug`): Dynamic route for Terms, Returns, Privacy, Shipping with navigation tabs
- **Admin Panel** (`/admin`): Password-protected dashboard with Orders, Products, and Legal editor tabs
- **404 Page**: Branded error page

### Cart & Checkout
- Real-time sidebar cart drawer with quantity controls
- Server-side price validation via `/api/checkout`
- Razorpay integration placeholder (ready for production key)
- Free shipping over Rs.1,999, flat Rs.99 otherwise

### Auth
- Google One-Tap Sign-In placeholder (needs real Client ID)
- Magic Link auth endpoint (`/api/auth/magic-link`)

### Legal Policies (Specifically Designed to Protect intru.in)
- **Terms of Service**: All sales final, limited drop model, 36-hour processing, delivery liability disclaimer (carrier responsible post-handoff), store credit only, Bangalore jurisdiction
- **Returns & Refunds**: Store Credit ONLY (no cash refunds), 36-hour claim window, eligible/ineligible claims defined, delivery liability clearly stated
- **Privacy Policy**: Data collection, Razorpay PCI-DSS compliance, cookie policy
- **Shipping Policy**: 36-hour dispatch, delivery estimates, liability disclaimer

### SEO
- Auto-generated alt tags: `intru.in [Product Name] - View [N]`
- Product schema.org markup (JSON-LD)
- ItemList schema on homepage
- Dynamic `<title>` and `<meta description>` per page
- Open Graph and Twitter Card meta tags
- Canonical URLs

### Admin Panel (`/admin`)
- **Password**: `intru2026admin`
- **Orders Tab**: Demo order list with status badges (Pending/Shipped/Delivered)
- **Products Tab**: Edit 4 image URLs, price, compare price, in-stock toggle per product
- **Legal Tab**: WYSIWYG HTML editor with live preview for all legal pages

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/checkout` | Validate cart & create order |
| POST | `/api/auth/google` | Google One-Tap callback |
| POST | `/api/auth/magic-link` | Send magic link email |
| POST | `/api/admin/auth` | Admin authentication |
| POST | `/api/store-credit` | Check store credit balance |

## Data Architecture
- **Products**: 6 items, each with 4 images, sizes, pricing
- **Storage**: Currently in-memory (data.ts). Production: Supabase + Cloudflare R2
- **Store Credit**: Model defined, production uses Supabase `store_credits` table

## Products
| # | Name | Price | Category |
|---|------|-------|----------|
| 1 | Essential Oversized Tee | Rs.1,299 | Tops |
| 2 | Midnight Cargo Joggers | Rs.1,999 | Bottoms |
| 3 | Structured Minimal Hoodie | Rs.2,499 | Tops |
| 4 | Everyday Slim Chinos | Rs.1,799 | Bottoms |
| 5 | Graphic Art Tee Vol. 1 | Rs.1,499 | Tops |
| 6 | Monochrome Zip Jacket | Rs.2,999 | Outerwear |

## Production Next Steps
1. **Supabase**: Set up tables (products, orders, users, store_credits, legal_pages)
2. **Razorpay**: Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as Cloudflare secrets
3. **Google Auth**: Replace `YOUR_GOOGLE_CLIENT_ID` with real OAuth 2.0 client ID
4. **Image Hosting**: Upload product images to Cloudflare R2 or Supabase Storage
5. **Custom Domain**: Point `intru.in` to Cloudflare Pages

## Deployment
- **Platform**: Cloudflare Pages
- **Build**: `npm run build` → outputs to `dist/`
- **Deploy**: `npm run deploy:prod`
- **Last Updated**: 2026-02-26
