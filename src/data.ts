// =============================================================
// intru.in — Data Layer
// All dynamic data comes from Supabase. SEED_PRODUCTS is the
// fallback catalog that gets auto-inserted when the DB is empty.
// =============================================================

export interface Product {
  id: string; slug: string; name: string; tagline: string; description: string;
  price: number; comparePrice?: number; currency: string; images: string[];
  sizes: string[]; category: string; inStock: boolean; featured: boolean;
}
export interface LegalPage { slug: string; title: string; content: string; updatedAt: string; }
export interface CartItem { productId: string; size: string; quantity: number; }
export interface StoreCredit { email: string; amount: number; reason: string; createdAt: string; }

// Environment bindings — wrangler secrets / .dev.vars
export interface Env {
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  GOOGLE_CLIENT_ID: string;
  ADMIN_PASSWORD: string;
}

// ============ STORE CONFIG (static — never changes at runtime) ============
export const STORE_CONFIG = {
  name: "intru.in",
  tagline: "Limited Drops. No Restocks.",
  description: "Born from a shared love for minimalism and everyday style. We craft essential wardrobe pieces that speak through quality, not logos. Limited drops only.",
  currency: "INR",
  currencySymbol: "Rs.",
  freeShippingThreshold: 1999,
  shippingCost: 99,
  email: "hello@intru.in",
  instagram: "intru.in",
  // Defaults — overridden by env vars in production
  adminPassword: "intru2026admin",
  googleClientId: "YOUR_GOOGLE_CLIENT_ID",
  razorpayKeyId: "YOUR_RAZORPAY_KEY_ID",
};

// ============ SEED PRODUCTS — inserted when Supabase products table is empty ============
export const SEED_PRODUCTS: Product[] = [
  {
    id: "p1", slug: "essential-oversized-tee", name: "Essential Oversized Tee",
    tagline: "The foundation of every outfit",
    description: "Our signature oversized tee crafted from 240 GSM premium cotton. Drop shoulders, ribbed neckline, and a relaxed fit that drapes perfectly. Pre-shrunk and garment-dyed for that lived-in softness from day one.",
    price: 1299, comparePrice: 1799, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/3.png?v=1748498083&width=800",
      "https://intru.in/cdn/shop/files/1_83d03bc1-1a42-4357-8d82-76fbd6a2b651.png?v=1748498083&width=800",
      "https://intru.in/cdn/shop/files/2_a58345be-8c36-4db5-a9a5-f88e19e3c22d.png?v=1748498083&width=800",
      "https://intru.in/cdn/shop/files/4_28b80a7c-be7e-4f21-bf58-f64b90c11d19.png?v=1748498083&width=800"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "Tops", inStock: true, featured: true
  },
  {
    id: "p2", slug: "midnight-cargo-joggers", name: "Midnight Cargo Joggers",
    tagline: "Utility meets comfort",
    description: "Relaxed-fit cargo joggers in washed black. Six-pocket design with snap closures, elastic waistband with drawcord, and tapered ankles with adjustable toggles. Built from heavyweight French terry.",
    price: 1999, comparePrice: 2499, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/jogger1.png?v=1748500000&width=800",
      "https://intru.in/cdn/shop/files/jogger2.png?v=1748500000&width=800",
      "https://intru.in/cdn/shop/files/jogger3.png?v=1748500000&width=800",
      "https://intru.in/cdn/shop/files/jogger4.png?v=1748500000&width=800"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "Bottoms", inStock: true, featured: true
  },
  {
    id: "p3", slug: "structured-minimal-hoodie", name: "Structured Minimal Hoodie",
    tagline: "Clean lines, warm soul",
    description: "A heavyweight 360 GSM hoodie with a structured silhouette. Kangaroo pocket, flat drawcord, and double-needle stitching throughout. The hood holds its shape without feeling stiff.",
    price: 2499, comparePrice: 3199, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/hoodie1.png?v=1748500100&width=800",
      "https://intru.in/cdn/shop/files/hoodie2.png?v=1748500100&width=800",
      "https://intru.in/cdn/shop/files/hoodie3.png?v=1748500100&width=800",
      "https://intru.in/cdn/shop/files/hoodie4.png?v=1748500100&width=800"
    ],
    sizes: ["S", "M", "L", "XL"], category: "Tops", inStock: true, featured: true
  },
  {
    id: "p4", slug: "everyday-slim-chinos", name: "Everyday Slim Chinos",
    tagline: "From desk to dinner",
    description: "Slim-fit chinos in stone wash. Stretch cotton twill with a soft hand-feel. Clean front, slant pockets, and a tapered leg that works with sneakers or boots. Wrinkle-resistant finish.",
    price: 1799, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/chinos1.png?v=1748500200&width=800",
      "https://intru.in/cdn/shop/files/chinos2.png?v=1748500200&width=800",
      "https://intru.in/cdn/shop/files/chinos3.png?v=1748500200&width=800",
      "https://intru.in/cdn/shop/files/chinos4.png?v=1748500200&width=800"
    ],
    sizes: ["28", "30", "32", "34", "36"], category: "Bottoms", inStock: true, featured: false
  },
  {
    id: "p5", slug: "graphic-art-tee-vol1", name: "Graphic Art Tee Vol. 1",
    tagline: "Wearable expression",
    description: "Limited-edition graphic tee featuring original artwork by independent Indian artists. Screen-printed on our signature 240 GSM cotton base. Each print is unique.",
    price: 1499, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/graphic1.png?v=1748500300&width=800",
      "https://intru.in/cdn/shop/files/graphic2.png?v=1748500300&width=800",
      "https://intru.in/cdn/shop/files/graphic3.png?v=1748500300&width=800",
      "https://intru.in/cdn/shop/files/graphic4.png?v=1748500300&width=800"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "Tops", inStock: true, featured: true
  },
  {
    id: "p6", slug: "monochrome-zip-jacket", name: "Monochrome Zip Jacket",
    tagline: "Layer with intent",
    description: "Lightweight zip-up jacket in matte black. Water-resistant shell with a soft mesh lining. Minimal branding, hidden pockets, and a clean stand collar. Packs into its own pocket for travel.",
    price: 2999, comparePrice: 3999, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/jacket1.png?v=1748500400&width=800",
      "https://intru.in/cdn/shop/files/jacket2.png?v=1748500400&width=800",
      "https://intru.in/cdn/shop/files/jacket3.png?v=1748500400&width=800",
      "https://intru.in/cdn/shop/files/jacket4.png?v=1748500400&width=800"
    ],
    sizes: ["S", "M", "L", "XL"], category: "Outerwear", inStock: true, featured: true
  },
];

