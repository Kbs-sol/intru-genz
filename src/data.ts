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
  RESEND_API_KEY: string;
}

// ============ STORE CONFIG (static — never changes at runtime) ============
export const STORE_CONFIG = {
  name: "intru.in",
  tagline: "Limited Drops. No Restocks.",
  description: "Experience premium streetwear with INTRU.IN. We specialize in limited-edition oversized tees and high-quality drops that never restock. Two best friends, tired of mass-produced fashion, bringing you exclusive Indian streetwear made with love. When it's gone, it's gone.",
  currency: "INR",
  currencySymbol: "Rs.",
  freeShippingThreshold: 1999,
  shippingCost: 99,
  email: "shop@intru.in",
  instagram: "intru.in",
  // Defaults — overridden by env vars in production
  adminPassword: "intru2026admin",
  googleClientId: "YOUR_GOOGLE_CLIENT_ID",
  razorpayKeyId: "YOUR_RAZORPAY_KEY_ID",
};

// ============ SEED PRODUCTS — inserted when Supabase products table is empty ============
export const SEED_PRODUCTS: Product[] = [
  {
    id: "p1", slug: "doodles-t-shirt", name: "Doodles T-Shirt",
    tagline: "Warmth and joy",
    description: "Playful doodle-art printed tee that radiates warmth. Crafted from premium cotton with puff-print detailing. Pre-shrunk, garment-dyed, and designed to feel like it was made just for you.",
    price: 999, comparePrice: 1499, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1946",
      "https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1000",
      "https://intru.in/cdn/shop/files/3.png?v=1748692106&width=800",
      "https://intru.in/cdn/shop/files/3.png?v=1748692106&width=600"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "T-Shirts", inStock: true, featured: true
  },
  {
    id: "p2", slug: "no-risk-porsche", name: "No Risk Porsche",
    tagline: "Bold edge",
    description: "A statement tee for those who move without hesitation. Bold graphic print, premium cotton, and a fit that commands attention. No risk, no reward.",
    price: 999, comparePrice: 1499, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=1920",
      "https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=1000",
      "https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=800",
      "https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=600"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "T-Shirts", inStock: true, featured: true
  },
  {
    id: "p3", slug: "orange-puff-printed-t-shirt", name: "Orange Puff",
    tagline: "Caffeine-core",
    description: "Orange puff-printed tee with a texture you can feel. Caffeine-core energy meets streetwear minimalism. Premium cotton, relaxed fit, limited run.",
    price: 899, comparePrice: 1499, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=1445",
      "https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=1000",
      "https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=800",
      "https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=600"
    ],
    sizes: ["S", "M", "L", "XL"], category: "T-Shirts", inStock: true, featured: true
  },
  {
    id: "p4", slug: "romanticise-crop-tee", name: "Romanticise Crop",
    tagline: "Breezy ease",
    description: "Cropped silhouette meets everyday comfort. Soft cotton, clean cut, and an effortless vibe. Designed over two months because we refused to rush perfection.",
    price: 699, comparePrice: 999, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/4_f2aa413e-6e91-49bd-8f16-2efd41b4d6ea.png?v=1748190572&width=1946",
      "https://intru.in/cdn/shop/files/4_f2aa413e-6e91-49bd-8f16-2efd41b4d6ea.png?v=1748190572&width=1000",
      "https://intru.in/cdn/shop/files/4_f2aa413e-6e91-49bd-8f16-2efd41b4d6ea.png?v=1748190572&width=800",
      "https://intru.in/cdn/shop/files/4_f2aa413e-6e91-49bd-8f16-2efd41b4d6ea.png?v=1748190572&width=600"
    ],
    sizes: ["XS", "S", "M", "L"], category: "T-Shirts", inStock: true, featured: true
  },
  {
    id: "p5", slug: "stripe-18-shirt", name: "Stripe 18 Shirt",
    tagline: "Cool tones",
    description: "Cool-toned striped shirt with a structured collar and relaxed body. Premium woven fabric, mother-of-pearl buttons, and a fit that bridges casual and smart.",
    price: 1099, comparePrice: 1699, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/99.png?v=1748173436&width=1946",
      "https://intru.in/cdn/shop/files/99.png?v=1748173436&width=1000",
      "https://intru.in/cdn/shop/files/99.png?v=1748173436&width=800",
      "https://intru.in/cdn/shop/files/99.png?v=1748173436&width=600"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "Shirts", inStock: true, featured: true
  },
  {
    id: "p6", slug: "summer-shirt", name: "Summer Shirt",
    tagline: "Sunshine staple",
    description: "Your go-to summer layer. Lightweight, breathable, and effortlessly styled. Made for golden-hour walks and spontaneous weekend plans.",
    price: 999, comparePrice: 1599, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/03.png?v=1756359941&width=1946",
      "https://intru.in/cdn/shop/files/03.png?v=1756359941&width=1000",
      "https://intru.in/cdn/shop/files/03.png?v=1756359941&width=800",
      "https://intru.in/cdn/shop/files/03.png?v=1756359941&width=600"
    ],
    sizes: ["S", "M", "L", "XL"], category: "Shirts", inStock: true, featured: true
  },
];

