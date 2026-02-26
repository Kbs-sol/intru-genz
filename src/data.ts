export interface Product {
  id: string; slug: string; name: string; tagline: string; description: string;
  price: number; comparePrice?: number; currency: string; images: string[];
  sizes: string[]; category: string; inStock: boolean; featured: boolean;
}
export interface LegalPage { slug: string; title: string; content: string; updatedAt: string; }
export interface CartItem { productId: string; size: string; quantity: number; }
export interface StoreCredit { email: string; amount: number; reason: string; createdAt: string; }

// Environment bindings — these come from wrangler secrets / .dev.vars
export interface Env {
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  GOOGLE_CLIENT_ID: string;
  ADMIN_PASSWORD: string;
}

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&h=1000&fit=crop&q=80&auto=format`;

// Fallback products — used when Supabase is not connected
// In production, /api/products fetches from Supabase
export const PRODUCTS: Product[] = [
  { id:"p1",slug:"essential-oversized-tee",name:"Essential Oversized Tee",tagline:"The foundation of every outfit",description:"Our signature oversized tee crafted from 240 GSM premium cotton. Drop shoulders, ribbed neckline, and a relaxed fit that drapes perfectly. Pre-shrunk and garment-dyed for that lived-in softness from day one.",price:1299,comparePrice:1799,currency:"INR",images:[IMG("1618354691373-d851c5c3a990"),IMG("1521572163474-6864f9cf17ab"),IMG("1583743814966-8936f5b7be1a"),IMG("1562157873-818bc0726f68")],sizes:["S","M","L","XL","XXL"],category:"Tops",inStock:true,featured:true },
  { id:"p2",slug:"midnight-cargo-joggers",name:"Midnight Cargo Joggers",tagline:"Utility meets comfort",description:"Relaxed-fit cargo joggers in washed black. Six-pocket design with snap closures, elastic waistband with drawcord, and tapered ankles with adjustable toggles. Built from heavyweight French terry.",price:1999,comparePrice:2499,currency:"INR",images:[IMG("1594938298603-c8148c4dae35"),IMG("1519235624215-85175d5eb36e"),IMG("1552374196-c4e7ffc6e126"),IMG("1506629082955-511b1aa562c8")],sizes:["S","M","L","XL","XXL"],category:"Bottoms",inStock:true,featured:true },
  { id:"p3",slug:"structured-minimal-hoodie",name:"Structured Minimal Hoodie",tagline:"Clean lines, warm soul",description:"A heavyweight 360 GSM hoodie with a structured silhouette. Kangaroo pocket, flat drawcord, and double-needle stitching throughout. The hood holds its shape without feeling stiff.",price:2499,comparePrice:3199,currency:"INR",images:[IMG("1556821840-3a63f95609a7"),IMG("1578662996442-48f60103fc96"),IMG("1515886657613-9f3515b0c78f"),IMG("1542272604-787c3835535d")],sizes:["S","M","L","XL"],category:"Tops",inStock:true,featured:true },
  { id:"p4",slug:"everyday-slim-chinos",name:"Everyday Slim Chinos",tagline:"From desk to dinner",description:"Slim-fit chinos in stone wash. Stretch cotton twill with a soft hand-feel. Clean front, slant pockets, and a tapered leg that works with sneakers or boots. Wrinkle-resistant finish.",price:1799,currency:"INR",images:[IMG("1473966968600-fa801b869a1a"),IMG("1434389677669-e08b4cac3105"),IMG("1490114538077-0a7f8cb49891"),IMG("1516826957135-700dedea698c")],sizes:["28","30","32","34","36"],category:"Bottoms",inStock:true,featured:false },
  { id:"p5",slug:"graphic-art-tee-vol1",name:"Graphic Art Tee Vol. 1",tagline:"Wearable expression",description:"Limited-edition graphic tee featuring original artwork by independent Indian artists. Screen-printed on our signature 240 GSM cotton base. Each print is unique.",price:1499,currency:"INR",images:[IMG("1503341455253-b2e723bb3dbb"),IMG("1529374255404-311a2a4f3fd5"),IMG("1576566588028-4147f3842f27"),IMG("1622470953794-aa9c70b0fb9d")],sizes:["S","M","L","XL","XXL"],category:"Tops",inStock:true,featured:true },
  { id:"p6",slug:"monochrome-zip-jacket",name:"Monochrome Zip Jacket",tagline:"Layer with intent",description:"Lightweight zip-up jacket in matte black. Water-resistant shell with a soft mesh lining. Minimal branding, hidden pockets, and a clean stand collar. Packs into its own pocket for travel.",price:2999,comparePrice:3999,currency:"INR",images:[IMG("1591047139829-d91aecb6caea"),IMG("1544022613-e87ca75a784a"),IMG("1551488831-00ddcb6c6bd3"),IMG("1548712841-f30f0e498523")],sizes:["S","M","L","XL"],category:"Outerwear",inStock:true,featured:true },
];

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug:"terms",title:"Terms of Service",
    content:`<h2>1. Agreement to Terms</h2>
