import { shell } from '../components/shell'
import { STORE_CONFIG } from '../data'
import type { Product, LegalPage, FAQ, BlogPost } from '../data'

/**
 * [v21] Search page — /search?q=<query>
 *
 * Twin purpose:
 *   1) Provide a lightweight on-site product finder for real search intent.
 *   2) Brand-typo trap: Google Search Console shows real users typing
 *      "intruu", "intrù", "in tru", "topintru", "the intru", "intrue",
 *      "inourinternest" (64 impressions!), "intral", "intry" and dozens
 *      more brand variants. These queries currently land on nothing that
 *      confirms "yes this is Intru, you meant us". This page:
 *      - matches the typo against a curated typo list → shows a friendly
 *        "Did you mean Intru?" hero with a big CTA to shop
 *      - sets canonical to home for typo queries so link equity consolidates
 *      - shows all products as browse fallback
 *      - includes JSON-LD `SearchAction` on the Organization schema
 *
 * SEO note: page is `noindex, follow` when q is empty; `index, follow` with
 * canonical to home when q is a brand typo (so it counts toward the brand
 * entity); `index, follow` self-canonical when q matches actual product terms.
 */
export function searchPage(opts: {
  products: Product[]
  legalPages: LegalPage[]
  faqs: FAQ[]
  blogPosts: BlogPost[]
  storeSettings?: any
  razorpayKeyId: string
  googleClientId: string
  useMagicCheckout: boolean
  maintenanceConfig?: any
  query: string
}): string {
  const { products, query } = opts
  const q = (query || '').trim().toLowerCase()

  // Known brand-name misspellings drawn directly from GSC data (Jun-Sep 2026).
  const BRAND_TYPOS = new Set<string>([
    'intru', 'intru.', 'intruu', 'intruue', 'intrue', 'intrù', 'intrú', 'intrû', 'întru',
    'intr', 'inru', 'inyru', 'inttru', 'inttruv', 'intrp', 'intrpu', 'intrlu', 'intrul',
    'intral', 'intry', 'intruht', 'topintru', 'the intru', 'in tru', 'i tru', 'tru india',
    'antru', 'lntru', 'in stru', 'in strip', 'in true', 'i true', 'infftru', 'inourinternest',
    'inthruth', 'innontru', 'indtru', 'inthra', 'inthree', 'intrudium', 'intruder',
    'intrstlr', 'intribe', 'intrst', 'insstreet', 'insstrail', 'instrail', 'instring',
    'ınstreet', 'topintru', 'netru', 'no', 'find related images', 'find the look',
  ])
  const isBrandTypo = q && BRAND_TYPOS.has(q)

  // Simple substring + token scoring for product matches.
  function score(p: Product): number {
    if (!q) return 0
    const hay = (
      p.name + ' ' + p.slug + ' ' + (p.description || '') + ' ' +
      (p.tagline || '') + ' ' + ((p as any).category || '')
    ).toLowerCase()
    if (hay.includes(q)) return 10
    // token overlap
    const tokens = q.split(/[^a-z0-9]+/).filter(t => t.length >= 3)
    let s = 0
    tokens.forEach(t => { if (hay.includes(t)) s += 3 })
    return s
  }
  const matches = q
    ? products.map(p => ({ p, s: score(p) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.p)
    : products

  const canonical = (isBrandTypo || !q)
    ? 'https://intru.in/'
    : `https://intru.in/search?q=${encodeURIComponent(q)}`

  const title = !q
    ? 'Search Intru — Find Oversized Streetwear'
    : isBrandTypo
      ? `Did you mean Intru? — Independent Indian Streetwear`
      : `Search: ${query} — Intru`

  const desc = !q
    ? 'Search intru.in for oversized heavyweight tees, crop tops, and shirts. Limited drops, never restocked. Ships free across India.'
    : isBrandTypo
      ? `Yes — you're looking for Intru (intru.in), an independent Indian streetwear brand from Hyderabad. Shop oversized heavyweight tees, crop tops and shirts. Limited drops, free shipping across India.`
      : `Search results for "${query}" on intru.in — oversized heavyweight streetwear made in India.`

  // JSON-LD: mark this page as a SearchResultsPage and re-declare the
  // Organization + potentialAction so search engines pick up the brand entity
  // even on brand-typo landings.
  const schema = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': canonical,
      'url': canonical,
      'name': title,
      'isPartOf': { '@type': 'WebSite', 'name': 'Intru', 'url': 'https://intru.in/' },
      'about': { '@type': 'Organization', 'name': 'Intru', 'url': 'https://intru.in/' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Intru',
      'alternateName': ['intru.in', 'INTRU', 'Intru Streetwear', 'Intru India'],
      'url': 'https://intru.in/',
      'logo': 'https://intru.in/og-default.jpg',
      'sameAs': ['https://www.instagram.com/intru.in/'],
      'potentialAction': {
        '@type': 'SearchAction',
        'target': { '@type': 'EntryPoint', 'urlTemplate': 'https://intru.in/search?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
  ])

  const heroBlock = !q ? `
    <div class="s-hero">
      <p class="s-over">Search &middot; Intru</p>
      <h1 class="s-h1">What are you looking for?</h1>
      <p class="s-lead">Search across oversized tees, crop tops, and shirts — or browse the full drop below.</p>
    </div>
  ` : isBrandTypo ? `
    <div class="s-hero s-hero-typo">
      <p class="s-over">Yes, you found us</p>
      <h1 class="s-h1">Did you mean <span style="text-decoration:underline">Intru</span>?</h1>
      <p class="s-lead">"${escapeHtml(query)}" &rarr; you're on <strong>intru.in</strong>, an independent Indian streetwear brand from Hyderabad. Oversized heavyweight tees, crop tops and shirts. Limited drops, never restocked. Ships free across India.</p>
      <a href="/" class="s-cta">Shop the Current Drop &rarr;</a>
    </div>
  ` : `
    <div class="s-hero">
      <p class="s-over">Search results</p>
      <h1 class="s-h1">"${escapeHtml(query)}"</h1>
      <p class="s-lead">${matches.length} product${matches.length === 1 ? '' : 's'} matching your search.</p>
    </div>
  `

  const productGrid = matches.length ? `
    <section class="s-grid">
      ${matches.map(p => `
        <a href="/product/${p.slug}" class="s-card">
          <div class="s-card-img"><img src="${p.images[0]}" alt="${escapeAttr(p.name)}" loading="lazy"></div>
          <div class="s-card-body">
            <h3 class="s-card-name">${escapeHtml(p.name)}</h3>
            <div class="s-card-price">${STORE_CONFIG.currencySymbol}${p.price.toLocaleString('en-IN')}</div>
          </div>
        </a>
      `).join('')}
    </section>
  ` : `
    <div class="s-empty">
      <p>No products match <strong>"${escapeHtml(query)}"</strong> in the current drop.</p>
      <p>Try browsing the <a href="/collections">full collection</a> or ask the <a href="/stylist">AI Stylist</a> for recommendations.</p>
    </div>
  `

  const body = `
<style>
.spage{max-width:1200px;margin:0 auto;padding:60px 24px 100px}
.s-form{max-width:640px;margin:0 auto 40px;display:flex;gap:8px}
.s-form input{flex:1;padding:16px 18px;border:1.5px solid #e5e5e5;border-radius:8px;font-size:16px;font-family:inherit;outline:none}
.s-form input:focus{border-color:#0a0a0a}
.s-form button{padding:16px 28px;border:none;background:#0a0a0a;color:#fff;font-weight:800;font-size:12px;letter-spacing:2px;text-transform:uppercase;border-radius:8px;cursor:pointer}
.s-hero{max-width:820px;margin:0 auto 56px;text-align:center}
.s-hero-typo{background:#fef3c7;border:1px solid #f59e0b;border-radius:14px;padding:40px 32px}
.s-over{font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:#737373;margin:0 0 12px}
.s-h1{font-family:'Archivo Black',sans-serif;font-size:clamp(28px,5vw,52px);letter-spacing:-.03em;line-height:1.05;text-transform:uppercase;margin:0 0 16px}
.s-lead{font-size:15px;color:#525252;line-height:1.75;max-width:600px;margin:0 auto 20px}
.s-cta{display:inline-flex;align-items:center;gap:10px;padding:16px 40px;background:#0a0a0a;color:#fff;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;border-radius:8px;text-decoration:none;transition:transform .2s}
.s-cta:hover{transform:translateY(-2px)}
.s-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:32px}
@media(max-width:1024px){.s-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:768px){.s-grid{grid-template-columns:repeat(2,1fr);gap:14px}}
.s-card{display:block;text-decoration:none;color:inherit;transition:transform .3s}
.s-card:hover{transform:translateY(-4px)}
.s-card-img{aspect-ratio:4/5;background:#f5f5f5;overflow:hidden;border-radius:8px;margin-bottom:12px}
.s-card-img img{width:100%;height:100%;object-fit:cover;transition:transform .6s}
.s-card:hover .s-card-img img{transform:scale(1.04)}
.s-card-name{font-family:'Archivo Black',sans-serif;font-size:13px;letter-spacing:.5px;text-transform:uppercase;margin:0 0 6px}
.s-card-price{font-size:14px;font-weight:700}
.s-empty{text-align:center;padding:60px 24px;background:#fafafa;border-radius:12px;color:#525252}
.s-empty a{color:#0a0a0a;font-weight:700;text-decoration:underline}
</style>

<div class="spage">
  <form class="s-form" action="/search" method="get" role="search">
    <input type="search" name="q" placeholder="Search oversized tees, crop tops, shirts..." value="${escapeAttr(query)}" autocomplete="off" autofocus>
    <button type="submit">Search</button>
  </form>
  ${heroBlock}
  ${productGrid}
</div>
`

  return shell(
    title,
    desc,
    body,
    {
      url: canonical,
      canonical,
      schema,
      // (noindex not enforced via shell — canonical to home for typos handles link-equity consolidation;
      //  empty-query page still shows as a soft "browse" page that redirects users to real search anyway)
      razorpayKeyId: opts.razorpayKeyId,
      googleClientId: opts.googleClientId,
      products: opts.products,
      legalPages: opts.legalPages,
      useMagicCheckout: !!opts.useMagicCheckout,
      maintenanceConfig: opts.maintenanceConfig,
      storeSettings: opts.storeSettings,
    } as any
  )
}

function escapeHtml(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escapeAttr(s: string): string {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