// ============ SEED LEGAL PAGES (Indian E-Commerce Compliant) ============
export const SEED_LEGAL_PAGES: LegalPage[] = [
  {
    slug: "terms", title: "Terms of Service",
    content: `<h2>1. Agreement to Terms</h2>
<p>By accessing, browsing, or using this website (<strong>intru.in</strong>), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, including our <a href="/p/shipping">Shipping</a> and <a href="/p/returns">Store-Credit-only Refund Policy</a>. If you do not agree, please discontinue use immediately.</p>
<h2>2. Limited Drop Model</h2>
<p>intru.in operates on a <strong>limited-drop model</strong>. Products are released in small, exclusive batches. Due to the limited nature of our drops, <strong>all sales are final</strong>. We do not offer cash refunds under any circumstances. Approved claims are issued as Store Credit only.</p>
<h2>3. Order Processing</h2>
<p>We strive to process and hand over all orders to our courier partners within a <strong>36-hour window</strong> from the time of order confirmation. Orders placed on weekends or public holidays will be processed on the next business day.</p>
<h2>4. Shipping Disclaimer</h2>
<p>Delivery timelines provided at checkout are estimates only. <strong>intru.in is not responsible for any logistical delays, damages during transit, or failures to deliver caused by the independent delivery partner.</strong></p>
<h2>5. Pricing &amp; Payment</h2>
<p>All product prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. Payment is processed securely through Razorpay. We accept UPI, credit/debit cards, net banking, and popular digital wallets.</p>
<h2>6. Store Credit</h2>
<p>Store Credit issued by intru.in is valued at a 1:1 ratio with INR. Store Credit never expires and can be applied to any future purchase. Store Credit is non-transferable and cannot be converted to cash.</p>
<h2>7. Intellectual Property</h2>
<p>All content on intru.in — including logos, graphics, product images, and text — is our intellectual property and may not be reproduced without prior written consent.</p>
<h2>8. Limitation of Liability</h2>
<p>intru.in shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Our total liability shall not exceed the amount paid for the specific product in question.</p>
<h2>9. Governing Law &amp; Jurisdiction</h2>
<p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.</p>
<h2>10. Grievance Redressal</h2>
<p>In accordance with the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong> and the Information Technology Act, 2000, our designated Grievance Officer / Nodal Officer is:</p>
<p><strong>Nodal Officer:</strong> intru.in Grievance Desk<br><strong>Email:</strong> <a href="mailto:shop@intru.in">shop@intru.in</a><br><strong>Response Time:</strong> All grievances will be acknowledged within 48 hours and resolved within 30 days of receipt.</p>
<h2>11. Changes to Terms</h2>
<p>We reserve the right to update these Terms at any time. Continued use constitutes acceptance of the new Terms.</p>`,
    updatedAt: "2026-02-27"
  },
  {
    slug: "returns", title: "Returns, Exchanges & Refunds",
    content: `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:32px;font-size:14px;line-height:1.7">
<strong>Important:</strong> intru.in operates on a limited-drop model. All sales are final. We do not offer cash refunds. Approved claims receive <strong>Store Credit only</strong>.
</div>
<h2>1. Limited Drop Policy</h2>
<p>Due to the exclusive and limited nature of intru.in products, <strong>all sales are final</strong>. Once a drop sells out, it is never restocked.</p>
<h2>2. Store Credit Only — No Cash Refunds</h2>
<p>Approved returns receive <strong>Store Credit at 1:1 value with INR</strong>. Store Credit can be used for any future drop, never expires, and is non-transferable. Cash refunds are not available under any circumstances.</p>
<h2>3. 36-Hour Defect Claim Window</h2>
<p>Customers must raise a claim within <strong>36 hours of receiving the order</strong>. To file a claim, email <a href="mailto:shop@intru.in">shop@intru.in</a> with:</p>
<ul><li>Your order number</li><li>Clear photographs of the defect or issue</li><li>A brief description of the problem</li></ul>
<h2>4. Eligible Claims</h2>
<p><strong>Store Credit approved for:</strong> Manufacturing defects, wrong item received, significantly damaged product during transit.</p>
<p><strong>NOT eligible:</strong> Change of mind, wrong size ordered, minor color variations between screen and product, claims submitted after the 36-hour window.</p>
<h2>5. Exchange Process</h2>
<p>For size exchanges on eligible items, email us within 36 hours. If approved and replacement size is in stock, we ship at no additional cost. If out of stock, Store Credit is issued.</p>
<h2>6. Grievance Redressal</h2>
<p>If you are unsatisfied with the resolution of your claim, you may escalate to our Nodal Officer at <a href="mailto:shop@intru.in">shop@intru.in</a>. All escalations are acknowledged within 48 hours and resolved within 30 days.</p>
<h2>7. Contact</h2>
<p>For all return queries: <a href="mailto:shop@intru.in">shop@intru.in</a></p>`,
    updatedAt: "2026-02-27"
  },
  {
    slug: "privacy", title: "Privacy Policy",
    content: `<h2>1. Information We Collect</h2>
<p>We collect information you provide directly: name, email address, phone number, shipping address, and payment details. We also collect browsing data through cookies and analytics tools.</p>
<h2>2. How We Use Your Data</h2>
<p>Your data is used to: process orders, send order updates and tracking, manage Store Credit balances, improve our services, and communicate about new drops (with your consent). <strong>We do not sell or rent your personal information to any third party.</strong></p>
<h2>3. Data Security</h2>
<p>We implement SSL/TLS encryption across the entire site. Payment processing is handled by Razorpay, a PCI-DSS Level 1 compliant payment gateway. We never store full card details on our servers.</p>
<h2>4. Cookies</h2>
<p>We use essential cookies for cart management and session authentication. Optional analytics cookies help us understand traffic and improve the shopping experience. You may disable non-essential cookies in your browser settings.</p>
<h2>5. Third-Party Services</h2>
<p>We use the following third-party services, each governed by their own privacy policies: Supabase (database), Razorpay (payments), Google (authentication), and our delivery partners (shipping).</p>
<h2>6. Data Retention</h2>
<p>We retain your personal data for as long as your account is active or as needed to provide services. Order records are retained for 7 years as required by Indian tax regulations.</p>
<h2>7. Your Rights</h2>
<p>You have the right to request access, correction, or deletion of your personal data at any time. Contact us at <a href="mailto:shop@intru.in">shop@intru.in</a>.</p>
<h2>8. Grievance Redressal</h2>
<p>For privacy-related grievances, contact our Nodal Officer at <a href="mailto:shop@intru.in">shop@intru.in</a>. Grievances will be acknowledged within 48 hours and resolved within 30 days.</p>
<h2>9. Updates</h2>
<p>This policy may be updated periodically. Significant changes will be communicated via email to registered users.</p>`,
    updatedAt: "2026-02-27"
  },
  {
    slug: "shipping", title: "Shipping Policy",
    content: `<h2>1. Processing Time</h2>
<p>All orders are processed within a <strong>36-hour window</strong> from order confirmation (excluding weekends and public holidays).</p>
<h2>2. Delivery Coverage</h2>
<p>We ship across India via trusted courier partners. International shipping is not available at this time.</p>
<h2>3. Estimated Delivery</h2>
<ul><li><strong>Metro cities (Delhi, Mumbai, Bangalore, etc.):</strong> 3–5 business days</li><li><strong>Tier 2 cities:</strong> 5–7 business days</li><li><strong>Remote / rural areas:</strong> 7–10 business days</li></ul>
<p>These are estimates and may vary based on courier partner capacity and external factors.</p>
<h2>4. Shipping Costs</h2>
<ul><li><strong>Free shipping</strong> on orders above Rs.1,999</li><li>Flat <strong>Rs.99</strong> for orders below Rs.1,999</li></ul>
<h2>5. Order Tracking</h2>
<p>A tracking link will be sent to your registered email and phone number once your order ships. You can also check order status by emailing <a href="mailto:shop@intru.in">shop@intru.in</a>.</p>
<h2>6. Delivery Liability</h2>
<p><strong>Once the order is handed over to our courier partner, intru.in is not responsible for transit delays, theft, or carrier-caused damage.</strong> We will, however, assist you in filing a claim with the courier and provide necessary documentation.</p>
<h2>7. Undeliverable Orders</h2>
<p>If an order is returned to us due to an incorrect address or failed delivery attempts, we will contact you to arrange re-shipment. Additional shipping charges may apply.</p>`,
    updatedAt: "2026-02-27"
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

// Add this to the email section of data.ts
export async function emailAdminPaymentAlert(resendApiKey: string, paymentData: any) {
  const adminEmail = "Venkatpradeep760@gmail.com";
  const amount = (paymentData.amount / 100).toFixed(2);
  const orderId = paymentData.order_id || "N/A";

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`
    },
    body: JSON.stringify({
      from: 'intru.in <noreply@order.intru.in>',
      to: adminEmail,
      subject: `💰 Payment Received: ₹${amount}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #10b981;">New Payment Captured</h2>
          <p><strong>Amount:</strong> ₹${amount} INR</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Payment ID:</strong> ${paymentData.id}</p>
          <p><strong>Customer Email:</strong> ${paymentData.email || 'N/A'}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">This is an automated alert for INTRU.IN</p>
        </div>
      `
    })
  });
}
// ============ Magic Checkout line_item builder ============

export interface MagicLineItem {
  type: string;
  sku: string;
  variant_id: string;
  price: number;          // paise
  offer_price: number;    // paise (after discount)
  tax_amount: number;
  quantity: number;
  name: string;
  description: string;
  weight: number;         // grams
  image_url: string;
  product_url: string;
}

export function buildMagicLineItems(
  validatedItems: { productId: string; name: string; size: string; quantity: number; unitPrice: number; lineTotal: number; image?: string; slug?: string; description?: string }[]
): { line_items: MagicLineItem[]; line_items_total: number } {
  let lineItemsTotal = 0;
  const line_items: MagicLineItem[] = validatedItems.map(item => {
    const pricePaise = item.unitPrice * 100;
    const totalPaise = item.lineTotal * 100;
    lineItemsTotal += totalPaise;
    return {
      type: 'e-commerce',
      sku: item.productId,
      variant_id: `${item.productId}_${item.size}`,
      price: pricePaise,
      offer_price: pricePaise,  // same as price (no per-item discount)
      tax_amount: 0,            // prices are tax-inclusive
      quantity: item.quantity,
      name: item.name,
      description: item.description || item.name,
      weight: 250,              // ~250g per garment
      image_url: item.image || '',
      product_url: `https://intru.in/product/${item.slug || item.productId}`,
    };
  });
  return { line_items, line_items_total: lineItemsTotal };
}

