import { STORE_CONFIG, type Product, type LegalPage, SEED_LEGAL_PAGES } from '../data'

/**
 * Shell: the HTML wrapper for every page.
 * NOW accepts products[] and legalPages[] as parameters — no more hardcoded PRODUCTS import.
 */
export function shell(
  title: string,
  desc: string,
  body: string,
  opt?: {
    og?: string; url?: string; schema?: string; cls?: string;
    razorpayKeyId?: string; googleClientId?: string;
    products?: Product[];
    legalPages?: LegalPage[];
  }
): string {
  const og = opt?.og || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&h=630&fit=crop&q=80';
  const url = opt?.url || 'https://intru.in';
  const rpKey = opt?.razorpayKeyId || STORE_CONFIG.razorpayKeyId;
  const gKey = opt?.googleClientId || STORE_CONFIG.googleClientId;
  const products = opt?.products || [];
  const legalPages = opt?.legalPages || SEED_LEGAL_PAGES;

  // Build product map for cart JS — from the DYNAMIC products array
  const pm = JSON.stringify(Object.fromEntries(products.map(p => [p.id, { id: p.id, n: p.name, s: p.slug, p: p.price, i: p.images, sz: p.sizes }])));
  const sj = JSON.stringify({ cs: STORE_CONFIG.currencySymbol, ft: STORE_CONFIG.freeShippingThreshold, sc: STORE_CONFIG.shippingCost, rk: rpKey });

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title><meta name="description" content="${desc}">
<meta name="robots" content="index,follow"><link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:image" content="${og}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="intru.in">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${desc}"><meta name="twitter:image" content="${og}">
${opt?.schema ? '<script type="application/ld+json">' + opt.schema + '</script>' : ''}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Archivo+Black&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css">
<!-- Razorpay Checkout SDK -->
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--bk:#0a0a0a;--wh:#fafafa;--g50:#f5f5f5;--g100:#e8e8e8;--g200:#d4d4d4;--g300:#a3a3a3;--g400:#737373;--g500:#525252;--g600:#404040;--red:#e53e3e;--green:#16a34a;--sans:'Space Grotesk',sans-serif;--head:'Archivo Black','Space Grotesk',sans-serif;--ease:cubic-bezier(.25,.46,.45,.94);--eo:cubic-bezier(.16,1,.3,1)}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:var(--sans);color:var(--bk);background:var(--wh);line-height:1.6;overflow-x:hidden}
a{color:inherit;text-decoration:none}img{display:block;max-width:100%;height:auto}button{cursor:pointer;font-family:inherit}
@keyframes fadeIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.anim{animation:fadeIn .6s var(--ease) forwards;opacity:0}
.d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.4s}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(250,250,250,.88);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--g100);transition:all .3s}
.nav.scrolled{background:rgba(250,250,250,.96);box-shadow:0 1px 24px rgba(0,0,0,.06)}
.navi{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:64px}
.logo{font-family:var(--head);font-size:20px;letter-spacing:-.03em;text-transform:uppercase}.logo span{font-family:var(--sans);font-weight:400;opacity:.4;text-transform:none;font-size:16px}
.nlinks{display:flex;align-items:center;gap:24px}
.nl{font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--g500);transition:color .2s;position:relative}
.nl:hover{color:var(--bk)}.nl::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1.5px;background:var(--bk);transition:width .3s var(--ease)}.nl:hover::after{width:100%}
.ncart{position:relative;background:none;border:none;font-size:18px;color:var(--bk);padding:8px}
.cbadge{position:absolute;top:0;right:0;background:var(--bk);color:var(--wh);font-size:9px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;transform:scale(0);transition:transform .3s var(--eo)}.cbadge.vis{transform:scale(1)}
.covl{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .3s}.covl.open{opacity:1;pointer-events:all}
.cdrw{position:fixed;top:0;right:0;bottom:0;z-index:201;width:420px;max-width:92vw;background:var(--wh);transform:translateX(100%);transition:transform .4s var(--eo);display:flex;flex-direction:column;box-shadow:-10px 0 40px rgba(0,0,0,.12)}.cdrw.open{transform:translateX(0)}
.chdr{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--g100)}
.chdr h3{font-family:var(--head);font-size:14px;letter-spacing:2px;text-transform:uppercase}
.ccls{background:none;border:none;font-size:20px;color:var(--g400);padding:4px}.ccls:hover{color:var(--bk)}
.cbdy{flex:1;overflow-y:auto;padding:16px 24px}
.cemp{text-align:center;padding:60px 0;color:var(--g400)}.cemp i{font-size:40px;margin-bottom:16px;display:block}
.citm{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--g100)}
.cimg{width:76px;height:95px;object-fit:cover;border-radius:6px;background:var(--g50)}
.cinf{flex:1}.cnm{font-size:13px;font-weight:700;margin-bottom:2px;text-transform:uppercase;letter-spacing:.5px}.cmt{font-size:11px;color:var(--g400);margin-bottom:6px}.cpr{font-size:14px;font-weight:700}
.cqty{display:flex;align-items:center;gap:10px;margin-top:6px}
.qb{width:26px;height:26px;border:1px solid var(--g200);background:none;border-radius:3px;font-size:13px;display:flex;align-items:center;justify-content:center;transition:all .2s}.qb:hover{background:var(--bk);color:var(--wh);border-color:var(--bk)}
.crm{background:none;border:none;color:var(--g300);font-size:11px;margin-top:4px;padding:0;transition:color .2s;text-transform:uppercase;letter-spacing:.5px}.crm:hover{color:var(--red)}
.cftr{padding:20px 24px;border-top:1px solid var(--g100);background:var(--g50)}
.cst{display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px}
.csh{display:flex;justify-content:space-between;font-size:11px;color:var(--g400);margin-bottom:12px}
.ctl{display:flex;justify-content:space-between;font-size:18px;font-weight:700;padding-top:12px;border-top:1px solid var(--g200)}
.ccbtn{width:100%;margin-top:16px;padding:16px;background:var(--bk);color:var(--wh);border:none;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;transition:all .3s}.ccbtn:hover{background:var(--g600);transform:translateY(-1px)}.ccbtn:disabled{background:var(--g300);cursor:not-allowed;transform:none}
.cpolicy{font-size:10px;color:var(--g400);text-align:center;margin-top:12px;line-height:1.5}
.cpolicy a{text-decoration:underline}
.ftr{background:var(--bk);color:var(--wh);padding:64px 24px 32px}
.ftri{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px}
.ftrb h3{font-family:var(--head);font-size:20px;margin-bottom:12px;letter-spacing:-.02em;text-transform:uppercase}.ftrb p{color:var(--g300);font-size:13px;line-height:1.7;max-width:300px}
.ftrc h4{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:16px;color:var(--g300)}
.ftrc a{display:block;color:var(--g400);font-size:13px;padding:4px 0;transition:color .2s}.ftrc a:hover{color:var(--wh)}
.ftrbt{max-width:1280px;margin:48px auto 0;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--g400)}
.fsoc{display:flex;gap:16px}.fsoc a{color:var(--g400);font-size:18px;transition:color .2s}.fsoc a:hover{color:var(--wh)}
.tc{position:fixed;bottom:24px;right:24px;z-index:300;display:flex;flex-direction:column;gap:8px}
.toast{padding:12px 20px;border-radius:6px;font-size:12px;font-weight:600;animation:slideUp .3s var(--eo);box-shadow:0 4px 20px rgba(0,0,0,.3);letter-spacing:.5px}
.toast-ok{background:var(--bk);color:var(--wh)}
.toast-err{background:var(--red);color:#fff}
.toast-ok-green{background:#065f46;color:#fff}
.sz-error{animation:shake .3s ease;border-color:var(--red) !important}
@media(max-width:768px){.nlinks .nl:not(.nls){display:none}.ftri{grid-template-columns:1fr 1fr;gap:32px}.ftrbt{flex-direction:column;gap:16px;text-align:center}}
@media(max-width:480px){.ftri{grid-template-columns:1fr}}
</style></head>
<body class="${opt?.cls || ''}">
<nav class="nav" id="nb"><div class="navi">
<a href="/" class="logo">INTRU<span>.in</span></a>
<div class="nlinks">
<a href="/#products" class="nl nls">Shop</a>
<a href="/#story" class="nl">Story</a>
<a href="/#contact" class="nl">Contact</a>
<button class="ncart" onclick="toggleCart()" aria-label="Cart"><i class="fas fa-shopping-bag"></i><span class="cbadge" id="cb">0</span></button>
</div></div></nav>
<div class="covl" id="co" onclick="toggleCart()"></div>
<div class="cdrw" id="cd">
<div class="chdr"><h3>Your Bag</h3><button class="ccls" onclick="toggleCart()"><i class="fas fa-times"></i></button></div>
<div class="cbdy" id="cby"><div class="cemp"><i class="fas fa-shopping-bag"></i><p>Your bag is empty</p></div></div>
<div class="cftr" id="cf" style="display:none">
<div class="cst"><span>Subtotal</span><span id="csub">${STORE_CONFIG.currencySymbol}0</span></div>
<div class="csh"><span>Shipping</span><span id="cshp">Calculated</span></div>
<div class="ctl"><span>Total</span><span id="ctot">${STORE_CONFIG.currencySymbol}0</span></div>
<button class="ccbtn" id="checkoutBtn" onclick="checkout()">Pay with Razorpay</button>
<p class="cpolicy">By placing an order, you agree to the intru.in <a href="/p/terms">Terms of Service</a> and our <a href="/p/returns">Store-Credit-only Refund Policy</a>.</p>
</div></div>
<main style="padding-top:64px">${body}</main>
<footer class="ftr" id="contact"><div class="ftri">
<div class="ftrb"><h3>INTRU.IN</h3><p>${STORE_CONFIG.description}</p></div>
<div class="ftrc"><h4>Shop</h4><a href="/#products">All Drops</a><a href="/#products">Latest Drop</a></div>
<div class="ftrc"><h4>Help</h4><a href="/p/shipping">Shipping</a><a href="/p/returns">Returns &amp; Credit</a><a href="mailto:${STORE_CONFIG.email}">Contact</a></div>
<div class="ftrc"><h4>Legal</h4>${legalPages.map(p => '<a href="/p/' + p.slug + '">' + p.title + '</a>').join('')}</div>
</div><div class="ftrbt"><span>&copy; 2026 intru.in &mdash; All sales final. Store credit only.</span>
<div class="fsoc"><a href="https://instagram.com/${STORE_CONFIG.instagram}" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a><a href="#"><i class="fab fa-twitter"></i></a></div>
</div></footer>
<div class="tc" id="tc"></div>
${gKey !== 'YOUR_GOOGLE_CLIENT_ID' ? '<script src="https://accounts.google.com/gsi/client" async defer></script><div id="g_id_onload" data-client_id="' + gKey + '" data-context="signin" data-ux_mode="popup" data-callback="handleGoogleAuth" data-auto_prompt="true"></div>' : '<!-- Google One-Tap: Set GOOGLE_CLIENT_ID env var to enable -->'}
<script>
/* ====== CONFIG ====== */
var S=${sj};
var PM=${pm};

/* ====== GOOGLE AUTH ====== */
function handleGoogleAuth(r){
  if(!r.credential)return;
  fetch('/api/auth/google',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:r.credential})})
  .then(function(res){return res.json()})
  .then(function(d){if(d.success){toast('Signed in successfully','ok');localStorage.setItem('intru_user',JSON.stringify(d.user||{}))}else{toast(d.error||'Auth failed','err')}})
  .catch(function(){toast('Auth failed','err')});
}

