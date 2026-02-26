// intru.in Product Data — 6 Products, 4 Images Each

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  comparePrice?: number;
  currency: string;
  images: string[];
  sizes: string[];
  category: string;
  inStock: boolean;
  featured: boolean;
}

export interface LegalPage {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  size: string;
  quantity: number;
}

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=1000&fit=crop&q=80&auto=format`;

export const PRODUCTS: Product[] = [
  {
    id: "p1", slug: "essential-oversized-tee",
    name: "Essential Oversized Tee", tagline: "The foundation of every outfit",
    description: "Our signature oversized tee crafted from 240 GSM premium cotton. Drop shoulders, ribbed neckline, and a relaxed fit that drapes perfectly. Pre-shrunk and garment-dyed for that lived-in softness from day one.",
    price: 1299, comparePrice: 1799, currency: "INR",
    images: [IMG("1618354691373-d851c5c3a990"), IMG("1521572163474-6864f9cf17ab"), IMG("1583743814966-8936f5b7be1a"), IMG("1562157873-818bc0726f68")],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "Tops", inStock: true, featured: true,
  },
  {
    id: "p2", slug: "midnight-cargo-joggers",
    name: "Midnight Cargo Joggers", tagline: "Utility meets comfort",
    description: "Relaxed-fit cargo joggers in washed black. Six-pocket design with snap closures, elastic waistband with drawcord, and tapered ankles with adjustable toggles. Built from heavyweight French terry.",
    price: 1999, comparePrice: 2499, currency: "INR",
    images: [IMG("1594938298603-c8148c4dae35"), IMG("1519235624215-85175d5eb36e"), IMG("1552374196-c4e7ffc6e126"), IMG("1506629082955-511b1aa562c8")],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "Bottoms", inStock: true, featured: true,
  },
  {
    id: "p3", slug: "structured-minimal-hoodie",
    name: "Structured Minimal Hoodie", tagline: "Clean lines, warm soul",
    description: "A heavyweight 360 GSM hoodie with a structured silhouette. Kangaroo pocket, flat drawcord, and double-needle stitching throughout. The hood holds its shape without feeling stiff.",
    price: 2499, comparePrice: 3199, currency: "INR",
    images: [IMG("1556821840-3a63f95609a7"), IMG("1578662996442-48f60103fc96"), IMG("1515886657613-9f3515b0c78f"), IMG("1542272604-787c3835535d")],
    sizes: ["S", "M", "L", "XL"], category: "Tops", inStock: true, featured: true,
  },
  {
    id: "p4", slug: "everyday-slim-chinos",
    name: "Everyday Slim Chinos", tagline: "From desk to dinner",
    description: "Slim-fit chinos in stone wash. Stretch cotton twill with a soft hand-feel. Clean front, slant pockets, and a tapered leg that works with sneakers or boots. Wrinkle-resistant finish.",
    price: 1799, currency: "INR",
    images: [IMG("1473966968600-fa801b869a1a"), IMG("1434389677669-e08b4cac3105"), IMG("1490114538077-0a7f8cb49891"), IMG("1516826957135-700dedea698c")],
    sizes: ["28", "30", "32", "34", "36"], category: "Bottoms", inStock: true, featured: false,
  },
  {
    id: "p5", slug: "graphic-art-tee-vol1",
    name: "Graphic Art Tee — Vol. 1", tagline: "Wearable expression",
    description: "Limited-edition graphic tee featuring original artwork by independent Indian artists. Screen-printed on our signature 240 GSM cotton base. Each print is unique — slight variations celebrate the craft.",
    price: 1499, currency: "INR",
    images: [IMG("1503341455253-b2e723bb3dbb"), IMG("1529374255404-311a2a4f3fd5"), IMG("1576566588028-4147f3842f27"), IMG("1622470953794-aa9c70b0fb9d")],
    sizes: ["S", "M", "L", "XL", "XXL"], category: "Tops", inStock: true, featured: true,
  },
  {
    id: "p6", slug: "monochrome-zip-jacket",
    name: "Monochrome Zip Jacket", tagline: "Layer with intent",
    description: "Lightweight zip-up jacket in matte black. Water-resistant shell with a soft mesh lining. Minimal branding, hidden pockets, and a clean stand collar. Packs into its own pocket for travel.",
    price: 2999, comparePrice: 3999, currency: "INR",
    images: [IMG("1591047139829-d91aecb6caea"), IMG("1544022613-e87ca75a784a"), IMG("1551488831-00ddcb6c6bd3"), IMG("1548712841-f30f0e498523")],
    sizes: ["S", "M", "L", "XL"], category: "Outerwear", inStock: true, featured: true,
  },
];

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "terms", title: "Terms & Conditions",
    content: `<h2>1. Introduction</h2><p>Welcome to intru.in. By accessing our website, you agree to these Terms and Conditions.</p><h2>2. Products & Pricing</h2><p>All prices are in INR and include applicable taxes. We reserve the right to modify prices. Product images are representative; slight color variations may occur.</p><h2>3. Orders & Payment</h2><p>Payment is processed securely through Razorpay. We accept UPI, credit/debit cards, net banking, and wallets.</p><h2>4. Shipping</h2><p>We ship across India. Standard: 5-7 business days. Express: 2-3 business days. Free shipping on orders above ₹1,999.</p><h2>5. Intellectual Property</h2><p>All content on intru.in is our intellectual property and may not be reproduced without written consent.</p><h2>6. Governing Law</h2><p>These terms are governed by the laws of India, subject to courts in Bangalore, Karnataka.</p>`,
    updatedAt: "2026-02-01",
  },
  {
    slug: "privacy", title: "Privacy Policy",
    content: `<h2>1. Information We Collect</h2><p>We collect name, email, phone, shipping address, and payment details. We also use cookies to improve your experience.</p><h2>2. How We Use Your Data</h2><p>To process orders, communicate updates, and personalize shopping. We do not sell your personal information.</p><h2>3. Data Security</h2><p>We use SSL/TLS encryption. Payment processing by PCI-DSS compliant Razorpay.</p><h2>4. Third-Party Services</h2><p>We use Supabase for auth, Razorpay for payments, and analytics tools. Each has its own privacy policy.</p><h2>5. Your Rights</h2><p>Request access, correction, or deletion of data by contacting hello@intru.in.</p>`,
    updatedAt: "2026-02-01",
  },
  {
    slug: "refunds", title: "Return & Refund Policy",
    content: `<h2>1. Return Window</h2><p>Returns accepted within 7 days. Items must be unworn, unwashed, with original tags.</p><h2>2. How to Return</h2><p>Email returns@intru.in with your order number. We'll provide a prepaid return label within 24 hours.</p><h2>3. Refund Process</h2><p>Refund processed within 5-7 business days to original payment method after inspection.</p><h2>4. Exchanges</h2><p>For size exchanges, email us — no extra shipping charge.</p><h2>5. Non-Returnable</h2><p>"Final Sale" items, undergarments, and accessories are non-returnable.</p><h2>6. Damaged Items</h2><p>Contact us within 48 hours with photos for immediate replacement or refund.</p>`,
    updatedAt: "2026-02-01",
  },
  {
    slug: "shipping", title: "Shipping Policy",
    content: `<h2>1. Coverage</h2><p>We ship across India. International shipping coming soon.</p><h2>2. Delivery Times</h2><p>Standard: 5-7 business days. Express: 2-3 business days.</p><h2>3. Costs</h2><p>Free on orders above ₹1,999. Flat ₹99 below. Express: ₹199.</p><h2>4. Tracking</h2><p>Tracking link sent via email and SMS once shipped.</p>`,
    updatedAt: "2026-02-01",
  },
];

export const STORE_CONFIG = {
  name: "intru.in",
  tagline: "Minimalism & Everyday Style",
  description: "Born from a shared love for minimalism and everyday style. We craft essential wardrobe pieces that speak through quality, not logos.",
  currency: "INR",
  currencySymbol: "₹",
  freeShippingThreshold: 1999,
  shippingCost: 99,
  email: "hello@intru.in",
  instagram: "intru.in",
  adminPassword: "intru2026admin",
};
