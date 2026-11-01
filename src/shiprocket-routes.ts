import type { Context } from 'hono';
import type { Bindings } from './index';
import {
  supabaseFetch, fetchProductById, fetchStoreSetting,
  sendResendEmail, emailOrderConfirmed, checkResendGuard, logResendEmail
} from './data';
import {
  getShiprocketToken, createShiprocketShipment, generateShiprocketAWB,
  trackShiprocketAWB, getShiprocketLabel
} from './shiprocket';

function getEnv(env: any, key: string, fallback = ''): string {
  return env[key] || fallback;
}

/**
 * Creates Fastrr / Shiprocket Checkout Session
 */
export async function handleShiprocketCheckoutSession(c: Context<{ Bindings: Bindings }>) {
  try {
    const body = await c.req.json();
    const items = body.items;
    const userEmail = body.userEmail || '';
    const userName = body.userName || '';
    const userPhone = body.userPhone || '';
    const couponCode: string = (body.couponCode || '').toUpperCase().trim();

    if (!items || !Array.isArray(items) || items.length === 0)
      return c.json({ error: 'No items in cart' }, 400);

    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
    const sbAnon = getEnv(c.env, 'SUPABASE_ANON_KEY');
    const sbKey = sbSvc || sbAnon;

    const fastrrAppId = getEnv(c.env, 'FASTRR_APP_ID') || (sbUrl && sbKey ? await fetchStoreSetting(sbUrl, sbKey, 'FASTRR_APP_ID') : '');
    const providerSetting = getEnv(c.env, 'CHECKOUT_PROVIDER') || (sbUrl && sbKey ? await fetchStoreSetting(sbUrl, sbKey, 'CHECKOUT_PROVIDER') : 'shiprocket');

    // If provider is explicitly set to razorpay or fastrrAppId is missing, signal client to fallback
    if (providerSetting === 'razorpay' || !fastrrAppId) {
      return c.json({ fallback: true, reason: 'Shiprocket Fastrr not configured or set to Razorpay' });
    }

    let subtotal = 0;
    const validatedItems: any[] = [];
    const fastrrOrderItems: any[] = [];

    for (const item of items) {
      const product = await fetchProductById(sbUrl, sbKey, item.productId);
      if (!product) return c.json({ error: `Product ${item.productId} not found` }, 400);
      if (!product.inStock) return c.json({ error: `${product.name} is out of stock` }, 400);
      if (!item.size || !product.sizes.includes(item.size))
        return c.json({ error: `Size "${item.size}" not available for ${product.name}` }, 400);

      if (product.sizeStock && product.sizeStock[item.size] !== undefined && product.sizeStock[item.size] <= 0)
        return c.json({ error: `Size "${item.size}" is sold out for ${product.name}` }, 400);

      const qty = Math.max(1, Math.min(10, parseInt(item.quantity) || 1));
      const lineTotal = product.price * qty;
      subtotal += lineTotal;
      validatedItems.push({
        productId: product.id, name: product.name, size: item.size,
        quantity: qty, unitPrice: product.price, lineTotal,
        image: product.images[0] || '', slug: product.slug, description: product.description,
        category: (product as any).category || '',
      });

      fastrrOrderItems.push({
        id: `${product.id}-${item.size}`,
        name: `${product.name} (${item.size})`,
        sku: `${product.slug}-${item.size}`.toUpperCase(),
        units: qty,
        selling_price: product.price,
        discount: 0,
        tax: 0,
        image: product.images[0] || '',
      });
    }

    // Evaluate combos
    let comboDiscount = 0;
    let appliedComboId: string | null = null;
    try {
      const activeCombosRes = await supabaseFetch(sbUrl, sbKey, 'combos?is_active=eq.true&order=created_at.desc');
      if (activeCombosRes.ok) {
        const activeCombos = await activeCombosRes.json() as any[];
        const totalItemsCount = validatedItems.reduce((acc, it) => acc + it.quantity, 0);
        const itemProductIds = validatedItems.map(it => it.productId);

        for (const combo of activeCombos) {
          if (combo.min_products && totalItemsCount < combo.min_products) continue;
          if (combo.min_subtotal && subtotal < combo.min_subtotal) continue;
          if (combo.required_product_ids && combo.required_product_ids.length > 0) {
            const hasAll = combo.required_product_ids.every((pid: string) => itemProductIds.includes(pid));
            if (!hasAll) continue;
          }
          let disc = 0;
          if (combo.discount_type === 'percent') {
            disc = Math.round((subtotal * combo.discount_value) / 100);
          } else {
            disc = Math.min(combo.discount_value, subtotal);
          }
          if (disc > comboDiscount) {
            comboDiscount = disc;
            appliedComboId = combo.id;
          }
        }
      }
    } catch (e) { console.error('Combo calculation error:', e); }

    // Evaluate coupons
    let couponDiscount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCode && !comboDiscount) {
      try {
        const couponRes = await supabaseFetch(sbUrl, sbKey, `coupons?code=eq.${encodeURIComponent(couponCode)}&is_active=eq.true`);
        if (couponRes.ok) {
          const coupons = await couponRes.json() as any[];
          if (coupons.length > 0) {
            const coupon = coupons[0];
            const now = new Date();
            const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > now;
            const meetsMin = !coupon.min_order_amount || subtotal >= coupon.min_order_amount;
            const withinLimit = !coupon.max_uses || (coupon.used_count || 0) < coupon.max_uses;

            if (notExpired && meetsMin && withinLimit) {
              if (coupon.discount_type === 'percent') {
                couponDiscount = Math.round((subtotal * coupon.discount_value) / 100);
                if (coupon.max_discount_amount) {
                  couponDiscount = Math.min(couponDiscount, coupon.max_discount_amount);
                }
              } else {
                couponDiscount = Math.min(coupon.discount_value, subtotal);
              }
              appliedCouponCode = coupon.code;
            }
          }
        }
      } catch (e) { console.error('Coupon fetch error:', e); }
    }

    const totalDiscount = comboDiscount + couponDiscount;
    const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
    const shipping = 0; // Prepaid is always free across India on intru
    const total = discountedSubtotal + shipping;

    const internalOrderId = `INTRU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Pre-insert pending order in Supabase
    if (sbUrl && sbKey) {
      try {
        const writeKey = sbSvc || sbKey;
        await supabaseFetch(sbUrl, writeKey, 'orders', {
          method: 'POST',
          body: JSON.stringify({
            shiprocket_order_id: internalOrderId,
            items: validatedItems,
            subtotal,
            shipping,
            total,
            customer_email: userEmail,
            customer_name: userName,
            customer_phone: userPhone,
            status: 'pending',
            payment_method: 'shiprocket_fastrr',
            checkout_provider: 'shiprocket',
            combo_discount: comboDiscount,
            applied_combo_id: appliedComboId,
            coupon_discount: couponDiscount,
            coupon_code: appliedCouponCode,
            created_at: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error('Failed to pre-store Fastrr order in Supabase:', err);
      }
    }

    return c.json({
      success: true,
      provider: 'shiprocket',
      fastrrAppId,
      orderId: internalOrderId,
      subtotal,
      discount: totalDiscount,
      total,
      currency: 'INR',
      items: fastrrOrderItems,
      customer: {
        email: userEmail,
        phone: userPhone,
        name: userName,
      },
    });
  } catch (err: any) {
    console.error('Fastrr session generation error, requesting fallback:', err);
    return c.json({ fallback: true, error: err.message || 'Fastrr init error' }, 200);
  }
}

/**
 * Handle incoming webhooks from Fastrr Checkout & Shiprocket tracking
 */
export async function handleShiprocketWebhook(c: Context<{ Bindings: Bindings }>) {
  try {
    const rawBody = await c.req.text();
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return c.json({ error: 'Invalid JSON payload' }, 400);
    }

    const sbUrl = getEnv(c.env, 'SUPABASE_URL');
    const sbSvc = getEnv(c.env, 'SUPABASE_SERVICE_KEY');
    const sbKey = sbSvc || getEnv(c.env, 'SUPABASE_ANON_KEY');

    console.log('[Shiprocket Webhook] Received event:', event.event || event.status || 'unknown');

    const eventName = event.event || event.action;
    const orderPayload = event.order || event.payload || event;
    const orderId = orderPayload.order_id || orderPayload.id;

    if (sbUrl && sbKey && orderId) {
      if (eventName === 'order.completed' || eventName === 'payment.success' || orderPayload.payment_status === 'PAID') {
        const updateData: any = {
          status: 'paid',
          payment_method: orderPayload.payment_method?.toLowerCase() || 'prepaid',
          shiprocket_order_id: String(orderId),
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (orderPayload.customer) {
          updateData.customer_email = orderPayload.customer.email || '';
          updateData.customer_phone = orderPayload.customer.phone || '';
          updateData.customer_name = orderPayload.customer.name || '';
        }
        if (orderPayload.shipping_address) {
          updateData.shipping_address = orderPayload.shipping_address;
          updateData.shipping_city = orderPayload.shipping_address.city || '';
          updateData.shipping_state = orderPayload.shipping_address.state || '';
          updateData.shipping_pincode = orderPayload.shipping_address.pincode || '';
        }

        await supabaseFetch(sbUrl, sbKey, `orders?shiprocket_order_id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        });

        const resendKey = getEnv(c.env, 'RESEND_API_KEY');
        if (resendKey && updateData.customer_email) {
          const confGuard = await checkResendGuard(sbUrl, sbKey, 'confirmation');
          if (confGuard.allowed) {
            try {
              await sendResendEmail(
                resendKey,
                updateData.customer_email,
                `Order Confirmed - #${String(orderId).slice(-8).toUpperCase()} | intru.in`,
                emailOrderConfirmed(String(orderId), updateData.customer_name || 'Collector', orderPayload.items || [], orderPayload.total || 0)
              );
              await logResendEmail(sbUrl, sbKey, updateData.customer_email, 'order_confirmed', String(orderId));
            } catch (emErr) {
              console.error('Fastrr email error:', emErr);
            }
          }
        }
      }

      // Tracking / Courier status update from Shiprocket
      if (event.awb || event.current_status || event.shipment_status) {
        const currentStatus = String(event.current_status || event.shipment_status || '').toUpperCase();
        const awbCode = event.awb || event.awb_code;
        const courier = event.courier_name;

        const updateData: any = {
          shiprocket_status: currentStatus,
          updated_at: new Date().toISOString(),
        };
        if (awbCode) {
          updateData.shiprocket_awb = awbCode;
          updateData.tracking_number = awbCode;
          updateData.tracking_url = `https://shiprocket.co/tracking/${awbCode}`;
        }
        if (courier) updateData.shiprocket_courier_name = courier;

        if (currentStatus.includes('DELIVERED')) {
          updateData.status = 'delivered';
          updateData.delivered_at = new Date().toISOString();
        } else if (currentStatus.includes('IN TRANSIT') || currentStatus.includes('OUT FOR DELIVERY') || currentStatus.includes('SHIPPED')) {
          updateData.status = 'shipped';
          updateData.shipped_at = new Date().toISOString();
        }

        await supabaseFetch(sbUrl, sbKey, `orders?shiprocket_order_id=eq.${encodeURIComponent(orderId)}`, {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        });
      }
    }

    return c.json({ success: true });
  } catch (err: any) {
    console.error('Shiprocket webhook error:', err);
    return c.json({ error: err.message || 'Webhook processing failed' }, 500);
  }
}

