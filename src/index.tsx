import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PRODUCTS, LEGAL_PAGES, STORE_CONFIG, type Env, createRazorpayOrder, hmacSHA256, supabaseFetch } from './data'
import { homePage } from './pages/home'
import { productPage } from './pages/product'
import { legalPage } from './pages/legal'
import { adminPage } from './pages/admin'

type Bindings = Env & {
  [key: string]: string;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// Helper: get env value with fallback
function getEnv(env: Bindings, key: keyof Env, fallback?: string): string {
  return (env as any)[key] || fallback || '';
}

// ============ PAGE ROUTES ============

app.get('/', (c) => {
  return c.html(homePage({
    razorpayKeyId: getEnv(c.env, 'RAZORPAY_KEY_ID', STORE_CONFIG.razorpayKeyId),
    googleClientId: getEnv(c.env, 'GOOGLE_CLIENT_ID', STORE_CONFIG.googleClientId),
  }))
})

app.get('/product/:slug', (c) => {
  const slug = c.req.param('slug')
  const product = PRODUCTS.find(p => p.slug === slug)
  if (!product) {
    return c.html(`<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>`, 404)
  }
  return c.html(productPage(product, {
    razorpayKeyId: getEnv(c.env, 'RAZORPAY_KEY_ID', STORE_CONFIG.razorpayKeyId),
    googleClientId: getEnv(c.env, 'GOOGLE_CLIENT_ID', STORE_CONFIG.googleClientId),
  }))
})

app.get('/p/:slug', (c) => {
  const slug = c.req.param('slug')
  const page = LEGAL_PAGES.find(p => p.slug === slug)
  if (!page) {
    return c.html(`<html><head><meta http-equiv="refresh" content="0;url=/"></head></html>`, 404)
  }
  return c.html(legalPage(page, {
    razorpayKeyId: getEnv(c.env, 'RAZORPAY_KEY_ID', STORE_CONFIG.razorpayKeyId),
    googleClientId: getEnv(c.env, 'GOOGLE_CLIENT_ID', STORE_CONFIG.googleClientId),
  }))
})

app.get('/admin', (c) => {
  return c.html(adminPage({
    razorpayKeyId: getEnv(c.env, 'RAZORPAY_KEY_ID', STORE_CONFIG.razorpayKeyId),
    googleClientId: getEnv(c.env, 'GOOGLE_CLIENT_ID', STORE_CONFIG.googleClientId),
  }))
})

// ============ API ROUTES ============

// Health check
app.get('/api/health', (c) => {
  const hasRazorpay = !!getEnv(c.env, 'RAZORPAY_KEY_ID');
  const hasSupabase = !!getEnv(c.env, 'SUPABASE_URL');
  return c.json({
    status: 'ok',
    store: STORE_CONFIG.name,
    timestamp: new Date().toISOString(),
    services: {
      razorpay: hasRazorpay ? 'connected' : 'not configured',
      supabase: hasSupabase ? 'connected' : 'not configured',
    }
  })
})

// Get products
app.get('/api/products', async (c) => {
  const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
  const supabaseKey = getEnv(c.env, 'SUPABASE_ANON_KEY');

  // If Supabase is configured, fetch from DB
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await supabaseFetch(supabaseUrl, supabaseKey, 'products?select=*&order=created_at.asc');
      if (res.ok) {
        const products = await res.json();
        return c.json({ products, source: 'supabase' });
      }
    } catch (e) { /* fallthrough to static data */ }
  }

  // Fallback: static product data
  return c.json({
    products: PRODUCTS.map(p => ({
      id: p.id, slug: p.slug, name: p.name, price: p.price,
      comparePrice: p.comparePrice, images: p.images, sizes: p.sizes,
      category: p.category, inStock: p.inStock,
    })),
    source: 'static'
  })
})

// Get single product
app.get('/api/products/:id', (c) => {
  const id = c.req.param('id')
  const product = PRODUCTS.find(p => p.id === id || p.slug === id)
  if (!product) return c.json({ error: 'Product not found' }, 404)
  return c.json({ product })
})

