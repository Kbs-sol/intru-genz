# Growth & Analytics Guide — intru.in

This document explains everything you (the store owner) need to set up on **your side**
to get products into Google Shopping, plus the code-side changes already shipped for
organic traffic, coupon visibility, dead-click fixes, and Microsoft Clarity smart events.

---

## PART 1 — Google Merchant Center (get products into the Google Shopping tab)

### What the code already does for you ✅
A ready-to-use Google Shopping **product feed** is now live at:

```
https://intru.in/merchant-feed.xml
```

- It is generated automatically from your live Supabase products.
- One entry **per size** (S/M/L/XL/…), grouped so Google shows the product once with
  selectable sizes (`item_group_id`).
- Includes: title, description, product link, images, price, **sale price** (when a
  compare-at price exists), brand (`INTRU`), condition, size, availability (in/out of stock),
  Google product category, and India shipping.
- It refreshes every time Google fetches it — **no manual re-upload needed** when you add
  or edit products.

**You do NOT need to write any code or build a Content API integration for basic Shopping.**
A "Scheduled fetch" of the feed URL above is enough for free Shopping-tab listings and Shopping ads.

---

### Step-by-step: what YOU must create/configure

#### Step 1 — Create a Google Merchant Center account
1. Go to **https://merchants.google.com** and sign in with the Google account you want to own the store.
2. Choose country **India**, currency **INR**, time zone **Asia/Kolkata**.
3. Business name: **INTRU** (or `intru.in`).
4. For "Where do customers check out?" choose **On your website**.

#### Step 2 — Add and verify your website (required)
1. In Merchant Center: **Settings (gear) → Business information → About your business → Website**.
2. Enter `https://intru.in` and click verify. Pick the easiest method:
   - **HTML tag** (recommended): Google gives you a `<meta name="google-site-verification" content="XXXX">` tag.
     - Send that `content` value to your developer, OR paste it in the Admin panel if a field exists.
     - It must appear in the `<head>` of `https://intru.in`. *(Ask dev to add it — 1 line.)*
   - **Google Search Console**: if `intru.in` is already verified in Search Console with the same Google
     account, Merchant Center can auto-verify. This is the fastest path — **do this if you already use Search Console.**
3. Click **Verify** and then **Claim**.

> 💡 If you have **Google Search Console** set up for intru.in already, use that — it verifies instantly and you can skip the meta tag.

