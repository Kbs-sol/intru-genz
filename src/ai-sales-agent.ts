// =============================================================
// intru.in — Daily AI Sales Agent
// -------------------------------------------------------------
// Runs once per day (triggered by a GitHub Actions cron that hits
// GET /api/ai/sales-report?key=CRON_SECRET). It:
//   1. Pulls the last N days of real data from Supabase
//      (view_stats, funnel_events, orders, products, coupons).
//   2. Computes the conversion funnel + KPIs and finds the biggest
//      leak / opportunity (drop-off points, zero-converting products).
//   3. Asks an LLM (OpenAI-compatible) for concrete, prioritised
//      sales-improvement actions. Falls back to a deterministic
//      heuristic engine when no LLM key is configured.
//   4. Emails the report to the manager (Resend) and stores it in
//      the ai_sales_reports table for the admin to review.
//
// Everything is edge-safe (fetch only — no Node APIs) so it runs
// inside Cloudflare Pages Functions.
// =============================================================

import { supabaseFetch, sendResendEmail, type Env } from './data'

export interface SalesMetrics {
  windowDays: number
  generatedAt: string
  // Funnel
  pageViews: number
  productViews: number
  addToCart: number
  checkoutStart: number
  purchases: number
  // Rates (%)
  viewToCartRate: number
  cartToCheckoutRate: number
  checkoutToPurchaseRate: number
  overallConversionRate: number
  // Revenue
  revenue: number
  orders: number
  avgOrderValue: number
  codShare: number          // % of orders that were COD
  // Catalog signals
  topPages: { path: string; count: number }[]
  topProducts: { id: string; name: string; orders: number; revenue: number }[]
  zeroConversionProducts: { id: string; name: string; views: number }[]
  activeCoupons: number
  // The single biggest opportunity, surfaced deterministically.
  biggestLeak: string
}

function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return Math.round((numerator / denominator) * 1000) / 10 // 1 decimal
}