/**
 * Admin: Push order to Shiprocket for fulfillment & generate AWB
 */
export async function handleAdminShiprocketPush(c: Context<{ Bindings: Bindings }>) {
  const orderId = c.req.param('id');
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (!sbUrl || !sbKey) return c.json({ error: 'Supabase not configured' }, 500);

  try {
    const orderRes = await supabaseFetch(sbUrl, sbKey, `orders?id=eq.${encodeURIComponent(orderId)}`);
    if (!orderRes.ok) return c.json({ error: 'Order not found in database' }, 404);
    const orders = await orderRes.json() as any[];
    if (!orders.length) return c.json({ error: 'Order not found' }, 404);
    const order = orders[0];

    const srEmail = getEnv(c.env, 'SHIPROCKET_EMAIL') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_EMAIL');
    const srPassword = getEnv(c.env, 'SHIPROCKET_PASSWORD') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_PASSWORD');
    const srTokenStatic = getEnv(c.env, 'SHIPROCKET_TOKEN') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_TOKEN');
    const pickupLoc = getEnv(c.env, 'SHIPROCKET_PICKUP_LOCATION') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_PICKUP_LOCATION') || 'Primary';

    const token = await getShiprocketToken({ email: srEmail, password: srPassword, staticToken: srTokenStatic });
    if (!token) {
      return c.json({ error: 'Could not authenticate with Shiprocket. Check SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in settings or environment.' }, 400);
    }

    const addr = order.shipping_address || {};
    const cName = order.customer_name || addr.name || 'Customer';
    const cPhone = order.customer_phone || addr.phone || addr.contact || '9999999999';
    const cEmail = order.customer_email || 'shop@intru.in';

    const orderItems = (order.items || []).map((it: any) => ({
      id: `${it.productId || 'item'}-${it.size || 'os'}`,
      name: it.name || 'Intru Garment',
      sku: `${it.slug || 'SKU'}-${it.size || 'M'}`.toUpperCase(),
      units: it.quantity || 1,
      selling_price: it.unitPrice || order.total || 999,
      discount: 0,
      tax: 0,
    }));

    const isCod = order.payment_method === 'cod';
    const payload = {
      order_id: `INTRU-${order.id.slice(0, 8).toUpperCase()}`,
      order_date: new Date(order.created_at || Date.now()).toISOString().slice(0, 19).replace('T', ' '),
      pickup_location: pickupLoc,
      billing_customer_name: cName,
      billing_last_name: '',
      billing_address: order.shipping_address_line1 || addr.line1 || 'Address Line 1',
      billing_address_2: order.shipping_address_line2 || addr.line2 || '',
      billing_city: order.shipping_city || addr.city || 'City',
      billing_pincode: order.shipping_pincode || addr.pincode || '500001',
      billing_state: order.shipping_state || addr.state || 'Telangana',
      billing_country: 'India',
      billing_email: cEmail,
      billing_phone: cPhone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: isCod ? ('COD' as const) : ('Prepaid' as const),
      shipping_charges: order.shipping || 0,
      sub_total: order.subtotal || order.total || 0,
      length: 28,
      breadth: 20,
      height: 3,
      weight: 0.45,
    };

    const srResult = await createShiprocketShipment(token, payload);
    if (!srResult.success) {
      return c.json({ error: srResult.error || 'Shiprocket order creation failed' }, 400);
    }

    const srData = srResult.data;
    const shipmentId = srData.shipment_id || srData.response?.data?.shipment_id;
    const srOrderId = srData.order_id || srData.response?.data?.order_id;

    // Automatically attempt AWB generation
    let awbCode = '';
    let courierName = '';
    if (shipmentId) {
      const awbRes = await generateShiprocketAWB(token, shipmentId);
      if (awbRes.success && awbRes.awb_code) {
        awbCode = awbRes.awb_code;
        courierName = awbRes.courier_name || '';
      }
    }

    const patchPayload: any = {
      shiprocket_order_id: String(srOrderId || payload.order_id),
      shiprocket_shipment_id: shipmentId ? String(shipmentId) : null,
      updated_at: new Date().toISOString(),
    };
    if (awbCode) {
      patchPayload.shiprocket_awb = awbCode;
      patchPayload.tracking_number = awbCode;
      patchPayload.tracking_url = `https://shiprocket.co/tracking/${awbCode}`;
      patchPayload.shiprocket_courier_name = courierName;
      patchPayload.status = 'processing';
    }

    await supabaseFetch(sbUrl, sbKey, `orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify(patchPayload),
    });

    return c.json({
      success: true,
      shipmentId,
      srOrderId,
      awbCode,
      courierName,
      trackingUrl: awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null,
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'Push to Shiprocket failed' }, 500);
  }
}

/**
 * Admin: Generate AWB for an already pushed shipment
 */
export async function handleAdminShiprocketAWB(c: Context<{ Bindings: Bindings }>) {
  const orderId = c.req.param('id');
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (!sbUrl || !sbKey) return c.json({ error: 'Supabase not configured' }, 500);

  try {
    const orderRes = await supabaseFetch(sbUrl, sbKey, `orders?id=eq.${encodeURIComponent(orderId)}`);
    const orders = orderRes.ok ? (await orderRes.json() as any[]) : [];
    if (!orders.length) return c.json({ error: 'Order not found' }, 404);
    const order = orders[0];

    const shipmentId = order.shiprocket_shipment_id;
    if (!shipmentId) return c.json({ error: 'Order does not have a Shiprocket shipment ID yet. Push order first.' }, 400);

    const srEmail = getEnv(c.env, 'SHIPROCKET_EMAIL') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_EMAIL');
    const srPassword = getEnv(c.env, 'SHIPROCKET_PASSWORD') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_PASSWORD');
    const srTokenStatic = getEnv(c.env, 'SHIPROCKET_TOKEN') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_TOKEN');

    const token = await getShiprocketToken({ email: srEmail, password: srPassword, staticToken: srTokenStatic });
    if (!token) return c.json({ error: 'Shiprocket authentication failed' }, 400);

    const awbRes = await generateShiprocketAWB(token, shipmentId);
    if (!awbRes.success || !awbRes.awb_code) {
      return c.json({ error: awbRes.error || 'Failed to generate AWB' }, 400);
    }

    const patchPayload: any = {
      shiprocket_awb: awbRes.awb_code,
      tracking_number: awbRes.awb_code,
      tracking_url: `https://shiprocket.co/tracking/${awbRes.awb_code}`,
      shiprocket_courier_name: awbRes.courier_name || '',
      updated_at: new Date().toISOString(),
    };

    await supabaseFetch(sbUrl, sbKey, `orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify(patchPayload),
    });

    return c.json({
      success: true,
      awbCode: awbRes.awb_code,
      courierName: awbRes.courier_name,
      trackingUrl: `https://shiprocket.co/tracking/${awbRes.awb_code}`,
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
}

/**
 * Admin: Get PDF Shipping Label URL
 */
export async function handleAdminShiprocketLabel(c: Context<{ Bindings: Bindings }>) {
  const orderId = c.req.param('id');
  const sbUrl = getEnv(c.env, 'SUPABASE_URL');
  const sbKey = getEnv(c.env, 'SUPABASE_SERVICE_KEY') || getEnv(c.env, 'SUPABASE_ANON_KEY');
  if (!sbUrl || !sbKey) return c.json({ error: 'Supabase not configured' }, 500);

  try {
    const orderRes = await supabaseFetch(sbUrl, sbKey, `orders?id=eq.${encodeURIComponent(orderId)}`);
    const orders = orderRes.ok ? (await orderRes.json() as any[]) : [];
    if (!orders.length) return c.json({ error: 'Order not found' }, 404);
    const order = orders[0];

    const shipmentId = order.shiprocket_shipment_id;
    if (!shipmentId) return c.json({ error: 'Shipment ID not found on this order' }, 400);

    const srEmail = getEnv(c.env, 'SHIPROCKET_EMAIL') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_EMAIL');
    const srPassword = getEnv(c.env, 'SHIPROCKET_PASSWORD') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_PASSWORD');
    const srTokenStatic = getEnv(c.env, 'SHIPROCKET_TOKEN') || await fetchStoreSetting(sbUrl, sbKey, 'SHIPROCKET_TOKEN');

    const token = await getShiprocketToken({ email: srEmail, password: srPassword, staticToken: srTokenStatic });
    if (!token) return c.json({ error: 'Shiprocket authentication failed' }, 400);

    const labelRes = await getShiprocketLabel(token, [shipmentId]);
    if (!labelRes.success || !labelRes.labelUrl) {
      return c.json({ error: labelRes.error || 'Failed to fetch label' }, 400);
    }

    return c.json({ success: true, labelUrl: labelRes.labelUrl });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
}
