import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

export function collectionsPage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
  /** [AG: category deep-link] Category name pulled from ?cat= query — matches
   *  the values shown in the header dropdown (T-Shirts, Crop-Tops, Shirts).
   *  Filtering happens on the client via filterCat(), which is auto-triggered
   *  when initialCat is present. */
  initialCat?: string;
}): string {
  const products = opts.products;
  const legalPages = opts.legalPages;

  // Extract unique categories
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Normalize the deep-link ?cat= value against product categories.
  // URLs use hyphens for readability ("Crop-Tops"), but category names can contain either
  // hyphens ("T-Shirts") or spaces ("Crop Tops"). Compare by stripping BOTH to alphanumerics,
  // so "T-Shirts" == "T Shirts" == "tshirts" all match. Case-insensitive.
  const initialCat = (opts.initialCat || '').trim();
  const strip = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const normalizedInitial = strip(initialCat);
  const matchedCat = normalizedInitial
    ? (categories.find(c => strip(c) === normalizedInitial) || '')
    : '';
  const isFiltered = !!matchedCat;
  const visibleCount = isFiltered ? products.filter(p => p.category === matchedCat).length : products.length;

  const schema = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "All Collections | Intru — Indian Streetwear",
      "description": "Shop all minimalist streetwear drops by Intru — for individuals who want to stop wearing the same thing as everyone else. Heavyweight oversized t-shirts, brutalist intentional designs. Never restocked — buy before it's gone.",
      "url": "https://intru.in/collections",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://intru.in" },
          { "@type": "ListItem", "position": 2, "name": "Collections", "item": "https://intru.in/collections" }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "Intru Drop Catalog",
        "numberOfItems": products.length,
        "itemListElement": products.map((p, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": {
            "@type": "Product",
            "name": p.name,
            "description": p.description || p.name,
            "url": "https://intru.in/product/" + p.slug,
            "image": p.images[0],
            "brand": { "@type": "Brand", "name": "Intru" },
            "offers": {
              "@type": "Offer",
              "price": p.price,
              "priceCurrency": "INR",
              "availability": p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          }
        }))
      }
    }
  ]);

  const body = `<style>
.col{max-width:1280px;margin:0 auto;padding:60px 24px 100px}
.col-hdr{text-align:center;margin-bottom:48px}
.col-over{font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--g400);margin-bottom:8px}
.col-title{font-family:var(--head);font-size:clamp(28px,5vw,48px);text-transform:uppercase;letter-spacing:-.03em;margin-bottom:12px}
.col-sub{font-size:14px;color:var(--g400);max-width:500px;margin:0 auto}
.col-filters{display:flex;justify-content:center;gap:8px;margin-bottom:40px;flex-wrap:wrap}
.cf-btn{padding:10px 20px;border:1.5px solid var(--g200);background:none;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g500);transition:all .2s}
.cf-btn:hover{border-color:var(--bk);color:var(--bk)}
.cf-btn.act{background:var(--bk);color:var(--wh);border-color:var(--bk)}
.col-count{font-size:12px;color:var(--g400);text-align:center;margin-bottom:24px}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.pcard{position:relative;overflow:hidden;cursor:pointer;text-decoration:none;color:inherit;transition:transform .4s var(--ease)}
.pcard:hover{transform:translateY(-4px)}
.pcard.hidden{display:none}
.pcimg{position:relative;aspect-ratio:3/4;overflow:hidden;border-radius:8px;background:var(--g50)}
.pcimg img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease)}
.pcard:hover .pcimg img{transform:scale(1.06)}
.pcimg .ih{position:absolute;inset:0;opacity:0;transition:opacity .4s}.pcard:hover .pcimg .ih{opacity:1}
.pcbadge{position:absolute;top:10px;left:10px;background:var(--bk);color:var(--wh);font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 10px;border-radius:3px}
.pcinfo{padding:14px 2px 0}
.pcname{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
.pctag{font-size:12px;color:var(--g400);margin-bottom:6px}
.pcprice{display:flex;align-items:center;gap:8px}
.pcprice .cur{font-size:15px;font-weight:700}
.pcprice .cmp{font-size:12px;color:var(--g300);text-decoration:line-through}
.pcprice .sv{font-size:10px;font-weight:700;color:#16a34a;background:#f0fdf4;padding:2px 6px;border-radius:3px}
@media(max-width:1024px){.pgrid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.pgrid{grid-template-columns:1fr;max-width:380px;margin:0 auto}}
</style>

<div class="col">
<div class="col-hdr">
<p class="col-over anim">${isFiltered ? 'Shop ' + matchedCat : 'Shop the Drop'}</p>
<h1 class="col-title anim d1">${isFiltered ? matchedCat : 'Collections'}</h1>
<p class="col-sub anim d2">${isFiltered ? 'Heavyweight ' + matchedCat.toLowerCase() + ' — minimalist streetwear for individuals. Never restocked, made in small batches.' : 'Minimalist streetwear for individuals. Every piece designed for two months, never mass-produced.'}</p>
</div>

<div class="col-filters" id="filters">
<button class="cf-btn${!isFiltered ? ' act' : ''}" data-cat="all" onclick="filterCat('all',this)">All</button>
${categories.map(cat => '<button class="cf-btn' + (matchedCat === cat ? ' act' : '') + '" data-cat="' + cat + '" onclick="filterCat(\'' + cat.replace(/'/g, "\\'") + '\',this)">' + cat + '</button>').join('')}
</div>

<p class="col-count" id="colCount">${visibleCount} product${visibleCount !== 1 ? 's' : ''}</p>

<div class="pgrid" id="pgrid">
${products.map((p, i) => {
    const d = p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
    const sizes = p.sizes || ['S', 'M', 'L', 'XL'];
    return `<a href="/product/${p.slug}" class="pcard anim d${(i % 4) + 1}" data-cat="${p.category}">