/* ====== CART ENGINE ====== */
var cart=JSON.parse(localStorage.getItem('ic')||'[]');

function saveCart(){
  localStorage.setItem('ic',JSON.stringify(cart));
  renderCart();
}

function addToCart(productId, size, qty){
  if(!productId||!size){toast('Please select a size','err');return false}
  var p=PM[productId];
  if(!p){toast('Product not found','err');return false}
  if(p.sz&&p.sz.indexOf(size)===-1){toast('Invalid size selected','err');return false}
  qty=qty||1;
  var existing=cart.find(function(i){return i.p===productId&&i.s===size});
  if(existing){
    if(existing.q+qty>10){toast('Max 10 per item','err');return false}
    existing.q+=qty;
  } else {
    cart.push({p:productId,s:size,q:qty});
  }
  saveCart();
  toast(p.n+' ('+size+') added to bag','ok');
  openCartDrawer();
  return true;
}

function removeFromCart(productId,size){
  cart=cart.filter(function(i){return!(i.p===productId&&i.s===size)});
  saveCart();
}

function updateQty(productId,size,delta){
  var item=cart.find(function(i){return i.p===productId&&i.s===size});
  if(!item)return;
  item.q+=delta;
  if(item.q<=0){removeFromCart(productId,size);return}
  if(item.q>10){item.q=10;toast('Max 10 per item','err')}
  saveCart();
}

