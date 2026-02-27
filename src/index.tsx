import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  STORE_CONFIG, SEED_PRODUCTS, SEED_LEGAL_PAGES,
  type Env, type Product,
  createRazorpayOrder, hmacSHA256, supabaseFetch,
  fetchProducts, fetchProductBySlug, fetchProductById, fetchLegalPages,
} from './data'
import { homePage } from './pages/home'
import { productPage } from './pages/product'
import { legalPage } from './pages/legal'
import { adminPage } from './pages/admin'

type Bindings = Env & { [key: string]: string }

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// Helper: get env value with fallback
function getEnv(env: Bindings, key: keyof Env, fallback?: string): string {
  return (env as any)[key] || fallback || '';
}

// ============ PAGE ROUTES (all async — data comes from Supabase) ============

app.get('/', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
  const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
  const { products } = await fetchProducts(sbUrl, sbSvc, sbAnon);
  const { pages: legalPages } = await fetchLegalPages(sbUrl, sbSvc, sbAnon);
  return c.html(homePage({
    razorpayKeyId: getEnv(c.env, 'RAZORPAY_KEY_ID', STORE_CONFIG.razorpayKeyId),
    googleClientId: getEnv(c.env, 'GOOGLE_CLIENT_ID', STORE_CONFIG.googleClientId),
    products,
    legalPages,
  }))
})

app.get('/product/:slug', async (c) => {
  const slug = c.req.param('slug')
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
  const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
  const key = sbSvc || sbAnon;
  const product = await fetchProductBySlug(sbUrl, key, slug);
  if (!product) {
    return c.html(`<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>`, 404)
  }
  const { products } = await fetchProducts(sbUrl, sbSvc, sbAnon);
  const { pages: legalPages } = await fetchLegalPages(sbUrl, sbSvc, sbAnon);
  return c.html(productPage(product, {
    razorpayKeyId: getEnv(c.env, 'RAZORPAY_KEY_ID', STORE_CONFIG.razorpayKeyId),
    googleClientId: getEnv(c.env, 'GOOGLE_CLIENT_ID', STORE_CONFIG.googleClientId),
    products,
    legalPages,
  }))
})

app.get('/p/:slug', async (c) => {
  const slug = c.req.param('slug')
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
  const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
  const { pages: legalPages } = await fetchLegalPages(sbUrl, sbSvc, sbAnon);
  const page = legalPages.find(p => p.slug === slug)
  if (!page) {
    return c.html(`<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>`, 404)
  }
  const { products } = await fetchProducts(sbUrl, sbSvc, sbAnon);
  return c.html(legalPage(page, {
    razorpayKeyId: getEnv(c.env, 'RAZORPAY_KEY_ID', STORE_CONFIG.razorpayKeyId),
    googleClientId: getEnv(c.env, 'GOOGLE_CLIENT_ID', STORE_CONFIG.googleClientId),
    products,
    legalPages,
  }))
})

app.get('/admin', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
  const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
  const { products } = await fetchProducts(sbUrl, sbSvc, sbAnon);
  const { pages: legalPages } = await fetchLegalPages(sbUrl, sbSvc, sbAnon);
  return c.html(adminPage({
    razorpayKeyId: getEnv(c.env, 'RAZORPAY_KEY_ID', STORE_CONFIG.razorpayKeyId),
    googleClientId: getEnv(c.env, 'GOOGLE_CLIENT_ID', STORE_CONFIG.googleClientId),
    products,
    legalPages,
  }))
})

// ============ API: Health ============

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    store: STORE_CONFIG.name,
    timestamp: new Date().toISOString(),
    services: {
      razorpay: getEnv(c.env, 'RAZORPAY_KEY_ID') ? 'connected' : 'not configured',
      supabase: getEnv(c.env, 'SUPABASE_URL') ? 'connected' : 'not configured',
    }
  })
})

// ============ API: Debug DB (hidden endpoint) ============

app.get('/api/debug-db', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
  const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
  try {
    const { products, source } = await fetchProducts(sbUrl, sbSvc, sbAnon);
    return c.json({
      connection: source === 'static' ? 'no_supabase' : 'success',
      count: products.length,
      source,
      products: products.map(p => ({ id: p.id, name: p.name, price: p.price, images: p.images.length })),
      env: {
        SUPABASE_URL: sbUrl ? 'set' : 'missing',
        SUPABASE_SERVICE_KEY: sbSvc ? 'set' : 'missing',
        SUPABASE_ANON_KEY: sbAnon ? 'set' : 'missing',
      }
    })
  } catch (e: any) {
    return c.json({ connection: 'error', error: e.message }, 500)
  }
})

// ============ API: Products (dynamic from Supabase) ============

app.get('/api/products', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
  const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
  const { products, source } = await fetchProducts(sbUrl, sbSvc, sbAnon);
  return c.json({ products, source })
})

