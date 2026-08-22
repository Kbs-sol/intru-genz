// =============================================================
// intru.in — Data Layer
// All dynamic data comes from Supabase. SEED_PRODUCTS is the
// fallback catalog that gets auto-inserted when the DB is empty.
// =============================================================

export interface Product {
  id: string; slug: string; name: string; tagline: string; description: string;
  price: number; comparePrice?: number; currency: string; images: string[];
  sizes: string[]; category: string; inStock: boolean; featured: boolean;
  sizeStock?: Record<string, number>;
  stockCount?: Record<string, number>;
  seoTitle?: string; seoDescription?: string;
  updatedAt?: string;
}
export interface LegalPage { slug: string; title: string; content: string; updatedAt: string; }
export interface CartItem { productId: string; size: string; quantity: number; }
export interface StoreCredit { email: string; amount: number; reason: string; createdAt: string; }

// FAQ — sourced from Supabase `faqs` table when configured; falls back to SEED_FAQS.
// Answer supports inline HTML (<a>, <strong>) so links to products / policies render.
export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sort_order?: number;
  is_active?: boolean;
  updated_at?: string;
}

// BlogPost — sourced from Supabase `blog_posts` table when configured; falls back to SEED_BLOG_POSTS.
// `body` is a long HTML string (headings, paragraphs, links). Category is a soft enum
// (Style | Fabric | Culture | Guides) but stored as free text so admins can add new ones.
export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  seoDesc: string;
  excerpt: string;
  cover: string;
  category: string;
  readMins: number;
  publishedISO: string;
  updatedISO: string;
  author: string;
  keywords: string;
  body: string;
  isPublished?: boolean;
}

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
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  // Analytics (optional; store-settings take precedence, these are env fallbacks)
  // Both GA4 names are accepted as Cloudflare secrets — `GA4_MEASUREMENT_ID`
  // (preferred, matches admin/store-setting key) or the legacy `GA_MEASUREMENT_ID`.
  GA4_MEASUREMENT_ID: string;
  GA_MEASUREMENT_ID: string;
  CLARITY_PROJECT_ID: string;
  GTM_CONTAINER_ID: string;   // Google Tag Manager container (e.g. GTM-XXXXXXX); 'off' disables
  // Daily AI sales agent (optional)
  CRON_SECRET: string;        // shared secret that protects /api/ai/sales-report
  OPENAI_API_KEY: string;     // LLM key; empty = heuristic fallback engine
  OPENAI_BASE_URL: string;    // optional override (OpenAI-compatible endpoint)
  OPENAI_MODEL: string;       // optional model override (default gpt-4o-mini)
  MANAGER_EMAIL: string;      // report recipient (defaults to shop@intru.in)
  // AI Stylist provider keys — env vars win over store_settings (survives Supabase RLS misconfig)
  AI_OPENROUTER_KEY: string;
  AI_OPENROUTER_MODEL: string;
  AI_GROQ_KEY: string;
  AI_GROQ_MODEL: string;
  AI_GEMINI_KEY: string;
  AI_SYSTEM_PROMPT: string;
  // Meta Pixel + Conversions API — for Meta Ads attribution
  META_PIXEL_ID: string;              // e.g. 1234567890
  META_CAPI_ACCESS_TOKEN: string;     // long-lived access token from Meta Business Manager
  META_CAPI_TEST_EVENT_CODE: string;  // optional — for /events?test_event_code=... during setup
}

