import { shell } from '../components/shell'
import { STORE_CONFIG, SEED_FAQS, type Product, type LegalPage, type FAQ } from '../data'

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

export function faqPage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  faqs?: FAQ[];
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
}): string {
  const today = new Date().toISOString().split('T')[0];

  // Prefer FAQs fetched from Supabase (via opts.faqs); fall back to the hardcoded
  // SEED_FAQS so crawlers and users always see content, even if the DB is empty
  // or the fetch failed. Only active FAQs are rendered.
  const source = (opts.faqs && opts.faqs.length ? opts.faqs : SEED_FAQS).filter(f => f.is_active !== false);

  // Group by category preserving insertion order, and sort within a category by
  // sort_order (nulls last).
  const seenCats: string[] = [];
  const grouped: Record<string, FAQ[]> = {};
  for (const f of source) {
    const cat = f.category || 'General';
    if (!grouped[cat]) { grouped[cat] = []; seenCats.push(cat); }
    grouped[cat].push(f);
  }
  for (const cat of seenCats) {
    grouped[cat].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  }
  // Flat list used for JSON-LD schema
  const faqs: FAQ[] = seenCats.flatMap(c => grouped[c]);
  const cats = seenCats;

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
      'name': f.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        // Strip HTML for schema (Google prefers plaintext in the answer text field)
        'text': f.answer.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
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

${cats.length ? `<nav class="faq-nav" aria-label="Jump to FAQ section">
${cats.map(c => `<a href="#faq-${c.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${c}</a>`).join('')}
</nav>` : ''}

${cats.map(cat => {
    const anchor = 'faq-' + cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const items = grouped[cat] || [];
    return `<section class="faq-cat" id="${anchor}">
<h2>${cat}</h2>
${items.map(f => `<details class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
<summary itemprop="name">${f.question}</summary>
<div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
<div itemprop="text">${f.answer}</div>
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
