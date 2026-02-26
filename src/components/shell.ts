import { STORE_CONFIG, LEGAL_PAGES, PRODUCTS } from '../data'

export function renderShell(title: string, description: string, body: string, extra?: { ogImage?: string; canonical?: string; schema?: string; bodyClass?: string; }): string {
  const ogImg = extra?.ogImage || 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&h=630&fit=crop&q=80';
  const canonical = extra?.canonical || 'https://intru.in';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImg}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="intru.in">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImg}">
  ${extra?.schema ? `<script type="application/ld+json">${extra.schema}</script>` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://images.unsplash.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css">
  <style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{--black:#0a0a0a;--white:#fafafa;--gray-50:#f5f5f5;--gray-100:#e8e8e8;--gray-200:#d4d4d4;--gray-300:#a3a3a3;--gray-400:#737373;--gray-500:#525252;--gray-600:#404040;--font-sans:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;--font-serif:'Playfair Display',Georgia,serif;--ease:cubic-bezier(.25,.46,.45,.94);--ease-out:cubic-bezier(.16,1,.3,1)}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
body{font-family:var(--font-sans);color:var(--black);background:var(--white);line-height:1.6;overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%;height:auto}
button{cursor:pointer;font-family:inherit}
@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.animate-in{animation:fadeIn .6s var(--ease) forwards;opacity:0}
.animate-delay-1{animation-delay:.1s}.animate-delay-2{animation-delay:.2s}.animate-delay-3{animation-delay:.3s}.animate-delay-4{animation-delay:.4s}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(250,250,250,.85);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--gray-100);transition:all .3s var(--ease)}
.nav.scrolled{background:rgba(250,250,250,.95);box-shadow:0 1px 20px rgba(0,0,0,.06)}
.nav-inner{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:16px 24px;height:64px}
.nav-logo{font-family:var(--font-serif);font-size:22px;font-weight:600;letter-spacing:-.5px}
.nav-logo span{font-style:italic;font-weight:400;opacity:.5}
.nav-links{display:flex;align-items:center;gap:28px}
.nav-link{font-size:13px;font-weight:500;letter-spacing:.5px;text-transform:uppercase;color:var(--gray-500);transition:color .2s;position:relative}
.nav-link:hover{color:var(--black)}
.nav-link::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1px;background:var(--black);transition:width .3s var(--ease)}
.nav-link:hover::after{width:100%}
.nav-cart{position:relative;background:none;border:none;font-size:18px;color:var(--black);padding:8px}
.cart-badge{position:absolute;top:0;right:0;background:var(--black);color:var(--white);font-size:10px;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;transform:scale(0);transition:transform .3s var(--ease-out)}
.cart-badge.visible{transform:scale(1)}

/* CART DRAWER */
.cart-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);opacity:0;pointer-events:none;transition:opacity .3s}
.cart-overlay.open{opacity:1;pointer-events:all}
.cart-drawer{position:fixed;top:0;right:0;bottom:0;z-index:201;width:420px;max-width:90vw;background:var(--white);transform:translateX(100%);transition:transform .4s var(--ease-out);display:flex;flex-direction:column;box-shadow:-10px 0 40px rgba(0,0,0,.1)}
.cart-drawer.open{transform:translateX(0)}
.cart-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--gray-100)}
.cart-header h3{font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:1px}
.cart-close{background:none;border:none;font-size:20px;color:var(--gray-400);padding:4px}
.cart-close:hover{color:var(--black)}
.cart-body{flex:1;overflow-y:auto;padding:16px 24px}
.cart-empty{text-align:center;padding:60px 0;color:var(--gray-400)}
.cart-empty i{font-size:48px;margin-bottom:16px;display:block}
.cart-item{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid var(--gray-100)}
.cart-item-img{width:80px;height:100px;object-fit:cover;border-radius:8px;background:var(--gray-50)}
.cart-item-info{flex:1}
.cart-item-name{font-size:14px;font-weight:600;margin-bottom:4px}
.cart-item-meta{font-size:12px;color:var(--gray-400);margin-bottom:8px}
.cart-item-price{font-size:14px;font-weight:600}
.cart-item-qty{display:flex;align-items:center;gap:12px;margin-top:8px}
.qty-btn{width:28px;height:28px;border:1px solid var(--gray-200);background:none;border-radius:4px;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .2s}
.qty-btn:hover{background:var(--black);color:var(--white);border-color:var(--black)}
.cart-item-remove{background:none;border:none;color:var(--gray-300);font-size:12px;margin-top:4px;padding:0;transition:color .2s}
.cart-item-remove:hover{color:#e53e3e}
.cart-footer{padding:20px 24px;border-top:1px solid var(--gray-100);background:var(--gray-50)}
.cart-subtotal{display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px}
.cart-shipping{display:flex;justify-content:space-between;font-size:12px;color:var(--gray-400);margin-bottom:12px}
.cart-total{display:flex;justify-content:space-between;font-size:18px;font-weight:700;padding-top:12px;border-top:1px solid var(--gray-200)}
.cart-checkout-btn{width:100%;margin-top:16px;padding:16px;background:var(--black);color:var(--white);border:none;font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;transition:all .3s var(--ease)}
.cart-checkout-btn:hover{background:var(--gray-600);transform:translateY(-1px)}
.cart-checkout-btn:disabled{background:var(--gray-300);cursor:not-allowed;transform:none}

/* FOOTER */
.footer{background:var(--black);color:var(--white);padding:64px 24px 32px}
.footer-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px}
.footer-brand h3{font-family:var(--font-serif);font-size:24px;margin-bottom:12px}
.footer-brand p{color:var(--gray-300);font-size:14px;line-height:1.7;max-width:300px}
.footer-col h4{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;color:var(--gray-300)}
.footer-col a{display:block;color:var(--gray-400);font-size:14px;padding:4px 0;transition:color .2s}
.footer-col a:hover{color:var(--white)}
.footer-bottom{max-width:1280px;margin:48px auto 0;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--gray-400)}
.footer-social{display:flex;gap:16px}
.footer-social a{color:var(--gray-400);font-size:18px;transition:color .2s}
.footer-social a:hover{color:var(--white)}

