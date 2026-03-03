import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  STORE_CONFIG, SEED_PRODUCTS, SEED_LEGAL_PAGES,
  type Env, type Product,
  createRazorpayOrder, createMagicCheckoutOrder, fetchRazorpayOrder,
  buildMagicLineItems, hmacSHA256, supabaseFetch,
  fetchProducts, fetchProductBySlug, fetchProductById, fetchLegalPages,
  sendResendEmail, emailDropSecured, emailCodReceived, emailCodManagerAlert,
  fetchStoreSetting, uploadToSupabase,
} from './data'
import { homePage } from './pages/home'
import { productPage } from './pages/product'
import { legalPage } from './pages/legal'
import { adminPage } from './pages/admin'
import { collectionsPage } from './pages/collections'
import { aboutPage } from './pages/about'

type Bindings = Env & { [key: string]: string }

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

function getEnv(env: Bindings, key: keyof Env, fallback?: string): string {
  return (env as any)[key] || fallback || '';
}

// Helper: get common page options
async function getPageOpts(c: any) {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
  const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
  const sbKey = sbSvc || sbAnon;
  const { products } = await fetchProducts(sbUrl, sbSvc, sbAnon);
  const { pages: legalPages } = await fetchLegalPages(sbUrl, sbSvc, sbAnon);
  const useMagic = await fetchStoreSetting(sbUrl, sbKey, 'USE_MAGIC_CHECKOUT');
  return {
    razorpayKeyId: getEnv(c.env, 'RAZORPAY_KEY_ID', STORE_CONFIG.razorpayKeyId),
    googleClientId: getEnv(c.env, 'GOOGLE_CLIENT_ID', STORE_CONFIG.googleClientId),
    products, legalPages,
    useMagicCheckout: useMagic === 'true',
  };
}

// ============ PAGE ROUTES ============

app.get('/', async (c) => {
  const opts = await getPageOpts(c);
  return c.html(homePage(opts));
})

app.get('/product/:slug', async (c) => {
  const slug = c.req.param('slug');
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  const product = await fetchProductBySlug(sbUrl, sbKey, slug);
  if (!product) return c.html(`<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>`, 404);
  const opts = await getPageOpts(c);
  return c.html(productPage(product, opts));
})

app.get('/p/:slug', async (c) => {
  const slug = c.req.param('slug');
  const opts = await getPageOpts(c);
  const page = opts.legalPages.find(p => p.slug === slug);
  if (!page) return c.html(`<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>`, 404);
  return c.html(legalPage(page, opts));
})

app.get('/admin', async (c) => {
  const opts = await getPageOpts(c);
  return c.html(adminPage(opts));
})

app.get('/collections', async (c) => {
  const opts = await getPageOpts(c);
  return c.html(collectionsPage(opts));
})

app.get('/about', async (c) => {
  const opts = await getPageOpts(c);
  return c.html(aboutPage(opts));
})

// ============ AUTH: Google OAuth Redirect Callback ============
// This page receives the id_token from Google OAuth redirect flow,
// sends it to our backend API, saves user data, then redirects to homepage.
app.get('/auth/google/callback', (c) => {
  return c.html(`<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Signing in — intru.in</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0a;color:#fafafa;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:'Space Grotesk',sans-serif;text-align:center;padding:24px}
.wrap{max-width:360px}.spinner{width:36px;height:36px;border:3px solid rgba(255,255,255,.15);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 20px}
@keyframes spin{to{transform:rotate(360deg)}}h1{font-size:18px;font-weight:700;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase}p{font-size:13px;color:#a3a3a3;line-height:1.6}
.err{color:#e53e3e;display:none;margin-top:16px;font-size:13px}a{color:#fafafa;font-weight:700;text-decoration:underline;text-underline-offset:3px}</style>
</head><body>
<div class="wrap">
<div class="spinner" id="spinner"></div>
<h1 id="title">Securing your session</h1>
<p id="msg">Verifying your Google account...</p>
<p class="err" id="err"></p>
</div>
<script>
(function(){
  /* Google sends id_token in the URL fragment (#id_token=...) */
  var hash=window.location.hash.substring(1);
  var params=new URLSearchParams(hash);
  var idToken=params.get('id_token');
  
  if(!idToken){
    /* Also check for access_token (legacy fallback) — but we can't use it directly */
    var accessToken=params.get('access_token');
    if(accessToken){
      /* Use Google userinfo API to get user data, then create a pseudo-credential */
      fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{'Authorization':'Bearer '+accessToken}})
      .then(function(r){return r.json()})
      .then(function(u){
        if(u.email){
          /* Save user directly */
          var user={email:u.email,name:u.name||'',picture:u.picture||''};
          localStorage.setItem('intru_user',JSON.stringify(user));
          localStorage.setItem('intru_user_email',u.email);
          localStorage.setItem('intru_user_name',u.name||'');
          /* Also upsert to backend */
          fetch('/api/auth/google-userinfo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(user)})
          .then(function(){sessionStorage.setItem('intru_auth_success','1');window.location.href='/'})
          .catch(function(){sessionStorage.setItem('intru_auth_success','1');window.location.href='/'});
        }else{showError('Could not retrieve your account info. <a href="/">Back to Store</a>')}
      }).catch(function(e){showError('Auth error: '+e.message+'. <a href="/">Back to Store</a>')});
      return;
    }
    showError('No authentication token received. <a href="/">Back to Store</a>');
    return;
  }
  
  /* We have an id_token (JWT) — send it to our backend */
  fetch('/api/auth/google',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:idToken})})
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success&&d.user){
      localStorage.setItem('intru_user',JSON.stringify(d.user));
      localStorage.setItem('intru_user_email',d.user.email||'');
      localStorage.setItem('intru_user_name',d.user.name||'');
      sessionStorage.setItem('intru_auth_success','1');
      window.location.href='/';
    }else{showError((d.error||'Authentication failed')+'. <a href="/">Back to Store</a>')}
  }).catch(function(e){showError('Error: '+e.message+'. <a href="/">Back to Store</a>')});
  
  function showError(msg){
    document.getElementById('spinner').style.display='none';
    document.getElementById('title').textContent='Authentication Failed';
    document.getElementById('msg').style.display='none';
    var errEl=document.getElementById('err');errEl.innerHTML=msg;errEl.style.display='block';
  }
})();
</script></body></html>`);
})

