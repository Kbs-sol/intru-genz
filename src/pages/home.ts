import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

export function homePage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  useMagicCheckout?: boolean;
}): string {
  const products = opts.products;
  const legalPages = opts.legalPages;

  const schema = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", "itemListElement": products.map((p, i) => ({ "@type": "ListItem", "position": i + 1, "item": { "@type": "Product", "name": p.name, "url": "https://intru.in/product/" + p.slug, "image": p.images, "offers": { "@type": "Offer", "price": p.price, "priceCurrency": "INR", "availability": "https://schema.org/InStock" } } })) });

  const body = `<style>
.noise{position:absolute;inset:0;opacity:.04;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")}
.hero{min-height:92vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:120px 24px;position:relative;background:#fff;overflow:hidden}
.hero-over{font-size:11px;font-weight:800;letter-spacing:6px;text-transform:uppercase;color:var(--bk);margin-bottom:24px;display:flex;align-items:center;gap:12px}.hero-over::before,.hero-over::after{content:'';width:40px;height:1px;background:var(--g200)}
.hero-title{font-family:var(--head);font-size:clamp(44px,10vw,110px);font-weight:900;line-height:.9;letter-spacing:-.06em;text-transform:uppercase;max-width:1000px;margin-bottom:24px;color:var(--bk)}
.hero-sub{font-size:16px;color:var(--g500);max-width:520px;line-height:1.7;margin-bottom:48px;font-weight:500}
.hero-cta{display:inline-flex;align-items:center;gap:16px;padding:20px 52px;background:var(--bk);color:var(--wh);font-size:12px;font-weight:800;letter-spacing:4px;text-transform:uppercase;border:none;transition:all .4s var(--eo);box-shadow:0 24px 48px rgba(0,0,0,.15)}
.hero-cta:hover{background:var(--g600);transform:translateY(-4px);box-shadow:0 32px 64px rgba(0,0,0,.25)}
.hero-scroll{position:absolute;bottom:48px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--g300);display:flex;flex-direction:column;align-items:center;gap:12px}
.hero-line{width:1px;height:48px;background:linear-gradient(to bottom,var(--g300),transparent)}
.mq{overflow:hidden;padding:16px 0;background:var(--bk)}
.mqt{display:flex;gap:40px;white-space:nowrap;animation:marquee 25s linear infinite}
.mqi{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--wh);opacity:.5;flex-shrink:0}
.mqd{opacity:.3}
.story{max-width:700px;margin:0 auto;padding:100px 24px;text-align:center}
.story-over{font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--g400);margin-bottom:20px}
.story-txt{font-size:clamp(20px,3vw,28px);line-height:1.6;color:var(--g500);font-weight:400}
.story-txt strong{color:var(--bk);font-weight:700}
.psec{padding:80px 24px;max-width:1280px;margin:0 auto}
.shdr{text-align:center;margin-bottom:60px}
.sover{font-size:10px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--g400);margin-bottom:8px}
.stitle{font-family:var(--head);font-size:clamp(24px,4vw,40px);text-transform:uppercase;letter-spacing:-.03em}
.pgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.pcard{position:relative;overflow:hidden;cursor:pointer;text-decoration:none;color:inherit;transition:transform .4s var(--ease)}
.pcard:hover{transform:translateY(-4px)}
.pcimg{position:relative;aspect-ratio:3/4;overflow:hidden;border-radius:8px;background:var(--g50)}
.pcimg img{width:100%;height:100%;object-fit:cover;transition:transform .6s var(--ease)}
.pcard:hover .pcimg img{transform:scale(1.06)}
.pcimg .ih{position:absolute;inset:0;opacity:0;transition:opacity .6s var(--eo)}.pcard:hover .pcimg .ih{opacity:1}
.pcbadge{position:absolute;top:12px;left:12px;background:var(--bk);color:var(--wh);font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:6px 12px;border-radius:2px;z-index:2}
.limited-badge{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.9);color:var(--bk);font-size:8px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 8px;border-radius:2px;backdrop-filter:blur(4px);z-index:2}
.pcinfo{padding:14px 2px 0}
.pcname{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
.pctag{font-size:12px;color:var(--g400);margin-bottom:6px}
.pcprice{display:flex;align-items:center;gap:8px}
.pcprice .cur{font-size:15px;font-weight:700}
.pcprice .cmp{font-size:12px;color:var(--g300);text-decoration:line-through}
.pcprice .sv{font-size:10px;font-weight:700;color:#16a34a;background:#f0fdf4;padding:2px 6px;border-radius:3px}
.feats{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;max-width:1280px;margin:0 auto;padding:80px 24px;border-top:1px solid var(--g100)}
.feat{text-align:center;padding:28px 12px}
.ficon{width:52px;height:52px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--g200);border-radius:50%;font-size:18px;color:var(--g500)}
.feat h4{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.feat p{font-size:12px;color:var(--g400);line-height:1.5}
.tsec{background:var(--g50);padding:80px 24px;text-align:center}
.tquote{font-size:clamp(18px,2.5vw,24px);line-height:1.6;max-width:650px;margin:0 auto 20px;color:var(--g500);font-weight:400;font-style:italic}
.tauth{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--g400)}
.nlsec{max-width:560px;margin:0 auto;padding:80px 24px;text-align:center}
.nlsec h3{font-family:var(--head);font-size:clamp(22px,3vw,32px);text-transform:uppercase;letter-spacing:-.02em;margin-bottom:10px}
.nlsec p{color:var(--g400);font-size:13px;margin-bottom:28px}
.nlform{display:flex;gap:0;max-width:420px;margin:0 auto}
.nlinp{flex:1;padding:14px 18px;border:1.5px solid var(--g200);border-right:none;font-size:13px;font-family:inherit;outline:none;transition:border-color .2s}.nlinp:focus{border-color:var(--bk)}
.nlbtn{padding:14px 24px;background:var(--bk);color:var(--wh);border:1.5px solid var(--bk);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;transition:background .2s}.nlbtn:hover{background:var(--g600)}
.igsec{padding:80px 24px 40px;text-align:center}
.iggrid{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;overflow:hidden}
.igit{aspect-ratio:1;overflow:hidden;position:relative}
.igit img{width:100%;height:100%;object-fit:cover;transition:transform .4s var(--ease)}
.igit:hover img{transform:scale(1.08)}
.igit::after{content:'\\f16d';font-family:'Font Awesome 6 Brands';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);color:#fff;font-size:22px;opacity:0;transition:opacity .3s}.igit:hover::after{opacity:1}
@media(max-width:1024px){.pgrid{grid-template-columns:repeat(2,1fr)}.feats{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.pgrid{grid-template-columns:1fr;max-width:380px;margin:0 auto}.feats{grid-template-columns:1fr}.nlform{flex-direction:column}.nlinp{border-right:1.5px solid var(--g200)}.iggrid{grid-template-columns:repeat(3,1fr)}}
</style>

<section class="hero">
<div class="noise"></div>
<p class="hero-over anim">Est. 2025 &mdash; Premium Indian Streetwear</p>
<h1 class="hero-title anim d1">LIMITED DROPS.<br>NO RESTOCKS.</h1>
<p class="hero-sub anim d2">${STORE_CONFIG.description}</p>
<div class="anim d3" style="margin-bottom:32px;font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:var(--green)">⚡ 100% Cotton &bull; Oversized Fit &bull; Made in India</div>
<a href="#products" class="hero-cta anim d4">Discover the Drop <i class="fas fa-arrow-right"></i></a>
<div class="hero-scroll"><span>Explore Collection</span><div class="hero-line"></div></div>
</section>

    <div class="mq"><div class="mqt">
${Array(4).fill('<span class="mqi">Limited Stock Only</span><span class="mqi mqd">/</span><span class="mqi">No Fake Drops</span><span class="mqi mqd">/</span><span class="mqi" style="color:#22c55e;opacity:1">Free Delivery on Prepaid ⚡</span><span class="mqi mqd">/</span><span class="mqi">Made With Love</span><span class="mqi mqd">/</span><span class="mqi">Made in India</span><span class="mqi mqd">/</span><span class="mqi">Never Restocked</span><span class="mqi mqd">/</span>').join('')}
    </div></div>

<section class="story" id="story">
<p class="story-over anim">Our Story</p>
<p class="story-txt anim d1">We're <strong>super picky</strong> about what we wear. We <strong>hate mass-produced, same-pattern</strong> clothes that flood every store. So two best friends decided to do something about it &mdash; we launched <strong>INTRU.IN</strong> with a promise: <strong>limited stock only, no fake drops, every piece made with love.</strong></p>
<p class="story-txt anim d2" style="margin-top:20px">Each design is crafted over <strong>two months</strong> to feel like it was made just for YOU. When it's gone, it's <strong>never restocked</strong> &mdash; that's not a marketing tactic, that's our word.</p>
</section>

<section class="psec" id="products">
<div class="shdr"><p class="sover anim">The Collection</p><h2 class="stitle anim d1">Current Drop</h2></div>
<div class="pgrid">
${products.map((p, i) => {
    const d = p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
    const sizes = p.sizes || ['S', 'M', 'L', 'XL'];
    return `<a href="/product/${p.slug}" class="pcard anim d${(i % 4) + 1}">
<div class="pcimg">
<img src="${p.images[0]}" alt="INTRU.IN ${p.name} - Premium Streetwear ${p.category}" loading="${i < 4 ? 'eager' : 'lazy'}" width="400" height="533">
${p.images[1] ? '<img class="ih" src="' + p.images[1] + '" alt="INTRU.IN ' + p.name + ' - Exclusive Drop Detail" loading="lazy" width="400" height="533" style="width:100%;height:100%;object-fit:cover">' : ''}
${d > 0 ? '<span class="pcbadge">Save ' + d + '%</span>' : ''}
<span class="limited-badge">Exclusive Drop</span>
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
</div></section>

    <section class="feats">
      <div class="feat anim"><div class="ficon" style="color:#16a34a;border-color:#16a34a"><i class="fas fa-truck-fast"></i></div><h4>Free Delivery</h4><p>On all Prepaid orders</p></div>
<div class="feat anim d1"><div class="ficon"><i class="fas fa-bolt"></i></div><h4>Fast Dispatch</h4><p>Processed within 36 hours</p></div>
<div class="feat anim d2"><div class="ficon"><i class="fas fa-shield-alt"></i></div><h4>Secure Payment</h4><p>Razorpay protected</p></div>
<div class="feat anim d3"><div class="ficon"><i class="fas fa-exchange-alt"></i></div><h4>Limited Drop</h4><p>36h exchange request</p></div>
</section>

<section class="tsec">
<p class="sover anim">What People Say</p>
<blockquote class="tquote anim d1">"Finally, a brand that gets it &mdash; clean designs, perfect fits, and quality you can actually feel. intru.in is the only place I shop for basics now."</blockquote>
<p class="tauth anim d2">&mdash; Verified Customer</p>
</section>

<section class="igsec" id="igSection">
<p class="sover">Join the Drop</p>
<h3 style="font-family:var(--head);font-size:32px;text-transform:uppercase;letter-spacing:-.04em;margin-bottom:32px;color:var(--bk)">Official Feed</h3>
<div class="iggrid" id="igHomeGrid">
<!-- Default premium visuals -->
<a href="https://instagram.com/${STORE_CONFIG.instagram}" target="_blank" rel="noopener" class="igit"><img src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=600&fit=crop&q=80" alt="intru.in Lifestyle" loading="lazy"></a>
<a href="https://instagram.com/${STORE_CONFIG.instagram}" target="_blank" rel="noopener" class="igit"><img src="https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&h=600&fit=crop&q=80" alt="intru.in Aesthetic" loading="lazy"></a>
<a href="https://instagram.com/${STORE_CONFIG.instagram}" target="_blank" rel="noopener" class="igit"><img src="https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=600&fit=crop&q=80" alt="intru.in Detail" loading="lazy"></a>
<a href="https://instagram.com/${STORE_CONFIG.instagram}" target="_blank" rel="noopener" class="igit"><img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=600&fit=crop&q=80" alt="intru.in Streetwear" loading="lazy"></a>
<a href="https://instagram.com/${STORE_CONFIG.instagram}" target="_blank" rel="noopener" class="igit"><img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=600&fit=crop&q=80" alt="intru.in Basics" loading="lazy"></a>
<a href="https://instagram.com/${STORE_CONFIG.instagram}" target="_blank" rel="noopener" class="igit"><img src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&h=600&fit=crop&q=80" alt="intru.in Culture" loading="lazy"></a>
</div></section>

<section class="nlsec" id="newsletter">
<h3>Get Notified of the Next Drop</h3>
<p>Be the first to know when we release new products. No spam, ever.</p>
<form class="nlform" onsubmit="event.preventDefault();subscribeEmail(this)">
<input class="nlinp" type="email" placeholder="Your email" required id="nlEmail">
<button class="nlbtn" type="submit" id="nlBtn">Notify Me</button>
</form></section>

<script>
var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.style.animationPlayState='running';obs.unobserve(e.target)}})},{threshold:.1});
document.querySelectorAll('.anim').forEach(function(el){el.style.animationPlayState='paused';obs.observe(el)});

