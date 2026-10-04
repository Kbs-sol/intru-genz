# INTRU.IN Audit — Implementation & Handover Report
**Date:** October 3, 2026
**Target Audience:** Audit Manager & Founder

This document outlines the technical resolutions applied to the INTRU Growth, Conversion & Technical Audit. It is divided into two sections: **Codebase Fixes Applied** (what was fixed in the codebase) and **Founder Action Items** (what the founder needs to do manually).

---

## Part 1: Codebase Fixes Applied (Engineering)

The following defects were resolved directly in the `kbs-sol/intru-genz` repository and are ready for deployment.

### 🔴 P0 (Critical) Fixes

*   **Defect 01 — 28,609 search impressions returning 404:** 
    *   **Fix:** Added a `LEGACY_REDIRECTS` map in `src/index.tsx`. Explicitly mapped 15 known Shopify legacy paths (e.g., `/products/sjirt` -> `/product/summer-shirt`) with 301 redirects. Added wildcard catch-alls: `/pages/*` 301s to `/collections`, and `/products/*` fuzzy-matches to `/search?q=<slug>`.
*   **Defect 02 — Dark mode invisible text:** 
    *   **Fix:** Changed `<meta name="color-scheme">` to `content="light only"` and added `:root { color-scheme: light only; }` in `src/components/shell.ts`. This instantly stops mobile browsers from auto-inverting backgrounds to black while keeping text black.
*   **Defect 03, 23, 24 — 85% cart→checkout abandonment (Cart UX):** 
    *   **Fix:** Removed the unhelpful "Shipping: Calculated" text in the cart footer. Replaced it with a transparent shipping info bar (`FREE (Prepaid) / + ₹99 (COD)`). Added a highly visible green badge stating: *"Cash on Delivery available — no card needed"* right inside the bag.
*   **Defect 04 — Admin tables never collapse on mobile (A-1):** 
    *   **Fix:** Added the missing `attr(data-label)` CSS logic in `src/pages/admin.ts`. The tables now properly collapse into stacked, readable cards on mobile devices (e.g., 390px iPhones) instead of forcing a 2.5x horizontal scroll. Also converted stat grids and image grids to mobile-friendly column layouts.
*   **Defect 05, 09 — LCP 4.07s & CLS 0.195:** 
    *   **Fix:** Added `fetchpriority="high" loading="eager"` to the first hero product image to optimize LCP. Added hardcoded `width="400" height="500"` to all hero cards in `src/pages/home.ts` to reserve space and eliminate Layout Shift (CLS).
*   **Defect 06 — Soft-404 meta-refresh (S-2):** 
    *   **Fix:** Replaced the `<meta http-equiv="refresh" content="0;url=/">` behavior on unknown `/product/:slug` and `/p/:slug` routes. They now return a proper HTTP 404 status alongside a branded, helpful "Drop Not Found" HTML page with a search button to preserve link equity and stop quick-backs.
*   **Defect 07 — Duplicate GA4 event names (M-1):** 
    *   **Fix:** Removed the double-firing alias logic in the Microsoft Clarity handler within `shell.ts`. Standardized hardcoded `window.track()` events from Title Case (`Contact us`, `Login`) to GA4-compliant snake_case (`contact`, `login`).
*   **Security (Not explicitly numbered but critical):**
    *   **Admin server-side gate:** `GET /admin` now strictly enforces an `httpOnly` session cookie instead of relying on client-side JS.
    *   **Google JWT Validation:** `POST /api/auth/google` now cryptographically verifies tokens against Google's `tokeninfo` API to prevent token forgery.
    *   **COD HMAC Verification:** `/verify-order` links now require a time-windowed HMAC-SHA256 signature to prevent order-confirmation spoofing.
    *   **DB Bug:** Fixed the `verify-order` route attempting to update order status to `'verified'` (which violated DB constraints); it now correctly updates to `'placed'`.

### 🟠 P1 & P2 Fixes

*   **Defect 12 — Promo bar eating above-fold space:** 
    *   **Fix:** Completely removed the `#comboPromoBar` HTML from the shell. The 67:1 shown-to-clicked ratio proved it was visual clutter, pushing the actual products down the mobile viewport.
