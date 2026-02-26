/* ═══════════════════════════════════════════════════
   intru.in — Frontend JavaScript
   Cart, Gallery, Checkout, UI Interactions
   ═══════════════════════════════════════════════════ */

// ─── Cart State ───
let cart = JSON.parse(localStorage.getItem('intru_cart') || '[]');

function saveCart() {
  localStorage.setItem('intru_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = total;
    countEl.style.display = total > 0 ? 'flex' : 'none';
  }
}

// ─── Add to Cart ───
function addToCart(slug, name, price, image, qty) {
  const quantity = qty || 1;
  const existing = cart.find(item => item.slug === slug);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ slug, name, price, image, quantity });
  }
  saveCart();
  showToast(`${name} added to bag`);
  renderCartItems();
}

// ─── Remove from Cart ───
function removeFromCart(slug) {
  cart = cart.filter(item => item.slug !== slug);
  saveCart();
  renderCartItems();
}

// ─── Update Cart Quantity ───
function updateCartQty(slug, delta) {
  const item = cart.find(i => i.slug === slug);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(slug);
      return;
    }
    saveCart();
    renderCartItems();
  }
}

// ─── Render Cart Items ───
function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-bag"></i>
        <p>Your bag is empty</p>
        <a href="/#collection" onclick="closeCart()" class="btn-primary">Start Shopping</a>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  let html = '';
  let subtotal = 0;

  cart.forEach(item => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    html += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" width="80" height="100">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="item-price">₹${item.price.toLocaleString('en-IN')}</span>
          <div class="cart-item-qty">
            <button onclick="updateCartQty('${item.slug}', -1)">−</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQty('${item.slug}', 1)">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${item.slug}')">Remove</button>
        </div>
      </div>`;
  });

  container.innerHTML = html;

  const shipping = subtotal >= 1999 ? 0 : 99;
  const total = subtotal + shipping;

  if (footer) {
    footer.style.display = 'block';
    const subtotalEl = document.getElementById('cartSubtotal');
    const shippingEl = document.getElementById('cartShipping');
    const totalEl = document.getElementById('cartTotal');
    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `₹${shipping}`;
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
  }
}

// ─── Cart Drawer ───
function openCart() {
  document.getElementById('cartOverlay')?.classList.add('open');
  document.getElementById('cartDrawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

function goToCheckout() {
  closeCart();
  window.location.href = '/checkout';
}

// ─── Toast ───
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fas fa-check"></i> ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── Image Zoom ───
function openZoom(src) {
  const modal = document.getElementById('zoomModal');
  const img = document.getElementById('zoomImg');
  if (modal && img) {
    img.src = src;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeZoom() {
  const modal = document.getElementById('zoomModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ─── PDP Gallery (Desktop) ───
function setMainImage(index) {
  if (typeof PRODUCT_IMAGES === 'undefined') return;
  currentImageIndex = index;
  const mainImg = document.getElementById('pdpMainImage');
  if (mainImg) mainImg.src = PRODUCT_IMAGES[index];

  // Update thumbs
  document.querySelectorAll('.gallery-thumb').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  // Update dots
  document.querySelectorAll('.carousel-dot').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  // Scroll mobile carousel
  const track = document.getElementById('carouselTrack');
  if (track) {
    const slide = track.children[index];
    if (slide) slide.scrollIntoView({ behavior: 'smooth', inline: 'start' });
  }
}

// ─── PDP Quantity ───
function changeQty(delta) {
  const input = document.getElementById('pdpQty');
  if (input) {
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    input.value = val;
  }
}

function getQty() {
  const input = document.getElementById('pdpQty');
  return input ? parseInt(input.value) : 1;
}

// ─── Mobile Carousel Touch ───
function initMobileCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const slideWidth = track.offsetWidth;
      const index = Math.round(track.scrollLeft / slideWidth);
      document.querySelectorAll('#mobileCarouselDots .carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
      // Sync desktop dots too
      document.querySelectorAll('#carouselDots .carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }, 50);
  });
}

// ─── Checkout Page ───
function renderCheckoutPage() {
  const container = document.getElementById('checkoutItems');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '<p style="color:#999;text-align:center;padding:2rem;">Your cart is empty. <a href="/" style="color:#000;text-decoration:underline;">Go shopping</a></p>';
    document.getElementById('checkoutBtn')?.setAttribute('disabled', 'true');
    return;
  }

  let html = '';
  let subtotal = 0;
  cart.forEach(item => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    html += `
      <div class="checkout-item">
        <img src="${item.image}" alt="${item.name}" width="60" height="75">
        <div class="checkout-item-info">
          <h4>${item.name}</h4>
          <p>Qty: ${item.quantity}</p>
        </div>
        <span class="checkout-item-total">₹${lineTotal.toLocaleString('en-IN')}</span>
      </div>`;
  });
  container.innerHTML = html;

  const shipping = subtotal >= 1999 ? 0 : 99;
  const total = subtotal + shipping;

  const subtotalEl = document.getElementById('checkSubtotal');
  const shippingEl = document.getElementById('checkShipping');
  const totalEl = document.getElementById('checkTotal');
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `₹${shipping}`;
  if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
}

async function processCheckout() {
  const btn = document.getElementById('checkoutBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  }

  try {
    const items = cart.map(item => ({ slug: item.slug, quantity: item.quantity }));
    const customer = {
      name: document.getElementById('custName')?.value || '',
      email: document.getElementById('custEmail')?.value || '',
      phone: document.getElementById('custPhone')?.value || '',
      address: document.getElementById('custAddress')?.value || ''
    };

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customer })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Checkout failed');
    }

    // Try Razorpay if available
    if (typeof Razorpay !== 'undefined' && data.total > 0) {
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      const razorpayKey = settingsData.settings?.razorpay_key_id;

      if (razorpayKey) {
        const options = {
          key: razorpayKey,
          amount: Math.round(data.total * 100),
          currency: data.currency,
          name: 'intru.in',
          description: `Order ${data.order_id}`,
          order_id: data.razorpay_order_id || undefined,
          handler: async function(response) {
            await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: data.order_id,
                payment_id: response.razorpay_payment_id
              })
            });
            cart = [];
            saveCart();
            window.location.href = `/order/${data.order_id}`;
          },
          prefill: {
            name: customer.name,
            email: customer.email,
            contact: customer.phone
          },
          theme: { color: '#000000' }
        };
        const rzp = new Razorpay(options);
        rzp.open();
        if (btn) { btn.disabled = false; btn.innerHTML = 'Place Order <i class="fas fa-lock"></i>'; }
        return;
      }
    }

    // Fallback: COD / direct order
    cart = [];
    saveCart();
    window.location.href = `/order/${data.order_id}`;

  } catch (err) {
    alert(err.message || 'Something went wrong. Please try again.');
    if (btn) { btn.disabled = false; btn.innerHTML = 'Place Order <i class="fas fa-lock"></i>'; }
  }
}

// ─── Navbar Scroll Effect ───
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
      navbar.style.boxShadow = '0 1px 10px rgba(0,0,0,0.08)';
    } else {
      navbar.style.boxShadow = 'none';
    }
    lastScroll = currentScroll;
  });
}

// ─── Escape key close modals ───
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCart();
    closeZoom();
  }
});

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  renderCartItems();
  initNavbar();
  initMobileCarousel();
});