<p>By accessing, browsing, or using this website (intru.in), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, including our <a href="/p/shipping">Shipping</a> and <a href="/p/returns">Store-Credit-only Refund Policy</a>.</p>

<h2>2. Limited Drop Model</h2>
<p>intru.in operates on a limited-drop model. Products are released in small, exclusive batches. Due to the limited nature of our drops, <strong>all sales are final</strong>. We do not offer cash refunds under any circumstances. Approved claims are issued as Store Credit only.</p>

<h2>3. Order Processing</h2>
<p>We strive to process and hand over all orders to our courier partners within a <strong>36-hour window</strong> from the time of order confirmation. Orders placed on weekends or public holidays will be processed on the next business day.</p>

<h2>4. Shipping Disclaimer</h2>
<p>Delivery timelines provided at checkout are estimates only. <strong>intru.in is not responsible for any logistical delays, damages during transit, or failures to deliver caused by the independent delivery partner.</strong> While we will assist you in tracking and resolving delivery issues, the liability for transit-related problems rests with the carrier once the package leaves our facility.</p>

<h2>5. Pricing &amp; Payment</h2>
<p>All product prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. We reserve the right to modify prices at any time without prior notice. Payment is processed securely through Razorpay. We accept UPI, credit/debit cards, net banking, and popular digital wallets.</p>

<h2>6. Store Credit</h2>
<p>Store Credit issued by intru.in is valued at a 1:1 ratio with INR. Store Credit never expires and can be applied to any future purchase on intru.in. Store Credit is non-transferable and cannot be converted to cash.</p>

<h2>7. Intellectual Property</h2>
<p>All content on intru.in &mdash; including text, images, logos, graphics, and product designs &mdash; is our intellectual property and may not be reproduced, distributed, or used without prior written consent.</p>

<h2>8. Limitation of Liability</h2>
<p>intru.in shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the website, purchase of products, or reliance on any information provided. Our total liability shall not exceed the amount paid for the specific product in question.</p>

<h2>9. Governing Law</h2>
<p>These terms are governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>

<h2>10. Changes to Terms</h2>
<p>We reserve the right to update these Terms at any time. Continued use of the website after changes constitutes acceptance of the new Terms.</p>`,
    updatedAt:"2026-02-26"
  },
  {
    slug:"returns",title:"Returns, Exchanges & Refunds",
    content:`<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:32px;font-size:14px;line-height:1.7">
<strong>Important:</strong> intru.in operates on a limited-drop model. All sales are final. We do not offer cash refunds. Approved claims receive Store Credit only.
</div>

<h2>1. Limited Drop Policy</h2>
<p>Due to the exclusive and limited nature of intru.in products, <strong>all sales are final</strong>. We do not offer cash refunds under any circumstances.</p>

<h2>2. Store Credit Only</h2>
<p>In the event that a return or refund is approved by the intru.in team (due to manufacturing defects or damage received), the refund will be issued <strong>exclusively in the form of Store Credit</strong>.</p>
<ul style="margin:12px 0 12px 20px;font-size:15px;color:#525252;line-height:1.8">
<li>Store Credit is issued at a <strong>1:1 value with INR</strong> (e.g., Rs.2999 paid = Rs.2999 store credit)</li>
<li>Store Credit can be used for <strong>any future drop</strong> on our website</li>
<li>Store Credit <strong>never expires</strong></li>
<li>Store Credit is non-transferable and cannot be converted to cash</li>
</ul>

<h2>3. 36-Hour Claim Window</h2>
<p>Customers must raise a request for an exchange or store credit <strong>within 36 hours of receiving the order</strong>. Requests made after this window will not be entertained, no exceptions.</p>
<p>To raise a claim, email <a href="mailto:returns@intru.in" style="text-decoration:underline;font-weight:600">returns@intru.in</a> with:</p>
<ul style="margin:12px 0 12px 20px;font-size:15px;color:#525252;line-height:1.8">
<li>Your order number</li>
<li>Clear photos of the issue (product + packaging)</li>
<li>Brief description of the problem</li>
</ul>

<h2>4. Delivery Liability</h2>
<p>While we process and dispatch all orders within a 36-hour window, <strong>once the package is handed over to our third-party delivery partners, the responsibility for transit delays or delivery issues lies with the carrier.</strong></p>
<p>intru.in is not liable for delays caused by the delivery partner, though we will actively assist you in tracking and resolving issues to the best of our ability.</p>

<h2>5. Eligible Claims</h2>
<p>Store Credit will only be approved for:</p>
<ul style="margin:12px 0 12px 20px;font-size:15px;color:#525252;line-height:1.8">
<li>Manufacturing defects (stitching errors, wrong print, fabric damage)</li>
<li>Wrong item received</li>
<li>Significantly damaged product (with photographic evidence within 36 hours)</li>
</ul>
<p>Store Credit will <strong>NOT</strong> be approved for:</p>
<ul style="margin:12px 0 12px 20px;font-size:15px;color:#525252;line-height:1.8">
<li>Change of mind or wrong size selection</li>
<li>Minor color variations (due to screen differences)</li>
<li>Normal wear and tear</li>
<li>Claims raised after the 36-hour window</li>
</ul>