app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id')
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  const product = await fetchProductById(sbUrl, sbKey, id);
  if (!product) return c.json({ error: 'Product not found' }, 404)
  return c.json({ product })
})

// ============ CHECKOUT: DB-validated prices + Razorpay order creation ============

app.post('/api/checkout', async (c) => {
  try {
    const body = await c.req.json()
    const items = body.items
    const userEmail = body.userEmail || ''

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'No items in cart' }, 400)
    }

    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
    const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
    const sbKey = sbSvc || sbAnon;

    // Step 1: Server-side price validation from DATABASE (never trust client)
    let subtotal = 0
    const validatedItems: any[] = []

    for (const item of items) {
      // Fetch live product from Supabase (falls back to SEED_PRODUCTS)
      const product = await fetchProductById(sbUrl, sbKey, item.productId);
      if (!product) {
        return c.json({ error: `Product ${item.productId} not found` }, 400)
      }
      if (!product.inStock) {
        return c.json({ error: `${product.name} is out of stock` }, 400)
      }
      if (!item.size || !product.sizes.includes(item.size)) {
        return c.json({ error: `Size "${item.size}" not available for ${product.name}` }, 400)
      }

      const qty = Math.max(1, Math.min(10, parseInt(item.quantity) || 1))
      const lineTotal = product.price * qty
      subtotal += lineTotal

      validatedItems.push({
        productId: product.id,
        name: product.name,
        size: item.size,
        quantity: qty,
        unitPrice: product.price,
        lineTotal,
      })
    }

    const shipping = subtotal >= STORE_CONFIG.freeShippingThreshold ? 0 : STORE_CONFIG.shippingCost
    const total = subtotal + shipping

    // Step 2: Create Razorpay order
    const rzpKeyId = getEnv(c.env, 'RAZORPAY_KEY_ID');
    const rzpKeySecret = getEnv(c.env, 'RAZORPAY_KEY_SECRET');

    let razorpayOrderId: string | null = null;

    if (rzpKeyId && rzpKeySecret) {
      try {
        const receipt = 'intru_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
        const rzpOrder = await createRazorpayOrder(rzpKeyId, rzpKeySecret, total, receipt);
        razorpayOrderId = rzpOrder.id;

        // Step 3: Store pending order in Supabase
        if (sbUrl && sbKey) {
          try {
            await supabaseFetch(sbUrl, sbKey, 'orders', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: razorpayOrderId,
                items: validatedItems,
                subtotal, shipping, total,
                customer_email: userEmail,
                status: 'pending',
                created_at: new Date().toISOString(),
              }),
            });
          } catch (e) {
            console.error('Failed to store order in Supabase:', e);
          }
        }
      } catch (e: any) {
        return c.json({ error: 'Payment gateway error: ' + (e.message || 'Failed to create order') }, 500)
      }
    }

    return c.json({
      success: true,
      items: validatedItems,
      subtotal, shipping, total,
      currency: 'INR',
      razorpayOrderId,
      storeCredit: 0,
    })
  } catch (e: any) {
    return c.json({ error: e.message || 'Checkout failed' }, 500)
  }
})

// ============ PAYMENT VERIFICATION ============

app.post('/api/payment/verify', async (c) => {
  try {
    const body = await c.req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return c.json({ error: 'Missing payment details' }, 400)
    }

    const rzpKeySecret = getEnv(c.env, 'RAZORPAY_KEY_SECRET');
    if (!rzpKeySecret) {
      return c.json({ error: 'Payment verification not configured' }, 500)
    }

    const expectedSignature = await hmacSHA256(rzpKeySecret, razorpay_order_id + '|' + razorpay_payment_id);

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature mismatch', { razorpay_order_id, razorpay_payment_id });
      return c.json({ error: 'Payment verification failed. Signature mismatch.' }, 400)
    }

    // Update order in Supabase
    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

    if (sbUrl && sbKey) {
      try {
        await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${razorpay_order_id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'paid',
            razorpay_payment_id,
            razorpay_signature,
            paid_at: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.error('Failed to update order in Supabase:', e);
      }
    }

    return c.json({
      success: true,
      orderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      message: 'Payment verified and order confirmed.',
    })
  } catch (e: any) {
    return c.json({ error: e.message || 'Verification failed' }, 500)
  }
})

// ============ RAZORPAY WEBHOOK ============