// Also handle the old /api/auth/google-redirect path as a backward-compatible redirect
app.get('/api/auth/google-redirect', (c) => {
  return c.redirect('/auth/google/callback' + (c.req.url.includes('#') ? '' : ''), 302);
})

// ============ COD ORDER CONFIRMATION PAGE [AG] ============

app.get('/confirm-order/:id', async (c) => {
  const id = c.req.param('id');
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');

  if (sbUrl && sbSvc) {
    try {
      // Update status to 'placed' only if it was 'pending'
      await supabaseFetch(sbUrl, sbSvc, `orders?id=eq.${id}&status=eq.pending`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'placed', updated_at: new Date().toISOString() }),
      });
    } catch (e) { console.error('Confirmation error:', e); }
  }

  return c.html(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Order Confirmed — intru.in</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Archivo+Black&display=swap" rel="stylesheet">
    <style>
      body{font-family:'Space Grotesk',sans-serif;background:#fafafa;color:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px}
      .ost-pending{background:#fef3c7;color:#92400e;border:1px solid #fcd34d}.ost-paid{background:#d1fae5;color:#065f46;border:1px solid #34d399}.ost-placed{background:#dbeafe;color:#1e40af;border:1px solid #60a5fa}.ost-shipped{background:#e0e7ff;color:#3730a3}.ost-delivered{background:#dcfce7;color:#166534}.ost-payment_failed{background:#fee2e2;color:#991b1b}.ost-cancelled{background:#f5f5f5;color:#737373}
      .card{max-width:400px;width:100%;text-align:center;background:#fff;padding:48px 32px;border:1px solid #eee;border-radius:12px}
      .icon{width:56px;height:56px;border:2px solid #0a0a0a;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
      h1{font-family:'Archivo Black',sans-serif;font-size:24px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px}
      p{font-size:15px;color:#666;line-height:1.6;margin:0 0 32px}
      .btn{display:block;width:100%;padding:16px;background:#0a0a0a;color:#fff;text-decoration:none;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-size:12px;border-radius:6px}
    </style></head>
    <body><div class="card">
      <div class="icon">✓</div>
      <h1>ORDER VERIFIED</h1>
      <p>Thank you. Your order has been successfully confirmed and moved to our fulfillment queue.</p>
      <a href="/" class="btn">Back to Store</a>
    </div></body></html>`);
});

// ============ API: Health ============

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok', store: STORE_CONFIG.name, timestamp: new Date().toISOString(),
    services: {
      razorpay: getEnv(c.env, 'RAZORPAY_KEY_ID') ? 'connected' : 'not configured',
      supabase: getEnv(c.env, 'SUPABASE_URL') ? 'connected' : 'not configured',
      resend: getEnv(c.env, 'RESEND_API_KEY') ? 'connected' : 'not configured',
    }
  });
})

// ============ API: Products ============

app.get('/api/products', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
  const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
  const { products, source } = await fetchProducts(sbUrl, sbSvc, sbAnon);
  return c.json({ products, source });
})

app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  const product = await fetchProductById(sbUrl, sbKey, id);
  if (!product) return c.json({ error: 'Product not found' }, 404);
  return c.json({ product });
})

// ============ CHECKOUT: Prepaid (Razorpay Standard or Magic) ============

app.post('/api/checkout', async (c) => {
  try {
    const body = await c.req.json();
    const items = body.items;
    const userEmail = body.userEmail || '';
    const userName = body.userName || '';
    const paymentMethod = body.paymentMethod || 'prepaid';

    if (!items || !Array.isArray(items) || items.length === 0)
      return c.json({ error: 'No items in cart' }, 400);

    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
    const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
    const sbKey = sbSvc || sbAnon;

    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = await fetchProductById(sbUrl, sbKey, item.productId);
      if (!product) return c.json({ error: `Product ${item.productId} not found` }, 400);
      if (!product.inStock) return c.json({ error: `${product.name} is out of stock` }, 400);
      if (!item.size || !product.sizes.includes(item.size))
        return c.json({ error: `Size "${item.size}" not available for ${product.name}` }, 400);

      const qty = Math.max(1, Math.min(10, parseInt(item.quantity) || 1));
      const lineTotal = product.price * qty;
      subtotal += lineTotal;
      validatedItems.push({
        productId: product.id, name: product.name, size: item.size,
        quantity: qty, unitPrice: product.price, lineTotal,
        image: product.images[0] || '', slug: product.slug, description: product.description,
      });
    }

    // Prepaid = free shipping always
    const shipping = 0;
    const total = subtotal + shipping;

    const rzpKeyId = getEnv(c.env, 'RAZORPAY_KEY_ID');
    const rzpKeySecret = getEnv(c.env, 'RAZORPAY_KEY_SECRET');
    let razorpayOrderId: string | null = null;

    if (rzpKeyId && rzpKeySecret) {
      try {
        const receipt = 'IN-' + Date.now().toString(36).toUpperCase().slice(-4) + Math.random().toString(36).toUpperCase().slice(-2);
        const isMagic = paymentMethod === 'magic';

        if (isMagic) {
          const { line_items, line_items_total } = buildMagicLineItems(validatedItems);
          const rzpOrder = await createMagicCheckoutOrder(rzpKeyId, rzpKeySecret, total, receipt, line_items, line_items_total);
          razorpayOrderId = rzpOrder.id;
        } else {
          const rzpOrder = await createRazorpayOrder(rzpKeyId, rzpKeySecret, total, receipt);
          razorpayOrderId = rzpOrder.id;
        }

        // Use service key for writes (RLS requires service_role)
        const writeKey = sbSvc || sbKey;
        if (sbUrl && writeKey) {
          try {
            const orderRes = await supabaseFetch(sbUrl, writeKey, 'orders', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: razorpayOrderId,
                items: validatedItems, subtotal, shipping, total,
                customer_email: userEmail, customer_name: userName,
                status: 'pending', payment_method: 'prepaid',
                created_at: new Date().toISOString(),
              }),
            });
            if (!orderRes.ok) console.error('Prepaid order insert failed:', orderRes.status, await orderRes.text());
          } catch (e) { console.error('Failed to store order:', e); }
        }
      } catch (e: any) {
        return c.json({ error: 'Payment gateway error: ' + (e.message || 'Failed') }, 500);
      }
    }

    return c.json({
      success: true, items: validatedItems, subtotal, shipping, total,
      currency: 'INR', razorpayOrderId,
      prefill: { email: userEmail, contact: '' },
    });
  } catch (e: any) {
    return c.json({ error: e.message || 'Checkout failed' }, 500);
  }
})

// ============ CHECKOUT: COD (custom form) ============

app.post('/api/checkout/cod', async (c) => {
  try {
    const body = await c.req.json();
    const items = body.items;
    const userEmail = body.userEmail || '';
    const userName = body.userName || '';
    const userPhone = body.userPhone || '';
    const address = body.address || {};

    if (!items || !Array.isArray(items) || items.length === 0)
      return c.json({ error: 'No items in cart' }, 400);
    if (!userName || !userPhone || !address.pincode || !address.line1)
      return c.json({ error: 'Name, phone, pincode, and address are required for COD' }, 400);

    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
    const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
    const sbKey = sbSvc || sbAnon;

    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = await fetchProductById(sbUrl, sbKey, item.productId);
      if (!product) return c.json({ error: `Product ${item.productId} not found` }, 400);
      if (!product.inStock) return c.json({ error: `${product.name} is out of stock` }, 400);
      if (!item.size || !product.sizes.includes(item.size))
        return c.json({ error: `Size "${item.size}" not available for ${product.name}` }, 400);

      const qty = Math.max(1, Math.min(10, parseInt(item.quantity) || 1));
      const lineTotal = product.price * qty;
      subtotal += lineTotal;
      validatedItems.push({
        productId: product.id, name: product.name, size: item.size,
        quantity: qty, unitPrice: product.price, lineTotal,
        image: product.images[0] || '', slug: product.slug,
      });
    }

    const codFee = 99;
    const shipping = 0;
    const total = subtotal + shipping + codFee;

    let orderId = '';
    let dbError = '';

    // IMPORTANT: Use service key for writes (RLS requires service_role for inserts)
    const writeKey = sbSvc || sbKey;
    if (sbUrl && writeKey) {
      try {
        const orderPayload: any = {
          items: validatedItems, subtotal, shipping, total,
          customer_name: userName, customer_email: userEmail,
          customer_phone: userPhone,
          status: 'pending', payment_method: 'cod', cod_fee: codFee,
          shipping_address: address,
          created_at: new Date().toISOString(),
        };
        const res = await supabaseFetch(sbUrl, writeKey, 'orders', {
          method: 'POST',
          body: JSON.stringify(orderPayload),
        });
        if (res.ok) {
          const rows = await res.json() as any[];
          orderId = rows?.[0]?.id || '';
        } else {
          dbError = await res.text();
          console.error('Supabase order insert failed:', res.status, dbError);
        }
      } catch (e: any) {
        dbError = e.message || 'Unknown DB error';
        console.error('Failed to store COD order:', e);
      }
    }

    // Send Resend emails for COD (send even without orderId — order was logically placed)
    const resendKey = getEnv(c.env, 'RESEND_API_KEY');
    if (resendKey) {
      const shortId = orderId ? orderId.slice(-8).toUpperCase() : ('COD' + Date.now().toString(36).slice(-5).toUpperCase());
      // Email to customer
      try {
        await sendResendEmail(resendKey, userEmail,
          `Action Required: Confirm your intru.in COD Order #${shortId}`,
          emailCodReceived(orderId || shortId, userName, validatedItems, total)
        );
      } catch (e) { console.error('Resend customer email error:', e); }

      // Email to manager
      try {
        const managerEmail = await fetchStoreSetting(sbUrl, writeKey, 'MANAGER_EMAIL') || 'shop@intru.in';
        const addrStr = [address.line1, address.line2, address.city, address.state, address.pincode].filter(Boolean).join(', ');
        await sendResendEmail(resendKey, managerEmail,
          `NEW COD ORDER - Action Required — ${userName} — Rs.${total}`,
          emailCodManagerAlert(orderId || shortId, userName, userPhone, addrStr, validatedItems, total)
        );
      } catch (e) { console.error('Resend manager email error:', e); }
    }

    return c.json({ success: true, orderId, total, codFee, ...(dbError ? { dbWarning: dbError } : {}) });
  } catch (e: any) {
    return c.json({ error: e.message || 'COD checkout failed' }, 500);
  }
})

// ============ SHIPPING INFO API ============

app.post('/api/shipping-info', async (c) => {
  try {
    const body = await c.req.json();
    const addresses = body.addresses || [];
    const addressResponses = addresses.map((addr: any) => ({
      zipcode: addr.zipcode || '',
      state_code: addr.state_code || '',
      country: addr.country || 'in',
      shipping_methods: [{
        id: 'standard', name: 'Standard Delivery',
        description: 'Dispatched within 36 hours. Delivery in 3-7 business days.',
        serviceable: addr.country === 'in' || !addr.country,
        shipping_fee: 9900, cod: true, cod_fee: 9900,
      }],
    }));
    return c.json({ addresses: addressResponses });
  } catch { return c.json({ addresses: [] }, 200); }
})

// ============ PAYMENT VERIFICATION ============

app.post('/api/payment/verify', async (c) => {
  try {
    const body = await c.req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return c.json({ error: 'Missing payment details' }, 400);

    const rzpKeyId = getEnv(c.env, 'RAZORPAY_KEY_ID');
    const rzpKeySecret = getEnv(c.env, 'RAZORPAY_KEY_SECRET');
    if (!rzpKeySecret) return c.json({ error: 'Payment verification not configured' }, 500);

    const expectedSignature = await hmacSHA256(rzpKeySecret, razorpay_order_id + '|' + razorpay_payment_id);
    if (expectedSignature !== razorpay_signature)
      return c.json({ error: 'Payment verification failed. Signature mismatch.' }, 400);

    let shippingAddress: any = null;
    let customerEmail = '';
    let customerPhone = '';
    let customerName = '';
    let orderItems: any[] = [];
    let orderTotal = 0;

    if (rzpKeyId && rzpKeySecret) {
      try {
        const rzpOrder = await fetchRazorpayOrder(rzpKeyId, rzpKeySecret, razorpay_order_id);
        if (rzpOrder) {
          shippingAddress = rzpOrder.customer_details?.shipping_address || null;
          customerEmail = rzpOrder.customer_details?.email || '';
          customerPhone = rzpOrder.customer_details?.contact || '';
          customerName = rzpOrder.customer_details?.shipping_address?.name || '';
          orderTotal = (rzpOrder.amount || 0) / 100;
        }
      } catch (e) { console.error('Failed to fetch Razorpay order:', e); }
    }

    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

    if (sbUrl && sbKey) {
      try {
        // Fetch order items for email
        const orderRes = await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${razorpay_order_id}&select=items,total,customer_email`);
        if (orderRes.ok) {
          const orders = await orderRes.json() as any[];
          if (orders.length > 0) {
            orderItems = orders[0].items || [];
            orderTotal = orders[0].total || orderTotal;
            if (!customerEmail) customerEmail = orders[0].customer_email || '';
          }
        }

        const updatePayload: any = {
          status: 'paid', payment_method: 'prepaid',
          razorpay_payment_id, razorpay_signature,
          paid_at: new Date().toISOString(),
        };
        if (shippingAddress) updatePayload.shipping_address = shippingAddress;
        if (customerEmail) updatePayload.customer_email = customerEmail;
        if (customerPhone) updatePayload.customer_phone = customerPhone;
        if (customerName) updatePayload.customer_name = customerName;

        await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${razorpay_order_id}`, {
          method: 'PATCH', body: JSON.stringify(updatePayload),
        });
      } catch (e) { console.error('Failed to update order:', e); }
    }

    // Send "Drop Secured" email for prepaid
    const resendKey = getEnv(c.env, 'RESEND_API_KEY');
    if (resendKey && customerEmail) {
      try {
        await sendResendEmail(resendKey, customerEmail,
          'Drop Secured! — intru.in',
          emailDropSecured(razorpay_order_id, orderItems, orderTotal)
        );
      } catch (e) { console.error('Resend email error:', e); }
    }

    return c.json({
      success: true, orderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      message: 'Payment verified and order confirmed.',
    });
  } catch (e: any) {
    return c.json({ error: e.message || 'Verification failed' }, 500);
  }
})

