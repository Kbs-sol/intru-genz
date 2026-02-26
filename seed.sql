-- Seed 6 Products with 4 images each
INSERT OR IGNORE INTO products (name, slug, description, short_description, price, compare_price, images, category, in_stock, featured, sort_order) VALUES
(
  'Midnight Oversized Tee',
  'midnight-oversized-tee',
  'Crafted from 100% organic cotton with a 240 GSM weight, the Midnight Oversized Tee is our signature piece. The relaxed, drop-shoulder silhouette pairs effortlessly with anything in your wardrobe. Pre-washed to eliminate shrinkage, this tee gets softer with every wear.',
  'Premium 240 GSM organic cotton oversized tee',
  1499,
  1999,
  '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80","https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80","https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"]',
  'tees',
  1, 1, 1
),
(
  'Essential Crew Hoodie',
  'essential-crew-hoodie',
  'Built for the in-between seasons. Our Essential Crew Hoodie features a heavyweight 380 GSM French terry body with ribbed cuffs and a kangaroo pocket. The minimal intru.in embroidery on the chest speaks to quiet confidence. Available in Charcoal Black.',
  'Heavyweight 380 GSM French terry hoodie',
  2999,
  3499,
  '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80","https://images.unsplash.com/photo-1578768079470-40064d45e6d1?w=800&q=80","https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80","https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80"]',
  'hoodies',
  1, 1, 2
),
(
  'Relaxed Cargo Pants',
  'relaxed-cargo-pants',
  'Function meets form in our Relaxed Cargo Pants. Constructed from a durable cotton-twill blend with six utility pockets, adjustable ankle cuffs, and a comfortable elastic waistband. The perfect canvas for your daily uniform.',
  'Cotton-twill cargo with six utility pockets',
  2499,
  2999,
  '["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80","https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80","https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80","https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&q=80"]',
  'bottoms',
  1, 1, 3
),
(
  'Monochrome Cap',
  'monochrome-cap',
  'The finishing touch. Our Monochrome Cap is an unstructured, six-panel design with an adjustable brass buckle closure. Made from washed cotton canvas with a subtle intru.in logo embroidery. One size fits all.',
  'Unstructured washed cotton canvas cap',
  799,
  999,
  '["https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=800&q=80","https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80","https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80","https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&q=80"]',
  'accessories',
  1, 1, 4
),
(
  'Everyday Joggers',
  'everyday-joggers',
  'From morning coffee to late-night walks, these joggers are built for comfort without compromise. Featuring a soft-brushed fleece interior, tapered leg, and zippered pockets. The elastic waistband with internal drawcord ensures a perfect fit every time.',
  'Soft-brushed fleece joggers with zippered pockets',
  1999,
  2499,
  '["https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80","https://images.unsplash.com/photo-1580906853149-f6c3c3c58b68?w=800&q=80","https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80","https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80"]',
  'bottoms',
  1, 1, 5
),
(
  'Minimal Tote Bag',
  'minimal-tote-bag',
  'Carry your essentials in understated style. Our Minimal Tote is made from heavy-duty 16oz canvas with reinforced stitching and cotton webbing handles. An internal zippered pocket keeps your valuables secure. Designed to age beautifully.',
  'Heavy-duty 16oz canvas tote with reinforced stitching',
  1299,
  1599,
  '["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80","https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80","https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?w=800&q=80","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"]',
  'accessories',
  1, 1, 6
);

-- Seed Legal Pages
INSERT OR IGNORE INTO legal_pages (slug, title, content, is_active, sort_order) VALUES
(
  'terms-and-conditions',
  'Terms & Conditions',
  '<h2>1. Introduction</h2><p>Welcome to intru.in. These Terms and Conditions govern your use of our website and the purchase of products from our online store. By accessing or using our website, you agree to be bound by these terms.</p><h2>2. Products & Pricing</h2><p>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time without prior notice.</p><h2>3. Orders & Payment</h2><p>By placing an order, you are making an offer to purchase a product. All orders are subject to availability and confirmation. We accept payments via Razorpay, which supports UPI, credit/debit cards, net banking, and wallets.</p><h2>4. Shipping</h2><p>We ship across India. Orders are processed within 1-2 business days. Standard delivery takes 5-7 business days. Free shipping on orders above Rs.1,999.</p><h2>5. Limitation of Liability</h2><p>intru.in shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website or products.</p><h2>6. Governing Law</h2><p>These terms shall be governed by the laws of India.</p>',
  1, 1
),
(
  'privacy-policy',
  'Privacy Policy',
  '<h2>1. Information We Collect</h2><p>We collect information you provide directly to us, including your name, email address, phone number, shipping address, and payment details when you make a purchase on intru.in.</p><h2>2. How We Use Your Information</h2><p>We use the information to process orders, send order confirmations and shipping updates, respond to customer service requests, and improve our website.</p><h2>3. Information Sharing</h2><p>We do not sell, trade, or rent your personal information to third parties. We may share information with payment processors (Razorpay) and shipping partners solely for order fulfillment.</p><h2>4. Data Security</h2><p>We implement appropriate security measures to protect your personal information. All payment transactions are processed through Razorpay secure, PCI-compliant payment gateway.</p><h2>5. Your Rights</h2><p>You have the right to access, correct, or delete your personal data. Contact us at hello@intru.in for any data-related requests.</p>',
  1, 2
),
(
  'refund-policy',
  'Refund & Return Policy',
  '<h2>1. Return Window</h2><p>We accept returns within 7 days of delivery. Items must be unworn, unwashed, and in their original packaging with all tags attached.</p><h2>2. How to Initiate a Return</h2><p>Email us at hello@intru.in with your order number and reason for return. Our team will respond within 24 hours with return instructions.</p><h2>3. Refund Process</h2><p>Once we receive and inspect your returned item, we will process your refund within 5-7 business days. Refunds will be credited to the original payment method.</p><h2>4. Exchange Policy</h2><p>We offer free exchanges for size-related issues. Contact us within 7 days of delivery to initiate an exchange.</p><h2>5. Non-Returnable Items</h2><p>Items that have been worn, washed, altered, or damaged by the customer are not eligible for return. Sale items are final sale unless defective.</p><h2>6. Damaged Items</h2><p>If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos. We will arrange a free replacement or full refund.</p>',
  1, 3
),
(
  'shipping-policy',
  'Shipping Policy',
  '<h2>1. Shipping Zones</h2><p>We currently ship across India. International shipping is not available at this time.</p><h2>2. Delivery Times</h2><p>Standard delivery: 5-7 business days. Metro cities: 3-5 business days. Orders placed before 2 PM IST are processed the same day.</p><h2>3. Shipping Charges</h2><p>Free shipping on all orders above Rs.1,999. A flat shipping fee of Rs.99 applies to orders below Rs.1,999.</p><h2>4. Order Tracking</h2><p>You will receive a tracking number via email and SMS once your order is shipped.</p><h2>5. Delivery Issues</h2><p>If your package is lost or significantly delayed, please contact us at hello@intru.in.</p>',
  1, 4
);

-- Seed Settings
INSERT OR IGNORE INTO settings (key, value) VALUES
('admin_password', 'intru2024admin'),
('razorpay_key_id', ''),
('razorpay_key_secret', ''),
('brand_name', 'intru.in'),
('brand_tagline', 'Minimalism & Everyday Style'),
('free_shipping_threshold', '1999'),
('flat_shipping_fee', '99'),
('instagram_url', 'https://instagram.com/intru.in'),
('contact_email', 'hello@intru.in');