/* TOAST */
.toast-container{position:fixed;bottom:24px;right:24px;z-index:300;display:flex;flex-direction:column;gap:8px}
.toast{background:var(--black);color:var(--white);padding:12px 20px;border-radius:8px;font-size:13px;font-weight:500;animation:slideUp .3s var(--ease-out);box-shadow:0 4px 20px rgba(0,0,0,.3)}

@media(max-width:768px){
  .nav-links .nav-link:not(.nav-link-shop){display:none}
  .footer-inner{grid-template-columns:1fr 1fr;gap:32px}
  .footer-bottom{flex-direction:column;gap:16px;text-align:center}
}
@media(max-width:480px){.footer-inner{grid-template-columns:1fr}}
  </style>
</head>
<body class="${extra?.bodyClass || ''}">
  <nav class="nav" id="navbar">
    <div class="nav-inner">
      <a href="/" class="nav-logo">intru<span>.in</span></a>
      <div class="nav-links">
        <a href="/#products" class="nav-link nav-link-shop">Shop</a>
        <a href="/#story" class="nav-link">Our Story</a>
        <a href="/#contact" class="nav-link">Contact</a>
        <button class="nav-cart" onclick="toggleCart()" aria-label="Open cart">
          <i class="fas fa-shopping-bag"></i>
          <span class="cart-badge" id="cartBadge">0</span>
        </button>
      </div>
    </div>
  </nav>
  <div class="cart-overlay" id="cartOverlay" onclick="toggleCart()"></div>
  <div class="cart-drawer" id="cartDrawer">
    <div class="cart-header">
      <h3>Your Bag</h3>
      <button class="cart-close" onclick="toggleCart()"><i class="fas fa-times"></i></button>
    </div>
    <div class="cart-body" id="cartBody">
      <div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your bag is empty</p></div>
    </div>
    <div class="cart-footer" id="cartFooter" style="display:none;">
      <div class="cart-subtotal"><span>Subtotal</span><span id="cartSubtotal">${STORE_CONFIG.currencySymbol}0</span></div>
      <div class="cart-shipping"><span>Shipping</span><span id="cartShipping">Calculated at checkout</span></div>
      <div class="cart-total"><span>Total</span><span id="cartTotal">${STORE_CONFIG.currencySymbol}0</span></div>
      <button class="cart-checkout-btn" onclick="proceedToCheckout()">Proceed to Checkout</button>
    </div>
  </div>
  <main style="padding-top:64px">${body}</main>
  <footer class="footer" id="contact">
    <div class="footer-inner">
      <div class="footer-brand">
        <h3>intru.in</h3>
        <p>${STORE_CONFIG.description}</p>
      </div>
      <div class="footer-col">
        <h4>Shop</h4>
        <a href="/#products">All Products</a>
        <a href="/#products">New Arrivals</a>
        <a href="/#products">Best Sellers</a>
      </div>
      <div class="footer-col">
        <h4>Help</h4>
        <a href="/legal/shipping">Shipping</a>
        <a href="/legal/refunds">Returns</a>
        <a href="mailto:${STORE_CONFIG.email}">Contact Us</a>
      </div>
      <div class="footer-col">
        <h4>Legal</h4>
        ${LEGAL_PAGES.map(p => `<a href="/legal/${p.slug}">${p.title}</a>`).join('')}
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 intru.in. All rights reserved.</span>
      <div class="footer-social">
        <a href="https://instagram.com/${STORE_CONFIG.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
        <a href="#" aria-label="Pinterest"><i class="fab fa-pinterest"></i></a>
      </div>
    </div>
  </footer>
  <div class="toast-container" id="toastContainer"></div>
  <script>