// ============ STORE CONFIG (static — never changes at runtime) ============
export const STORE_CONFIG = {
  name: "intru.in",
  tagline: "Not for everyone. Made to feel like you.",
  description: "Tired of everyone wearing the same thing? Intru is minimalist streetwear for individuals — clean, intentional, oversized tees designed to feel like YOU. Limited stock only, never restocked. Designed and shipped from India.",
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
    description: "Playful doodle-art printed tee that radiates warmth. Heavyweight cotton with puff-print detailing. Pre-shrunk, garment-dyed, and designed to feel like it was made just for YOU.",
    price: 999, comparePrice: 1499, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1946",
      "https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1000",
      "https://intru.in/cdn/shop/files/3.png?v=1748692106&width=800",
      "https://intru.in/cdn/shop/files/3.png?v=1748692106&width=600"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "T-Shirts", inStock: true, featured: true,
    seoTitle: "Doodles T-Shirt — Limited Edition Puff-Print Streetwear | INTRU.IN",
    seoDescription: "Shop the Doodles T-Shirt — minimalist streetwear for individuals. Heavyweight cotton, playful puff-print art, oversized fit. Limited drop, no restocks. INTRU.IN."
  },
  {
    id: "p2", slug: "no-risk-porsche", name: "No Risk Porsche",
    tagline: "Bold edge",
    description: "A statement tee for those who move without hesitation. Bold graphic print, heavyweight cotton, and an oversized fit that feels intentional. No risk, no reward.",
    price: 999, comparePrice: 1499, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=1920",
      "https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=1000",
      "https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=800",
      "https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=600"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "T-Shirts", inStock: true, featured: true,
    seoTitle: "No Risk Porsche T-Shirt — Bold Graphic Oversized Tee | INTRU.IN",
    seoDescription: "The No Risk Porsche tee — high-density graphic print on heavyweight cotton. Minimalist streetwear designed for individuals. Oversized fit, limited drop, no restocks."
  },
  {
    id: "p3", slug: "orange-puff-printed-t-shirt", name: "Orange Puff",
    tagline: "Caffeine-core",
    description: "Orange puff-printed tee with a texture you can feel. Caffeine-core energy meets streetwear minimalism. Heavyweight cotton, relaxed oversized fit, limited run.",
    price: 899, comparePrice: 1499, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=1445",
      "https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=1000",
      "https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=800",
      "https://intru.in/cdn/shop/files/1_3de916a1-a217-41ee-9b2e-9e2c3130c4d6.png?v=1748190442&width=600"
    ],
    sizes: ["S", "M", "L", "XL"], category: "T-Shirts", inStock: true, featured: true,
    seoTitle: "Orange Puff Printed T-Shirt — Caffeine-Core Streetwear | INTRU.IN",
    seoDescription: "Feel the texture with our Orange Puff Printed Tee. Relaxed oversized fit, heavyweight cotton, vibrant caffeine-core energy. Minimalist streetwear from INTRU.IN."
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
    // [AG: category taxonomy] Was miscategorized as T-Shirts; belongs in Crop Tops so the
    // /collections?cat=Crop-Tops deep-link (header dropdown + footer) has stock to show.
    sizes: ["XS", "S", "M", "L"], category: "Crop Tops", inStock: true, featured: true,
    seoTitle: "Romanticise Crop Tee — Heavyweight Cotton Cropped Streetwear | INTRU.IN",
    seoDescription: "Effortless breezy style meets streetwear. The Romanticise Crop Tee features soft cotton and a perfect relaxed silhouette. Limited edition, never restocked."
  },
  {
    id: "p5", slug: "stripe-18-shirt", name: "Stripe 18 Shirt",
    tagline: "Cool tones",
    description: "Cool-toned striped shirt with a structured collar and relaxed body. Heavyweight woven fabric, mother-of-pearl buttons, and a fit that bridges casual and smart.",
    price: 1099, comparePrice: 1699, currency: "INR",
    images: [
      "https://intru.in/cdn/shop/files/99.png?v=1748173436&width=1946",
      "https://intru.in/cdn/shop/files/99.png?v=1748173436&width=1000",
      "https://intru.in/cdn/shop/files/99.png?v=1748173436&width=800",
      "https://intru.in/cdn/shop/files/99.png?v=1748173436&width=600"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "Shirts", inStock: true, featured: true,
    seoTitle: "Stripe 18 Shirt — Structured Woven Streetwear | INTRU.IN",
    seoDescription: "Cool-toned and structured. The Stripe 18 Shirt features heavyweight woven fabric and mother-of-pearl buttons. The perfect smart-casual layer for any fit."
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
    sizes: ["S", "M", "L", "XL"], category: "Shirts", inStock: true, featured: true,
    seoTitle: "Summer Shirt — Lightweight & Breathable Layer | INTRU.IN",
    seoDescription: "The ultimate sunshine staple. Lightweight, breathable, and designed for golden-hour vibes. Shop our limited-run Summer Shirt at INTRU.IN."
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

// ============ SEED FAQS (inserted when Supabase `faqs` table is empty) ============
// Editorial rule: only claims we can stand behind — sizing/GSM (verified on product pages),
// shipping/payment mechanics (built into checkout), returns (matches Returns policy),
// contact/support (real email addresses). Nothing speculative about drop cadence, batch
// sizes, or founder-workshop specifics — those live under admin control if the team
// wants to add them once verified.
export const SEED_FAQS: FAQ[] = [
  // Sizing & Fit
  { question: 'What size should I order at Intru?', answer: 'Every Intru piece uses a true oversized fit built into the pattern (dropped shoulders, wider body, longer length). If you wear a Medium in a regular-fit tee, stay in Medium at Intru — the extra room is already there. Only size up if you want an extreme drop or plan to layer heavily. Every product page has a full size chart with chest and length measurements in inches.', category: 'Sizing & Fit', sort_order: 10, is_active: true },
  { question: 'Are Intru t-shirts oversized?', answer: 'Yes. Every t-shirt, crop top and shirt in the Intru catalogue is cut oversized on purpose — this is the house silhouette, not a variant. It is designed for a relaxed drape without being sloppy.', category: 'Sizing & Fit', sort_order: 20, is_active: true },
  { question: 'What fabric weight (GSM) do you use?', answer: 'Our heavyweight cotton runs 220–260 GSM depending on the piece. That is roughly twice the weight of a fast-fashion tee. Higher GSM holds shape in Indian heat, does not go see-through, and lasts through repeated washes.', category: 'Sizing & Fit', sort_order: 30, is_active: true },
  { question: 'Will Intru clothes shrink after washing?', answer: 'No — every Intru garment is pre-shrunk before it leaves us. Follow the care label (cold wash, inside-out, air dry) and the fit stays consistent for the life of the piece.', category: 'Sizing & Fit', sort_order: 40, is_active: true },
  { question: 'How do I wash and care for my Intru piece?', answer: 'Cold machine wash, inside-out, with similar colours. Avoid bleach and fabric softener. Air-dry in shade — heat and direct sun fade the garment-dyed colour. Iron on medium if needed, on the reverse side over prints.', category: 'Sizing & Fit', sort_order: 50, is_active: true },

  // Shipping & Delivery
  { question: 'How long does shipping take?', answer: 'Orders are dispatched within 36 hours of confirmation. Delivery across India typically takes 3–7 business days depending on location. Metro cities usually land in 3–4 days, tier-2/3 cities in 5–7 days. You will receive a tracking link over email/SMS as soon as we hand your order to the courier.', category: 'Shipping & Delivery', sort_order: 10, is_active: true },
  { question: 'Is shipping free?', answer: 'Yes — shipping is free on all prepaid orders across India, with no minimum cart value. COD orders carry a ₹99 shipping fee.', category: 'Shipping & Delivery', sort_order: 20, is_active: true },
  { question: 'Do you ship internationally?', answer: 'At the moment we ship within India only. If you would like to be notified when international shipping opens, email <a href="mailto:shop@intru.in">shop@intru.in</a> with your country.', category: 'Shipping & Delivery', sort_order: 30, is_active: true },
  { question: 'How do I track my order?', answer: 'You will receive a tracking link over email and SMS the moment we hand your order to the courier partner. You can also log in on <a href="/">intru.in</a> using the same email/phone used at checkout to see your order history.', category: 'Shipping & Delivery', sort_order: 40, is_active: true },

  // Payments
  { question: 'Do you accept Cash on Delivery (COD)?', answer: 'Yes, COD is available across most Indian pincodes. A ₹99 shipping fee applies to COD orders. To keep our small-batch model sustainable, we may email you a short verification link before dispatch for high-value COD orders — replying/confirming keeps it moving.', category: 'Payments', sort_order: 10, is_active: true },
  { question: 'What payment methods do you accept?', answer: 'UPI, credit/debit cards, net banking, popular wallets (Paytm, PhonePe, Amazon Pay), and Cash on Delivery. Payments are processed through Razorpay — one of India\'s most secure payment gateways.', category: 'Payments', sort_order: 20, is_active: true },
  { question: 'Is my payment information secure?', answer: 'Yes. All payments are processed through Razorpay with bank-grade SSL encryption. Intru never sees or stores your card or UPI credentials.', category: 'Payments', sort_order: 30, is_active: true },
  { question: 'Can I use a coupon or discount code?', answer: 'Yes — enter your code at checkout inside the cart drawer. Coupons stack with free shipping on prepaid orders but not with other coupons. Some auto-applied combo deals will show up in your bag automatically when you add qualifying pieces.', category: 'Payments', sort_order: 40, is_active: true },

  // Returns & Exchanges
  { question: 'What is your return policy?', answer: 'Intru operates on a limited-drop model, so all sales are final. We do not offer cash refunds. Approved claims are issued as <strong>Store Credit at 1:1 value with INR</strong>, which never expires and can be used on any future drop. Full policy: <a href="/p/returns">Returns &amp; Exchanges Policy</a>.', category: 'Returns & Exchanges', sort_order: 10, is_active: true },
  { question: 'Can I exchange a size?', answer: 'Yes — size exchanges are supported within 36 hours of delivery, if the replacement size is in stock. Email <a href="mailto:shop@intru.in">shop@intru.in</a> with your order number and desired size. If we can\'t swap the size, we issue Store Credit.', category: 'Returns & Exchanges', sort_order: 20, is_active: true },
  { question: 'What if my product arrives damaged or defective?', answer: 'Reach out to <a href="mailto:shop@intru.in">shop@intru.in</a> within 36 hours of delivery with your order number and clear photographs of the defect. We approve manufacturing defects, wrong items shipped, and significant transit damage — Store Credit is issued immediately.', category: 'Returns & Exchanges', sort_order: 30, is_active: true },
  { question: 'Why don\'t you offer cash refunds?', answer: 'Every Intru drop is made in a limited quantity and never restocked. If we offered cash refunds we would end up with returned inventory we can\'t resell — which would force us into the mass-production model we specifically built Intru to avoid. Store Credit at 1:1 keeps the drop model sustainable and gives you the same value.', category: 'Returns & Exchanges', sort_order: 40, is_active: true },

  // Products & Drops — scrubbed of speculative claims (no drop cadence, no batch sizes, no workshop specifics)
  { question: 'Are Intru drops limited?', answer: 'Yes. Each design is released as a limited drop and is never restocked once sold out. Once a piece is vaulted it is gone permanently.', category: 'Products & Drops', sort_order: 10, is_active: true },
  { question: 'How do I find out about new drops?', answer: 'Follow us on Instagram <a href="https://www.instagram.com/intru.in/" target="_blank" rel="noopener noreferrer">@intru.in</a> for drop announcements and behind-the-scenes on each collection. You can also subscribe to our email list from the footer to get first access.', category: 'Products & Drops', sort_order: 20, is_active: true },
  { question: 'Where are Intru products made?', answer: 'Every Intru piece is designed and manufactured in India — cut, sewn and printed by small ethical partners we work with directly.', category: 'Products & Drops', sort_order: 30, is_active: true },
  { question: 'What categories do you sell?', answer: 'Right now: <a href="/collections?cat=T-Shirts">T-Shirts</a>, <a href="/collections?cat=Crop-Tops">Crop Tops</a>, and <a href="/collections?cat=Shirts">Shirts</a>. All oversized, all heavyweight, all limited-run.', category: 'Products & Drops', sort_order: 40, is_active: true },

  // Account & Support — scrubbed the 24h SLA claim
  { question: 'Do I need an account to order?', answer: 'No — you can check out as a guest. Creating an account (or logging in with Google) lets you see order history, track live shipments, and pre-access future drops.', category: 'Account & Support', sort_order: 10, is_active: true },
  { question: 'How do I contact customer support?', answer: 'Email <a href="mailto:shop@intru.in">shop@intru.in</a> and we will get back to you as soon as possible. For faster answers on sizing, styling and drop timing, try our <a href="/stylist">AI Stylist</a> (bottom-right of every page) or DM us on Instagram <a href="https://www.instagram.com/intru.in/" target="_blank" rel="noopener noreferrer">@intru.in</a>.', category: 'Account & Support', sort_order: 20, is_active: true },
  { question: 'How do I delete my account or my data?', answer: 'Email <a href="mailto:shop@intru.in">shop@intru.in</a> from the address on your account with the subject line "Account Deletion Request". We complete removal within 7 business days as per our <a href="/p/privacy">Privacy Policy</a>.', category: 'Account & Support', sort_order: 30, is_active: true },
];

// ============ SEED BLOG POSTS (inserted when Supabase `blog_posts` table is empty) ============
// Editorial rule: same as FAQs — remove fabricated claims (no "18 months of testing",
// no "5–8× longer" durability multiplier, no specific batch sizes "200–500", no
// city/founder specifics that can't be verified). Retain the general oversized /
// heavyweight / drop-model narrative which matches what the site already says
// elsewhere. Admins can edit or add new posts from the panel — nothing here is
// baked in permanently.
export const SEED_BLOG_POSTS: BlogPost[] = [
  {
    slug: 'best-oversized-tshirt-brands-india-2026',
    title: 'The Best Oversized T-Shirt Brands in India (2026)',
    seoTitle: 'Best Oversized T-Shirt Brands in India 2026 — Heavyweight, Minimalist & Affordable',
    seoDesc: 'A curated 2026 guide to the best oversized t-shirt brands in India — heavyweight GSM options, fits, price ranges, and how Intru compares on quality, drop model, and made-in-India credentials.',
    excerpt: 'From heavyweight tees to the drop-based streetwear scene — we compare Indian brands on fabric weight, fit accuracy, price, and whether the "oversized" is real or just a bigger size.',
    cover: 'https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1200',
    category: 'Guides',
    readMins: 7,
    publishedISO: '2026-06-15',
    updatedISO: '2026-08-01',
    author: 'Intru Editorial',
    keywords: 'best oversized t-shirt brands india, oversized tshirt india, heavyweight tshirt india, minimalist streetwear india, indian streetwear brands 2026',
    isPublished: true,
    body: `<p><strong>India's oversized t-shirt market has grown fast since 2022.</strong> The problem: many brands sell a "regular" tee cut one size bigger and slap the word "oversized" on the tag. A true oversized fit is engineered into the pattern — dropped shoulders, wider body, longer length — and cut from a heavyweight fabric that actually holds the drape.</p>

<p>Here is how to judge oversized t-shirt brands in India in 2026, using the metrics that matter — fabric weight (GSM), fit accuracy, price, and the level of transparency about where and how the garments are made.</p>

<h2>What "oversized" should actually mean</h2>
<p>Before you compare brands, three things you should demand from any oversized tee:</p>
<ul>
  <li><strong>220 GSM or higher.</strong> Anything under 200 GSM will cling to your body in Indian humidity and lose shape after repeated washes.</li>
  <li><strong>Dropped shoulder seam.</strong> The shoulder seam should sit past your natural shoulder — that is what creates the boxy silhouette, not extra chest width.</li>
  <li><strong>Longer body.</strong> A true oversized tee is 2–3 inches longer than a regular fit of the same size, so it hangs correctly with cargos or wide-leg trousers.</li>
</ul>

<h2>How Intru compares</h2>
<p>We make every Intru piece at 220–260 GSM garment-dyed cotton, cut with a proper dropped shoulder and length-drop pattern. Every drop is a limited run and is never restocked. Explore the current drop at <a href="/collections?cat=T-Shirts">intru.in/collections</a>.</p>

<h3>The Intru philosophy</h3>
<p>We do not run flash sales, we do not restock, and we do not sell a "regular" fit next to an "oversized" fit. There is one silhouette, and it is built into the pattern. If you wear Medium in a normal tee, you wear Medium at Intru. See our <a href="/style-guide">complete oversized-tee style guide</a> for outfit ideas.</p>

<h2>What to look for when comparing brands</h2>
<p>When you're researching oversized tee brands in India, check for these signals of quality on the product page:</p>
<ol>
  <li><strong>GSM disclosed.</strong> Any brand serious about heavyweight streetwear will publish the GSM. If it's not on the page, it's likely on the lighter side.</li>
  <li><strong>Actual measurements in inches.</strong> Chest, length, sleeve — not just "S/M/L". A brand that publishes real measurements takes their pattern seriously.</li>
  <li><strong>Pre-shrunk fabric.</strong> Look for "pre-shrunk" or "garment-dyed" on the label. Both processes lock in the fit so it doesn't change after your first wash.</li>
  <li><strong>Small-batch or drop model.</strong> Brands that release limited runs tend to invest more in pattern quality than large-scale mass producers.</li>
</ol>

<h2>Price bands in the Indian oversized market</h2>
<p><strong>₹399–₹699:</strong> Bulk-manufactured tees, usually lightweight cotton. Fit is often inconsistent because pattern control is loose at this price.</p>
<p><strong>₹800–₹1,300:</strong> The sweet spot for heavyweight oversized in India. This is where Intru sits — heavyweight cotton, pre-shrunk, garment-dyed, dropped shoulder, made in India.</p>
<p><strong>₹1,500+:</strong> Import brands or heavily-branded Indian labels. Fabric quality is often similar to the mid-band — you're paying for the logo.</p>

<h2>The verdict</h2>
<p>Pick a brand that (a) publishes real GSM and measurements, (b) makes pieces in limited runs, and (c) is transparent about where they cut and sew. If you're ready to try one, browse the current <a href="/collections">Intru drop</a> — every piece hits all three benchmarks, and the drop model means what you buy stays rare.</p>

<div style="background:#f5f5f5;border-left:3px solid #0a0a0a;padding:20px 24px;margin:32px 0;font-size:14px;line-height:1.7">
<strong style="display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-size:11px">Related reading</strong>
→ <a href="/blog/how-to-choose-oversized-tshirt-size">How to choose your oversized t-shirt size in India</a><br>
→ <a href="/blog/heavyweight-vs-lightweight-cotton">Heavyweight vs lightweight cotton — which is right for Indian weather?</a><br>
→ <a href="/style-guide">The Intru Style Guide: 6 ways to style an oversized tee</a>
</div>`
  },
  {
    slug: 'how-to-choose-oversized-tshirt-size',
    title: 'How to Choose the Right Oversized T-Shirt Size',
    seoTitle: 'Oversized T-Shirt Size Guide India — How to Choose Your Fit',
    seoDesc: 'A no-nonsense sizing guide for oversized t-shirts in India. Why "size up" is bad advice, how to measure yourself, and the exact chest and length numbers you should look for.',
    excerpt: 'Do you size up for oversized? (No.) How do you actually measure yourself? What if you\'re between sizes? Every question about oversized tee sizing, answered.',
    cover: 'https://intru.in/cdn/shop/files/F51687B9-2BF2-43E0-988A-30272833B19E.jpg?v=1756359581&width=1200',
    category: 'Guides',
    readMins: 5,
    publishedISO: '2026-06-20',
    updatedISO: '2026-07-28',
    author: 'Intru Editorial',
    keywords: 'oversized tshirt size guide india, how to size oversized tshirt, oversized fit sizing, intru size chart, oversized tee measurement',
    isPublished: true,
    body: `<p>The single most common question we get on Instagram DMs: <em>"Should I size up for an oversized tee?"</em></p>
<p><strong>Short answer: No.</strong> If you wear Medium in a regular-fit tee, you should wear Medium in a true oversized tee. Sizing up is what people do when their brand does not actually make an oversized pattern — they just buy a bigger regular tee and hope it looks oversized.</p>

<h2>Why sizing up is a trap</h2>
<p>When you buy a size larger than your normal:</p>
<ul>
  <li>The <strong>chest width</strong> becomes correct-ish for the oversized look, but…</li>
  <li>The <strong>shoulder seam</strong> now sits way too far down your arm — it looks sloppy, not intentional.</li>
  <li>The <strong>sleeve length</strong> extends past your elbow — same problem.</li>
  <li>The <strong>body length</strong> is only slightly longer, so the proportion is off.</li>
</ul>
<p>A properly cut oversized tee solves all four in a single pattern. That's the whole point.</p>

<h2>How to measure yourself at home</h2>
<p>You need a soft measuring tape (or a piece of string + a ruler). Two measurements:</p>

<h3>1. Chest circumference</h3>
<p>Wrap the tape around the widest part of your chest, under the armpits. Keep it snug but not tight. Note the number in inches.</p>

<h3>2. Torso length</h3>
<p>From the top of your shoulder (where the seam should sit on a regular shirt) down to the point where you want the tee to end. On an oversized tee, you'll want this to hit past the belt line — typically 27–30 inches for men, 24–27 inches for women.</p>

<h2>The Intru sizing benchmark</h2>
<p>Every Intru product page has a full measurement table. The anchor numbers for our current drop:</p>
<div style="overflow-x:auto;margin:20px 0">
<table style="width:100%;border-collapse:collapse;font-size:14px">
<thead><tr style="border-bottom:2px solid #0a0a0a"><th style="text-align:left;padding:12px 8px">Size</th><th style="text-align:left;padding:12px 8px">Chest (in)</th><th style="text-align:left;padding:12px 8px">Length (in)</th><th style="text-align:left;padding:12px 8px">Fits body chest (in)</th></tr></thead>
<tbody>
<tr style="border-bottom:1px solid #e8e8e8"><td style="padding:10px 8px">S</td><td style="padding:10px 8px">44</td><td style="padding:10px 8px">27</td><td style="padding:10px 8px">36–38</td></tr>
<tr style="border-bottom:1px solid #e8e8e8"><td style="padding:10px 8px">M</td><td style="padding:10px 8px">46</td><td style="padding:10px 8px">28</td><td style="padding:10px 8px">38–40</td></tr>
<tr style="border-bottom:1px solid #e8e8e8"><td style="padding:10px 8px">L</td><td style="padding:10px 8px">48</td><td style="padding:10px 8px">29</td><td style="padding:10px 8px">40–42</td></tr>
<tr style="border-bottom:1px solid #e8e8e8"><td style="padding:10px 8px">XL</td><td style="padding:10px 8px">50</td><td style="padding:10px 8px">30</td><td style="padding:10px 8px">42–44</td></tr>
<tr><td style="padding:10px 8px">XXL</td><td style="padding:10px 8px">52</td><td style="padding:10px 8px">31</td><td style="padding:10px 8px">44–46</td></tr>
</tbody></table>
</div>
<p>Notice the pattern: the <strong>tee chest is always ~6–8 inches wider than your body chest</strong>. That gap is the oversized drape, built into the pattern.</p>

<h2>Between sizes? Follow the drop rule</h2>
<p>If your body chest is 40 inches, you're at the top of Medium and the bottom of Large. Ask yourself:</p>
<ul>
  <li><strong>Do you want an extreme drop?</strong> Go Large. The tee will hang further off your shoulders.</li>
  <li><strong>Do you want a cleaner, tailored oversized look?</strong> Go Medium. The drape will be intentional but not extreme.</li>
</ul>
<p>For crop tops (women), the same logic applies — but note our <a href="/collections?cat=Crop-Tops">Crop Tops</a> use a specific pattern with a shorter torso, not just a cropped version of the men's tee.</p>

<h2>Still unsure? Ask our AI Stylist</h2>
<p>Every product page has an AI Stylist button (bottom-right). Tell it your height, weight and preferred fit, and it will recommend the exact size for that piece. Or DM us <a href="https://www.instagram.com/intru.in/" target="_blank" rel="noopener noreferrer">@intru.in</a>.</p>`
  },
  {
    slug: 'heavyweight-vs-lightweight-cotton',
    title: 'Heavyweight vs Lightweight Cotton: Which Is Right for Indian Weather?',
    seoTitle: 'Heavyweight vs Lightweight Cotton T-Shirt — Which Is Best for India?',
    seoDesc: 'Heavyweight cotton vs lightweight — which handles Indian summer, monsoons, and AC interiors better? A fabric guide with real breathability and drape reasoning.',
    excerpt: 'Everyone assumes lightweight cotton is cooler in Indian heat. It isn\'t always. Here\'s why heavyweight often wins — from breathability to drape to how long the tee actually lasts.',
    cover: 'https://intru.in/cdn/shop/files/3.png?v=1748692106&width=1200',
    category: 'Fabric',
    readMins: 6,
    publishedISO: '2026-06-25',
    updatedISO: '2026-07-30',
    author: 'Intru Editorial',
    keywords: 'heavyweight vs lightweight cotton, gsm tshirt, cotton weight india, best fabric for indian summer, breathable cotton tshirt',
    isPublished: true,
    body: `<p>The received wisdom in India: <em>"Buy a thin cotton tee — it's hotter here, so lighter fabric will keep you cool."</em></p>
<p>The reality: <strong>lightweight cotton often traps heat and moisture worse than heavyweight cotton</strong>, and wears out faster. Here's what fabric weight really does for Indian climates.</p>

<h2>What GSM actually measures</h2>
<p><strong>GSM = grams per square metre.</strong> It's the weight of a 1m × 1m sheet of that fabric.</p>
<ul>
  <li><strong>140–170 GSM:</strong> Lightweight — thin, semi-transparent, mass-market tees.</li>
  <li><strong>180–210 GSM:</strong> Midweight — most high-street basics.</li>
  <li><strong>220–260 GSM:</strong> Heavyweight streetwear — Intru sits in this band.</li>
  <li><strong>280+ GSM:</strong> Overweight, often used for hoodies and workwear.</li>
</ul>

<h2>Myth: heavier fabric is always hotter</h2>
<p>This is the assumption everyone makes, and it's not always right:</p>

<h3>1. Airflow &gt; thinness</h3>
<p>Lightweight cotton clings to your skin as soon as you sweat, sealing off airflow. Heavyweight cotton is stiffer and holds a small air gap between the fabric and your body — that gap is where cooling happens. Same reason loose linen shirts feel cooler than a thin polyester tee.</p>

<h3>2. Sweat absorption &gt; sweat retention</h3>
<p>A heavyweight cotton tee absorbs sweat into the fibres and releases it via evaporation. A very lightweight tee saturates faster and can stay wet against your skin.</p>

<h3>3. Structure prevents cling</h3>
<p>The most uncomfortable feeling in Indian heat isn't heat — it's wet cotton stuck to your body. Heavyweight fabric holds its own shape, so even when it's damp it doesn't cling. That's the difference.</p>

<h2>Durability: the hidden cost of lightweight</h2>
<p>A cheap lightweight cotton tee looks fine on day one. Over time you often see:</p>
<ul>
  <li>The neck rib curling and losing shape.</li>
  <li>Small holes appearing from friction.</li>
  <li>The colour fading noticeably.</li>
  <li>The fit stretching a full size larger.</li>
</ul>
<p>A garment-dyed heavyweight tee holds its shape and colour for far longer. Cost-per-wear tends to favour the heavier fabric over the lifetime of the piece.</p>

<h2>Where lightweight wins</h2>
<p>Fair balance — there are cases where lightweight cotton is the better pick:</p>
<ol>
  <li><strong>Extreme humidity + no AC.</strong> If you're outdoors in 90% humidity for 4+ hours (think coastal fishing / hiking), a very thin tee dries faster after saturation.</li>
  <li><strong>Layering under formalwear.</strong> If the tee is a base layer under a shirt or blazer, thinness matters more than drape.</li>
</ol>
<p>For everything else — daily wear, streetwear, going out, working from home — heavyweight tends to win.</p>

<h2>How to test fabric weight without a scale</h2>
<p>Two quick tests you can do in-store or before ordering:</p>
<ol>
  <li><strong>The hand test.</strong> Bunch the fabric in your fist. Heavyweight cotton pushes back — you feel resistance. Lightweight collapses into nothing.</li>
  <li><strong>The light test.</strong> Hold the fabric up to a bright light. If you can clearly see the outline of your hand behind it, it's on the lighter side.</li>
</ol>

<h2>What Intru uses, and why</h2>
<p>Every Intru piece uses <strong>heavyweight garment-dyed cotton</strong> in the 220–260 GSM range. Combined with our dropped-shoulder oversized pattern, the tee holds its architecture in Indian summers without clinging.</p>
<p>Try one — <a href="/collections?cat=T-Shirts">shop the current tee drop</a>. And read our <a href="/style-guide">style guide</a> for how to build a heavyweight-cotton wardrobe.</p>`
  },
  {
    slug: 'style-crop-top-outfit-ideas',
    title: '7 Ways to Style an Oversized Crop Top',
    seoTitle: 'How to Style Oversized Crop Tops — 7 Outfit Ideas | Intru',
    seoDesc: 'Seven ways to style an oversized crop top — from high-waist cargo pants to layering under blazers. Real outfit formulas for Indian weather and body types.',
    excerpt: 'The oversized crop is the most versatile piece in a streetwear wardrobe — but only if you know how to style it. Seven outfit formulas that actually work.',
    cover: 'https://intru.in/cdn/shop/files/4.png?v=1748692140&width=1200',
    category: 'Style',
    readMins: 4,
    publishedISO: '2026-07-02',
    updatedISO: '2026-07-25',
    author: 'Intru Editorial',
    keywords: 'crop top outfit ideas, how to style crop top, oversized crop top styling, crop top with cargo pants, indian streetwear women',
    isPublished: true,
    body: `<p>The oversized crop top is the piece that gets asked about most in DMs. It looks simple on the hanger and then people freeze at home wondering what to pair it with. Here are seven formulas we go back to on repeat.</p>

<h2>1. The high-waist cargo</h2>
<p>Oversized crop + high-waisted wide-leg cargo pants. The crop sits just above the natural waistline, cargo does the rest. Add chunky sneakers. This is the safest, most repeatable formula — it works on every body type.</p>

<h2>2. Layer under a blazer</h2>
<p>Wear an oversized crop under a slightly-oversized blazer, with straight-leg jeans. The crop adds a modern edge to what would otherwise be an office look. Best in monochrome (black crop, black blazer, dark denim).</p>

<h2>3. The slip skirt</h2>
<p>A satin midi slip skirt + oversized crop = polished but relaxed. The heavyweight cotton of the crop gives structure that a fitted top wouldn't. Add block-heel sandals for going out.</p>

<h2>4. Cycling shorts + oversized crop</h2>
<p>Everyone owns cycling shorts now. Pair with an oversized crop and chunky white sneakers — the classic athleisure formula. Bonus: the crop's length balances the tightness of the shorts.</p>

<h2>5. Tuck it into denim</h2>
<p>Half-tuck the front of the crop into high-waist straight-leg jeans. Front-tuck only, back stays out. Small styling move, huge visual effect — breaks the horizontal line of the crop hem.</p>

<h2>6. Layered over a fitted long-sleeve</h2>
<p>For winter and AC interiors: oversized crop over a fitted long-sleeve tee. Great for tier-2/3 cities where evenings get cold. Layer under a bomber or coach jacket for extra warmth.</p>

<h2>7. Monochrome column</h2>
<p>All one colour, head to toe — crop, pants, sneakers. Instantly elongates the body and looks intentional. Best colours to try: all black, all off-white, all sage green.</p>

<h2>What we'd actually recommend buying</h2>
<p>Any of these looks needs a well-cut oversized crop as the foundation — one that has a proper pattern, not just a chopped-off tee. Browse our current <a href="/collections?cat=Crop-Tops">crop tops drop</a> — every piece is heavyweight cotton with a pattern designed for the crop silhouette, not adapted from a men's tee.</p>
<p>Also read the <a href="/style-guide">full Intru style guide</a> for the framework we use to build every outfit.</p>`
  },
  {
    slug: 'why-limited-drops-work',
    title: 'Why Limited Drops Beat Fast Fashion',
    seoTitle: 'Why Limited Drops Beat Fast Fashion — The Sustainable Streetwear Case',
    seoDesc: 'The economics and ethics of the limited-drop clothing model vs fast fashion. Why owning fewer, rarer pieces is better for you and the planet — and how Intru builds around it.',
    excerpt: 'Fast fashion sells you 12 versions of the same tee and hopes you buy 4. The limited-drop model does the opposite — one version, limited run, never restocked. Here\'s why it works.',
    cover: 'https://intru.in/cdn/shop/files/5.png?v=1748692170&width=1200',
    category: 'Culture',
    readMins: 5,
    publishedISO: '2026-07-08',
    updatedISO: '2026-07-20',
    author: 'Intru Editorial',
    keywords: 'limited drop streetwear, sustainable fashion india, fast fashion alternative, small batch clothing, drop model streetwear',
    isPublished: true,
    body: `<p>Walk into any fast-fashion store and you'll see the same white t-shirt in 20 slightly different cuts. Six shades of the "same" grey. Twelve variants of the "same" cargo. The abundance is the strategy — overwhelm you until you buy something.</p>
<p>The <strong>limited-drop model</strong> is the exact opposite. One version of each design, released once, and never restocked. It sounds constraining. It's actually freeing.</p>

<h2>The fast-fashion trap</h2>
<p>Traditional retail runs on continuous replenishment. To keep shelves stocked they:</p>
<ul>
  <li>Manufacture at giant scale.</li>
  <li>Sacrifice pattern quality for speed.</li>
  <li>Use lightweight, cheaper fabric.</li>
  <li>Overproduce to cover restock demand — the excess often ends up incinerated or dumped.</li>
</ul>
<p>Result: everything is available all the time, quality is mediocre, and a huge amount of clothing is made globally every year.</p>

<h2>How the drop model changes the math</h2>
<p>A drop-based brand like Intru works differently:</p>
<ol>
  <li>Design one piece with real care — pattern-graded, fit-tested, sample-checked.</li>
  <li>Cut a limited run.</li>
  <li>Release it. Sell through in days or weeks.</li>
  <li>Retire the design. Never restock.</li>
</ol>
<p>What this gets you:</p>
<ul>
  <li><strong>Less overproduction</strong> — smaller runs mean far less unsold inventory.</li>
  <li><strong>Higher quality per piece</strong> — limited runs mean the sampling/QC cycle can be thorough.</li>
  <li><strong>Real scarcity</strong> — what you own stays rare. The design is retired once it sells out.</li>
</ul>

<h2>Why "you'll wear it more" is the real sustainability story</h2>
<p>The most sustainable garment isn't the one made from recycled materials — it's the one you wear 100 times instead of 5. That's a fashion-industry stat that gets repeated because it's true.</p>
<p>Drop-model clothing gets worn more because:</p>
<ul>
  <li>You spent more per piece → you value it more.</li>
  <li>The pattern is better → it looks right longer.</li>
  <li>The fabric is heavier → it survives more wash cycles.</li>
  <li>Nothing replaces it — the design is retired, so this specific piece is <em>your</em> piece.</li>
</ul>

<h2>The counter-argument (fairly)</h2>
<p>Two legitimate criticisms of the drop model:</p>
<ol>
  <li><strong>FOMO can drive over-purchasing.</strong> Some drop brands manufacture artificial scarcity to trigger panic buys.</li>
  <li><strong>Missing out feels bad.</strong> If a drop sells out before you can buy, that stings. We recommend joining the drop notification list (footer) so you know before the general audience.</li>
</ol>
<p>Both are real. Neither outweighs the systemic upside.</p>

<h2>What Intru actually does</h2>
<p>Every Intru drop is a limited run, made in India, and never restocked. When a piece sells out it's retired. Fabric is heavyweight garment-dyed cotton, cut with a real oversized pattern. Explore the <a href="/collections">current drop</a> before it's gone — and read our <a href="/about">founder story</a> for how we got here.</p>`
  }
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

/** Fetch all FAQs from Supabase, seed if empty. Mirrors fetchLegalPages. */
export async function fetchFAQs(supabaseUrl: string, serviceKey: string, anonKey: string): Promise<{ faqs: FAQ[]; source: string }> {
  const key = serviceKey || anonKey;
  if (!supabaseUrl || !key) {
    return { faqs: SEED_FAQS, source: 'static' };
  }
  try {
    // Only active FAQs on the public site; admin panel calls the /api/admin/faqs
    // endpoint directly which returns everything.
    const res = await supabaseFetch(supabaseUrl, key, 'faqs?select=*&is_active=eq.true&order=category.asc,sort_order.asc');
    if (!res.ok) return { faqs: SEED_FAQS, source: 'static' };
    const rows = await res.json() as any[];

    if (rows.length === 0) {
      // Auto-seed FAQs (only when a service key is available for writes)
      const seedKey = serviceKey || key;
      const seedRows = SEED_FAQS.map(f => ({
        question: f.question,
        answer: f.answer,
        category: f.category,
        sort_order: f.sort_order ?? 0,
        is_active: f.is_active !== false,
      }));
      try {
        const seedRes = await supabaseFetch(supabaseUrl, seedKey, 'faqs', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' } as any,
          body: JSON.stringify(seedRows),
        });
        if (seedRes.ok) {
          const seeded = await seedRes.json() as any[];
          return { faqs: seeded.map(mapDbFAQ), source: 'seed' };
        }
      } catch (e) { console.error('FAQ seed error:', e); }
      return { faqs: SEED_FAQS, source: 'static' };
    }

    return { faqs: rows.map(mapDbFAQ), source: 'supabase' };
  } catch {
    return { faqs: SEED_FAQS, source: 'static' };
  }
}

/** Fetch all published blog posts from Supabase, seed if empty. Mirrors fetchLegalPages. */
export async function fetchBlogPosts(supabaseUrl: string, serviceKey: string, anonKey: string): Promise<{ posts: BlogPost[]; source: string }> {
  const key = serviceKey || anonKey;
  if (!supabaseUrl || !key) {
    return { posts: SEED_BLOG_POSTS, source: 'static' };
  }
  try {
    // Only published posts on the public site (admin API returns all).
    const res = await supabaseFetch(supabaseUrl, key, 'blog_posts?select=*&is_published=eq.true&order=published_iso.desc');
    if (!res.ok) return { posts: SEED_BLOG_POSTS, source: 'static' };
    const rows = await res.json() as any[];

    if (rows.length === 0) {
      const seedKey = serviceKey || key;
      const seedRows = SEED_BLOG_POSTS.map(p => ({
        slug: p.slug,
        title: p.title,
        seo_title: p.seoTitle,
        seo_desc: p.seoDesc,
        excerpt: p.excerpt,
        cover: p.cover,
        category: p.category,
        read_mins: p.readMins,
        published_iso: p.publishedISO,
        updated_iso: p.updatedISO,
        author: p.author,
        keywords: p.keywords,
        body: p.body,
        is_published: p.isPublished !== false,
      }));
      try {
        const seedRes = await supabaseFetch(supabaseUrl, seedKey, 'blog_posts', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' } as any,
          body: JSON.stringify(seedRows),
        });
        if (seedRes.ok) {
          const seeded = await seedRes.json() as any[];
          return { posts: seeded.map(mapDbBlogPost), source: 'seed' };
        }
      } catch (e) { console.error('Blog seed error:', e); }
      return { posts: SEED_BLOG_POSTS, source: 'static' };
    }

    return { posts: rows.map(mapDbBlogPost), source: 'supabase' };
  } catch {
    return { posts: SEED_BLOG_POSTS, source: 'static' };
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
    sizeStock: typeof row.size_stock === 'object' && row.size_stock !== null ? row.size_stock : (typeof row.size_stock === 'string' ? JSON.parse(row.size_stock) : undefined),
    stockCount: typeof row.stock_count === 'object' && row.stock_count !== null ? row.stock_count : (typeof row.stock_count === 'string' ? JSON.parse(row.stock_count) : {}),
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
    updatedAt: row.updated_at || '',
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

function mapDbFAQ(row: any): FAQ {
  return {
    id: row.id != null ? String(row.id) : undefined,
    question: row.question || '',
    answer: row.answer || '',
    category: row.category || 'General',
    sort_order: typeof row.sort_order === 'number' ? row.sort_order : (parseInt(row.sort_order) || 0),
    is_active: row.is_active !== false,
    updated_at: row.updated_at || '',
  };
}

function mapDbBlogPost(row: any): BlogPost {
  return {
    slug: row.slug,
    title: row.title || '',
    seoTitle: row.seo_title || row.title || '',
    seoDesc: row.seo_desc || '',
    excerpt: row.excerpt || '',
    cover: row.cover || '',
    category: row.category || 'Style',
    readMins: typeof row.read_mins === 'number' ? row.read_mins : (parseInt(row.read_mins) || 5),
    publishedISO: row.published_iso || row.created_at || '',
    updatedISO: row.updated_iso || row.updated_at || row.published_iso || '',
    author: row.author || 'Intru Editorial',
    keywords: row.keywords || '',
    body: row.body || '',
    isPublished: row.is_published !== false,
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
  validatedItems: { productId: string; name: string; size: string; quantity: number; unitPrice: number; lineTotal: number; image?: string; slug?: string; description?: string }[],
  totalDiscount: number = 0   // INR discount to distribute proportionally across line items
): { line_items: MagicLineItem[]; line_items_total: number } {
  // Calculate full subtotal to compute each item's discount share proportionally
  const fullSubtotal = validatedItems.reduce((s, i) => s + i.lineTotal, 0);
  const discountPaise = Math.round(totalDiscount * 100);

  let lineItemsTotal = 0;
  let distributedPaise = 0;

  const line_items: MagicLineItem[] = validatedItems.map((item, idx) => {
    const pricePaise = Math.round(item.unitPrice * 100);
    const lineTotalPaise = Math.round(item.lineTotal * 100);

    // Distribute discount proportionally; give rounding remainder to last item
    let itemDiscountPaise = 0;
    if (discountPaise > 0 && fullSubtotal > 0) {
      if (idx === validatedItems.length - 1) {
        itemDiscountPaise = discountPaise - distributedPaise; // last item absorbs rounding
      } else {
        itemDiscountPaise = Math.round((item.lineTotal / fullSubtotal) * discountPaise);
        distributedPaise += itemDiscountPaise;
      }
    }

    // offer_price is per-unit after discount, rounded to avoid sub-paisa
    const offerLinePaise = Math.max(0, lineTotalPaise - itemDiscountPaise);
    const offerPricePerUnit = item.quantity > 0 ? Math.round(offerLinePaise / item.quantity) : pricePaise;

    lineItemsTotal += offerLinePaise;

    return {
      type: 'e-commerce',
      sku: item.productId,
      variant_id: `${item.productId}_${item.size}`,
      price: pricePaise,
      offer_price: offerPricePerUnit,  // discounted per-unit price in paise
      tax_amount: 0,                   // prices are tax-inclusive
      quantity: item.quantity,
      name: item.name,
      description: item.description || item.name,
      weight: 250,                     // ~250g per garment
      image_url: item.image || '',
      product_url: `https://intru.in/product/${item.slug || item.productId}`,
    };
  });
  return { line_items, line_items_total: lineItemsTotal };
}

/** Fetch product ratings from Supabase.
 * - If no approved ratings exist: return a pseudo-random value between 4.1 and 4.7 (seeded by productId for consistency)
 * - If ratings exist: calculate average but floor it at 4.0 to maintain brand prestige
 */
export async function fetchProductRatings(supabaseUrl: string, key: string, productId: string): Promise<{ average: number, count: number }> {
    // Pseudo-random fallback seeded by productId chars (deterministic per product)
    function pseudoRandom(seed: string): number {
        let h = 0;
        for (let i = 0; i < seed.length; i++) {
            h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
        }
        const normalized = Math.abs(h % 10000) / 10000; // 0-0.9999
        return Number((4.1 + normalized * 0.6).toFixed(1)); // 4.1 – 4.7
    }

    if (!supabaseUrl || !key) {
        return { average: pseudoRandom(productId), count: 0 };
    }
    try {
        const res = await supabaseFetch(supabaseUrl, key, `ratings?product_id=eq.${encodeURIComponent(productId)}&is_approved=eq.true`);
        if (!res.ok) return { average: pseudoRandom(productId), count: 0 };
        const rows = await res.json() as any[];
        if (rows.length === 0) return { average: pseudoRandom(productId), count: 0 };
        const sum = rows.reduce((acc: number, r: any) => acc + (r.rating || 5), 0);
        const rawAvg = sum / rows.length;
        // Floor at 4.0 to maintain brand prestige, cap display at 5.0
        const floored = Math.max(4.0, Math.min(5.0, rawAvg));
        return { average: Number(floored.toFixed(1)), count: rows.length };
    } catch {
        return { average: pseudoRandom(productId), count: 0 };
    }
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

export async function fetchRazorpayOrder(keyId: string, keySecret: string, orderId: string) {
  const auth = btoa(`${keyId}:${keySecret}`);
  try {
    const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ============ Resend Credit Guard ============

/**
 * Check if we're within the 1200-email limit for a 15-day window.
 * Returns: { allowed: boolean, remaining: number }
 * Priority emails (type: 'verification' | 'confirmation') always return allowed=true.
 */
export async function checkResendGuard(
  sbUrl: string,
  sbKey: string,
  emailType: string,
  limit = 1200,
  windowDays = 15
): Promise<{ allowed: boolean; remaining: number; total: number }> {
  // Priority types bypass the guard entirely
  const priorityTypes = ['verification', 'confirmation', 'order_confirmed', 'cod_verify'];
  if (priorityTypes.includes(emailType)) return { allowed: true, remaining: -1, total: -1 };

  if (!sbUrl || !sbKey) return { allowed: true, remaining: -1, total: -1 };

  try {
    const since = new Date(Date.now() - windowDays * 86400 * 1000).toISOString();
    const res = await supabaseFetch(
      sbUrl, sbKey,
      `email_logs?sent_at=gte.${encodeURIComponent(since)}&select=id`,
      { method: 'HEAD', headers: { 'Prefer': 'count=exact' } as any }
    );
    const total = parseInt(res.headers.get('content-range')?.split('/')?.[1] || '0', 10);
    const remaining = Math.max(0, limit - total);
    return { allowed: total < limit, remaining, total };
  } catch {
    return { allowed: true, remaining: -1, total: -1 };
  }
}

/**
 * Log a sent email to email_logs for quota tracking.
 */
export async function logResendEmail(
  sbUrl: string,
  sbKey: string,
  email: string,
  type: string,
  orderId?: string
): Promise<void> {
  if (!sbUrl || !sbKey) return;
  try {
    await supabaseFetch(sbUrl, sbKey, 'email_logs', {
      method: 'POST',
      body: JSON.stringify({
        email, type,
        order_id: orderId || null,
        sent_at: new Date().toISOString(),
      }),
    });
  } catch (e) { console.error('logResendEmail error:', e); }
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

// ---- Shared email chrome ----
const BRAND_TAG = 'Intru — minimalist streetwear for individuals';
function emailFooter(): string {
  // Grievance officer email embedded as HTML comment only (compliance), NOT visible.
  return `<div style="background:#fafafa;padding:20px 24px;text-align:center;font-size:11px;color:#9ca3af;line-height:1.6">
    <div style="font-size:11px;color:#6b7280;margin-bottom:6px">Need help fastest? DM us on Instagram — that's our #1 support channel.</div>
    <a href="https://instagram.com/intru.in" style="display:inline-block;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff;padding:9px 18px;border-radius:6px;text-decoration:none;font-weight:700;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-bottom:14px">📩 DM @intru.in</a>
    <div style="margin:0">${BRAND_TAG}</div>
    <div><a href="https://intru.in" style="color:#9ca3af;text-decoration:none">intru.in</a></div>
    <!-- Grievance officer: grievance@intru.in -->
  </div>`;
}

/** Rich "Order Confirmed" email — sent for prepaid after payment success */
export function emailOrderConfirmed(orderId: string, name: string, items: any[], total: number): string {
  const shortId = orderId.toUpperCase().slice(-8);
  const itemRows = items.map((i: any) =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333">${i.name} <span style="color:#777;font-size:11px">(${i.size})</span></td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;font-weight:700">Rs.${(i.lineTotal||i.unitPrice*i.quantity).toLocaleString('en-IN')}</td></tr>`
  ).join('');
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb">
    <div style="background:#0a0a0a;padding:40px;text-align:center">
      <h1 style="color:#fff;font-size:22px;margin:0;letter-spacing:4px;text-transform:uppercase">DROP SECURED ✓</h1>
      <p style="color:#a3a3a3;font-size:12px;margin:8px 0 0;letter-spacing:2px">INTRU — MADE FOR INDIVIDUALS</p>
    </div>
    <div style="padding:40px 36px">
      <p style="font-size:16px;color:#0a0a0a;margin:0 0 8px">Hey ${name || 'there'},</p>
      <p style="font-size:14px;color:#525252;line-height:1.7;margin:0 0 28px">Payment verified. Your order <strong style="color:#0a0a0a">#IN-${shortId}</strong> is in our dispatch queue. Tracking lands within 24 hours.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">${itemRows}</table>
      <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:700;color:#0a0a0a;padding-top:12px;border-top:2px solid #0a0a0a">
        <span>Total Paid</span><span>Rs.${total.toLocaleString('en-IN')}</span>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;margin:28px 0;font-size:13px;color:#166534">
        <strong>⚡ Prepaid Priority</strong> — Expected delivery: 3-7 business days.
      </div>
      <p style="font-size:12px;color:#737373;line-height:1.6;margin:20px 0 0">Tired of everyone wearing the same thing? You're not alone — that's exactly why Intru exists. Clean, intentional, oversized. Made for you.</p>
    </div>
    ${emailFooter()}
  </div>`;
}

/** COD Verification Required email — replaces old emailCodReceived with idempotent verify link */
export function emailCodVerificationRequired(orderId: string, name: string, items: any[], total: number): string {
  const shortId = orderId.toUpperCase().slice(-8);
  const verifyUrl = `https://intru.in/verify-order?id=${orderId}`;
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb">
    <div style="background:#0a0a0a;padding:36px;text-align:center">
      <h1 style="color:#fff;font-size:20px;margin:0;letter-spacing:4px;text-transform:uppercase">ACTION REQUIRED</h1>
      <p style="color:#fcd34d;font-size:11px;margin:8px 0 0;letter-spacing:2px;font-weight:700">VERIFY YOUR COD ORDER TO START PRODUCTION</p>
    </div>
    <div style="padding:36px">
      <p style="font-size:16px;color:#0a0a0a;margin:0 0 8px">Hi ${name || 'there'},</p>
      <p style="font-size:14px;color:#525252;line-height:1.7;margin:0 0 24px">We've received your Cash on Delivery order <strong style="color:#0a0a0a">#IN-${shortId}</strong>. To prevent fraud and move your order into production, <strong>please verify this is a genuine order by clicking below.</strong></p>
      <div style="text-align:center;margin:32px 0">
        <a href="${verifyUrl}" style="background:#0a0a0a;color:#fff;padding:18px 40px;text-decoration:none;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:13px;border-radius:4px;display:inline-block">CONFIRM MY ORDER →</a>
      </div>
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:16px;margin:24px 0;font-size:12px;color:#92400e;line-height:1.6">
        <strong>⚠️ Unverified orders are automatically cancelled after 24 hours.</strong> Click the button above to lock in your drop.
      </div>
      <div style="margin:24px 0;padding:20px;background:#f9fafb;border-radius:6px">
        <p style="font-size:12px;font-weight:700;color:#0a0a0a;margin:0 0 8px">Order Summary:</p>
        <p style="font-size:13px;color:#525252;margin:0">Total: <strong>Rs.${total.toLocaleString('en-IN')}</strong> (incl. Rs.99 COD/Shipping Fee)</p>
      </div>
      <p style="font-size:11px;color:#9ca3af;line-height:1.6;text-align:center">Button not working? Copy this link:<br><span style="color:#0a0a0a;word-break:break-all">${verifyUrl}</span></p>
    </div>
    ${emailFooter()}
  </div>`;
}

export function emailDropSecured(orderId: string, items: any[], total: number): string {
  const shortId = orderId.toUpperCase().slice(-8);
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border:1px solid #16a34a">
    <div style="background:#16a34a;padding:32px;text-align:center">
      <h1 style="color:#fff;font-size:24px;margin:0;letter-spacing:4px;text-transform:uppercase">DROP SECURED</h1>
      <p style="color:#dcfce7;font-size:11px;margin:8px 0 0;letter-spacing:2px">Order #IN-${shortId}</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:14px;color:#333;line-height:1.7;margin:0">Your Intru order is locked in. Dispatch queue: active. Tracking within 24 hours.</p>
      <p style="font-size:13px;color:#666;line-height:1.7;margin:16px 0 0">Total: <strong>Rs.${total.toLocaleString('en-IN')}</strong></p>
    </div>
    ${emailFooter()}
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
      <p style="font-size:16px;color:#333">Hey ${name || 'there'},</p>
      <p style="font-size:14px;color:#666;line-height:1.7">We got your Cash on Delivery order <strong>#IN-${shortId}</strong>. One quick step: confirm it's really you so we can start production.</p>
      
      <div style="text-align:center;margin:32px 0">
        <a href="${confirmUrl}" style="background:#0a0a0a;color:#fff;padding:18px 32px;text-decoration:none;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:14px;border-radius:4px;display:inline-block">CONFIRM MY ORDER</a>
      </div>

      <p style="font-size:12px;color:#999;line-height:1.6;text-align:center">Button not working? Copy this link:<br>${confirmUrl}</p>
      
      <div style="margin-top:40px;padding-top:20px;border-top:1px solid #eee">
        <p style="font-size:14px;color:#333;font-weight:700;margin-bottom:8px">Order Summary:</p>
        <p style="font-size:13px;color:#666">Total: Rs.${total.toLocaleString('en-IN')} (incl. Rs.99 COD/Shipping Fee)</p>
      </div>
    </div>
    ${emailFooter()}
  </div>`;
}

export function emailCodManagerAlert(orderId: string, name: string, phone: string, address: string, items: any[], total: number): string {
  const itemsList = items.map((i: any) => `${i.name} (${i.size}) x${i.quantity}`).join(', ');
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff">
    <div style="background:#dc2626;padding:24px;text-align:center">
      <h1 style="color:#fff;font-size:20px;margin:0;letter-spacing:3px;text-transform:uppercase">NEW COD ALERT</h1>
      <p style="color:#fecaca;font-size:11px;margin:6px 0 0;letter-spacing:2px">${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata', dateStyle:'medium', timeStyle:'short'})} IST</p>
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
      <div style="margin-top:20px;padding:14px;background:#fef3c7;border-radius:6px;font-size:12px;color:#92400e">⚠️ Verify via Shiprocket + IG DM before dispatch. Auto-cancels after 24h if unverified.</div>
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
    let rows = await res.json() as { key: string, value: string }[];

    const keys = rows.map(r => r.key);
    const mKeys = ['MAINTENANCE_MODE', 'MAINTENANCE_MESSAGE', 'MAINTENANCE_ETA'];
    if (mKeys.some(k => !keys.includes(k))) {
      const seed = [
        { key: 'MAINTENANCE_MODE', value: 'off' },
        { key: 'MAINTENANCE_MESSAGE', value: 'We are making improvements. Back soon!' },
        { key: 'MAINTENANCE_ETA', value: '' }
      ].filter(s => !keys.includes(s.key));
      try {
        await supabaseFetch(sbUrl, sbKey, 'store_settings', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
          body: JSON.stringify(seed)
        });
        seed.forEach(s => rows.push({ key: s.key, value: s.value }));
      } catch (e) { console.error('Maintenance seed error:', e); }
    }

    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
  } catch { return {}; }
}

/**
 * Upsert one or more store_settings key/value pairs (merge-duplicates on `key`).
 * Used by the AI loop to auto-apply approved changes (announcement, hero line,
 * coupon suggestions, etc.) with no redeploy. Returns true on success.
 */
export async function upsertStoreSettings(
  sbUrl: string,
  sbKey: string,
  entries: Record<string, string>
): Promise<boolean> {
  if (!sbUrl || !sbKey) return false;
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value: String(value ?? '') }));
  if (!rows.length) return true;
  try {
    const res = await supabaseFetch(sbUrl, sbKey, 'store_settings', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
      body: JSON.stringify(rows),
    });
    return res.ok;
  } catch { return false; }
}

/**
 * Upload a file directly to Cloudflare R2 using S3-compatible API with AWS SigV4.
 * Returns the full Public URL.
 */
export async function uploadToR2(env: Env, file: File, fileName: string): Promise<string> {
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 configuration missing (Access Key or Secret Key)');
  }

  const endpoint = 'https://83b25481410c2463525f8e8cbc087bbd.r2.cloudflarestorage.com/intru-products';
  const bucket = 'intru-products';
  const prefix = 'products/';
  const fullPath = `/${bucket}/${prefix}${fileName}`;
  const host = '83b25481410c2463525f8e8cbc087bbd.r2.cloudflarestorage.com';
  const url = `${endpoint}/${prefix}${fileName}`;

  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';

  // Canonical Request
  const canonicalUri = fullPath;
  const canonicalQueryString = '';
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const payloadHash = 'UNSIGNED-PAYLOAD';
  const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // String to Sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const hashedCanonicalRequest = await sha256(canonicalRequest);
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${hashedCanonicalRequest}`;

  // Calculate Signature
  const kDate = await hmacRaw(env.R2_SECRET_ACCESS_KEY, `AWS4${dateStamp}`);
  const kRegion = await hmacRaw(kDate, region);
  const kService = await hmacRaw(kRegion, service);
  const kSigning = await hmacRaw(kService, 'aws4_request');
  const signature = await hmacHex(kSigning, stringToSign);

  const authorizationHeader = `${algorithm} Credential=${env.R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': authorizationHeader,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`R2 Upload failed: ${errorText}`);
  }

  return url;
}

/** Helper for SHA256 hex encoding */
async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Helper for HMAC with Raw returned key */
async function hmacRaw(key: string | ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyData = typeof key === 'string' ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
}

/** Helper for HMAC with Hex returned signature */
async function hmacHex(key: ArrayBuffer, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Increment view count for a specific path in Supabase.
 */
export async function incrementView(env: Env, path: string): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return;
  try {
    // First try the RPC function (preferred — atomic increment)
    const rpcRes = await supabaseFetch(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, 'rpc/increment_view', {
      method: 'POST',
      body: JSON.stringify({ page_path: path }),
    });
    if (rpcRes.ok) return;

    // Fallback: upsert into view_stats (non-atomic but better than nothing)
    await supabaseFetch(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, 'view_stats', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
      body: JSON.stringify({ path, count: 1, last_viewed_at: new Date().toISOString() }),
    });
  } catch (e) { console.error('Analytics tracking error:', e); }
}

/**
 * Fetch all page view stats from Supabase.
 * Returns view_stats rows ordered by count desc.
 */
export async function fetchAnalytics(env: Env): Promise<any[]> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) return [];
  try {
    const res = await supabaseFetch(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, 'view_stats?select=*&order=count.desc');
    if (res.ok) return await res.json();
  } catch (e) { console.error('Analytics fetch error:', e); }
  return [];
}