/**
 * Create a Razorpay Magic Checkout order.
 * Sends line_items + line_items_total so Razorpay activates the Magic flow
 * (address collection, COD intelligence, 1-click checkout).
 */
export async function createMagicCheckoutOrder(
  keyId: string,
  keySecret: string,
  amount: number,           // INR (not paise)
  receipt: string,
  lineItems: MagicLineItem[],
  lineItemsTotal: number,   // paise
) {
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100,       // paise
      currency: 'INR',
      receipt,
      notes: { store: 'intru.in' },
      line_items_total: lineItemsTotal,
      line_items: lineItems,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay Magic Checkout order creation failed: ${err}`);
  }
  return res.json();
}

/** Fetch full order details (including shipping address) after payment */
export async function fetchRazorpayOrder(keyId: string, keySecret: string, orderId: string) {
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    method: 'GET',
    headers: { 'Authorization': `Basic ${auth}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// Legacy helper kept for backward compatibility
export async function createRazorpayOrder(keyId: string, keySecret: string, amount: number, receipt: string) {
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100,
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

// ============ Resend email helper ============

export async function sendResendEmail(
  apiKey: string,
  to: string | string[],
  subject: string,
  html: string,
  from?: string
): Promise<{ success: boolean; error?: string }> {
  if (!apiKey) return { success: false, error: 'RESEND_API_KEY not configured' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || 'intru.in <noreply@order.intru.in>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ============ Email templates ============

export function emailDropSecured(orderId: string, items: any[], total: number): string {
  const shortId = orderId.toUpperCase().slice(-8);
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #16a34a">
    <div style="background:#16a34a;padding:32px;text-align:center">
      <h1 style="color:#fff;font-size:24px;margin:0;letter-spacing:4px;text-transform:uppercase">DROP SECURED</h1>
    </div>
    <div style="padding:32px">
      <p style="margin:0">intru.in — Limited Drops. No Restocks.</p>
    </div>
  </div>`;
}

export function emailCodReceived(orderId: string, name: string, items: any[], total: number): string {
  const shortId = orderId.toUpperCase().slice(-8);
  const confirmUrl = `https://intru.in/confirm-order/${orderId}`;
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee">
    <div style="background:#0a0a0a;padding:32px;text-align:center">
      <h1 style="color:#fff;font-size:24px;margin:0;letter-spacing:4px;text-transform:uppercase">ORDER RECEIVED</h1>
    </div>
    <div style="padding:32px">
      <p style="font-size:16px;color:#333">Hi ${name || 'there'},</p>
      <p style="font-size:14px;color:#666;line-height:1.7">We've received your Cash on Delivery order <strong>#IN-${shortId}</strong>. To prevent fake orders and start production, please confirm you are real by clicking below:</p>
      
      <div style="text-align:center;margin:32px 0">
        <a href="${confirmUrl}" style="background:#0a0a0a;color:#fff;padding:18px 32px;text-decoration:none;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:14px;border-radius:4px;display:inline-block">CONFIRM MY ORDER</a>
      </div>

      <p style="font-size:12px;color:#999;line-height:1.6;text-align:center">If the button doesn't work, copy this link: <br> ${confirmUrl}</p>
      
      <div style="margin-top:40px;padding-top:20px;border-top:1px solid #eee">
        <p style="font-size:14px;color:#333;font-weight:700;margin-bottom:8px">Order Summary:</p>
        <p style="font-size:13px;color:#666">Total: Rs.${total.toLocaleString('en-IN')} (incl. Rs.99 COD/Shipping Fee)</p>
      </div>
    </div>
    <div style="background:#f5f5f5;padding:24px;text-align:center;font-size:11px;color:#999">
      <p style="margin:0">intru.in — Limited Drops. No Restocks.</p>
    </div>
  </div>`;
}

export function emailCodManagerAlert(orderId: string, name: string, phone: string, address: string, items: any[], total: number): string {
  const itemsList = items.map((i: any) => `${i.name} (${i.size}) x${i.quantity}`).join(', ');
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff">
    <div style="background:#dc2626;padding:24px;text-align:center">
      <h1 style="color:#fff;font-size:20px;margin:0;letter-spacing:3px;text-transform:uppercase">NEW COD ALERT</h1>
    </div>
    <div style="padding:32px">
      <table style="width:100%;font-size:14px;line-height:1.8">
        <tr><td style="font-weight:700;padding:6px 12px;color:#666">Customer</td><td style="padding:6px 12px">${name}</td></tr>
        <tr><td style="font-weight:700;padding:6px 12px;color:#666">Phone</td><td style="padding:6px 12px"><a href="tel:${phone}">${phone}</a></td></tr>
        <tr><td style="font-weight:700;padding:6px 12px;color:#666">Address</td><td style="padding:6px 12px">${address}</td></tr>
        <tr><td style="font-weight:700;padding:6px 12px;color:#666">Items</td><td style="padding:6px 12px">${itemsList}</td></tr>
        <tr><td style="font-weight:700;padding:6px 12px;color:#666">Total (COD)</td><td style="padding:6px 12px;font-weight:700;font-size:16px">Rs.${total.toLocaleString('en-IN')}</td></tr>
        <tr><td style="font-weight:700;padding:6px 12px;color:#666">Order ID</td><td style="padding:6px 12px;font-size:12px">${orderId}</td></tr>
      </table>
    </div>
  </div>`;
}

// ============ Store settings helper ============

export async function fetchStoreSetting(sbUrl: string, sbKey: string, key: string): Promise<string | null> {
  if (!sbUrl || !sbKey) return null;
  try {
    const res = await supabaseFetch(sbUrl, sbKey, `store_settings?key=eq.${encodeURIComponent(key)}&select=value&limit=1`);
    if (!res.ok) return null;
    const rows = await res.json() as any[];
    return rows.length > 0 ? rows[0].value : null;
  } catch { return null; }
}

export async function fetchAllStoreSettings(sbUrl: string, sbKey: string): Promise<Record<string, string>> {
  if (!sbUrl || !sbKey) return {};
  try {
    const res = await supabaseFetch(sbUrl, sbKey, 'store_settings');
    if (!res.ok) return {};
    const rows = await res.json() as { key: string, value: string }[];
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
  } catch { return {}; }
}

// ============ Image Upload helper ============

/**
 * Upload a file directly to Supabase Storage.
 * Returns the full Public URL.
 */
export async function uploadToSupabase(env: Env, bucket: string, file: File): Promise<string> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase configuration missing (URL or Service Key)');
  }

  // Sanitize filename: timestamp + alphanumeric only
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
  const fileName = `${timestamp}_${safeName}`;

  const baseUrl = env.SUPABASE_URL.replace(/\/$/, '');
  const url = `${baseUrl}/storage/v1/object/${bucket}/${fileName}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'x-upsert': 'true',
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${errorText}`);
  }

  // Return the public URL
  return `${baseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
}
