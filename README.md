# intru.in — Premium Minimalist E-Commerce Store

## Project Overview
- **Name**: intru.in
- **Goal**: Premium, minimalist e-commerce store for a streetwear brand with high-conversion design
- **Stack**: Hono + Cloudflare Pages + D1 Database + Tailwind-inspired CSS
- **Theme**: Black & White, high-contrast, Sabina/minimalist streetwear aesthetic

## Live URLs
- **Sandbox Preview**: (active during development)
- **Production**: https://intru-in.pages.dev (after Cloudflare deployment)
- **Admin Panel**: /admin (password: `intru2024admin`)

## Completed Features

### Landing Page
- Full-screen hero with elegant typography (Playfair Display + Inter)
- Animated marquee strip with brand values
- Brand story section with imagery
- 6-product grid with hover image swap & discount badges
- Testimonial section (dark theme)
- Newsletter signup form
- Trust signals (Free Shipping, Easy Returns, Secure Payments, Organic Cotton)
- Instagram feed placeholder
- Full footer with legal links and payment icons

### Product Detail Pages (`/product/:slug`)
- **Desktop**: Thumbnail column + main image gallery with click-to-zoom
- **Mobile**: Horizontal swipe carousel with pagination dots
- Full product description, pricing with discount display
- Quantity selector
- Add-to-bag with price display
- Product details & shipping accordion
- Schema.org Product JSON-LD for SEO

### Cart System
- Sidebar drawer with real-time updates
- Quantity adjustment (+/- buttons)
- Remove items
- Subtotal, shipping calculation (free above ₹1,999)
- Keyboard shortcut (Escape to close)

### Checkout (`/checkout`)
- Full checkout form (name, email, phone, address, notes)
- Order summary with item breakdown
- Server-side price verification via `/api/checkout`
- Razorpay integration ready (auto-detects if Razorpay key is configured)
- Fallback to COD/direct order flow

### Order Confirmation (`/order/:orderId`)
- Order success page with checkmark
- Progress tracker (Received → Confirmed → Shipped → Delivered)
- Ordered items list with images
- Order summary card

### Legal Pages (`/legal/:slug`)
- Dynamic routing for all legal pages
- Sidebar navigation between policies
- Seeded pages: Terms & Conditions, Privacy Policy, Refund Policy, Shipping Policy
- New pages can be added via admin panel

### Admin Panel (`/admin`)
- Password-protected login
- **Orders Manager**: View all orders, customer details, update status (received/confirmed/shipped/delivered/cancelled)
- **Products Manager**: Edit name, price, compare price, description, stock status, and all 4 image URLs
- **Legal Pages Manager**: Edit existing pages, create new pages, delete pages
- **Settings**: Admin password, Razorpay keys, brand name/tagline, shipping thresholds, contact info

### SEO
- Dynamic meta titles and descriptions for every page
- Schema.org Organization JSON-LD on homepage
- Schema.org Product JSON-LD on product pages
- Automatic image alt tags (`intru.in [Product Name] - View N`)
- OpenGraph and Twitter Card meta tags
- Semantic HTML structure

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | All in-stock products |
| GET | `/api/products/:slug` | Single product by slug |
| POST | `/api/checkout` | Create order with price verification |
| POST | `/api/payment/verify` | Verify Razorpay payment |
| GET | `/api/legal` | List all active legal pages |
| GET | `/api/legal/:slug` | Single legal page content |
| GET | `/api/settings` | Public settings (brand, shipping) |
| POST | `/api/admin/login` | Admin authentication |
| GET | `/api/admin/orders` | All orders (auth required) |
| PUT | `/api/admin/orders/:id` | Update order status |
| GET | `/api/admin/products` | All products (auth required) |
| PUT | `/api/admin/products/:id` | Update product |
| GET | `/api/admin/legal` | All legal pages (auth required) |
| POST | `/api/admin/legal` | Create legal page |
| PUT | `/api/admin/legal/:id` | Update legal page |
| DELETE | `/api/admin/legal/:id` | Delete legal page |
| GET | `/api/admin/settings` | All settings (auth required) |
| PUT | `/api/admin/settings` | Update settings |

## Data Architecture
- **Database**: Cloudflare D1 (SQLite)
- **Tables**: `products`, `orders`, `legal_pages`, `settings`
- **Images**: Stored as JSON array of URLs in `products.images` field (4 URLs per product)
- **Local Dev**: Uses `--local` flag for automatic local SQLite

## User Guide

### Shopping
1. Browse products on the homepage
2. Click a product to see all 4 images and full details
3. Add items to your bag
4. Open the cart drawer and proceed to checkout
5. Fill in shipping details and place order

### Admin
1. Go to `/admin` and enter password `intru2024admin`
2. **Orders**: View/manage all customer orders
3. **Products**: Update images (paste URLs, one per line), prices, descriptions
4. **Legal**: Edit existing policies or add new pages
5. **Settings**: Configure Razorpay keys, shipping thresholds, etc.

## Deployment
- **Platform**: Cloudflare Pages
- **Tech Stack**: Hono 4.x + TypeScript + D1 Database
- **Build**: `npm run build` → Vite SSR bundle → `dist/`
- **Database**: D1 with migration files in `migrations/`
- **Status**: ✅ Active (local development)
- **Last Updated**: February 2026

## Next Steps
1. Configure Razorpay API keys in admin settings for live payments
2. Replace placeholder Unsplash images with actual product photos
3. Set up Supabase Auth for Google One-Tap and Magic Link login
4. Deploy to Cloudflare Pages with production D1 database
5. Connect custom domain (intru.in)
6. Set up Instagram feed API integration
7. Add product size/variant selector if needed
