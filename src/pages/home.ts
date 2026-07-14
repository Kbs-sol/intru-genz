import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

export function homePage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  useMagicCheckout?: boolean;
  maintenanceConfig?: { mode?: string; message?: string; eta?: string };
  storeSettings?: Record<string, string>;
}): string {
  const rawProducts = opts.products;
  // Sort products to ensure Doodles and Stripe 18 are front-and-center
  const prioritySlugs = ['doodles-t-shirt', 'stripe-18-shirt'];
  const featuredProducts = rawProducts.filter(p => prioritySlugs.includes(p.slug))
                                    .sort((a, b) => prioritySlugs.indexOf(a.slug) - prioritySlugs.indexOf(b.slug));
  const otherProducts = rawProducts.filter(p => !prioritySlugs.includes(p.slug));
  const products = [...featuredProducts, ...otherProducts];
  
  const legalPages = opts.legalPages;
  const featuredOne = products[0];
  const featuredTwo = products[1];

  const schema = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Intru Drop Catalog — Current Collection",
      "description": "Exclusive limited-edition streetwear drops by intru.in. Premium heavyweight oversized t-shirts, brutalist Indian streetwear.",
      "url": "https://intru.in/#products",
      "numberOfItems": products.length,
      "itemListElement": products.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Product",
          "name": p.name,
          "description": p.description || p.name,
          "url": "https://intru.in/product/" + p.slug,
          "image": p.images,
          "brand": { "@type": "Brand", "name": "Intru" },
          "offers": {
            "@type": "Offer",
            "price": p.price,
            "priceCurrency": "INR",
            "availability": p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "url": "https://intru.in/product/" + p.slug,
            "seller": { "@type": "Organization", "name": "Intru" }
          }
        }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Intru",
      "url": "https://intru.in",
      "description": "India's exclusive limited-edition streetwear brand. Premium heavyweight oversized t-shirts, brutalist designs, zero restocks.",
      "image": "https://intru.in/og-default.jpg",
      "logo": "https://intru.in/favicon.png",
      "priceRange": "₹899 - ₹2499",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
      "hasMap": "https://intru.in",
      "areaServed": "IN",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hyderabad",
        "addressRegion": "Telangana",
        "addressCountry": "IN"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "shop@intru.in",
        "contactType": "customer service"
      },
      "sameAs": [
        "https://instagram.com/intru.in"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Intru?",
          "acceptedAnswer": { "@type": "Answer", "text": "Intru (intru.in) is India's exclusive limited-edition streetwear brand based in Hyderabad. We produce premium heavyweight oversized t-shirts with brutalist minimalist designs in small batches — zero restocks, ever." }
        },
        {
          "@type": "Question",
          "name": "Does Intru offer free shipping in India?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. All prepaid orders (UPI, cards, net banking) get free shipping across India. COD orders have a ₹99 convenience fee. Orders are dispatched within 36 hours." }
        },
        {
          "@type": "Question",
          "name": "What makes Intru the best oversized t-shirt brand in India?",
          "acceptedAnswer": { "@type": "Answer", "text": "Intru uses premium 240 GSM heavyweight cotton with garment-dyeing for a soft hand-feel, brutalist design aesthetics, and strict limited production — no restocks means every piece is genuinely exclusive." }
        },
        {
          "@type": "Question",
          "name": "Can I return clothes from Intru?",
          "acceptedAnswer": { "@type": "Answer", "text": "Intru offers exchanges only (no refunds). Report any manufacturing defects within 36 hours of delivery. All sales are final." }
        },
        {
          "@type": "Question",
          "name": "How do I get access to the next Intru drop?",
          "acceptedAnswer": { "@type": "Answer", "text": "Join the priority list by entering your email on intru.in. Drops sell out within hours so early access is essential." }
        }
      ]
    }
  ]);

  const body = `
<svg style="display:none"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="0.1"/><feFuncG type="linear" slope="0.1"/><feFuncB type="linear" slope="0.1"/></feComponentTransfer><feComposite operator="in" in2="SourceGraphic"/></filter></svg>

<style>
:root { --eo: cubic-bezier(0.8, 0, 0.2, 1); }
html, body { overflow-x: hidden !important; width: 100% !important; max-width: 100vw !important; }
/* ====== BENTO HERO [AG] ====== */
.hero{min-height:calc(100vh - 72px);display:flex;background:var(--bk);overflow:hidden;position:relative}
.hero::after{content:'';position:absolute;inset:0;backdrop-filter:url(#grain);opacity:0.4;pointer-events:none}

.h-split{display:flex;width:100%;max-width:1440px;margin:0 auto;position:relative;z-index:10;gap:40px}
.h-l{flex:1;display:flex;flex-direction:column;justify-content:center;padding:60px 48px;text-align:left}
.h-r{flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:24px;align-items:center;padding:48px 48px 48px 0}

@media(max-width:1024px){
  .hero{min-height:auto}
  .h-split{flex-direction:column;gap:0}
  .h-l{padding:80px 24px 40px}
  .h-r{padding:24px;border-top:1px solid rgba(255,255,255,0.1)}
}
@media(max-width:768px){
  .h-r{grid-template-columns:1fr;padding:24px}
  .hf-card:nth-child(2) {display:none} /* Clean mobile UX: Only 1 hero product */
}

.h-over{font-size:11px;font-weight:900;letter-spacing:10px;text-transform:uppercase;color:var(--wh);opacity:0.4;margin-bottom:24px;display:block}
.h-title{font-family:var(--head);font-size:clamp(32px,12vw,120px);line-height:0.85;font-weight:900;letter-spacing:-.065em;text-transform:uppercase;color:var(--wh);margin:0;word-wrap:break-word}
.h-title span.w-300{font-weight:300;opacity:0.6;letter-spacing:-.02em}

/* FEATURE CARD IN HERO [AG] */
.hf-card{width:100%;background:var(--wh);color:var(--bk);position:relative;display:flex;flex-direction:column}
.hf-img{aspect-ratio:4/5;overflow:hidden;background:var(--g100);position:relative}
.hf-img img{width:100%;height:100%;object-fit:cover;transition:transform 1s var(--eo)}
.hf-card:hover .hf-img img{transform:scale(1.03)}

/* Hover reveal Quick Add — single line [AG] */
.hf-sizes-box{position:absolute;inset:0;top:auto;background:rgba(255,255,255,0.96);backdrop-filter:blur(8px);padding:8px 10px;transform:translateY(100%);transition:transform .35s var(--eo);z-index:20;border-top:1px solid rgba(0,0,0,0.06);display:flex;align-items:center;gap:6px}
.hf-card:hover .hf-sizes-box{transform:translateY(0)}

.hf-body{padding:14px 16px;display:flex;justify-content:space-between;align-items:center;background:var(--wh);position:relative;z-index:30}
.hf-name{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0}
.hf-price{font-size:13px;font-weight:900}
.hf-sizes{display:flex;flex-wrap:nowrap;gap:5px;flex:1}
.hf-sz{flex:1;min-width:0;padding:6px 4px;border:1px solid var(--g200);text-align:center;font-size:9px;font-weight:900;letter-spacing:.5px;cursor:pointer;transition:all .25s;background:var(--wh);white-space:nowrap}
.hf-sz:hover{background:var(--bk);color:var(--wh);border-color:var(--bk)}

/* MAIN GRID AND MARQUEE (MINIMALISM) [AG] */
.mq{background:var(--wh);border-bottom:1px solid var(--g100);padding:16px 0;width:100%;overflow:hidden;position:relative;display:block}
.mqt{display:flex;white-space:nowrap;width:max-content;animation:scroll-mq 60s linear infinite}
@keyframes scroll-mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.mqi{color:var(--bk);font-size:10px;font-weight:900;letter-spacing:4px;text-transform:uppercase;margin:0 24px}
.mq-dot{color:var(--g300);margin:0;font-size:14px;line-height:1}

.psec{background:var(--wh);padding:100px 32px}
.shdr{border-bottom:1.5px solid var(--bk);margin-bottom:64px;padding-bottom:16px;display:flex;justify-content:space-between;align-items:center}
.stitle{font-family:var(--head);font-size:32px;letter-spacing:-2px;text-transform:uppercase}

.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
@media(max-width:1024px){.pgrid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.pgrid{grid-template-columns:1fr}}

.pcard{text-decoration:none;color:inherit;position:relative;display:block}
.pc-img{aspect-ratio:4/5;background:var(--g50);overflow:hidden;position:relative}
.pc-img img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--eo)}
.pcard:hover .pc-img img{transform:scale(1.02)}

.pc-quick{position:absolute;inset:0;top:auto;background:rgba(255,255,255,0.96);backdrop-filter:blur(8px);padding:8px 10px;transform:translateY(100%);transition:transform .35s var(--eo);z-index:20;border-top:1px solid rgba(0,0,0,0.06);display:flex;align-items:center;gap:5px}
.pcard:hover .pc-quick{transform:translateY(0)}

.pcinfo{padding:14px 0 0}
.pcname{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
.pcp-row{display:flex;justify-content:space-between;align-items:center}
.pcprice{font-size:13px;font-weight:900}
.pccomp{font-size:11px;color:var(--g400);text-decoration:line-through}

/* PURE TYPOGRAPHY BADGES [AG] */
.t-badge{display:inline-block;padding:2px 0 6px;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;border-bottom:1.5px solid var(--bk);margin-bottom:12px}
.t-badge.red{color:var(--red);border-color:var(--red)}

.story{padding:140px 32px;background:var(--wh);max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1.2fr;gap:100px;align-items:end;overflow:hidden}
.story-h{font-family:var(--head);font-size:clamp(26px,8vw,72px);line-height:0.85;font-weight:900;text-transform:uppercase;letter-spacing:-.05em;margin:0;word-wrap:break-word}
.story-cnt p{font-size:16px;color:var(--g500);line-height:1.7;margin:0}
@media(max-width:768px){.story{grid-template-columns:1fr;gap:40px;padding:80px 24px}}
</style>

<section class="hero">
  <div class="h-split">
    <div class="h-l">
      <span class="h-over anim">Limited Dropout.03</span>
      <h1 class="h-title anim d1">
        <span class="w-300">MODERN</span><br>
        MINIMALISM<br>
        <span class="w-300">EVERY DAY</span>
      </h1>
      <div style="margin-top:60px" class="anim d2">
        <a href="#products" style="font-size:12px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:var(--wh);border-bottom:1.5px solid var(--wh);padding-bottom:10px">Explore Drop ↓</a>
      </div>
    </div>
    
    <div class="h-r">
      ${[featuredOne, featuredTwo].map((p, i) => p ? `
      <div class="hf-card anim d${i+3}">
        <a href="/product/${p.slug}" class="hf-img-link" style="display:block;cursor:pointer">
          <div class="hf-img">
            <img src="${p.images[0]}" alt="${p.name}">
            <div class="hf-sizes-box">
              <div class="hf-sizes">
                ${(p.sizes || ['S', 'M', 'L', 'XL']).map(sz => `<div class="hf-sz" onclick="event.preventDefault();event.stopPropagation();quickAddToCart('${p.id}','${sz}')">${sz}</div>`).join('')}
              </div>
            </div>
          </div>
        </a>
        <a href="/product/${p.slug}" style="text-decoration:none;color:inherit">
          <div class="hf-body">
            <h2 class="hf-name">${p.name}</h2>
            <div class="hf-price">${STORE_CONFIG.currencySymbol}${p.price.toLocaleString('en-IN')}</div>
          </div>
        </a>
      </div>
      ` : '').join('')}
    </div>
  </div>
</section>

<div class="mq">
  <div class="mqt">
    ${Array(20).fill('<span class="mqi">MODERN MINIMALISM</span><span class="mq-dot">•</span><span class="mqi">EVERYDAY ESSENTIALS</span><span class="mq-dot">•</span><span class="mqi" style="color:var(--g500)">PREMIUM HEAVYWEIGHT</span><span class="mq-dot">•</span>').join('')}
  </div>
</div>

<section class="psec" id="products">
  <div class="shdr"><h2 class="stitle anim">The Drop Catalog</h2><div style="font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;opacity:0.4">${products.length} Designs</div></div>
  <div class="pgrid">
  ${products.map((p, i) => {
    const sizes = p.sizes || ['S', 'M', 'L', 'XL'];
    const totalStock = p.stockCount ? Object.values(p.stockCount).reduce((a: number, b: number) => a + b, 0) : 12;

    return `
    <div class="pcard anim d${(i % 3) + 1}">
      <a href="/product/${p.slug}" class="pc_link_img">
        <div class="pc-img">
          <img src="${p.images[0]}" alt="${p.name}" loading="${i < 3 ? 'eager' : 'lazy'}" width="400" height="500">
          <div class="pc-quick">
            <div class="hf-sizes">
              ${sizes.map(sz => `<div class="hf-sz" onclick="event.preventDefault();quickAddToCart('${p.id}','${sz}')">${sz}</div>`).join('')}
            </div>
          </div>
        </div>
      </a>
      <div class="pcinfo">
        ${totalStock <= 5 ? `<span class="t-badge red">Only ${totalStock} Left</span>` : `<span class="t-badge">Limited Batch</span>`}
        <a href="/product/${p.slug}" style="text-decoration:none;color:inherit"><h3 class="pcname">${p.name}</h3></a>
        <div class="pcp-row">
          <div class="pcprice">${STORE_CONFIG.currencySymbol}${p.price.toLocaleString('en-IN')}</div>
          ${p.comparePrice ? `<div class="pccomp">${STORE_CONFIG.currencySymbol}${p.comparePrice.toLocaleString('en-IN')}</div>` : ''}
        </div>
      </div>
    </div>`;
  }).join('')}
  </div>
</section>

<section class="story">
  <h2 class="story-h anim">UNCOMPROMISING<br>STREETWEAR.</h2>
  <div class="story-cnt anim d1">
    <p>We destroy the screens after every drop. At <strong>Intru</strong>, mass production is the enemy. We build the best oversized collection for the individual who demands exclusivity over conformity.</p>
    <p style="margin-top:32px">Heavyweight materials. Industrial finishes. Brutalist design. This is not just clothing; it\\'s a collection of artifacts.</p>
  </div>
</section>

<section class="nlsec" id="newsletter">
  <h3>Secure the next drop.</h3>
  <p>Our releases sell out within hours. Join the priority list for early access.</p>
  <form class="nlform" onsubmit="event.preventDefault();subscribeEmail(this)">
    <input class="nlinp" type="email" placeholder="Email address" required id="nlEmail" style="border-radius:0">
    <button class="nlbtn" type="submit" id="nlBtn">Get Access</button>
  </form>
</section>

<script>
var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.style.animationPlayState='running';obs.unobserve(e.target)}})},{threshold:.1});
document.querySelectorAll('.anim').forEach(function(el){el.style.animationPlayState='paused';obs.observe(el)});

function subscribeEmail(form){
  var e=document.getElementById('nlEmail').value; if(!e)return;
  var b=document.getElementById('nlBtn'); b.disabled=true; b.textContent='...';
  fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e})})
  .then(function(r){return r.json()}).then(function(d){
    toast(d.message||d.error||'Thank you!','ok'); form.reset();
  }).finally(function(){b.disabled=false; b.textContent='Get Access'});
}
</script>
`;

  return shell(
    'Intru | Minimalist Streetwear India — Pieces That Feel Like You',
    'Tired of everyone wearing the same thing? Intru is minimalist streetwear for individuals — clean, intentional, oversized tees designed to feel like YOU. Limited stock only, never restocked, made with love in India. Ships across India.',
    body,
    { url: 'https://intru.in', schema, razorpayKeyId: opts.razorpayKeyId, googleClientId: opts.googleClientId, products, legalPages, useMagicCheckout: !!opts.useMagicCheckout, maintenanceConfig: opts.maintenanceConfig, storeSettings: opts.storeSettings }
  );
}