function getCartTotals(){
  var sub=0;
  cart.forEach(function(i){var p=PM[i.p];if(p)sub+=p.p*i.q});
  var sh=sub>=S.ft?0:(sub>0?S.sc:0);
  return{subtotal:sub,shipping:sh,total:sub+sh};
}

function fmt(n){return S.cs+n.toLocaleString('en-IN')}

function renderCart(){
  var badge=document.getElementById('cb');
  var body=document.getElementById('cby');
  var footer=document.getElementById('cf');
  var count=cart.reduce(function(a,i){return a+i.q},0);
  badge.textContent=count;
  badge.classList.toggle('vis',count>0);
  if(!cart.length){
    body.innerHTML='<div class="cemp"><i class="fas fa-shopping-bag"></i><p>Your bag is empty</p></div>';
    footer.style.display='none';
    return;
  }
  footer.style.display='block';
  var html='';
  cart.forEach(function(item){
    var p=PM[item.p];if(!p)return;
    html+='<div class="citm">'
      +'<img class="cimg" src="'+p.i[0]+'" alt="'+p.n+'">'
      +'<div class="cinf">'
      +'<div class="cnm">'+p.n+'</div>'
      +'<div class="cmt">Size: '+item.s+'</div>'
      +'<div class="cpr">'+fmt(p.p*item.q)+'</div>'
      +'<div class="cqty">'
      +'<button class="qb" onclick="updateQty(\\x27'+p.id+'\\x27,\\x27'+item.s+'\\x27,-1)">&minus;</button>'
      +'<span>'+item.q+'</span>'
      +'<button class="qb" onclick="updateQty(\\x27'+p.id+'\\x27,\\x27'+item.s+'\\x27,1)">+</button>'
      +'</div>'
      +'<button class="crm" onclick="removeFromCart(\\x27'+p.id+'\\x27,\\x27'+item.s+'\\x27)">Remove</button>'
      +'</div></div>';
  });
  body.innerHTML=html;
  var t=getCartTotals();
  document.getElementById('csub').textContent=fmt(t.subtotal);
  document.getElementById('cshp').textContent=t.shipping===0?'Free':fmt(t.shipping);
  document.getElementById('ctot').textContent=fmt(t.total);
}