const STORE=${JSON.stringify({currency:STORE_CONFIG.currency,currencySymbol:STORE_CONFIG.currencySymbol,freeShippingThreshold:STORE_CONFIG.freeShippingThreshold,shippingCost:STORE_CONFIG.shippingCost})};
const PRODUCTS_MAP=${JSON.stringify(Object.fromEntries(PRODUCTS.map(p=>[p.id,{id:p.id,name:p.name,slug:p.slug,price:p.price,images:p.images}])))};
let cart=JSON.parse(localStorage.getItem('intru_cart')||'[]');
function saveCart(){localStorage.setItem('intru_cart',JSON.stringify(cart));updateCartUI()}
function addToCart(pid,size,qty=1){const e=cart.find(i=>i.productId===pid&&i.size===size);if(e)e.quantity+=qty;else cart.push({productId:pid,size,quantity:qty});saveCart();showToast('Added to bag');openCart()}
function removeFromCart(pid,size){cart=cart.filter(i=>!(i.productId===pid&&i.size===size));saveCart()}
function updateQuantity(pid,size,d){const i=cart.find(x=>x.productId===pid&&x.size===size);if(i){i.quantity+=d;if(i.quantity<=0){removeFromCart(pid,size);return}}saveCart()}
function getCartTotal(){let s=0;cart.forEach(i=>{const p=PRODUCTS_MAP[i.productId];if(p)s+=p.price*i.quantity});const sh=s>=STORE.freeShippingThreshold?0:(s>0?STORE.shippingCost:0);return{subtotal:s,shipping:sh,total:s+sh}}
function updateCartUI(){const badge=document.getElementById('cartBadge'),body=document.getElementById('cartBody'),footer=document.getElementById('cartFooter');const count=cart.reduce((s,i)=>s+i.quantity,0);badge.textContent=count;badge.classList.toggle('visible',count>0);if(!cart.length){body.innerHTML='<div class="cart-empty"><i class="fas fa-shopping-bag"></i><p>Your bag is empty</p></div>';footer.style.display='none';return}footer.style.display='block';let h='';cart.forEach(item=>{const p=PRODUCTS_MAP[item.productId];if(!p)return;h+=\`<div class="cart-item"><img class="cart-item-img" src="\${p.images[0]}" alt="\${p.name}" loading="lazy"><div class="cart-item-info"><div class="cart-item-name">\${p.name}</div><div class="cart-item-meta">Size: \${item.size}</div><div class="cart-item-price">\${STORE.currencySymbol}\${(p.price*item.quantity).toLocaleString('en-IN')}</div><div class="cart-item-qty"><button class="qty-btn" onclick="updateQuantity('\${p.id}','\${item.size}',-1)">&minus;</button><span>\${item.quantity}</span><button class="qty-btn" onclick="updateQuantity('\${p.id}','\${item.size}',1)">+</button></div><button class="cart-item-remove" onclick="removeFromCart('\${p.id}','\${item.size}')">Remove</button></div></div>\`});body.innerHTML=h;const t=getCartTotal();document.getElementById('cartSubtotal').textContent=STORE.currencySymbol+t.subtotal.toLocaleString('en-IN');document.getElementById('cartShipping').textContent=t.shipping===0?'Free':STORE.currencySymbol+t.shipping;document.getElementById('cartTotal').textContent=STORE.currencySymbol+t.total.toLocaleString('en-IN')}
function toggleCart(){document.getElementById('cartOverlay').classList.toggle('open');document.getElementById('cartDrawer').classList.toggle('open');document.body.style.overflow=document.getElementById('cartDrawer').classList.contains('open')?'hidden':''}
function openCart(){document.getElementById('cartOverlay').classList.add('open');document.getElementById('cartDrawer').classList.add('open')}
async function proceedToCheckout(){if(!cart.length)return;const btn=document.querySelector('.cart-checkout-btn');btn.disabled=true;btn.textContent='Processing...';try{const res=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:cart})});const data=await res.json();if(data.error)throw new Error(data.error);showToast('Checkout ready \\u2014 \\u20B9'+data.total.toLocaleString('en-IN'));alert('Razorpay Integration Point\\n\\nTotal: \\u20B9'+data.total.toLocaleString('en-IN')+'\\n\\nIn production, Razorpay checkout opens here.')}catch(e){showToast('Error: '+e.message)}finally{btn.disabled=false;btn.textContent='Proceed to Checkout'}}
function showToast(m){const c=document.getElementById('toastContainer'),t=document.createElement('div');t.className='toast';t.textContent=m;c.appendChild(t);setTimeout(()=>t.remove(),3000)}
window.addEventListener('scroll',()=>{document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>20)});
updateCartUI();
  </script>
</body></html>`;
}