// ============ RAZORPAY WEBHOOK ============

app.post('/api/webhooks/razorpay', async (c) => {
  try {
    const rawBody = await c.req.text();
    const webhookSecret = getEnv(c.env, 'RAZORPAY_WEBHOOK_SECRET') || getEnv(c.env, 'RAZORPAY_KEY_SECRET');
    const receivedSignature = c.req.header('x-razorpay-signature') || '';

    if (!webhookSecret) return c.json({ error: 'Webhook not configured' }, 500);

    const expectedSig = await hmacSHA256(webhookSecret, rawBody);
    if (expectedSig !== receivedSignature) return c.json({ error: 'Invalid signature' }, 400);

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
    const rzpKeyId = getEnv(c.env, 'RAZORPAY_KEY_ID');
    const rzpKeySecret = getEnv(c.env, 'RAZORPAY_KEY_SECRET');

    if (eventType === 'order.created' && sbUrl && sbKey) {
      const order = event.payload?.order?.entity;
      if (order?.id) {
        let shippingAddress: any = null;
        let customerDetails: any = null;
        let codFee = 0;
        let rtoRiskLevel = 'unknown';

        if (rzpKeyId && rzpKeySecret) {
          try {
            const fullOrder = await fetchRazorpayOrder(rzpKeyId, rzpKeySecret, order.id);
            if (fullOrder) {
              shippingAddress = fullOrder.customer_details?.shipping_address || null;
              customerDetails = fullOrder.customer_details || null;
              codFee = fullOrder.cod_fee || 0;
              rtoRiskLevel = fullOrder.notes?.rto_risk_level || fullOrder.rto_risk_level || 'unknown';
            }
          } catch (e) { console.error('Failed to fetch COD order:', e); }
        }

        try {
          const existingRes = await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${order.id}&select=id`);
          const existing = existingRes.ok ? (await existingRes.json() as any[]) : [];

          const updateData: any = {
            status: 'pending', payment_method: 'cod',
            cod_fee: codFee, rto_risk_level: rtoRiskLevel,
            shipping_address: shippingAddress,
            customer_email: customerDetails?.email || '',
            customer_phone: customerDetails?.contact || '',
            customer_name: shippingAddress?.name || '',
          };

          if (existing.length > 0) {
            await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${order.id}`, {
              method: 'PATCH', body: JSON.stringify(updateData),
            });
          } else {
            await supabaseFetch(sbUrl, sbKey, 'orders', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: order.id, items: [],
                subtotal: (order.amount || 0) / 100, shipping: 0,
                total: (order.amount || 0) / 100,
                ...updateData, created_at: new Date().toISOString(),
              }),
            });
          }
        } catch (e) { console.error('Failed to save COD order:', e); }
      }
    }

    if (eventType === 'payment.captured' && sbUrl && sbKey) {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        const updatePayload: any = {
          status: 'paid', payment_method: payment.method || 'prepaid',
          razorpay_payment_id: payment.id, paid_at: new Date().toISOString(),
        };
        if (rzpKeyId && rzpKeySecret) {
          try {
            const fullOrder = await fetchRazorpayOrder(rzpKeyId, rzpKeySecret, payment.order_id);
            if (fullOrder?.customer_details?.shipping_address)
              updatePayload.shipping_address = fullOrder.customer_details.shipping_address;
            if (fullOrder?.customer_details?.email)
              updatePayload.customer_email = fullOrder.customer_details.email;
          } catch (e) { console.error('Fetch order for payment.captured:', e); }
        }
        await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${payment.order_id}`, {
          method: 'PATCH', body: JSON.stringify(updatePayload),
        });
      }
    }

    if (eventType === 'payment.failed' && sbUrl && sbKey) {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${payment.order_id}`, {
          method: 'PATCH', body: JSON.stringify({
            status: 'payment_failed', failure_reason: payment.error_description || 'Payment failed',
          }),
        });
      }
    }

    return c.json({ status: 'ok' });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