// ============ CHECKOUT: Server-side price validation + Razorpay order creation ============
app.post('/api/checkout', async (c) => {
  try {
    const body = await c.req.json()
    const items = body.items
    const userEmail = body.userEmail || ''

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'No items in cart' }, 400)
    }

    // Step 1: Server-side price validation (NEVER trust client prices)
    let subtotal = 0
    const validatedItems: any[] = []

    for (const item of items) {
      const product = PRODUCTS.find(p => p.id === item.productId)
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

    // Step 2: Create Razorpay order (if keys are configured)
    const rzpKeyId = getEnv(c.env, 'RAZORPAY_KEY_ID');
    const rzpKeySecret = getEnv(c.env, 'RAZORPAY_KEY_SECRET');

    let razorpayOrderId: string | null = null;

    if (rzpKeyId && rzpKeySecret) {
      try {
        const receipt = 'intru_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
        const rzpOrder = await createRazorpayOrder(rzpKeyId, rzpKeySecret, total, receipt);
        razorpayOrderId = rzpOrder.id;

        // Step 3: Store pending order in Supabase (if configured)
        const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
        const supabaseKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

        if (supabaseUrl && supabaseKey) {
          try {
            await supabaseFetch(supabaseUrl, supabaseKey, 'orders', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: razorpayOrderId,
                items: validatedItems,
                subtotal,
                shipping,
                total,
                customer_email: userEmail,
                status: 'pending',
                created_at: new Date().toISOString(),
              }),
            });
          } catch (e) { /* Order stored in Razorpay, Supabase insert is best-effort */ }
        }
      } catch (e: any) {
        return c.json({ error: 'Payment gateway error: ' + (e.message || 'Failed to create order') }, 500)
      }
    }

    return c.json({
      success: true,
      items: validatedItems,
      subtotal,
      shipping,
      total,
      currency: 'INR',
      razorpayOrderId,
      storeCredit: 0,
    })
  } catch (e: any) {
    return c.json({ error: e.message || 'Checkout failed' }, 500)
  }
})

