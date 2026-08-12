import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

/**
 * /faq — Frequently Asked Questions page
 *
 * Purpose: a dedicated FAQ hub that captures long-tail search queries
 * (e.g. "intru sizing", "intru shipping time", "does intru accept COD")
 * and gets picked up by both Google's FAQ rich snippet and answer engines
 * (ChatGPT / Gemini / Perplexity).
 *
 * Was previously a 404 (footer linked /p/faq → non-existent legal page),
 * causing a Clarity "quick back click" for every visitor who clicked it.
 *
 * Structured data: FAQPage schema — required for Google FAQ rich results.
 */

interface FAQ {
  q: string;
  a: string;  // HTML allowed for links
  cat: string;
}

export function faqPage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
}): string {
  const today = new Date().toISOString().split('T')[0];

  const faqs: FAQ[] = [
    // Sizing & Fit — highest search volume category
    { cat: 'Sizing & Fit', q: 'What size should I order at Intru?', a: 'Every Intru piece uses a true oversized fit built into the pattern (dropped shoulders, wider body, longer length). If you wear a Medium in a regular-fit tee, stay in Medium at Intru — the extra room is already there. Only size up if you want an extreme drop or plan to layer heavily. Every product page has a full size chart with chest and length measurements in inches.' },
    { cat: 'Sizing & Fit', q: 'Are Intru t-shirts oversized?', a: 'Yes. Every t-shirt, crop top and shirt in the Intru catalogue is cut oversized on purpose — this is the house silhouette, not a variant. It is designed for a relaxed drape without being sloppy.' },
    { cat: 'Sizing & Fit', q: 'What fabric weight (GSM) do you use?', a: 'Our heavyweight cotton runs 220–260 GSM depending on the piece. That is roughly twice the weight of a fast-fashion tee. Higher GSM holds shape in Indian heat, does not go see-through, and lasts through repeated washes.' },
    { cat: 'Sizing & Fit', q: 'Will Intru clothes shrink after washing?', a: 'No — every Intru garment is pre-shrunk before it leaves us. Follow the care label (cold wash, inside-out, air dry) and the fit stays consistent for the life of the piece.' },
    { cat: 'Sizing & Fit', q: 'How do I wash and care for my Intru piece?', a: 'Cold machine wash, inside-out, with similar colours. Avoid bleach and fabric softener. Air-dry in shade — heat and direct sun fade the garment-dyed colour. Iron on medium if needed, on the reverse side over prints.' },

    // Shipping & Delivery
    { cat: 'Shipping & Delivery', q: 'How long does shipping take?', a: 'Orders are dispatched within 36 hours of confirmation. Delivery across India typically takes 3–7 business days depending on location. Metro cities usually land in 3–4 days, tier-2/3 cities in 5–7 days. You will receive a tracking link over email/SMS as soon as we hand your order to the courier.' },
    { cat: 'Shipping & Delivery', q: 'Is shipping free?', a: 'Yes — shipping is free on all prepaid orders across India, with no minimum cart value. COD orders carry a ₹99 shipping fee.' },
    { cat: 'Shipping & Delivery', q: 'Do you ship internationally?', a: 'At the moment we ship within India only. We are exploring select international corridors — if you would like to be notified, email <a href="mailto:shop@intru.in">shop@intru.in</a> with your country.' },
    { cat: 'Shipping & Delivery', q: 'How do I track my order?', a: 'You will receive a tracking link over email and SMS the moment we hand your order to the courier partner. You can also log in on <a href="/">intru.in</a> using the same email/phone used at checkout to see your order history.' },

    // Payments
    { cat: 'Payments', q: 'Do you accept Cash on Delivery (COD)?', a: 'Yes, COD is available across most Indian pincodes. A ₹99 shipping fee applies to COD orders. To keep our small-batch model sustainable, we may email you a short verification link before dispatch for high-value COD orders — replying/confirming keeps it moving.' },
    { cat: 'Payments', q: 'What payment methods do you accept?', a: 'UPI, credit/debit cards, net banking, popular wallets (Paytm, PhonePe, Amazon Pay), and Cash on Delivery. Payments are processed through Razorpay — one of India\'s most secure payment gateways.' },
    { cat: 'Payments', q: 'Is my payment information secure?', a: 'Yes. All payments are processed through Razorpay with bank-grade SSL encryption. Intru never sees or stores your card or UPI credentials.' },
    { cat: 'Payments', q: 'Can I use a coupon or discount code?', a: 'Yes — enter your code at checkout inside the cart drawer. Coupons stack with free shipping on prepaid orders but not with other coupons. Some auto-applied combo deals will show up in your bag automatically when you add qualifying pieces.' },

    // Returns & Exchanges — critical for trust
    { cat: 'Returns & Exchanges', q: 'What is your return policy?', a: 'Intru operates on a limited-drop model, so all sales are final. We do not offer cash refunds. Approved claims are issued as <strong>Store Credit at 1:1 value with INR</strong>, which never expires and can be used on any future drop. Full policy: <a href="/p/returns">Returns &amp; Exchanges Policy</a>.' },
    { cat: 'Returns & Exchanges', q: 'Can I exchange a size?', a: 'Yes — size exchanges are supported within 36 hours of delivery, if the replacement size is in stock. Email <a href="mailto:shop@intru.in">shop@intru.in</a> with your order number and desired size. If we can\'t swap the size, we issue Store Credit.' },
    { cat: 'Returns & Exchanges', q: 'What if my product arrives damaged or defective?', a: 'Reach out to <a href="mailto:shop@intru.in">shop@intru.in</a> within 36 hours of delivery with your order number and clear photographs of the defect. We approve manufacturing defects, wrong items shipped, and significant transit damage — Store Credit is issued immediately.' },
    { cat: 'Returns & Exchanges', q: 'Why don\'t you offer cash refunds?', a: 'Every Intru drop is made in a limited quantity and never restocked. If we offered cash refunds we would end up with returned inventory we can\'t resell — which would force us into the mass-production model we specifically built Intru to avoid. Store Credit at 1:1 keeps the drop model sustainable and gives you the same value.' },

    // Products & Drops
    { cat: 'Products & Drops', q: 'Are Intru drops really limited?', a: 'Yes. Each design is made in a small batch (typically under a few hundred units per size) and is never restocked once sold out. The exact numbers per drop are visible on some product pages, and once a piece is vaulted it is gone permanently.' },
    { cat: 'Products & Drops', q: 'When do new drops launch?', a: 'We drop roughly every 4–6 weeks. Follow us on Instagram <a href="https://www.instagram.com/intru.in/" target="_blank" rel="noopener noreferrer">@intru.in</a> for drop announcements and behind-the-scenes on each collection.' },
    { cat: 'Products & Drops', q: 'Where are Intru products made?', a: 'Every Intru piece is designed and manufactured in India — cut, sewn and printed by small ethical partners we know personally. Founders Ramya and the team visit the workshop for every drop.' },
    { cat: 'Products & Drops', q: 'What categories do you sell?', a: 'Right now: <a href="/collections?cat=T-Shirts">T-Shirts</a>, <a href="/collections?cat=Crop-Tops">Crop Tops</a>, and <a href="/collections?cat=Shirts">Shirts</a>. All oversized, all heavyweight, all limited-run. Bottoms and outerwear are on the roadmap.' },

    // Account & Support
    { cat: 'Account & Support', q: 'Do I need an account to order?', a: 'No — you can check out as a guest. Creating an account (or logging in with Google) lets you see order history, track live shipments, and pre-access future drops.' },
    { cat: 'Account & Support', q: 'How do I contact customer support?', a: 'Email <a href="mailto:shop@intru.in">shop@intru.in</a> — we reply within 24 hours on business days. For faster answers on sizing, styling and drop timing, try our <a href="/stylist">AI Stylist</a> (bottom-right of every page) or DM us on Instagram <a href="https://www.instagram.com/intru.in/" target="_blank" rel="noopener noreferrer">@intru.in</a>.' },
    { cat: 'Account & Support', q: 'How do I delete my account or my data?', a: 'Email <a href="mailto:shop@intru.in">shop@intru.in</a> from the address on your account with the subject line "Account Deletion Request". We complete removal within 7 business days as per our <a href="/p/privacy">Privacy Policy</a>.' },
  ];

  // Group by category for rendering
  const cats = [...new Set(faqs.map(f => f.cat))];

  // FAQPage schema — Google rich-snippet gold, and answer engines cite it verbatim
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://intru.in/faq#faqpage',
    'url': 'https://intru.in/faq',
    'name': 'Intru FAQ — Sizing, Shipping, Returns & Payments',
    'description': 'Answers to the most common questions about Intru — sizing, oversized fit, shipping to India, returns and store credit, COD, and drop mechanics.',
    'inLanguage': 'en-IN',
    'isPartOf': { '@type': 'WebSite', 'name': 'Intru', 'url': 'https://intru.in' },
    'about': { '@type': 'Brand', 'name': 'Intru' },
    'dateModified': today,
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        // Strip HTML for schema (Google prefers plaintext in the answer text field)
        'text': f.a.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      }
    }))
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://intru.in' },
      { '@type': 'ListItem', 'position': 2, 'name': 'FAQ', 'item': 'https://intru.in/faq' }
    ]
  };
  const schema = JSON.stringify([faqSchema, breadcrumbSchema]);

  const body = `
<style>
.faq-wrap{max-width:860px;margin:0 auto;padding:80px 24px 100px}
.faq-over{font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--g500);margin-bottom:12px;text-align:center}
.faq-h1{font-family:var(--head);font-size:clamp(32px,5vw,52px);text-transform:uppercase;letter-spacing:-.04em;text-align:center;margin-bottom:16px;line-height:1.05}
.faq-sub{font-size:15px;color:var(--g500);text-align:center;max-width:580px;margin:0 auto 48px;line-height:1.7}

/* Sticky mini-nav to jump between categories */
.faq-nav{position:sticky;top:80px;background:rgba(250,250,250,.94);backdrop-filter:blur(12px);z-index:50;display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:14px 12px;margin-bottom:36px;border-bottom:1px solid var(--g100);border-radius:8px}
.faq-nav a{padding:8px 14px;border:1.5px solid var(--g200);border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--g600);text-decoration:none;transition:all .2s}
.faq-nav a:hover,.faq-nav a:focus-visible{border-color:var(--bk);color:var(--bk);background:var(--wh);outline:none}
.faq-nav a:focus-visible{outline:2px solid var(--bk);outline-offset:2px}

/* Category section */
.faq-cat{margin-bottom:56px;scroll-margin-top:160px}
.faq-cat h2{font-family:var(--head);font-size:clamp(20px,3vw,28px);text-transform:uppercase;letter-spacing:-.02em;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--bk)}

/* Accordion items */
.faq-item{border-bottom:1px solid var(--g100);padding:0}
.faq-item summary{list-style:none;cursor:pointer;padding:22px 40px 22px 4px;position:relative;font-size:16px;font-weight:700;color:var(--bk);line-height:1.45;transition:color .2s}
.faq-item summary::-webkit-details-marker{display:none}
.faq-item summary::after{content:'+';position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:28px;font-weight:400;color:var(--g500);transition:transform .3s var(--eo),color .2s;line-height:1}
.faq-item[open] summary::after{transform:translateY(-50%) rotate(45deg);color:var(--bk)}
.faq-item summary:hover,.faq-item summary:focus-visible{color:var(--bk);outline:none}
.faq-item summary:focus-visible{outline:2px solid var(--bk);outline-offset:2px;border-radius:4px}
.faq-answer{padding:0 40px 24px 4px;font-size:15px;color:var(--g600);line-height:1.75}
.faq-answer a{color:var(--bk);font-weight:600;text-decoration:underline;text-underline-offset:2px}
.faq-answer strong{color:var(--bk)}

/* CTA */
.faq-cta{margin-top:64px;padding:48px 32px;background:var(--bk);color:var(--wh);border-radius:12px;text-align:center}
.faq-cta h3{font-family:var(--head);font-size:clamp(22px,3vw,32px);text-transform:uppercase;letter-spacing:-.02em;margin-bottom:12px}
.faq-cta p{font-size:14px;color:#d4d4d4;margin-bottom:24px;line-height:1.7}
.faq-cta .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.faq-cta a{display:inline-flex;align-items:center;gap:10px;padding:14px 28px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:6px;text-decoration:none;transition:all .2s}
.faq-cta a.primary{background:var(--wh);color:var(--bk)}
.faq-cta a.primary:hover{background:#e5e5e5;transform:translateY(-2px)}
.faq-cta a.secondary{background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:#fff}
.faq-cta a.secondary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(220,39,67,.4)}

@media(max-width:640px){
  .faq-wrap{padding:56px 16px 80px}
  .faq-nav{top:64px;padding:10px 8px}
  .faq-nav a{padding:6px 10px;font-size:10px;letter-spacing:.8px}
  .faq-item summary{font-size:15px;padding:18px 36px 18px 2px}
  .faq-answer{padding:0 36px 18px 2px;font-size:14px}
}
</style>

<article class="faq-wrap" itemscope itemtype="https://schema.org/FAQPage">
<p class="faq-over">Frequently Asked Questions</p>
<h1 class="faq-h1">Everything You Need<br>to Know</h1>
<p class="faq-sub">Real answers on sizing, shipping, returns and payments. Still stuck? Reach out on <a href="mailto:shop@intru.in" style="color:var(--bk);text-decoration:underline">email</a> or DM us <a href="https://www.instagram.com/intru.in/" target="_blank" rel="noopener noreferrer" style="color:var(--bk);text-decoration:underline">@intru.in</a>.</p>

<nav class="faq-nav" aria-label="Jump to FAQ section">
${cats.map(c => `<a href="#faq-${c.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${c}</a>`).join('')}
</nav>