// ============ AUTH: Silent Identity ============

app.post('/api/auth/identify', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email || !email.includes('@')) return c.json({ error: 'Valid email required' }, 400);

    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

    if (sbUrl && sbKey) {
      // Check if user exists
      const res = await supabaseFetch(sbUrl, sbKey, `users?email=eq.${encodeURIComponent(email)}&select=id,name,email&limit=1`);
      if (res.ok) {
        const users = await res.json() as any[];
        if (users.length > 0) {
          // Existing user — link session
          return c.json({ success: true, name: users[0].name, existing: true });
        }
      }
      // New user — silently create in public.users
      try {
        await supabaseFetch(sbUrl, sbKey, 'users', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
          body: JSON.stringify({
            email, name: '', auth_provider: 'email',
            last_login: new Date().toISOString(),
          }),
        });
      } catch (e) { console.error('User create error:', e); }
      return c.json({ success: true, existing: false });
    }

    return c.json({ success: true, message: 'Identity noted (Supabase not configured)' });
  } catch (e: any) {
    return c.json({ error: e.message || 'Failed' }, 500);
  }
})

app.post('/api/auth/google', async (c) => {
  try {
    const body = await c.req.json();
    const { credential } = body;
    if (!credential) return c.json({ error: 'No credential' }, 400);
    const parts = credential.split('.');
    if (parts.length !== 3) return c.json({ error: 'Invalid token' }, 400);
    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const { email, name, picture, sub } = payload;
      const sbUrl = getEnv(c.env, 'SUPABASE_URL');
      const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
      if (sbUrl && sbKey) {
        try {
          await supabaseFetch(sbUrl, sbKey, 'users', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
            body: JSON.stringify({ email, name, picture, google_id: sub, auth_provider: 'google', last_login: new Date().toISOString() }),
          });
        } catch (e) { console.error('User upsert error:', e); }
      }
      return c.json({ success: true, user: { email, name, picture } });
    } catch { return c.json({ error: 'Invalid token format' }, 400); }
  } catch (e: any) {
    return c.json({ error: e.message || 'Auth failed' }, 500);
  }
})