// ============ SEED LEGAL PAGES ============
export const SEED_LEGAL_PAGES: LegalPage[] = [
  {
    slug: "terms", title: "Terms of Service",
    content: `<h2>1. Agreement to Terms</h2>
<p>By accessing, browsing, or using this website (intru.in), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, including our <a href="/p/shipping">Shipping</a> and <a href="/p/returns">Store-Credit-only Refund Policy</a>.</p>
<h2>2. Limited Drop Model</h2>
<p>intru.in operates on a limited-drop model. Products are released in small, exclusive batches. Due to the limited nature of our drops, <strong>all sales are final</strong>. We do not offer cash refunds under any circumstances. Approved claims are issued as Store Credit only.</p>
<h2>3. Order Processing</h2>
<p>We strive to process and hand over all orders to our courier partners within a <strong>36-hour window</strong> from the time of order confirmation. Orders placed on weekends or public holidays will be processed on the next business day.</p>
<h2>4. Shipping Disclaimer</h2>
<p>Delivery timelines provided at checkout are estimates only. <strong>intru.in is not responsible for any logistical delays, damages during transit, or failures to deliver caused by the independent delivery partner.</strong></p>
<h2>5. Pricing &amp; Payment</h2>
<p>All product prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Payment is processed securely through Razorpay. We accept UPI, credit/debit cards, net banking, and popular digital wallets.</p>
<h2>6. Store Credit</h2>
<p>Store Credit issued by intru.in is valued at a 1:1 ratio with INR. Store Credit never expires and can be applied to any future purchase. Store Credit is non-transferable and cannot be converted to cash.</p>
<h2>7. Intellectual Property</h2>
<p>All content on intru.in is our intellectual property and may not be reproduced without prior written consent.</p>
<h2>8. Limitation of Liability</h2>
<p>intru.in shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed the amount paid for the specific product in question.</p>
<h2>9. Governing Law</h2>
<p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>
<h2>10. Changes to Terms</h2>
<p>We reserve the right to update these Terms at any time. Continued use constitutes acceptance of the new Terms.</p>`,
    updatedAt: "2026-02-26"
  },
  {
    slug: "returns", title: "Returns, Exchanges & Refunds",
    content: `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:32px;font-size:14px;line-height:1.7">
<strong>Important:</strong> intru.in operates on a limited-drop model. All sales are final. We do not offer cash refunds. Approved claims receive Store Credit only.
</div>
<h2>1. Limited Drop Policy</h2>
<p>Due to the exclusive and limited nature of intru.in products, <strong>all sales are final</strong>.</p>
<h2>2. Store Credit Only</h2>
<p>Approved returns receive <strong>Store Credit at 1:1 value with INR</strong>. Store Credit can be used for any future drop, never expires, and is non-transferable.</p>
<h2>3. 36-Hour Claim Window</h2>
<p>Customers must raise a request within <strong>36 hours of receiving the order</strong>. Email <a href="mailto:returns@intru.in">returns@intru.in</a> with your order number, photos, and description.</p>
<h2>4. Eligible Claims</h2>
<p>Store Credit approved for: manufacturing defects, wrong item received, significantly damaged product. NOT approved for: change of mind, wrong size, minor color variations, claims after 36h.</p>
<h2>5. Exchange Process</h2>
<p>For size exchanges on eligible items, email us within 36 hours. If approved and replacement is in stock, we ship at no additional cost.</p>
<h2>6. Contact</h2>
<p>For all return queries: <a href="mailto:returns@intru.in">returns@intru.in</a></p>`,
    updatedAt: "2026-02-26"
  },
  {
    slug: "privacy", title: "Privacy Policy",
    content: `<h2>1. Information We Collect</h2>
<p>We collect information you provide directly: name, email, phone, shipping address, and payment details. We also collect browsing data through cookies.</p>
<h2>2. How We Use Your Data</h2>
<p>Your data is used to process orders, send updates, manage Store Credit, and improve our services. We do not sell your personal information.</p>
<h2>3. Data Security</h2>
<p>We implement SSL/TLS encryption. Payment is handled by Razorpay (PCI-DSS compliant). We never store full card details.</p>
<h2>4. Cookies</h2>
<p>We use essential cookies for cart and sessions. Optional analytics cookies help us understand traffic.</p>
<h2>5. Third-Party Services</h2>
<p>We use Supabase, Razorpay, and Google, each under their own privacy policies.</p>
<h2>6. Your Rights</h2>
<p>Request access, correction, or deletion of your data at <a href="mailto:hello@intru.in">hello@intru.in</a>.</p>
<h2>7. Updates</h2>
<p>This policy may be updated periodically. Significant changes will be communicated via email.</p>`,
    updatedAt: "2026-02-26"
  },
  {
    slug: "shipping", title: "Shipping Policy",
    content: `<h2>1. Processing Time</h2>
<p>All orders processed within a <strong>36-hour window</strong> (excluding weekends and holidays).</p>
<h2>2. Delivery Coverage</h2>
<p>We ship across India. International shipping is not available at this time.</p>
<h2>3. Estimated Delivery</h2>
<ul><li><strong>Metro cities:</strong> 3-5 business days</li><li><strong>Tier 2:</strong> 5-7 business days</li><li><strong>Remote:</strong> 7-10 business days</li></ul>
<h2>4. Shipping Costs</h2>
<ul><li>Free shipping on orders above Rs.1,999</li><li>Flat Rs.99 for orders below Rs.1,999</li></ul>
<h2>5. Delivery Liability</h2>
<p><strong>Once handed to our courier partner, intru.in is not responsible for transit delays or carrier-caused damage.</strong> We will assist with tracking.</p>
<h2>6. Order Tracking</h2>
<p>A tracking link will be sent to your email and phone once your order ships.</p>`,
    updatedAt: "2026-02-26"
  },
];