<div class="pcimg">
<img src="${p.images[0]}" alt="Intru ${p.name}" loading="${i < 3 ? 'eager' : 'lazy'}" width="400" height="533">
${p.images[1] ? '<img class="ih" src="' + p.images[1] + '" alt="' + p.name + '" loading="lazy" width="400" height="533" style="width:100%;height:100%;object-fit:cover">' : ''}
${d > 0 ? '<span class="pcbadge">Save ' + d + '%</span>' : ''}
<div class="pcard-actions">
  <div class="pcsizes">
    ${sizes.map(sz => `<div class="pcsz" data-pid="${p.id}" data-sz="${sz}" onclick="selectQuickSize(event,'${p.id}','${sz}')">${sz}</div>`).join('')}
  </div>
  <div class="pcbtns">
    <button class="pc-atc" onclick="handleQuickAction(event,'atc','${p.id}')">Add to Bag</button>
    <button class="pc-bn" onclick="handleQuickAction(event,'bn','${p.id}')">Buy Now</button>
  </div>
</div>
</div>
<div class="pcinfo">
<h3 class="pcname">${p.name}</h3>
<p class="pctag">${p.tagline}</p>
<div class="pcprice">
<span class="cur">${STORE_CONFIG.currencySymbol}${p.price.toLocaleString('en-IN')}</span>
${p.comparePrice ? '<span class="cmp">' + STORE_CONFIG.currencySymbol + p.comparePrice.toLocaleString('en-IN') + '</span>' : ''}
${d > 0 ? '<span class="sv">' + d + '% OFF</span>' : ''}
</div></div></a>`;
  }).join('\n')}
</div>

<div class="col-seo-block" style="margin-top:64px;padding-top:40px;border-top:1px solid var(--g200);color:var(--g600);font-size:13px;line-height:1.8">
  <div style="max-width:840px;margin:0 auto">
    <h2 style="font-family:var(--head);font-size:18px;text-transform:uppercase;letter-spacing:-.02em;color:var(--bk);margin-bottom:12px">
      ${isFiltered ? `${matchedCat} — Indian Streetwear Engineered for Individuals` : 'Oversized Streetwear Designed in India — The Heavyweight Standard'}
    </h2>
    <p style="margin-bottom:14px">
      Unlike fast-fashion brands that simply upsize regular fits, Intru patterns are custom-tailored with dropped shoulders, elongated body cuts, and ribbed high-density collars that never stretch or bacon. Every garment is crafted from <strong>220–260 GSM garment-dyed combed cotton</strong> to deliver structured drape and breathable comfort in Indian weather.
    </p>
    <p style="margin-bottom:14px">
      All drops are produced in small, numbered batches and are never restocked once claimed. Orders ship free pan-India on prepaid payments, backed by our <strong>36-Hour Free Size Exchange & Defect Replacement Guarantee</strong>.
    </p>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">
      <a href="/blog/best-oversized-tshirt-brands-india-2026" style="color:var(--bk);text-decoration:underline">📖 2026 Oversized Brand Guide →</a>
      <a href="/blog/how-to-choose-oversized-tshirt-size" style="color:var(--bk);text-decoration:underline">📏 Sizing & Fit Guide →</a>
      <a href="/style-guide" style="color:var(--bk);text-decoration:underline">⚡ 6 Ways to Style an Oversized Tee →</a>
    </div>
  </div>
</div>
</div>

<script>
function filterCat(cat, btn) {
  document.querySelectorAll('.cf-btn').forEach(function(b) { b.classList.remove('act') });
  if (btn) btn.classList.add('act');
  var cards = document.querySelectorAll('.pcard');
  var count = 0;
  cards.forEach(function(c) {
    if (cat === 'all' || c.dataset.cat === cat) { c.classList.remove('hidden'); count++; }
    else { c.classList.add('hidden'); }
  });
  var cc = document.getElementById('colCount');
  if (cc) cc.textContent = count + ' product' + (count !== 1 ? 's' : '');
  // Sync URL so deep links, back/forward, and reload all preserve the filter
  try {
    var u = new URL(window.location.href);
    if (cat === 'all') u.searchParams.delete('cat');
    else u.searchParams.set('cat', cat.replace(/ /g, '-'));
    window.history.replaceState({}, '', u.toString());
  } catch (e) {}
}
// [AG: category deep-link] Auto-apply filter from ?cat= on load (server-side already
// marked the button .act; this hides non-matching cards without an extra click).
(function(){
  ${isFiltered ? "var initial='" + matchedCat.replace(/'/g, "\\'") + "'; var btn=document.querySelector('.cf-btn[data-cat=\"'+initial+'\"]'); filterCat(initial, btn);" : ''}
})();
</script>`;

  const pageTitle = isFiltered
    ? `${matchedCat} Drops | Oversized Streetwear India — Intru`
    : 'Shop Drops | Oversized Streetwear T-Shirts India — Intru';
  const pageDesc = isFiltered
    ? `Explore Intru's limited-run ${matchedCat.toLowerCase()} collection. 240+ GSM heavyweight cotton, dropped shoulder silhouettes, designed in India. Zero restocks.`
    : 'Shop limited-edition oversized t-shirts, crop tees & streetwear drops by Intru. 240+ GSM heavyweight fabric, intentional boxy silhouettes, free prepaid shipping in India.';

  return shell(
    pageTitle,
    pageDesc,
    body,
    { url: isFiltered ? `https://intru.in/collections?cat=${encodeURIComponent(matchedCat)}` : 'https://intru.in/collections', schema, razorpayKeyId: opts.razorpayKeyId, googleClientId: opts.googleClientId, products, legalPages, useMagicCheckout: !!opts.useMagicCheckout, maintenanceConfig: opts.maintenanceConfig, storeSettings: opts.storeSettings }
  );
}