// Google userinfo fallback: when redirect flow returns access_token instead of id_token
app.post('/api/auth/google-userinfo', async (c) => {
  try {
    const body = await c.req.json();
    const { email, name, picture } = body;
    if (!email) return c.json({ error: 'No email' }, 400);
    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
    if (sbUrl && sbKey) {
      try {
        await supabaseFetch(sbUrl, sbKey, 'users', {
          method: 'POST',
          headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
          body: JSON.stringify({ email, name: name || '', picture: picture || '', auth_provider: 'google', last_login: new Date().toISOString() }),
        });
      } catch (e) { console.error('User upsert error:', e); }
    }
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message || 'Failed' }, 500);
  }
})

app.post('/api/auth/magic-link', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email || !email.includes('@')) return c.json({ error: 'Valid email required' }, 400);
    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbKey = getEnv(c.env, 'SUPABASE_ANON_KEY');
    if (sbUrl && sbKey) {
      const res = await fetch(`${sbUrl}/auth/v1/magiclink`, {
        method: 'POST',
        headers: { 'apikey': sbKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) return c.json({ success: true, message: 'Magic link sent to ' + email });
      const err = await res.json();
      return c.json({ error: (err as any).msg || 'Failed to send' }, 400);
    }
    return c.json({ success: true, message: 'Magic link ready. Set SUPABASE keys.' });
  } catch (e: any) {
    return c.json({ error: e.message || 'Failed' }, 500);
  }
})