<h2>6. Exchange Process</h2>
<p>For size exchanges on eligible items, email us within 36 hours. If approved and the replacement size is in stock, we will ship it at no additional cost once the original item is returned to us.</p>

<h2>7. Contact</h2>
<p>For all return and exchange queries: <a href="mailto:returns@intru.in" style="text-decoration:underline;font-weight:600">returns@intru.in</a></p>`,
    updatedAt:"2026-02-26"
  },
  {
    slug:"privacy",title:"Privacy Policy",
    content:`<h2>1. Information We Collect</h2>
<p>We collect information you provide directly: name, email address, phone number, shipping address, and payment details. We also collect browsing data through cookies to improve your experience.</p>

<h2>2. How We Use Your Data</h2>
<p>Your data is used to: process and fulfill orders, communicate order updates and shipping notifications, manage Store Credit balances, personalize your shopping experience, and improve our services. We do not sell your personal information to third parties.</p>

<h2>3. Data Security</h2>
<p>We implement industry-standard encryption (SSL/TLS) and security measures. Payment processing is handled by Razorpay, which is PCI-DSS compliant. We never store your full card details on our servers.</p>

<h2>4. Cookies</h2>
<p>We use essential cookies for cart functionality and session management. Optional analytics cookies help us understand traffic patterns. You can manage cookie preferences through your browser settings.</p>

<h2>5. Third-Party Services</h2>
<p>We use Supabase for authentication and data storage, Razorpay for payment processing, Google for One-Tap sign-in, and analytics services. Each third-party service operates under its own privacy policy.</p>

<h2>6. Your Rights</h2>
<p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:hello@intru.in" style="text-decoration:underline">hello@intru.in</a>.</p>

<h2>7. Updates</h2>
<p>This policy may be updated periodically. Significant changes will be communicated via email or a notice on our website.</p>`,
    updatedAt:"2026-02-26"
  },
  {
    slug:"shipping",title:"Shipping Policy",
    content:`<h2>1. Processing Time</h2>
<p>All orders are processed and handed over to our courier partners within a <strong>36-hour window</strong> from order confirmation (excluding weekends and public holidays).</p>

<h2>2. Delivery Coverage</h2>
<p>We currently ship across India via our third-party delivery partners. International shipping is not available at this time.</p>

<h2>3. Estimated Delivery Times</h2>
<ul style="margin:12px 0 12px 20px;font-size:15px;color:#525252;line-height:1.8">
<li><strong>Metro cities:</strong> 3-5 business days</li>
<li><strong>Tier 2 cities:</strong> 5-7 business days</li>
<li><strong>Remote areas:</strong> 7-10 business days</li>
</ul>
<p><em>Note: These are estimates only. Actual delivery times may vary based on carrier performance, weather, and other factors beyond our control.</em></p>

<h2>4. Shipping Costs</h2>
<ul style="margin:12px 0 12px 20px;font-size:15px;color:#525252;line-height:1.8">
<li>Free shipping on orders above Rs.1,999</li>
<li>Flat Rs.99 shipping fee for orders below Rs.1,999</li>
</ul>

<h2>5. Delivery Liability Disclaimer</h2>
<p><strong>Once the package is handed over to our third-party delivery partner, intru.in is not responsible for transit delays, misdelivery, or carrier-caused damage.</strong> We will, however, assist you in tracking your package and escalating issues with the carrier.</p>

<h2>6. Order Tracking</h2>
<p>A tracking link will be sent to your registered email and phone number once your order ships. You can also track your order from your account dashboard on intru.in.</p>`,
    updatedAt:"2026-02-26"
  },
];

export const STORE_CONFIG = {
  name:"intru.in",
  tagline:"Limited Drops. No Restocks.",
  description:"Born from a shared love for minimalism and everyday style. We craft essential wardrobe pieces that speak through quality, not logos. Limited drops only.",
  currency:"INR",
  currencySymbol:"Rs.",
  freeShippingThreshold:1999,
  shippingCost:99,
  email:"hello@intru.in",
  instagram:"intru.in",
  // Defaults — overridden by env vars in production
  adminPassword:"intru2026admin",
  googleClientId:"YOUR_GOOGLE_CLIENT_ID",
  razorpayKeyId:"YOUR_RAZORPAY_KEY_ID",
};

// ============ Supabase helpers (used in API routes) ============
export function supabaseFetch(url: string, anonKey: string, path: string, options?: RequestInit) {
  return fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options?.headers || {}),
    },
  });
}

// ============ Razorpay helpers (used in API routes) ============
// HMAC-SHA256 using Web Crypto API (available in Cloudflare Workers)
export async function hmacSHA256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create Razorpay order via their REST API (no SDK needed — Workers compatible)
export async function createRazorpayOrder(keyId: string, keySecret: string, amount: number, receipt: string) {
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100, // Razorpay expects paise
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
