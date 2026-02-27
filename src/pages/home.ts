import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

export function homePage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
}): string {
  const products = opts.products;
  const legalPages = opts.legalPages;

  const schema = JSON.stringify({"@context":"https://schema.org","@type":"ItemList","itemListElement":products.map((p,i)=>({"@type":"ListItem","position":i+1,"item":{"@type":"Product","name":p.name,"url":"https://intru.in/product/"+p.slug,"image":p.images,"offers":{"@type":"Offer","price":p.price,"priceCurrency":"INR","availability":"https://schema.org/InStock"}}}))});

  const body = `<style>
.hero{min-height:calc(100vh - 64px);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:80px 24px;position:relative}
.hero-over{font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--g400);margin-bottom:20px}
.hero-title{font-family:var(--head);font-size:clamp(40px,8vw,88px);font-weight:900;line-height:1;letter-spacing:-.05em;text-transform:uppercase;max-width:900px;margin-bottom:20px}
.hero-sub{font-size:15px;color:var(--g400);max-width:480px;line-height:1.7;margin-bottom:40px;font-weight:400}
.hero-cta{display:inline-flex;align-items:center;gap:12px;padding:18px 48px;background:var(--bk);color:var(--wh);font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;border:none;transition:all .3s var(--ease)}
.hero-cta:hover{background:var(--g600);transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,.2)}
.hero-scroll{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--g300);display:flex;flex-direction:column;align-items:center;gap:8px}
.hero-line{width:1px;height:36px;background:linear-gradient(to bottom,var(--g300),transparent)}
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
.pcimg .ih{position:absolute;inset:0;opacity:0;transition:opacity .4s}.pcard:hover .pcimg .ih{opacity:1}
.pcbadge{position:absolute;top:10px;left:10px;background:var(--bk);color:var(--wh);font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 10px;border-radius:3px}
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
<p class="hero-over anim">Est. 2026 &mdash; India</p>
<h1 class="hero-title anim d1">LIMITED DROPS.<br>NO RESTOCKS.</h1>
<p class="hero-sub anim d2">${STORE_CONFIG.description}</p>
<a href="#products" class="hero-cta anim d3">Shop the Drop <i class="fas fa-arrow-right"></i></a>
<div class="hero-scroll"><span>Scroll</span><div class="hero-line"></div></div>
</section>

<div class="mq"><div class="mqt">
${Array(4).fill('<span class="mqi">Limited Drops</span><span class="mqi mqd">/</span><span class="mqi">36h Exchange Only</span><span class="mqi mqd">/</span><span class="mqi">Free Shipping Over Rs.1,999</span><span class="mqi mqd">/</span><span class="mqi">Premium 240 GSM</span><span class="mqi mqd">/</span><span class="mqi">Made in India</span><span class="mqi mqd">/</span><span class="mqi">Store Credit Only</span><span class="mqi mqd">/</span>').join('')}
</div></div>

<section class="story" id="story">
<p class="story-over anim">Our Story</p>
<p class="story-txt anim d1"><strong>INTRU.IN</strong> was born from a simple belief: <strong>great clothes don't need loud logos.</strong> We craft essential wardrobe pieces with premium fabrics and intentional design. Limited drops. No restocks. When it's gone, it's gone.</p>
</section>

<section class="psec" id="products">
<div class="shdr"><p class="sover anim">The Collection</p><h2 class="stitle anim d1">Current Drop</h2></div>
<div class="pgrid">
${products.map((p, i) => {
  const d = p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
  return `<a href="/product/${p.slug}" class="pcard anim d${(i%4)+1}">
<div class="pcimg">
<img src="${p.images[0]}" alt="intru.in ${p.name} - View 1" loading="${i<3?'eager':'lazy'}" width="400" height="533">
${p.images[1] ? '<img class="ih" src="'+p.images[1]+'" alt="intru.in '+p.name+' - View 2" loading="lazy" width="400" height="533" style="width:100%;height:100%;object-fit:cover">' : ''}
${d>0?'<span class="pcbadge">Save '+d+'%</span>':''}
</div>
<div class="pcinfo">
<h3 class="pcname">${p.name}</h3>
<p class="pctag">${p.tagline}</p>
<div class="pcprice">
<span class="cur">${STORE_CONFIG.currencySymbol}${p.price.toLocaleString('en-IN')}</span>
${p.comparePrice?'<span class="cmp">'+STORE_CONFIG.currencySymbol+p.comparePrice.toLocaleString('en-IN')+'</span>':''}
${d>0?'<span class="sv">'+d+'% OFF</span>':''}
</div></div></a>`;
}).join('\n')}
</div></section>

<section class="feats">
<div class="feat anim"><div class="ficon"><i class="fas fa-truck"></i></div><h4>Free Shipping</h4><p>Orders above Rs.1,999</p></div>
<div class="feat anim d1"><div class="ficon"><i class="fas fa-bolt"></i></div><h4>Fast Dispatch</h4><p>Processed within 36 hours</p></div>
<div class="feat anim d2"><div class="ficon"><i class="fas fa-shield-alt"></i></div><h4>Secure Payment</h4><p>Razorpay protected</p></div>
<div class="feat anim d3"><div class="ficon"><i class="fas fa-exchange-alt"></i></div><h4>Limited Drop</h4><p>36h exchange request</p></div>
</section>

<section class="tsec">
<p class="sover anim">What People Say</p>
<blockquote class="tquote anim d1">"Finally, a brand that gets it &mdash; clean designs, perfect fits, and quality you can actually feel. intru.in is the only place I shop for basics now."</blockquote>
<p class="tauth anim d2">&mdash; Verified Customer</p>
</section>

<section class="igsec">
<p class="sover">Follow Us</p>
<h3 style="font-family:var(--head);font-size:24px;text-transform:uppercase;letter-spacing:-.02em;margin-bottom:28px">@${STORE_CONFIG.instagram}</h3>
<div class="iggrid">
${products.slice(0,5).map((p,i)=>'<a href="https://instagram.com/'+STORE_CONFIG.instagram+'" target="_blank" rel="noopener" class="igit"><img src="'+p.images[i % p.images.length]+'" alt="intru.in Instagram" loading="lazy" width="300" height="300"></a>').join('')}
</div></section>

<section class="nlsec" id="newsletter">
<h3>Get Notified of the Next Drop</h3>
<p>Be the first to know when we release new products. No spam, ever.</p>
<form class="nlform" onsubmit="event.preventDefault();toast('You\\'re on the list.');this.reset()">
<input class="nlinp" type="email" placeholder="Your email" required>
<button class="nlbtn" type="submit">Notify Me</button>
</form></section>

<script>
var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.style.animationPlayState='running';obs.unobserve(e.target)}})},{threshold:.1});
document.querySelectorAll('.anim').forEach(function(el){el.style.animationPlayState='paused';obs.observe(el)});
</script>`;

  return shell(
    'INTRU.IN — Limited Drops. No Restocks. | Premium Indian Streetwear',
    'intru.in: premium minimalist streetwear crafted in India. Limited drops, no restocks. Oversized tees, cargo joggers, hoodies & more. Free shipping over Rs.1,999.',
    body,
    { url: 'https://intru.in', schema, razorpayKeyId: opts.razorpayKeyId, googleClientId: opts.googleClientId, products, legalPages }
  );
}