/* ====== CART DRAWER ====== */
function toggleCart(){
  document.getElementById('co').classList.toggle('open');
  document.getElementById('cd').classList.toggle('open');
  document.body.style.overflow=document.getElementById('cd').classList.contains('open')?'hidden':'';
}
function openCartDrawer(){
  document.getElementById('co').classList.add('open');
  document.getElementById('cd').classList.add('open');
  document.body.style.overflow='hidden';
}

/* ====== BUY NOW ====== */
function buyNow(productId,size){
  if(!size){toast('Please select a size first','err');return}
  var p=PM[productId];
  if(!p){toast('Product not found','err');return}
  if(p.sz&&p.sz.indexOf(size)===-1){toast('Invalid size','err');return}
  cart=[{p:productId,s:size,q:1}];
  saveCart();
  checkout();
}

/* ====== CHECKOUT -> RAZORPAY ====== */
function checkout(){
  if(!cart.length){toast('Your bag is empty','err');return}
  var btn=document.getElementById('checkoutBtn');
  btn.disabled=true;
  btn.textContent='CREATING ORDER...';

  fetch('/api/checkout',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      items:cart.map(function(i){return{productId:i.p,size:i.s,quantity:i.q}}),
      userEmail:localStorage.getItem('intru_user_email')||''
    })
  })
  .then(function(r){return r.json()})
  .then(function(data){
    if(data.error){throw new Error(data.error)}
    if(!data.razorpayOrderId){
      toast('Order total: '+fmt(data.total)+'. Configure Razorpay keys to enable payments.','err');
      btn.disabled=false;btn.textContent='PAY WITH RAZORPAY';
      return;
    }
    if(typeof Razorpay==='undefined'){
      toast('Payment SDK failed to load. Please refresh.','err');
      btn.disabled=false;btn.textContent='PAY WITH RAZORPAY';
      return;
    }
    var options={
      key:S.rk,
      amount:data.total*100,
      currency:'INR',
      name:'intru.in',
      description:'Order #'+data.razorpayOrderId.slice(-8),
      order_id:data.razorpayOrderId,
      image:'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=100&h=100&fit=crop&q=80',
      prefill:{
        email:localStorage.getItem('intru_user_email')||'',
        contact:''
      },
      notes:{
        items:JSON.stringify(cart.map(function(i){return i.p+':'+i.s+'x'+i.q}))
      },
      theme:{
        color:'#0a0a0a',
        backdrop_color:'rgba(0,0,0,0.6)'
      },
      modal:{
        ondismiss:function(){
          btn.disabled=false;
          btn.textContent='PAY WITH RAZORPAY';
          toast('Payment cancelled','err');
        }
      },
      handler:function(response){
        btn.textContent='VERIFYING PAYMENT...';
        fetch('/api/payment/verify',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            razorpay_order_id:response.razorpay_order_id,
            razorpay_payment_id:response.razorpay_payment_id,
            razorpay_signature:response.razorpay_signature,
            items:cart.map(function(i){return{productId:i.p,size:i.s,quantity:i.q}}),
            userEmail:localStorage.getItem('intru_user_email')||''
          })
        })
        .then(function(r){return r.json()})
        .then(function(vd){
          if(vd.success){
            cart=[];
            saveCart();
            toggleCart();
            toast('Payment successful! Order confirmed.','ok-green');
            setTimeout(function(){
              if(vd.orderId){toast('Order ID: '+vd.orderId,'ok')}
            },1500);
          } else {
            toast('Payment verification failed: '+(vd.error||'Unknown error'),'err');
          }
        })
        .catch(function(e){toast('Verification error: '+e.message,'err')})
        .finally(function(){btn.disabled=false;btn.textContent='PAY WITH RAZORPAY'});
      }
    };
    var rzp=new Razorpay(options);
    rzp.on('payment.failed',function(response){
      toast('Payment failed: '+response.error.description,'err');
      btn.disabled=false;btn.textContent='PAY WITH RAZORPAY';
    });
    rzp.open();
  })
  .catch(function(e){
    toast('Checkout error: '+e.message,'err');
    btn.disabled=false;btn.textContent='PAY WITH RAZORPAY';
  });
}

/* ====== TOAST ====== */
function toast(msg,type){
  type=type||'ok';
  var c=document.getElementById('tc');
  var t=document.createElement('div');
  t.className='toast toast-'+(type==='err'?'err':type==='ok-green'?'ok-green':'ok');
  t.textContent=msg;
  c.appendChild(t);
  setTimeout(function(){t.style.opacity='0';t.style.transform='translateY(10px)';t.style.transition='all .3s';setTimeout(function(){t.remove()},300)},3500);
}

/* ====== NAV SCROLL ====== */
window.addEventListener('scroll',function(){document.getElementById('nb').classList.toggle('scrolled',window.scrollY>20)});

/* ====== INIT ====== */
renderCart();
</script></body></html>`;
}