// ============ ADMIN AUTH ============

app.post('/api/admin/auth', async (c) => {
  try {
    const body = await c.req.json();
    const adminPwd = getEnv(c.env, 'ADMIN_PASSWORD', STORE_CONFIG.adminPassword);
    if (body.password === adminPwd) return c.json({ success: true });
    return c.json({ error: 'Invalid password' }, 401);
  } catch { return c.json({ error: 'Auth failed' }, 500); }
})

app.post('/api/admin/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File;
    const bucket = (body['bucket'] as string) || 'products';

    if (!file) return c.json({ error: 'No file provided' }, 400);

    const url = await uploadToSupabase(c.env, bucket, file);
    return c.json({ success: true, url });
  } catch (e: any) {
    return c.json({ error: e.message || 'Upload failed' }, 500);
  }
})

// ============ ADMIN API ============

app.get('/api/admin/orders', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    try {
      const res = await supabaseFetch(sbUrl, sbKey, 'orders?select=*&order=created_at.desc&limit=50');
      if (res.ok) return c.json({ orders: await res.json(), source: 'supabase' });
    } catch (e) { console.error('Orders fetch error:', e); }
  }
  return c.json({ orders: [], source: 'none' });
})

app.patch('/api/admin/orders/:id', async (c) => {
  const orderId = c.req.param('id');
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, `orders?id=eq.${orderId}`, {
      method: 'PATCH', body: JSON.stringify(body),
    });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: await res.text() }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

app.patch('/api/admin/products/:id', async (c) => {
  const productId = c.req.param('id');
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, `products?id=eq.${productId}`, {
      method: 'PATCH', body: JSON.stringify(body),
    });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: await res.text() }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

app.patch('/api/admin/legal/:slug', async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, `legal_pages?slug=eq.${slug}`, {
      method: 'PATCH', body: JSON.stringify(body),
    });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: await res.text() }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

// ============ SIZE CHART API ============

