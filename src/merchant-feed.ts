// =============================================================
// intru.in — Google Merchant Center feed builders (pure functions)
//   /merchant-feed.xml        → product feed   (buildProductFeed)
//   /merchant-promotions.xml  → promotions feed (buildPromotionsFeed)
//
// Kept free of Hono / Supabase imports so it can be unit-tested in Node.
// Goal of this file: maximise FREE ORGANIC listing quality (Google Search,
// Shopping tab, Images). Paid + local surfaces are excluded on purpose.
// =============================================================

export interface FeedProduct {
  id: string; slug: string; name: string; tagline?: string; description?: string;
  price: number; comparePrice?: number; images?: string[]; sizes?: string[];
  category?: string; inStock: boolean;
  sizeStock?: Record<string, number>; stockCount?: Record<string, number>;
}

export interface FeedPromo {
  promotionId: string;
  longTitle: string;           // <= 60 chars (Google limit)
  couponValueType: 'no_structured_data';
  buyQuantity: number;         // buy_this_quantity
  promotionPrice: number;      // promotion_price (fixed price for the bundle), INR
  finePrint: string;
}

// ---------------------------------------------------------------
// Per-product apparel attributes.
// Google needs real colour / gender / material for the apparel filters, and
// the product DB has no such columns, so they live here (keyed by product id).
// ONLY claims that the site already makes publicly are used (see README v24).
// Unknown / new products fall back to CATEGORY_DEFAULTS and are never given
// a colour, GSM or gender that we cannot verify.
// ---------------------------------------------------------------
interface ProductAttrs {
  titleName: string;     // design name used in the title
  typeLabel: string;     // [Product Type]
  feature: string;       // [Key Feature / GSM]
  color: string;         // Google colour (use "A/B" for two colours)
  gender: 'male' | 'female' | 'unisex';
  material: string;
  pattern?: string;
  lead: string;          // first sentence of description (<=150 chars, SEO keywords)
}

const TEE_LEAD = 'Minimalist oversized tee in durable 240 GSM heavyweight cotton. Dropped shoulders, pre-shrunk, garment-dyed. Made in India by INTRU.';

export const PRODUCT_ATTRS: Record<string, ProductAttrs> = {
  p1: { titleName: 'Doodles', typeLabel: 'Heavyweight Oversized T-Shirt', feature: '240 GSM', color: 'White', gender: 'unisex', material: '100% Cotton', lead: TEE_LEAD },
  p2: { titleName: 'No Risk No Porsche', typeLabel: 'Heavyweight Oversized T-Shirt', feature: '240 GSM', color: 'Black', gender: 'unisex', material: '100% Cotton', lead: TEE_LEAD },
  p3: { titleName: 'Orange Puff', typeLabel: 'Heavyweight Oversized T-Shirt', feature: '240 GSM', color: 'White', gender: 'unisex', material: '100% Cotton', lead: TEE_LEAD },
  p4: { titleName: 'Romanticise', typeLabel: 'Oversized Crop Top', feature: 'Soft Cotton', color: 'White', gender: 'female', material: '100% Cotton',
        lead: 'Minimalist cropped tee in durable, soft heavyweight cotton. Clean cut, relaxed oversized fit, pre-shrunk. Made in India by INTRU.' },
  p5: { titleName: 'Stripe 18', typeLabel: 'Oversized Striped Shirt', feature: 'Relaxed Fit', color: 'Light Blue/White', gender: 'unisex', material: 'Cotton', pattern: 'Striped',
        lead: 'Minimalist striped shirt in durable woven fabric. Structured collar, mother-of-pearl buttons, relaxed oversized body. Made in India by INTRU.' },
  p6: { titleName: 'Summer', typeLabel: 'Oversized Shirt', feature: 'Lightweight Breathable', color: 'Yellow', gender: 'unisex', material: 'Cotton',
        lead: 'Minimalist, lightweight and breathable summer shirt in a durable relaxed oversized cut. Made in India by INTRU.' },
};

const CATEGORY_DEFAULTS: Record<string, { typeLabel: string; material: string; lead: string; gender: 'unisex' | 'female' }> = {
  't-shirts':  { typeLabel: 'Oversized T-Shirt', material: '100% Cotton', gender: 'unisex', lead: 'Minimalist oversized tee in durable heavyweight cotton. Dropped shoulders, pre-shrunk. Made in India by INTRU.' },
  'crop tops': { typeLabel: 'Oversized Crop Top', material: '100% Cotton', gender: 'female', lead: 'Minimalist cropped tee in durable heavyweight cotton. Relaxed oversized fit, pre-shrunk. Made in India by INTRU.' },
  'shirts':    { typeLabel: 'Oversized Shirt', material: 'Cotton', gender: 'unisex', lead: 'Minimalist oversized shirt in durable fabric with a relaxed fit. Made in India by INTRU.' },
};