#### Step 3 — Set up Shipping & Returns (required for approval)
1. **Settings → Shipping and returns → Add shipping service.**
   - Service area: **India**
   - Rate: Flat **₹99**, or **Free above ₹1999** (this matches the store's real policy).
   - Delivery time: e.g. 3–7 business days.
2. **Settings → Returns policy** — add a basic policy (link to `https://intru.in/p/returns`).
3. **Business info → add your business address** (Hyderabad, Telangana) and a contact email (`shop@intru.in`).

#### Step 4 — Register the product feed (the important part)
1. Go to **Products → Feeds** (in the newer UI: **Products → Add products → Add products from a file / Scheduled fetch**).
2. Choose **Scheduled fetch** (NOT upload).
3. Fill in:
   - **Feed name:** `Intru Main Feed`
   - **Country of sale:** India
   - **Language:** English
   - **File URL:** `https://intru.in/merchant-feed.xml`
   - **Fetch frequency:** Daily (pick a time, e.g. 6:00 AM).
4. Save and click **Fetch now**. Within a few minutes you'll see products imported.

#### Step 5 — Fix any product disapprovals
Google will review products (can take 3–5 days first time). Common fixes:
- **Missing GTIN/brand:** Our feed already sends `brand = INTRU` and `identifier_exists = no`
  (correct for a brand with no barcodes). No action needed.
- **Price mismatch:** Feed price must equal the site price. Since the feed reads from the same
  DB the site uses, they always match. If flagged, just re-fetch.
- **Image quality:** Use clean product images (already the case).
- **Policy pages:** Make sure `/p/returns`, `/p/shipping`, `/p/terms` exist (they do).

#### Step 6 — Turn on FREE listings + (optional) Shopping ads
1. **Growth → Manage programs → "Free listings"** → make sure it's **active**. This puts products
   in the **free Google Shopping tab** at no cost.
2. (Optional, paid) To run **Shopping ads / Performance Max**, link a **Google Ads** account:
   **Settings → Linked accounts → Google Ads → Link.** Then create a "Shopping" or "Performance Max"
   campaign in Google Ads using the feed. Start small (₹200–500/day) and let it optimise.

---

### Do you need the "Google Merchant API" / Content API?
- **For getting products in Shopping: NO.** The scheduled feed fetch above is sufficient and is the
  recommended approach for a catalog this size.
- **The Content API for Shopping** is only useful later if you want **real-time** stock/price pushes
  (e.g. update inventory the instant something sells out) instead of a daily fetch. It requires:
  1. A **Google Cloud project** + enabling the *Content API for Shopping*.
  2. A **service account** JSON key, added as a Merchant Center API user.
  3. Server code to POST product updates.
  This is optional and can be added later; the current daily feed already keeps Shopping in sync.

---

## PART 2 — Additional FREE / high-ROI organic traffic sources

Beyond Google Merchant, these are the best free channels for a streetwear brand whose traffic is
~70% Instagram in-app:

1. **Google Search Console** (do this first if not done) — submit `https://intru.in/sitemap.xml`
   and `https://intru.in/sitemap-images.xml`. Free organic search + Google Images traffic. Fixes
   indexing issues.
2. **Bing Webmaster Tools** — import from Search Console in 1 click. Bing/Edge + powers ChatGPT/Copilot search.
3. **Google Business Profile** — free local listing for "Hyderabad streetwear", appears in Maps + Search.
4. **Instagram → link-in-bio + Stories link stickers** — your #1 channel. Add product links directly.
   Use Instagram Shopping (tag products in posts) — it can also read the same Merchant feed.
5. **Pinterest (organic, not the removed embed)** — streetwear/outfit boards drive long-tail traffic.
   *(You asked to remove the dead Pinterest embed; a real Pinterest **business** account with pins is
   still worth it later — but that's a content effort, not a code embed.)*
6. **WhatsApp sharing** — already added a copy-link + WhatsApp share on product pages (your audience shares in DMs).
7. **YouTube Shorts / Instagram Reels** — drop teasers, "fit checks". Free reach, links in description.
8. **Reddit** (r/streetwear, r/IndianFashionAddicts), **Threads**, and niche Discord servers — organic community reach.
9. **Google Rich Results** — the site already emits Product, FAQ, and Organization structured data,
   which earns rich snippets (price, rating, stock) in search for free.
10. **AI search (GEO)** — `/llms.txt` + structured data are already in place so ChatGPT/Perplexity/Gemini
    can recommend intru.in. This is a growing free channel.

**Quick wins ranked:** (1) Search Console + sitemap submit → (2) Merchant free listings →
(3) Instagram Shopping tagging → (4) Google Business Profile.

---

## PART 3 — Microsoft Clarity smart events (now connected)

The `window.track()` helper fires GA4 + Clarity + an internal beacon together. Clarity event names are
case-sensitive; the helper maps them to your dashboard names automatically.

| Funnel step   | Fires event (GA4 / Clarity)        | Where |
|---------------|------------------------------------|-------|
| View product  | `view_item`                        | product page |
| Add to cart   | `add_to_cart`                      | add-to-bag |
| Begin checkout| `begin_checkout`                   | checkout start |
| Purchase      | `purchase` / **`Purchase`**        | order success |
| Login         | `Login` (email + Google)           | identify / Google auth |
| Contact us    | `Contact us`                       | mailto/WhatsApp/tel clicks |
| Scroll depth  | `scroll_depth`                     | 25/50/75/100% |
| Engaged       | `engaged_session`                  | 30s + scrolled |
| Exit intent   | `exit_intent_shown`                | exit-intent popup |
| Promo shown   | `promo_shown`                      | coupon bar render |
| Anchor scroll | `anchor_scroll`                    | in-page nav |
| Share         | `share`                            | copy-link button |

**Your action in Clarity dashboard:** these now fire automatically. In Clarity → Settings → Smart events,
make sure the events named exactly `Purchase`, `Login`, `Contact us`, `add_to_cart`, `begin_checkout`,
`view_item`, `scroll_depth`, `engaged_session`, `exit_intent_shown` are enabled/"connected". Because the code
now sends those exact names, Clarity will start recording them on the next sessions after deploy.

---

## PART 4 — What changed in the code (this release)

1. **Dead-click fix (root cause):** In the Instagram in-app browser the big bottom script could load late or
   throw during init, leaving `onclick` handlers (menu, cart, login) undefined — the user tapped (visible in
   recordings) but nothing happened → logged as a "dead click". Added an **early nav bootstrap script** right
   after the header that guarantees `toggleMobNav`, `toggleCart`, `openIdentifyOrOrders` exist immediately, plus a
   capture-phase delegated fallback. Init calls are now individually `try/catch`-guarded so one failure can't
   cascade.
2. **Checkout gate unblocked (prior release):** pincode lookup no longer blocks the "Place Order" button.
3. **Faster LCP (prior release):** Razorpay SDK lazy-loaded instead of render-blocking.
4. **Coupon visibility:** The top promo bar and a new in-cart promo banner now show the **real offer**
   ("FINAL CLEARANCE — Any 3 products for Rs.1499") instead of the ambiguous "Rs.1499 OFF", with an
   "Add N more to unlock this deal" nudge in the bag. Brighter, pulsing badge.
5. **Removed Twitter/X + Pinterest** footer icons, the product-page X share button (replaced with copy-link),
   and their references in structured data / meta.
6. **Google Merchant feed** at `/merchant-feed.xml` + referenced in `robots.txt`.
7. **Smart events** wired for `Login`, `Contact us`, `Purchase`, `share`, `promo_shown` (others already existed).