*   **Defect 13 — Sandbox dev sessions in analytics (M-2):** 
    *   **Fix:** Added a strict hostname check in `getPageOpts()` (`src/index.tsx`). GA4, Clarity, Meta Pixel, and GTM IDs are now purged/disabled if the `host` header is not exactly `intru.in` or `www.intru.in`. This permanently stops local and sandbox traffic from polluting production metrics.
*   **Defect 14 — Admin pages tracked as customer traffic (A-3, A-4):** 
    *   **Fix:** Analytics tags are skipped entirely if the path starts with `/admin`. Additionally, a `<meta name="robots" content="noindex,nofollow">` was added to the admin HTML head.
*   **Defect 18 & 19 — Dead Clicks (Sold-out styling & Lightbox):** 
    *   **Fix:** Created a global image lightbox (DOM, CSS, JS) in `shell.ts` with escape/arrow key bindings. Added `.sz-btn.sz-sold` CSS for standardizing strikethroughs on sold-out inventory.
*   **Defect 22 — Exit-intent popup friction:** 
    *   **Fix:** Hardcoded `EXIT_ON = false` in `shell.ts`. The popup was firing for 7% of sessions but only converting at 1%, adding frustration to users already trying to leave.
*   **Defect 28 — 180+ brand misspellings (S-4):** 
    *   **Fix:** Added `alternateName: ["INTRU", "Intru Clothing", "intru.in", "Intruu", ...]` to the `Organization` JSON-LD schema in `home.ts`. This helps Google route typos directly to the brand.
*   **Defect 32 & 33 — SEO metadata cleanup (S-5, S-6):** 
    *   **Fix:** Removed the fake/placeholder Bing verification token and the 300+ character keyword-stuffing `<meta name="keywords">` tag, both of which flag as low-quality to search algorithms.

---

## Part 2: Founder Action Items (To-Do List)

These items require manual operational actions outside of the codebase. Please complete these to realize the full value of the audit.

### 🟥 High Priority (Do this week)
1.  **Email 10 Past Customers for Reviews (Defect 08):**
    *   You have 10 purchases but 0 reviews on the site. Send a personal email to these buyers asking for a photo review. Offer a small store credit (using your existing `/api/store-credit` endpoint). This is the single highest-leverage conversion task.
2.  **Set the Admin Password Environment Variable:**
    *   Go to your Cloudflare Pages dashboard -> Settings -> Environment Variables.
    *   Add `ADMIN_PASSWORD` and set it to a secure string. If you don't do this, the system will fall back to the public repository default (`intru2026admin`), which is insecure.
3.  **Update Instagram Bio Link with UTMs (Defect 15 & 21):**
    *   Change your IG bio link so you can track sales. Point it directly to a collection, not the homepage.
    *   **Use this format:** `https://intru.in/collections?utm_source=instagram&utm_medium=bio`
4.  **Register Bing Webmaster Tools (Defect 32):**
    *   Go to bing.com/webmasters, verify your domain, get your real verification token, and we can add it to the codebase later. This is crucial as Bing powers ChatGPT search indexing.

### 🟧 Medium Priority
5.  **301 Redirect `www` to Apex Domain (Defect 16):**
    *   Log into Cloudflare dashboard -> Rules -> Page Rules.
    *   Create a rule to 301 redirect `www.intru.in/*` to `https://intru.in/$1`. This stops your SEO authority from splitting across two domains.
6.  **Fix the Blog CTR & Content (Defect 25, 26, 27):**
    *   Log into your admin dashboard.
    *   Change the SEO Title and Description for `/blog/style-crop-top-outfit-ideas` to something more clickable.
    *   Start expanding your blog posts to ~2,000 words based on the 90-day plan in the audit to capture non-brand search traffic.
7.  **Submit URL Removal in Google Search Console (Defect 34):**
    *   In GSC, request removal of any old Shopify `cdn/shop/files/...` URLs that are still lingering in the index.

---

## Part 3: Deferred Technical Debt (Future Sprints)
*To be tackled in future technical sprints as they require architectural refactoring:*
*   **Defect 10:** Extracting the 112 KB of inline JavaScript out of the HTML into a cached `/static/app.js` file (Week 3 of audit plan).
*   **Defect 11:** Deferring GTM / Meta Pixel payload execution to reduce INP (Interaction to Next Paint).
*   **Defect 30:** Building an automated User-Generated Content (UGC) photo pipeline for the site.