// ============ Supabase helpers ============

/** Fetch from Supabase REST API using anon key (for public reads) */
export function supabaseFetch(url: string, key: string, path: string, options?: RequestInit) {
  return fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options?.headers || {}),
    },
  });
}

/**
 * Fetch all products from Supabase. If empty, auto-seed from SEED_PRODUCTS.
 * Returns { products, source } where source is 'supabase' | 'seed' | 'static'.
 */
export async function fetchProducts(supabaseUrl: string, serviceKey: string, anonKey: string): Promise<{ products: Product[]; source: string }> {
  const key = serviceKey || anonKey;
  if (!supabaseUrl || !key) {
    return { products: SEED_PRODUCTS, source: 'static' };
  }

  try {
    const res = await supabaseFetch(supabaseUrl, key, 'products?select=*&order=created_at.asc');
    if (!res.ok) {
      console.error('Supabase products fetch failed:', res.status, await res.text());
      return { products: SEED_PRODUCTS, source: 'static' };
    }
    const rows = await res.json() as any[];

    if (rows.length === 0) {
      // Auto-seed: insert SEED_PRODUCTS into Supabase
      console.log('Products table empty — auto-seeding', SEED_PRODUCTS.length, 'products');
      const seedKey = serviceKey || key; // prefer service key for writes
      const seedRows = SEED_PRODUCTS.map(p => ({
        id: p.id, slug: p.slug, name: p.name, tagline: p.tagline,
        description: p.description, price: p.price, compare_price: p.comparePrice || null,
        currency: p.currency, images: p.images, sizes: p.sizes,
        category: p.category, in_stock: p.inStock, featured: p.featured,
      }));
      try {
        const seedRes = await supabaseFetch(supabaseUrl, seedKey, 'products', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' } as any,
          body: JSON.stringify(seedRows),
        });
        if (seedRes.ok) {
          const seeded = await seedRes.json() as any[];
          return { products: mapDbProducts(seeded), source: 'seed' };
        }
        console.error('Auto-seed failed:', seedRes.status, await seedRes.text());
      } catch (e) {
        console.error('Auto-seed error:', e);
      }
      return { products: SEED_PRODUCTS, source: 'static' };
    }

    return { products: mapDbProducts(rows), source: 'supabase' };
  } catch (e) {
    console.error('Supabase connection error:', e);
    return { products: SEED_PRODUCTS, source: 'static' };
  }
}