${cats.map(cat => {
    const anchor = 'faq-' + cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const items = faqs.filter(f => f.cat === cat);
    return `<section class="faq-cat" id="${anchor}">
<h2>${cat}</h2>
${items.map(f => `<details class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<summary itemprop="name">${f.q}</summary>
<div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<div itemprop="text">${f.a}</div>
</div>
</details>`).join('')}
</section>`;
  }).join('')}

<div class="faq-cta">
  <h3>Didn't Find Your Answer?</h3>
  <p>Our small team replies to every email within 24 hours. Or catch us on Instagram — we DM back fastest there.</p>
  <div class="btns">
    <a href="mailto:shop@intru.in" class="primary"><i class="fas fa-envelope"></i> Email Us</a>
    <a href="https://www.instagram.com/intru.in/" target="_blank" rel="noopener noreferrer" class="secondary"><i class="fab fa-instagram"></i> DM on Instagram</a>
  </div>
</div>
</article>`;

  return shell(
    'FAQ — Sizing, Shipping, Returns & Payments | Intru',
    'Answers to the most common questions about Intru premium oversized streetwear. Sizing, GSM fabric weight, shipping timelines, COD, returns and store credit policy — everything in one place.',
    body,
    {
      url: 'https://intru.in/faq',
      schema,
      razorpayKeyId: opts.razorpayKeyId,
      googleClientId: opts.googleClientId,
      products: opts.products,
      legalPages: opts.legalPages,
      useMagicCheckout: !!opts.useMagicCheckout,
      maintenanceConfig: opts.maintenanceConfig,
      storeSettings: opts.storeSettings,
      pageType: 'article'
    }
  );
}