app.post('/api/webhooks/razorpay', async (c) => {
  try {
    const rawBody = await c.req.text();
    const webhookSecret = getEnv(c.env, 'RAZORPAY_WEBHOOK_SECRET') || getEnv(c.env, 'RAZORPAY_KEY_SECRET');
    const receivedSignature = c.req.header('x-razorpay-signature') || '';

    if (!webhookSecret) {
      return c.json({ error: 'Webhook not configured' }, 500);
    }

    const expectedSig = await hmacSHA256(webhookSecret, rawBody);
    if (expectedSig !== receivedSignature) {
      return c.json({ error: 'Invalid webhook signature' }, 400);
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

    if (eventType === 'payment.captured' && sbUrl && sbKey) {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${payment.order_id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'paid',
            razorpay_payment_id: payment.id,
            paid_at: new Date().toISOString(),
          }),
        });
      }
    }

    if (eventType === 'payment.failed' && sbUrl && sbKey) {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await supabaseFetch(sbUrl, sbKey, `orders?razorpay_order_id=eq.${payment.order_id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'payment_failed',
            failure_reason: payment.error_description || 'Payment failed',
          }),
        });
      }
    }

    return c.json({ status: 'ok' });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
})

// ============ AUTH ============

app.post('/api/auth/google', async (c) => {
  try {
    const body = await c.req.json()
    const { credential } = body
    if (!credential) return c.json({ error: 'No credential' }, 400)

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
            body: JSON.stringify({ email, name, picture, google_id: sub, last_login: new Date().toISOString() }),
          });
        } catch (e) { console.error('User upsert error:', e); }
      }

      return c.json({ success: true, user: { email, name, picture } })
    } catch (e) {
      return c.json({ error: 'Invalid token format' }, 400);
    }
  } catch (e: any) {
    return c.json({ error: e.message || 'Auth failed' }, 500)
  }
})

app.post('/api/auth/magic-link', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email || !email.includes('@')) return c.json({ error: 'Valid email required' }, 400)

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

    return c.json({ success: true, message: 'Magic link endpoint ready. Set SUPABASE_URL and SUPABASE_ANON_KEY to enable.' })
  } catch (e: any) {
    return c.json({ error: e.message || 'Failed' }, 500)
  }
})

// Admin auth
app.post('/api/admin/auth', async (c) => {
  try {
    const body = await c.req.json()
    const adminPwd = getEnv(c.env, 'ADMIN_PASSWORD', STORE_CONFIG.adminPassword);
    if (body.password === adminPwd) return c.json({ success: true })
    return c.json({ error: 'Invalid password' }, 401)
  } catch { return c.json({ error: 'Auth failed' }, 500) }
})

// ============ ADMIN API ============

// Admin: get orders
app.get('/api/admin/orders', async (c) => {
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

  if (sbUrl && sbKey) {
    try {
      const res = await supabaseFetch(sbUrl, sbKey, 'orders?select=*&order=created_at.desc&limit=50');
      if (res.ok) {
        const orders = await res.json();
        return c.json({ orders, source: 'supabase' });
      }
      console.error('Orders fetch failed:', res.status, await res.text());
    } catch (e) { console.error('Orders fetch error:', e); }
  }
  return c.json({ orders: [], source: 'none', message: 'Connect Supabase to see live orders' });
})

// Admin: update order
app.patch('/api/admin/orders/:id', async (c) => {
  const orderId = c.req.param('id');
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, `orders?id=eq.${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (res.ok) return c.json({ success: true });
    const errText = await res.text();
    console.error('Order update failed:', res.status, errText);
    return c.json({ error: 'Update failed: ' + errText }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

// Admin: update product (upsert-friendly)
app.patch('/api/admin/products/:id', async (c) => {
  const productId = c.req.param('id');
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, `products?id=eq.${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (res.ok) return c.json({ success: true });
    const errText = await res.text();
    console.error('Product update failed:', res.status, errText);
    return c.json({ error: 'Update failed: ' + errText }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

// Admin: update legal page
app.patch('/api/admin/legal/:slug', async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.json();
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

  if (sbUrl && sbKey) {
    const res = await supabaseFetch(sbUrl, sbKey, `legal_pages?slug=eq.${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (res.ok) return c.json({ success: true });
    const errText = await res.text();
    console.error('Legal update failed:', res.status, errText);
    return c.json({ error: 'Update failed: ' + errText }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

// Store credit
app.post('/api/store-credit', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email) return c.json({ error: 'Email required' }, 400)

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
    return c.json({ email, balance: 0 })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ============ 404 ============
app.all('*', (c) => {
  return c.html(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>404 — INTRU.IN</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Space Grotesk',sans-serif;background:#fafafa;color:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px}h1{font-family:'Archivo Black',sans-serif;font-size:clamp(60px,12vw,120px);text-transform:uppercase;letter-spacing:-.05em;margin-bottom:8px}p{color:#737373;font-size:14px;margin-bottom:28px}a{display:inline-block;padding:14px 36px;background:#0a0a0a;color:#fafafa;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;transition:all .2s}a:hover{background:#404040;transform:translateY(-2px)}</style></head>
<body><div><h1>404</h1><p>This page doesn't exist. Maybe it sold out.</p><a href="/">Back to Drop</a></div></body></html>`, 404)
})

export default app