/** Fetch a single product by slug from Supabase */
export async function fetchProductBySlug(supabaseUrl: string, key: string, slug: string): Promise<Product | null> {
  if (!supabaseUrl || !key) {
    return SEED_PRODUCTS.find(p => p.slug === slug) || null;
  }
  try {
    const res = await supabaseFetch(supabaseUrl, key, `products?slug=eq.${encodeURIComponent(slug)}&limit=1`);
    if (!res.ok) return SEED_PRODUCTS.find(p => p.slug === slug) || null;
    const rows = await res.json() as any[];
    if (rows.length === 0) return SEED_PRODUCTS.find(p => p.slug === slug) || null;
    return mapDbProduct(rows[0]);
  } catch {
    return SEED_PRODUCTS.find(p => p.slug === slug) || null;
  }
}

/** Fetch a single product by ID from Supabase */
export async function fetchProductById(supabaseUrl: string, key: string, id: string): Promise<Product | null> {
  if (!supabaseUrl || !key) {
    return SEED_PRODUCTS.find(p => p.id === id) || null;
  }
  try {
    const res = await supabaseFetch(supabaseUrl, key, `products?id=eq.${encodeURIComponent(id)}&limit=1`);
    if (!res.ok) return SEED_PRODUCTS.find(p => p.id === id) || null;
    const rows = await res.json() as any[];
    if (rows.length === 0) return SEED_PRODUCTS.find(p => p.id === id) || null;
    return mapDbProduct(rows[0]);
  } catch {
    return SEED_PRODUCTS.find(p => p.id === id) || null;
  }
}

/** Fetch all legal pages from Supabase, seed if empty */
export async function fetchLegalPages(supabaseUrl: string, serviceKey: string, anonKey: string): Promise<{ pages: LegalPage[]; source: string }> {
  const key = serviceKey || anonKey;
  if (!supabaseUrl || !key) {
    return { pages: SEED_LEGAL_PAGES, source: 'static' };
  }
  try {
    const res = await supabaseFetch(supabaseUrl, key, 'legal_pages?select=*&order=slug.asc');
    if (!res.ok) return { pages: SEED_LEGAL_PAGES, source: 'static' };
    const rows = await res.json() as any[];

    if (rows.length === 0) {
      // Auto-seed legal pages
      const seedKey = serviceKey || key;
      const seedRows = SEED_LEGAL_PAGES.map(p => ({
        slug: p.slug, title: p.title, content: p.content, updated_at: p.updatedAt,
      }));
      try {
        const seedRes = await supabaseFetch(supabaseUrl, seedKey, 'legal_pages', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' } as any,
          body: JSON.stringify(seedRows),
        });
        if (seedRes.ok) {
          const seeded = await seedRes.json() as any[];
          return { pages: seeded.map(mapDbLegal), source: 'seed' };
        }
      } catch (e) { console.error('Legal seed error:', e); }
      return { pages: SEED_LEGAL_PAGES, source: 'static' };
    }

    return { pages: rows.map(mapDbLegal), source: 'supabase' };
  } catch {
    return { pages: SEED_LEGAL_PAGES, source: 'static' };
  }
}

// ============ DB row → TypeScript mappers ============

function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    price: row.price,
    comparePrice: row.compare_price || undefined,
    currency: row.currency || 'INR',
    images: Array.isArray(row.images) ? row.images : (typeof row.images === 'string' ? JSON.parse(row.images) : []),
    sizes: Array.isArray(row.sizes) ? row.sizes : (typeof row.sizes === 'string' ? JSON.parse(row.sizes) : []),
    category: row.category || '',
    inStock: row.in_stock !== false,
    featured: row.featured === true,
  };
}

function mapDbProducts(rows: any[]): Product[] {
  return rows.map(mapDbProduct);
}

function mapDbLegal(row: any): LegalPage {
  return {
    slug: row.slug,
    title: row.title,
    content: row.content,
    updatedAt: row.updated_at || row.updatedAt || '',
  };
}

// ============ Razorpay helpers ============

export async function hmacSHA256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createRazorpayOrder(keyId: string, keySecret: string, amount: number, receipt: string) {
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt,
      notes: { store: 'intru.in' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay order creation failed: ${err}`);
  }
  return res.json();
}