// Internal site breadcrumb → <g:product_type>
const PRODUCT_TYPE_BY_CATEGORY: Record<string, string> = {
  't-shirts': 'Clothing > Oversized T-shirts',
  'crop tops': 'Clothing > Crop Tops',
  'shirts': 'Clothing > Shirts',
};

const BRAND = 'INTRU';          // <g:brand>
const BRAND_TITLE = 'Intru';    // used inside titles
const GOOGLE_CATEGORY_ID = '212'; // Apparel & Accessories > Clothing > Shirts & Tops
const GENDER_LABEL = { male: 'Men', female: 'Women', unisex: 'Unisex' } as const;

export function xmlEscape(s: unknown): string {
  return String(s == null ? '' : s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')   // illegal XML chars
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function stripHtml(s: string): string {
  return String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function attrsFor(p: FeedProduct): ProductAttrs & { colorKnown: boolean } {
  const known = PRODUCT_ATTRS[p.id];
  if (known) return { ...known, colorKnown: true };
  const cat = (p.category || '').toLowerCase();
  const d = CATEGORY_DEFAULTS[cat] || CATEGORY_DEFAULTS['t-shirts'];
  return {
    titleName: p.name, typeLabel: d.typeLabel, feature: 'Heavyweight Cotton',
    color: 'Multicolor', colorKnown: false, gender: d.gender, material: d.material, lead: d.lead,
  };
}

function titleCaseSize(size: string): string {
  return size.toUpperCase() === 'ONE SIZE' ? 'One Size' : size.toUpperCase();
}

/** [Brand] [Gender] [Design] [Product Type] [Key Feature/GSM] [Color] [Size] — max 150 chars. */
export function buildTitle(p: FeedProduct, size: string): string {
  const a = attrsFor(p);
  const parts = [BRAND_TITLE, GENDER_LABEL[a.gender], a.titleName, a.typeLabel, a.feature,
    a.colorKnown ? a.color.replace('/', ' / ') : '', titleCaseSize(size)];
  const t = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  return t.length <= 150 ? t : t.slice(0, 150).trim();
}

/** Keyword-rich lead (<=150 chars) + the product's own copy. Capped at Google's 5000 chars. */
export function buildDescription(p: FeedProduct): string {
  const a = attrsFor(p);
  const own = stripHtml(p.description || p.tagline || '');
  const full = own ? `${a.lead} ${own}` : a.lead;
  return full.length <= 5000 ? full : full.slice(0, 4997) + '...';
}

function dedupeImages(p: FeedProduct): { main: string; extra: string[] } {
  const all = (p.images || []).filter(Boolean);
  const main = all[0] || '';
  const seen = new Set<string>([main]);
  const extra: string[] = [];
  for (const u of all.slice(1)) {
    if (seen.has(u)) continue;      // e.g. Summer Shirt lists the same photo twice
    seen.add(u);
    extra.push(u);
    if (extra.length === 10) break; // Google max 10 additional images
  }
  return { main, extra };
}

// ---------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------
const inr = (n: number) => `${Number(n).toFixed(2)} INR`;
const rupees = (n: number) => `\u20B9${Math.round(n).toLocaleString('en-IN')}`;

/**
 * Clearance bundle = ANY 3 units for a fixed Rs.1499 (see calculateBundleTotals in data.ts).
 * Google has no dedicated "bundle price" coupon_value_type; the documented way is
 * coupon_value_type=no_structured_data + buy_this_quantity + promotion_price.
 * The numbers are passed in (from BUNDLE_SIZE / BUNDLE_PRICE) so feed and checkout cannot drift.
 */
export function bundlePromo(size: number, price: number): FeedPromo[] {
  if (!(size >= 2) || !(price > 0)) return [];
  return [{
    promotionId: 'INTRUCLEARANCE' + size + 'FOR' + Math.round(price),
    longTitle: `Clearance: any ${size} for ${rupees(price)}`.slice(0, 60),
    couponValueType: 'no_structured_data',
    buyQuantity: size,
    promotionPrice: price,
    finePrint: `Any ${size} items (any products, sizes or quantities) for a total of ${rupees(price)}. Applied automatically at checkout, no code needed. Extra items beyond each group of ${size} are charged at regular price. Cannot be combined with coupon codes. Prepaid and COD orders. Limited drops, never restocked.`,
  }];
}

/** Stable window in IST: 1st of this month → last day of NEXT month (<= 92 days, Google max 183). */
export function promoWindow(now: Date = new Date()): string {
  const IST_MS = 5.5 * 3600 * 1000;
  const n = new Date(now.getTime() + IST_MS);
  const y = n.getUTCFullYear(), m = n.getUTCMonth();
  const pad = (x: number) => String(x).padStart(2, '0');
  const endRef = new Date(Date.UTC(y, m + 2, 0));          // last day of month m+1
  const start = `${y}-${pad(m + 1)}-01T00:00:00+05:30`;
  const end = `${endRef.getUTCFullYear()}-${pad(endRef.getUTCMonth() + 1)}-${pad(endRef.getUTCDate())}T23:59:59+05:30`;
  return `${start}/${end}`;
}

export function buildPromotionsFeed(promos: FeedPromo[], now: Date = new Date()): string {
  const window = promoWindow(now);
  const items = promos.map(p => `    <item>
      <g:promotion_id>${xmlEscape(p.promotionId)}</g:promotion_id>
      <g:product_applicability>all_products</g:product_applicability>
      <g:offer_type>no_code</g:offer_type>
      <g:long_title>${xmlEscape(p.longTitle)}</g:long_title>
      <g:promotion_effective_dates>${window}</g:promotion_effective_dates>
      <g:redemption_channel>online</g:redemption_channel>
      <g:promotion_destination>Free_listings</g:promotion_destination>
      <g:promotion_url>https://intru.in/collections</g:promotion_url>
      <g:coupon_value_type>${p.couponValueType}</g:coupon_value_type>
      <g:buy_this_quantity>${p.buyQuantity}</g:buy_this_quantity>
      <g:promotion_price>${inr(p.promotionPrice)}</g:promotion_price>
      <g:fine_print>${xmlEscape(p.finePrint)}</g:fine_print>
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>INTRU.IN promotions</title>
    <link>https://intru.in</link>
    <description>Active promotions on intru.in</description>
${items}
  </channel>
</rss>`;
}

// ---------------------------------------------------------------
// Product feed
// ---------------------------------------------------------------
export function buildProductFeed(
  products: FeedProduct[],
  opts: { promos: FeedPromo[]; channelDescription: string; now?: Date },
): string {
  const now = (opts.now || new Date()).toUTCString();
  const promoTags = opts.promos.slice(0, 10).map(p => `\n      <g:promotion_id>${xmlEscape(p.promotionId)}</g:promotion_id>`).join('');
  const items: string[] = [];

  for (const p of products) {
    const a = attrsFor(p);
    const link = `https://intru.in/product/${p.slug}`;
    const { main, extra } = dedupeImages(p);
    const description = buildDescription(p);
    const hasSale = !!(p.comparePrice && p.comparePrice > p.price);
    const listPrice = hasSale ? Math.round(p.comparePrice as number) : Math.round(p.price);
    const catKey = (p.category || '').toLowerCase();
    const productType = PRODUCT_TYPE_BY_CATEGORY[catKey] || `Clothing > ${p.category || 'Apparel'}`;
    const sizes = (p.sizes && p.sizes.length) ? p.sizes : ['ONE SIZE'];

    for (const size of sizes) {
      let inStock = p.inStock;
      const sizeQty = (p.sizeStock && p.sizeStock[size] != null) ? p.sizeStock[size]
        : (p.stockCount && p.stockCount[size] != null) ? p.stockCount[size] : null;
      if (sizeQty != null) inStock = sizeQty > 0;
      const variantId = `${p.id}-${String(size).replace(/[^A-Za-z0-9]/g, '')}`;
      items.push(`    <item>
      <g:id>${xmlEscape(variantId)}</g:id>
      <g:item_group_id>${xmlEscape(p.id)}</g:item_group_id>
      <title>${xmlEscape(buildTitle(p, size))}</title>
      <description>${xmlEscape(description)}</description>
      <link>${xmlEscape(link)}</link>
      <g:image_link>${xmlEscape(main)}</g:image_link>${extra.map(u => `\n      <g:additional_image_link>${xmlEscape(u)}</g:additional_image_link>`).join('')}
      <g:availability>${inStock ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${listPrice}.00 INR</g:price>${hasSale ? `\n      <g:sale_price>${Math.round(p.price)}.00 INR</g:sale_price>` : ''}
      <g:brand>${BRAND}</g:brand>
      <g:condition>new</g:condition>
      <g:color>${xmlEscape(a.color)}</g:color>
      <g:size>${xmlEscape(titleCaseSize(size))}</g:size>
      <g:gender>${a.gender}</g:gender>
      <g:age_group>adult</g:age_group>
      <g:material>${xmlEscape(a.material)}</g:material>${a.pattern ? `\n      <g:pattern>${xmlEscape(a.pattern)}</g:pattern>` : ''}
      <g:identifier_exists>no</g:identifier_exists>
      <g:mpn>${xmlEscape(variantId)}</g:mpn>
      <g:google_product_category>${GOOGLE_CATEGORY_ID}</g:google_product_category>
      <g:product_type>${xmlEscape(productType)}</g:product_type>
      <g:excluded_destination>Shopping_ads</g:excluded_destination>
      <g:excluded_destination>Local_inventory_ads</g:excluded_destination>
      <g:excluded_destination>Free_local_listings</g:excluded_destination>${promoTags}
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>INTRU.IN — Exclusive Indian Streetwear</title>
    <link>https://intru.in</link>
    <description>${xmlEscape(opts.channelDescription)}</description>
    <lastBuildDate>${now}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>`;
}