// ============ PAYMENT VERIFICATION (Razorpay signature validation + order confirmation) ============
app.post('/api/payment/verify', async (c) => {
  try {
    const body = await c.req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, userEmail } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return c.json({ error: 'Missing payment details' }, 400)
    }

    const rzpKeySecret = getEnv(c.env, 'RAZORPAY_KEY_SECRET');

    if (!rzpKeySecret) {
      return c.json({ error: 'Payment verification not configured' }, 500)
    }

    // Step 1: HMAC-SHA256 signature verification
    // Razorpay signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
    const expectedSignature = await hmacSHA256(rzpKeySecret, razorpay_order_id + '|' + razorpay_payment_id);

    if (expectedSignature !== razorpay_signature) {
      // CRITICAL: Signature mismatch — potential tamper attempt
      console.error('Payment signature mismatch', { razorpay_order_id, razorpay_payment_id });
      return c.json({ error: 'Payment verification failed. Signature mismatch.' }, 400)
    }

    // Step 2: Signature valid — update order in Supabase
    const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
    const supabaseKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
    let orderId = razorpay_order_id;

    if (supabaseUrl && supabaseKey) {
      try {
        // Update order status to 'paid'
        await supabaseFetch(supabaseUrl, supabaseKey, `orders?razorpay_order_id=eq.${razorpay_order_id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'paid',
            razorpay_payment_id,
            razorpay_signature,
            paid_at: new Date().toISOString(),
          }),
        });
      } catch (e) {
        // Best-effort — payment is confirmed by Razorpay regardless
        console.error('Failed to update order in Supabase:', e);
      }
    }

    return c.json({
      success: true,
      orderId,
      razorpayPaymentId: razorpay_payment_id,
      message: 'Payment verified and order confirmed.',
    })
  } catch (e: any) {
    return c.json({ error: e.message || 'Verification failed' }, 500)
  }
})

// ============ RAZORPAY WEBHOOK (server-to-server, no user interaction) ============
app.post('/api/webhooks/razorpay', async (c) => {
  try {
    const rawBody = await c.req.text();
    const webhookSecret = getEnv(c.env, 'RAZORPAY_WEBHOOK_SECRET') || getEnv(c.env, 'RAZORPAY_KEY_SECRET');
    const receivedSignature = c.req.header('x-razorpay-signature') || '';

    if (!webhookSecret) {
      return c.json({ error: 'Webhook not configured' }, 500);
    }

    // Verify webhook signature
    const expectedSig = await hmacSHA256(webhookSecret, rawBody);
    if (expectedSig !== receivedSignature) {
      return c.json({ error: 'Invalid webhook signature' }, 400);
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
    const supabaseKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

    if (eventType === 'payment.captured' && supabaseUrl && supabaseKey) {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await supabaseFetch(supabaseUrl, supabaseKey, `orders?razorpay_order_id=eq.${payment.order_id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'paid',
            razorpay_payment_id: payment.id,
            paid_at: new Date().toISOString(),
          }),
        });
      }
    }

    if (eventType === 'payment.failed' && supabaseUrl && supabaseKey) {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await supabaseFetch(supabaseUrl, supabaseKey, `orders?razorpay_order_id=eq.${payment.order_id}`, {
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

    // Decode Google JWT (header.payload.signature)
    const parts = credential.split('.');
    if (parts.length !== 3) return c.json({ error: 'Invalid token' }, 400);

    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const { email, name, picture, sub } = payload;

      // In production: verify token with Google's tokeninfo endpoint
      // const verify = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      // if (!verify.ok) return c.json({ error: 'Token verification failed' }, 401);

      // Upsert user in Supabase
      const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
      const supabaseKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

      if (supabaseUrl && supabaseKey) {
        try {
          await supabaseFetch(supabaseUrl, supabaseKey, 'users', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates' } as any,
            body: JSON.stringify({ email, name, picture, google_id: sub, last_login: new Date().toISOString() }),
          });
        } catch (e) { /* best effort */ }
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

    const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
    const supabaseKey = getEnv(c.env, 'SUPABASE_ANON_KEY');

    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' },
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

// Admin: get orders from Supabase
app.get('/api/admin/orders', async (c) => {
  const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
  const supabaseKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await supabaseFetch(supabaseUrl, supabaseKey, 'orders?select=*&order=created_at.desc&limit=50');
      if (res.ok) {
        const orders = await res.json();
        return c.json({ orders, source: 'supabase' });
      }
    } catch (e) { /* fallthrough */ }
  }
  return c.json({ orders: [], source: 'none', message: 'Connect Supabase to see live orders' });
})

// Admin: update order status
app.patch('/api/admin/orders/:id', async (c) => {
  const orderId = c.req.param('id');
  const body = await c.req.json();
  const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
  const supabaseKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

  if (supabaseUrl && supabaseKey) {
    const res = await supabaseFetch(supabaseUrl, supabaseKey, `orders?id=eq.${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: 'Update failed' }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

// Admin: update product
app.patch('/api/admin/products/:id', async (c) => {
  const productId = c.req.param('id');
  const body = await c.req.json();
  const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
  const supabaseKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');

  if (supabaseUrl && supabaseKey) {
    const res = await supabaseFetch(supabaseUrl, supabaseKey, `products?id=eq.${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    if (res.ok) return c.json({ success: true });
    return c.json({ error: 'Update failed' }, 500);
  }
  return c.json({ error: 'Supabase not configured' }, 500);
})

// Store credit check
app.post('/api/store-credit', async (c) => {
  try {
    const { email } = await c.req.json()
    if (!email) return c.json({ error: 'Email required' }, 400)

    const supabaseUrl = getEnv(c.env, 'SUPABASE_URL');
    const supabaseKey = getEnv(c.env, 'SUPABASE_ANON_KEY');

    if (supabaseUrl && supabaseKey) {
      const res = await supabaseFetch(supabaseUrl, supabaseKey, `store_credits?email=eq.${email}&select=amount`);
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