async function safeJson<T>(p: Promise<Response>, fallback: T): Promise<T> {
  try {
    const res = await p
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

/**
 * Gather raw data from Supabase and compute the funnel + KPIs.
 */
export async function computeSalesMetrics(env: Env, windowDays = 7): Promise<SalesMetrics> {
  const sbUrl = env.SUPABASE_URL
  const sbKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY
  const sinceIso = new Date(Date.now() - windowDays * 86400_000).toISOString()

  // --- Funnel events (last N days) ---
  const events = await safeJson<any[]>(
    supabaseFetch(sbUrl, sbKey, `funnel_events?select=event_type,product_id,metadata,created_at&created_at=gte.${sinceIso}&limit=10000`),
    []
  )
  const countBy = (t: string) => events.filter(e => e.event_type === t).length
  const addToCart = countBy('add_to_cart')
  // funnel_events event_type CHECK: identify | add_to_cart | checkout_start | payment_success
  const checkoutStart = countBy('checkout_start') + countBy('begin_checkout')

  // --- Orders (last N days) ---
  const orders = await safeJson<any[]>(
    supabaseFetch(sbUrl, sbKey, `orders?select=id,total,items,status,payment_method,created_at&created_at=gte.${sinceIso}&limit=5000`),
    []
  )
  const paidOrders = orders.filter(o => ['paid', 'confirmed', 'shipped', 'delivered', 'cod_confirmed'].includes((o.status || '').toLowerCase()))
  const revenue = paidOrders.reduce((s, o) => s + (Number(o.total) || 0), 0)
  const codCount = paidOrders.filter(o => (o.payment_method || '').toLowerCase().includes('cod')).length
  const purchases = paidOrders.length

  // --- Page views (view_stats is cumulative; use as catalog signal) ---
  const viewStats = await safeJson<any[]>(
    supabaseFetch(sbUrl, sbKey, `view_stats?select=path,count&order=count.desc&limit=50`),
    []
  )
  const pageViews = viewStats.reduce((s, v) => s + (Number(v.count) || 0), 0)
  const productViews = viewStats
    .filter(v => (v.path || '').startsWith('/product/'))
    .reduce((s, v) => s + (Number(v.count) || 0), 0)
  const topPages = viewStats.slice(0, 8).map(v => ({ path: v.path, count: Number(v.count) || 0 }))

  // --- Products (for names + zero-conversion detection) ---
  const products = await safeJson<any[]>(
    supabaseFetch(sbUrl, sbKey, `products?select=id,name,slug&limit=500`),
    []
  )
  const nameById: Record<string, string> = {}
  const slugToId: Record<string, string> = {}
  for (const p of products) { nameById[p.id] = p.name; slugToId[p.slug] = p.id }

  // Revenue & order count per product (from paid orders' items JSONB)
  const prodOrders: Record<string, { orders: number; revenue: number }> = {}
  for (const o of paidOrders) {
    const items = Array.isArray(o.items) ? o.items : []
    for (const it of items) {
      const pid = it.productId || it.id || slugToId[it.slug] || ''
      if (!pid) continue
      if (!prodOrders[pid]) prodOrders[pid] = { orders: 0, revenue: 0 }
      prodOrders[pid].orders += Number(it.quantity) || 1
      prodOrders[pid].revenue += (Number(it.lineTotal) || (Number(it.unitPrice || it.price) || 0) * (Number(it.quantity) || 1))
    }
  }
  const topProducts = Object.entries(prodOrders)
    .map(([id, v]) => ({ id, name: nameById[id] || id, orders: v.orders, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)

  // Products with views but no orders in the window
  const viewsByProductId: Record<string, number> = {}
  for (const v of viewStats) {
    if (!(v.path || '').startsWith('/product/')) continue
    const slug = v.path.replace('/product/', '')
    const pid = slugToId[slug]
    if (pid) viewsByProductId[pid] = Number(v.count) || 0
  }
  const zeroConversionProducts = Object.entries(viewsByProductId)
    .filter(([id, views]) => views >= 20 && !(prodOrders[id]?.orders))
    .map(([id, views]) => ({ id, name: nameById[id] || id, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)

  // --- Coupons ---
  const coupons = await safeJson<any[]>(
    supabaseFetch(sbUrl, sbKey, `coupons?select=code,is_active&is_active=eq.true&limit=100`),
    []
  )

  const viewToCartRate = pct(addToCart, productViews || pageViews)
  const cartToCheckoutRate = pct(checkoutStart, addToCart)
  const checkoutToPurchaseRate = pct(purchases, checkoutStart)
  const overallConversionRate = pct(purchases, pageViews)

  // Deterministic "biggest leak" — picks the lowest-converting funnel stage.
  const stages: { label: string; rate: number }[] = [
    { label: 'Visitors are not adding to cart (browse → cart drop-off)', rate: viewToCartRate },
    { label: 'Carts are not reaching checkout (cart → checkout drop-off)', rate: cartToCheckoutRate },
    { label: 'Checkouts are not completing payment (checkout → purchase drop-off)', rate: checkoutToPurchaseRate },
  ]
  const worst = stages.reduce((a, b) => (b.rate < a.rate ? b : a), stages[0])

  return {
    windowDays,
    generatedAt: new Date().toISOString(),
    pageViews, productViews, addToCart, checkoutStart, purchases,
    viewToCartRate, cartToCheckoutRate, checkoutToPurchaseRate, overallConversionRate,
    revenue, orders: orders.length, avgOrderValue: purchases ? Math.round(revenue / purchases) : 0,
    codShare: pct(codCount, purchases),
    topPages, topProducts, zeroConversionProducts,
    activeCoupons: coupons.length,
    biggestLeak: worst.label,
  }
}

/**
 * Deterministic fallback recommendation engine — used when no LLM key
 * is configured, so the agent always produces useful output.
 */
export function heuristicRecommendations(m: SalesMetrics): string {
  const recs: string[] = []
  if (m.viewToCartRate < 5) {
    recs.push('• Low browse→cart rate: strengthen product pages — add urgency ("Only X left"), clearer size guidance, and 3+ lifestyle images above the fold. Surface the free-shipping threshold prominently.')
  }
  if (m.cartToCheckoutRate < 40) {
    recs.push('• Cart→checkout leak: reduce friction at the cart step. Show total savings + free-shipping progress bar, enable a one-tap checkout, and trigger the exit-intent coupon when users hesitate.')
  }
  if (m.checkoutToPurchaseRate < 50) {
    recs.push('• Checkout→purchase leak: this is where revenue is lost. Offer COD reassurance, display trust badges, pre-fill saved addresses, and send an abandoned-checkout email within 1 hour.')
  }
  if (m.zeroConversionProducts.length) {
    recs.push(`• ${m.zeroConversionProducts.length} product(s) get traffic but zero sales (${m.zeroConversionProducts.map(p => p.name).join(', ')}). A/B test pricing, refresh hero imagery, or bundle them into a combo.`)
  }
  if (m.avgOrderValue > 0 && m.activeCoupons === 0) {
    recs.push('• No active coupons: launch a first-order code (WELCOME10) and a cart-threshold offer to lift AOV.')
  }
  if (m.codShare > 60) {
    recs.push('• High COD share increases RTO risk. Incentivise prepaid with a small prepaid-only discount or free shipping on prepaid orders.')
  }
  if (!recs.length) {
    recs.push('• Funnel is healthy across stages. Focus on top-of-funnel: invest in the organic content pages and Instagram to grow qualified traffic, and test raising the free-shipping threshold to lift AOV.')
  }
  return `Biggest opportunity: ${m.biggestLeak}\n\nPrioritised actions:\n${recs.join('\n')}`
}

/**
 * Ask an OpenAI-compatible LLM for recommendations. Returns null on any
 * failure so the caller can fall back to the heuristic engine.
 */
export async function llmRecommendations(env: Env, m: SalesMetrics): Promise<{ text: string; model: string } | null> {
  const apiKey = (env as any).OPENAI_API_KEY as string | undefined
  if (!apiKey) return null
  const baseUrl = ((env as any).OPENAI_BASE_URL as string) || 'https://api.openai.com/v1'
  const model = ((env as any).OPENAI_MODEL as string) || 'gpt-4o-mini'

  const prompt = `You are a senior e-commerce CRO (conversion rate optimization) strategist for "intru.in", an Indian premium streetwear brand selling limited-edition oversized t-shirts (no restocks, FOMO-driven). Analyse the last ${m.windowDays} days of real store data and give concrete, prioritised actions to increase SALES. Be specific to a Shopify-like single-page store with Razorpay + COD, coupons, an AI stylist, and exit-intent offers. Keep it under 250 words, use short bullet points, lead with the single highest-impact action, and quantify expected impact where reasonable.

DATA (JSON):
${JSON.stringify({
    funnel: {
      pageViews: m.pageViews, productViews: m.productViews, addToCart: m.addToCart,
      checkoutStart: m.checkoutStart, purchases: m.purchases,
    },
    rates_percent: {
      viewToCart: m.viewToCartRate, cartToCheckout: m.cartToCheckoutRate,
      checkoutToPurchase: m.checkoutToPurchaseRate, overall: m.overallConversionRate,
    },
    revenue_inr: m.revenue, orders: m.orders, avgOrderValue_inr: m.avgOrderValue,
    codSharePercent: m.codShare, activeCoupons: m.activeCoupons,
    topProducts: m.topProducts, zeroConversionProducts: m.zeroConversionProducts,
    topPages: m.topPages, biggestLeak: m.biggestLeak,
  }, null, 2)}`

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a precise, no-fluff e-commerce growth analyst. Output only the recommendations.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 700,
      }),
    })
    if (!res.ok) return null
    const data = await res.json() as any
    const text = data?.choices?.[0]?.message?.content?.trim()
    if (!text) return null
    return { text, model }
  } catch {
    return null
  }
}

function buildEmailHtml(m: SalesMetrics, recommendations: string, model: string): string {
  const rupee = (n: number) => 'Rs.' + (n || 0).toLocaleString('en-IN')
  const recHtml = recommendations
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => `<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#333">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`)
    .join('')
  const row = (k: string, v: string) =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#525252">${k}</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;font-weight:700;color:#0a0a0a">${v}</td></tr>`
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb">
    <div style="background:#0a0a0a;padding:32px;text-align:center">
      <h1 style="color:#fff;font-size:18px;margin:0;letter-spacing:3px;text-transform:uppercase">DAILY SALES INTELLIGENCE</h1>
      <p style="color:#a3a3a3;font-size:11px;margin:8px 0 0;letter-spacing:2px">INTRU.IN — last ${m.windowDays} days · ${new Date(m.generatedAt).toDateString()}</p>
    </div>
    <div style="padding:28px 32px">
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#0a0a0a;margin:0 0 12px">KPIs</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        ${row('Revenue (paid)', rupee(m.revenue))}
        ${row('Orders (paid)', String(m.purchases))}
        ${row('Avg order value', rupee(m.avgOrderValue))}
        ${row('Overall conversion', m.overallConversionRate + '%')}
        ${row('Browse → cart', m.viewToCartRate + '%')}
        ${row('Cart → checkout', m.cartToCheckoutRate + '%')}
        ${row('Checkout → purchase', m.checkoutToPurchaseRate + '%')}
        ${row('COD share', m.codShare + '%')}
      </table>
      <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#0a0a0a;margin:0 0 12px">AI Recommendations</h2>
      <div style="background:#fafafa;border-left:3px solid #0a0a0a;padding:16px 18px">${recHtml}</div>
      <p style="font-size:11px;color:#a3a3a3;margin:20px 0 0">Generated by the Intru daily AI sales agent · ${model}</p>
    </div>
  </div>`
}

export interface SalesReportResult {
  ok: boolean
  metrics: SalesMetrics
  summary: string
  recommendations: string
  model: string
  emailed: boolean
  stored: boolean
  error?: string
}

/**
 * Full daily run: compute → recommend → email → store.
 */
export async function runDailySalesAgent(env: Env, windowDays = 7): Promise<SalesReportResult> {
  const metrics = await computeSalesMetrics(env, windowDays)

  // Recommendations: LLM first, deterministic fallback.
  let recommendations: string
  let model: string
  const llm = await llmRecommendations(env, metrics)
  if (llm) { recommendations = llm.text; model = llm.model }
  else { recommendations = heuristicRecommendations(metrics); model = 'heuristic' }

  const summary = `Rev ${metrics.revenue.toLocaleString('en-IN')} INR · ${metrics.purchases} orders · ${metrics.overallConversionRate}% conv · leak: ${metrics.biggestLeak}`

  // Email the manager (reuse existing Resend integration).
  let emailed = false
  const managerEmail = (env as any).MANAGER_EMAIL || 'shop@intru.in'
  if (env.RESEND_API_KEY) {
    const r = await sendResendEmail(
      env.RESEND_API_KEY,
      managerEmail,
      `📈 Intru daily sales report — ${new Date(metrics.generatedAt).toDateString()}`,
      buildEmailHtml(metrics, recommendations, model)
    )
    emailed = r.success
  }

  // Store the report for the admin dashboard / history.
  let stored = false
  const sbUrl = env.SUPABASE_URL
  const sbKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY
  if (sbUrl && sbKey) {
    try {
      const res = await supabaseFetch(sbUrl, sbKey, 'ai_sales_reports', {
        method: 'POST',
        body: JSON.stringify({
          window_days: windowDays,
          metrics,
          summary,
          recommendations,
          model,
        }),
      })
      stored = res.ok
    } catch { stored = false }
  }

  return { ok: true, metrics, summary, recommendations, model, emailed, stored }
}