app.get('/api/size-chart', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    try {
      const res = await supabaseFetch(sbUrl, sbKey, 'size_chart?select=*&order=sort_order.asc');
      if (res.ok) return c.json({ sizes: await res.json(), source: 'supabase' });
    } catch (e) { console.error('Size chart error:', e); }
  }
  return c.json({
    sizes: [
      { size_label: 'XS', chest: 36, length: 26, sort_order: 1 },
      { size_label: 'S', chest: 38, length: 27, sort_order: 2 },
      { size_label: 'M', chest: 40, length: 28, sort_order: 3 },
      { size_label: 'L', chest: 42, length: 29, sort_order: 4 },
      { size_label: 'XL', chest: 44, length: 30, sort_order: 5 },
      { size_label: 'XXL', chest: 46, length: 31, sort_order: 6 },
    ], source: 'static'
  });
})

app.put('/api/admin/size-chart/:label', async (c) => {
  const label = c.req.param('label');
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, 'size_chart', {
      method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
      body: JSON.stringify({ size_label: label, chest: body.chest, length: body.length, sort_order: body.sort_order || 0 }),
    });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: await res.text() }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

app.delete('/api/admin/size-chart/:label', async (c) => {
  const label = c.req.param('label');
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, `size_chart?size_label=eq.${encodeURIComponent(label)}`, { method: 'DELETE' });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: 'Delete failed' }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

// ============ STORE SETTINGS API ============

app.get('/api/admin/settings', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    try {
      const res = await supabaseFetch(sbUrl, sbKey, 'store_settings?select=*');
      if (res.ok) {
        const rows = await res.json() as any[];
        const settings: any = {};
        rows.forEach((r: any) => { settings[r.key] = r.value; });
        return c.json({ settings, source: 'supabase' });
      }
    } catch (e) { console.error('Settings error:', e); }
  }
  return c.json({ settings: { USE_MAGIC_CHECKOUT: 'false', MANAGER_EMAIL: 'shop@intru.in', COD_FEE: '99' }, source: 'static' });
})

app.put('/api/admin/settings/:key', async (c) => {
  const key = c.req.param('key');
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, 'store_settings', {
      method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
      body: JSON.stringify({ key, value: body.value }),
    });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: await res.text() }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})
app.post('/api/webhooks/razorpay', async (c) => {
  const signature = c.req.header('x-razorpay-signature');
  const secret = c.env.RAZORPAY_WEBHOOK_SECRET;
  const body = await c.req.text();

  // 1. Verify Signature
  if (signature && secret) {
    const isValid = verifyRazorpaySignature(body, signature, secret);
    if (!isValid) return c.json({ status: 'invalid_signature' }, 400);
  }

  const payload = JSON.parse(body);
  const event = payload.event;

  // 2. Handle Payment Captured
  if (event === 'payment.captured') {
    const payment = payload.payload.payment.entity;

    // Update DB (Existing logic)
    if (payment.order_id) {
      await updateOrderStatus(c.env, payment.order_id, 'paid', payment.id);
    }

    // NEW: Send alert to your specific email
    if (c.env.RESEND_API_KEY) {
      await emailAdminPaymentAlert(c.env.RESEND_API_KEY, payment);
    }
  }

  return c.json({ status: 'ok' });
});
// ============ INSTAGRAM FEED API ============

app.get('/api/instagram-feed', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    try {
      // Check if IG feed is enabled in store_settings
      const igEnabled = await fetchStoreSetting(sbUrl, sbKey, 'INSTAGRAM_FEED_ENABLED');
      if (igEnabled === 'false') return c.json({ feed: [], enabled: false, source: 'supabase' });

      const res = await supabaseFetch(sbUrl, sbKey, 'instagram_feed?select=*&active=eq.true&order=sort_order.asc');
      if (res.ok) return c.json({ feed: await res.json(), enabled: true, source: 'supabase' });
    } catch (e) { console.error('IG feed error:', e); }
  }
  return c.json({ feed: [], enabled: true, source: 'static' });
})

app.post('/api/admin/instagram-feed', async (c) => {
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, 'instagram_feed', {
      method: 'POST',
      body: JSON.stringify({ image_url: body.image_url, link_url: body.link_url || '', caption: body.caption || '', sort_order: body.sort_order || 0, active: true }),
    });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: await res.text() }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

app.patch('/api/admin/instagram-feed/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, `instagram_feed?id=eq.${id}`, {
      method: 'PATCH', body: JSON.stringify(body),
    });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: await res.text() }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

app.delete('/api/admin/instagram-feed/:id', async (c) => {
  const id = c.req.param('id');
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, `instagram_feed?id=eq.${id}`, { method: 'DELETE' });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: 'Delete failed' }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

// ============ SUBSCRIBERS ("Notify Me") ============

app.post('/api/subscribe', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email || !email.includes('@')) return c.json({ error: 'Valid email required' }, 400);
    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
    if (sbUrl && sbKey) {
      const res = await supabaseFetch(sbUrl, sbKey, 'subscribers', {
        method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
        body: JSON.stringify({ email, source: 'notify_me', subscribed_at: new Date().toISOString() }),
      });
      if (res.ok) return c.json({ success: true, message: "You're on the list!" });
      return c.json({ error: 'Failed to subscribe' }, 500);
    }
    return c.json({ success: true, message: "You're on the list! (Supabase not configured yet)" });
  } catch (e: any) { return c.json({ error: e.message }, 500); }
})