/* ====== IG Feed: hide if disabled ====== */
fetch('/api/instagram-feed').then(function(r){return r.json()}).then(function(d){
  if(d.enabled===false){var sec=document.getElementById('igSection');if(sec)sec.style.display='none';return}
  if(d.feed&&d.feed.length>0){
    var grid=document.getElementById('igHomeGrid');var h='';
    d.feed.forEach(function(item){h+='<a href="'+(item.link_url||'https://instagram.com/${STORE_CONFIG.instagram}')+'" target="_blank" rel="noopener" class="igit"><img src="'+item.image_url+'" alt="'+(item.caption||'intru.in Instagram')+'" loading="lazy" width="300" height="300"></a>'});
    if(h)grid.innerHTML=h;
  }
}).catch(function(){});

function subscribeEmail(form){
  var email=document.getElementById('nlEmail').value.trim();
  if(!email)return;
  var btn=document.getElementById('nlBtn');
  btn.disabled=true;btn.textContent='SUBSCRIBING...';
  fetch('/api/subscribe',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email:email})
  })
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success||d.message){
      toast(d.message||"You're on the list!",'ok-green');
      form.reset();
    } else {
      toast(d.error||'Failed to subscribe','err');
    }
  })
  .catch(function(e){toast('Error: '+e.message,'err')})
  .finally(function(){btn.disabled=false;btn.textContent='NOTIFY ME'});
}
</script>`;

  return shell(
    'INTRU.IN — Premium Streetwear India | Oversized Tees & Limited Edition Fashion',
    'Discover INTRU.IN: India\\\'s premier destination for limited-edition streetwear. Shop oversized tees, exclusive drops, and premium basics. No restocks, ever. Free delivery on all prepaid orders.',
    body,
    { url: 'https://intru.in', schema, razorpayKeyId: opts.razorpayKeyId, googleClientId: opts.googleClientId, products, legalPages, useMagicCheckout: opts.useMagicCheckout }
  );
}