// ============ STORE CREDIT ============

app.post('/api/store-credit', async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ error: 'Email required' }, 400);
    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbKey = getEnv(c.env, 'SUPABASE_ANON_KEY');
    if (sbUrl && sbKey) {
      const res = await supabaseFetch(sbUrl, sbKey, `store_credits?email=eq.${email}&select=amount`);
      if (res.ok) {
        const credits = await res.json() as any[];
        const balance = credits.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
        return c.json({ email, balance });
      }
    }
    return c.json({ email, balance: 0 });
  } catch (e: any) { return c.json({ error: e.message }, 500); }
})

// ============ CUSTOMER: MY ORDERS [AG] ============

app.get('/api/customer/orders', async (c) => {
  const email = c.req.query('email');
  if (!email) return c.json({ orders: [] });

  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

  if (sbUrl && sbKey) {
    try {
      const res = await supabaseFetch(sbUrl, sbKey, `orders?customer_email=eq.${email}&select=id,razorpay_order_id,total,status,items,created_at&order=created_at.desc`);
      if (res.ok) {
        const orders = await res.json();
        return c.json({ orders });
      }
    } catch (e) { console.error('Error fetching customer orders:', e); }
  }
  return c.json({ orders: [] });
});

// ============ ADMIN: LIMITS & USAGE [AG] ============

app.get('/api/admin/limits', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

  let rows = 0;
  let emailsSentEst = 0;
  let storageMb = 0;

  if (sbUrl && sbKey) {
    try {
      // Estimate rows from orders + products + subscribers
      const ordersRes = await supabaseFetch(sbUrl, sbKey, 'orders?select=id', { method: 'HEAD', headers: { 'Prefer': 'count=exact' } as any });
      const orderCount = parseInt(ordersRes.headers.get('content-range')?.split('/')?.[1] || '0');

      const prodRes = await supabaseFetch(sbUrl, sbKey, 'products?select=id', { method: 'HEAD', headers: { 'Prefer': 'count=exact' } as any });
      const prodCount = parseInt(prodRes.headers.get('content-range')?.split('/')?.[1] || '0');

      const subRes = await supabaseFetch(sbUrl, sbKey, 'subscribers?select=id', { method: 'HEAD', headers: { 'Prefer': 'count=exact' } as any });
      const subCount = parseInt(subRes.headers.get('content-range')?.split('/')?.[1] || '0');

      rows = orderCount + prodCount + subCount;

      // Emails: assume 2 per order + some overhead
      emailsSentEst = orderCount * 2 + 50;

      // Storage: rough estimate 1MB per order (images/logs) + assets
      storageMb = Math.round(prodCount * 2 + (orderCount * 0.1));
    } catch (e) { console.error('Limit tracking error:', e); }
  }

  return c.json({ rows, emailsSentEst, storageMb });
});

/* ====== Helper Functions for Webhooks [AG] ====== */
async function verifyRazorpaySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSHA256(secret, body);
  return expected === signature;
}

async function updateOrderStatus(env: any, orderId: string, status: string, paymentId?: string) {
  const sbUrl = getEnv(env, 'SUPABASE_URL');
  const sbKey = getEnv(env, 'SUPABASE_SERVICE_KEY');
  if (sbUrl && sbKey) {
    const payload: any = { status, updated_at: new Date().toISOString() };
    if (paymentId) payload.razorpay_payment_id = paymentId;
    await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${orderId}`, {
      method: 'PATCH', body: JSON.stringify(payload),
    });
  }
}

async function emailAdminPaymentAlert(resendKey: string, payment: any) {
  const amount = (payment.amount || 0) / 100;
  const currency = (payment.currency || 'INR').toUpperCase();
  const emailBody = `
    <div style="font-family:sans-serif;padding:24px;border:1px solid #eee">
      <h2 style="color:#16a34a">💰 NEW PAYMENT RECEIVED</h2>
      <p>A payment of <strong>${currency} ${amount.toLocaleString('en-IN')}</strong> has been captured.</p>
      <p>Method: ${payment.method} | Email: ${payment.email}</p>
      <p>Order ID: ${payment.order_id}</p>
      <p style="font-size:12px;color:#999">View in Razorpay Dashboard for details.</p>
    </div>
  `;
  await sendResendEmail(resendKey, 'shop@intru.in', `💰 Payment Captured: ${currency} ${amount}`, emailBody);
}

// ============ 404 ============
app.all('*', (c) => {
  return c.html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>404 — INTRU.IN</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Space Grotesk',sans-serif;background:#fafafa;color:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px}h1{font-family:'Archivo Black',sans-serif;font-size:clamp(60px,12vw,120px);text-transform:uppercase;letter-spacing:-.05em;margin-bottom:8px}p{color:#737373;font-size:14px;margin-bottom:28px}a{display:inline-block;padding:14px 36px;background:#0a0a0a;color:#fafafa;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;transition:all .2s}a:hover{background:#404040;transform:translateY(-2px)}</style></head>
<body><div><h1>404</h1><p>This page doesn't exist. Maybe it sold out.</p><a href="/">Back to Drop</a></div></body></html>`, 404);
})

export default app
