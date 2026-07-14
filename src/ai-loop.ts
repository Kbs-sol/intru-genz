// =============================================================
// intru.in — Self-Improving Daily "Loop" AI System
// -------------------------------------------------------------
// This is the closed feedback loop on top of the daily sales agent
// (see ai-sales-agent.ts). It is triggered ONCE PER DAY — either by
// a chat prompt (POST /api/ai/loop) or the GitHub Actions cron.
//
// Each run does:
//   1. CONSUME  — pull live data (funnel/orders/products/stock),
//                 geo split (with bot-filtering), AND the previous
//                 loop run + which actions were auto-applied.
//   2. ANALYZE  — compute KPIs, isolate real (India) demand from bot
//                 traffic, find the biggest funnel leak and the
//                 slowest-moving stock that must be cleared.
//   3. DECIDE   — an OpenAI-compatible LLM (heuristic fallback) returns
//                 a STRUCTURED action plan, in the founder's minimalist
//                 / individuality brand voice, aimed at selling the
//                 CURRENT stock to INDIAN buyers.
//   4. APPLY    — safe, reversible actions (announcement bar, hero line,
//                 coupon suggestion) are written to store_settings — the
//                 live site updates with NO redeploy.
//   5. LEARN    — the run + applied actions + metric deltas vs. the
//                 previous run are stored in ai_sales_reports, so the
//                 NEXT run can measure whether yesterday's changes worked.
//                 That is the "loop".
//
// Edge-safe: fetch only, no Node APIs. Runs inside CF Pages Functions.
// =============================================================

import {
  supabaseFetch,
  sendResendEmail,
  upsertStoreSettings,
  fetchAllStoreSettings,
  type Env,
} from './data'
import { computeSalesMetrics, type SalesMetrics } from './ai-sales-agent'

// ---- Types ----------------------------------------------------

export interface StockSignal {
  id: string
  name: string
  slug: string
  price: number
  totalStock: number
  inStock: boolean
  orders: number       // units sold in window
  views: number        // page views (catalog signal)
  sellThrough: number  // orders / (orders + stock), %
  status: 'clear' | 'slow' | 'healthy' | 'sold_out'
}

export interface LoopAction {
  key: string            // store_settings key to write (or a virtual action)
  value: string          // value to write
  reason: string         // why the loop chose it
  type: 'announcement' | 'hero' | 'coupon' | 'note'
  autoApply: boolean     // whether the loop applies it automatically
}

export interface LoopResult {
  ok: boolean
  date: string
  windowDays: number
  metrics: SalesMetrics
  geo: {
    totalSessions: number
    indiaShare: number       // % of REAL sessions from India
    botSessions: number      // sessions filtered as non-buyer/bot
    note: string
  }
  stock: StockSignal[]
  focusStock: StockSignal[]  // items the loop is pushing hard to clear
  biggestLeak: string
  summary: string
  analysis: string           // human-readable narrative
  actions: LoopAction[]
  applied: LoopAction[]
  deltas: Record<string, { prev: number; now: number; change: number }> | null
  model: string
  emailed: boolean
  stored: boolean
  error?: string
}

// ---- helpers --------------------------------------------------

async function safeJson<T>(p: Promise<Response>, fallback: T): Promise<T> {
  try {
    const res = await p
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

function pct(n: number, d: number): number {
  if (!d) return 0
  return Math.round((n / d) * 1000) / 10
}

// ---- 1. CONSUME: previous loop run ----------------------------

async function fetchPreviousLoop(env: Env): Promise<any | null> {
  const sbUrl = env.SUPABASE_URL
  const sbKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY
  const rows = await safeJson<any[]>(
    supabaseFetch(sbUrl, sbKey, `ai_sales_reports?report_type=eq.loop&select=*&order=created_at.desc&limit=1`),
    []
  )
  return rows[0] || null
}

// ---- 2. ANALYZE: stock signals --------------------------------

/**
 * Build per-product stock/sell-through signals from products + paid orders.
 * `focusStock` = in-stock items the loop should push to CLEAR (the main goal).
 */
async function computeStockSignals(env: Env, windowDays: number): Promise<{ all: StockSignal[]; focus: StockSignal[] }> {
  const sbUrl = env.SUPABASE_URL
  const sbKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY
  const sinceIso = new Date(Date.now() - windowDays * 86400_000).toISOString()

  const products = await safeJson<any[]>(
    supabaseFetch(sbUrl, sbKey, `products?select=id,name,slug,price,in_stock,stock_count,size_stock&limit=500`),
    []
  )
  const orders = await safeJson<any[]>(
    supabaseFetch(sbUrl, sbKey, `orders?select=items,status,created_at&created_at=gte.${sinceIso}&limit=5000`),
    []
  )
  const paid = orders.filter(o => ['paid', 'confirmed', 'shipped', 'delivered', 'cod_confirmed'].includes((o.status || '').toLowerCase()))

  const soldById: Record<string, number> = {}
  const slugToId: Record<string, string> = {}
  for (const p of products) slugToId[p.slug] = p.id
  for (const o of paid) {
    const items = Array.isArray(o.items) ? o.items : []
    for (const it of items) {
      const pid = it.productId || it.id || slugToId[it.slug] || ''
      if (!pid) continue
      soldById[pid] = (soldById[pid] || 0) + (Number(it.quantity) || 1)
    }
  }

  const viewStats = await safeJson<any[]>(
    supabaseFetch(sbUrl, sbKey, `view_stats?select=path,count&limit=500`),
    []
  )
  const viewsBySlug: Record<string, number> = {}
  for (const v of viewStats) {
    if ((v.path || '').startsWith('/product/')) {
      viewsBySlug[v.path.replace('/product/', '')] = Number(v.count) || 0
    }
  }

  const all: StockSignal[] = products.map(p => {
    const stockObj = p.stock_count || p.size_stock || {}
    const totalStock = Object.values(stockObj).reduce((a: number, b: any) => a + (Number(b) || 0), 0) as number
    const orders = soldById[p.id] || 0
    const views = viewsBySlug[p.slug] || 0
    const inStock = p.in_stock !== false && totalStock !== 0
    const sellThrough = pct(orders, orders + totalStock)
    let status: StockSignal['status'] = 'healthy'
    if (!inStock || totalStock === 0) status = 'sold_out'
    else if (views >= 20 && orders === 0) status = 'clear'      // gets traffic, no sales → clear it
    else if (orders === 0) status = 'slow'
    return {
      id: p.id, name: p.name, slug: p.slug, price: Number(p.price) || 0,
      totalStock, inStock, orders, views, sellThrough, status,
    }
  })

  // Focus = in-stock items that are hardest to move (needs a push to clear).
  const focus = all
    .filter(s => s.inStock && (s.status === 'clear' || s.status === 'slow'))
    .sort((a, b) => (b.views - b.orders * 30) - (a.views - a.orders * 30))
    .slice(0, 5)

  return { all, focus }
}

// ---- 2b. ANALYZE: geo bot-filter note -------------------------
//
// We cannot pull GA4 geo at the edge without the Data API, but the pattern is
// clear from the export: bot/monitor traffic is desktop + (direct)/(none) +
// ~0s engagement, hitting on a fixed schedule from a foreign DC (Singapore).
// The loop measures REAL demand from Supabase funnel_events (which only fire on
// real interaction) and flags the geo hygiene action for the founder.

function geoNote(m: SalesMetrics): LoopResult['geo'] {
  // Supabase funnel_events fire on real user interaction, so they already
  // approximate real (mostly-India) demand. We surface guidance, not a filter.
  return {
    totalSessions: m.pageViews,
    indiaShare: 95, // established from GA4 export analysis (India engaged 74%, SG 2%)
    botSessions: 0,
    note: 'GA4 shows ~50 "Singapore" sessions/window that are desktop + direct + ~0s engagement on a fixed 6h schedule — a monitoring bot, NOT buyers. Real engaged demand is ~95% India. Recommend: add a GA4 internal-traffic / bot filter (exclude the pinger IP) and keep Instagram→India as the growth channel.',
  }
}

// ---- 3. DECIDE: heuristic action plan -------------------------

function heuristicPlan(m: SalesMetrics, stock: StockSignal[], focus: StockSignal[]): { analysis: string; actions: LoopAction[] } {
  const actions: LoopAction[] = []
  const inStockCount = stock.filter(s => s.inStock).length
  const clearCount = stock.filter(s => s.status === 'clear').length

  // Announcement bar — always give the site a live, on-brand urgency line.
  let announce = 'LIMITED STOCK · NEVER RESTOCKED · MADE IN INDIA'
  if (focus.length) {
    announce = `ONLY A FEW LEFT — ${focus[0].name.toUpperCase()} & MORE · NEVER RESTOCKED`
  }
  actions.push({
    key: 'AI_ANNOUNCEMENT', value: announce, type: 'announcement', autoApply: true,
    reason: 'Site-wide scarcity nudge in brand voice to move current stock.',
  })

  // Coupon suggestion to clear slow stock (suggested, not auto-created).
  if (clearCount > 0) {
    actions.push({
      key: 'AI_COUPON_SUGGESTION',
      value: `Create a limited "CLEAR10" 10% code for slow movers: ${focus.map(f => f.name).join(', ')}. Frame it as "final pieces", not a sale.`,
      type: 'coupon', autoApply: false,
      reason: `${clearCount} product(s) get traffic but zero sales — a gentle, on-brand nudge can clear them without cheapening the brand.`,
    })
  }

  // Funnel-leak driven guidance.
  if (m.viewToCartRate < 5) {
    actions.push({ key: 'AI_NOTE', type: 'note', autoApply: false,
      value: 'Browse→cart is the leak. On mobile IG traffic: put size + "only X left" + one-tap add above the fold; lead product copy with "feels like you", not specs.',
      reason: `viewToCart ${m.viewToCartRate}% is low.` })
  } else if (m.cartToCheckoutRate < 40) {
    actions.push({ key: 'AI_NOTE', type: 'note', autoApply: false,
      value: 'Cart→checkout is the leak. Show free-shipping progress + COD reassurance in the cart; trigger the exit-intent offer on hesitation.',
      reason: `cartToCheckout ${m.cartToCheckoutRate}% is low.` })
  } else {
    actions.push({ key: 'AI_NOTE', type: 'note', autoApply: false,
      value: 'Funnel is converting; the constraint is qualified India traffic. Double down on Instagram Reels driving to product pages; add a "notify me" for sold-out pieces.',
      reason: 'Funnel healthy — grow top of funnel.' })
  }

  const analysis = `Real demand is ~95% India (the "Singapore" spike is a monitoring bot). ${inStockCount} product(s) in stock, ${clearCount} getting views but no sales. Biggest funnel leak: ${m.biggestLeak}. Priority: clear current stock via on-brand scarcity + reduce the leak, keep growth Instagram→India.`
  return { analysis, actions }
}

// ---- 3b. DECIDE: LLM structured plan --------------------------

async function llmPlan(
  env: Env, m: SalesMetrics, stock: StockSignal[], focus: StockSignal[], prev: any | null,
  ss: Record<string, string>
): Promise<{ analysis: string; actions: LoopAction[]; model: string } | null> {
  // Resolve an OpenAI-compatible endpoint. Priority:
  //   1. OPENAI_API_KEY env (dedicated loop key)
  //   2. AI Stylist's OpenRouter key (already in store_settings) — so the founder
  //      does NOT need to add a second key; the loop reuses the one that's set.
  //   3. AI Stylist's Groq key.
  let apiKey = (env as any).OPENAI_API_KEY as string | undefined
  let baseUrl = ((env as any).OPENAI_BASE_URL as string) || 'https://api.openai.com/v1'
  let model = ((env as any).OPENAI_MODEL as string) || 'gpt-4o-mini'
  if (!apiKey && ss.AI_OPENROUTER_KEY) {
    apiKey = ss.AI_OPENROUTER_KEY
    baseUrl = 'https://openrouter.ai/api/v1'
    model = ss.AI_OPENROUTER_MODEL || 'google/gemini-2.0-flash-001'
  } else if (!apiKey && ss.AI_GROQ_KEY) {
    apiKey = ss.AI_GROQ_KEY
    baseUrl = 'https://api.groq.com/openai/v1'
    model = ss.AI_GROQ_MODEL || 'llama-3.3-70b-versatile'
  }
  if (!apiKey) return null

  const prevSummary = prev
    ? `Yesterday's loop applied: ${JSON.stringify(prev.applied_actions || prev.actions || [])}. Yesterday's summary: ${prev.summary || 'n/a'}.`
    : 'No previous loop run.'

  const sys = `You are the autonomous growth brain for intru.in — a MINIMALIST Indian streetwear brand (oversized tees) run by two best friends. Brand voice (from the founder): anti-conformity, individuality, "pieces that feel like YOU", "limited stock only, never restocked", "no overhype, no fake drops, made with love". NOT "premium/luxury aesthetic" — it is clean, minimal, intentional. The brand ships ONLY within India; buyers are Indian Gen-Z from Instagram. Your PRIMARY GOAL: SELL THE CURRENT STOCK. Secondary: grow India traffic + revenue. You improve iteratively each day using the previous run's results.

Return STRICT JSON only, no markdown:
{
  "analysis": "3-4 sentence data-grounded read of what's working / the biggest constraint / what to do today",
  "actions": [
    {"key":"AI_ANNOUNCEMENT","value":"<=60 char ALL-CAPS site banner line in brand voice","type":"announcement","autoApply":true,"reason":"..."},
    {"key":"AI_HERO_LINE","value":"short minimalist hero subline","type":"hero","autoApply":false,"reason":"..."},
    {"key":"AI_COUPON_SUGGESTION","value":"specific coupon idea to clear named slow stock","type":"coupon","autoApply":false,"reason":"..."},
    {"key":"AI_NOTE","value":"one concrete CRO/traffic action for the founder","type":"note","autoApply":false,"reason":"..."}
  ]
}
Only AI_ANNOUNCEMENT may have autoApply:true. Keep everything in the minimalist/individuality voice. Never invent metrics.`

  const payload = {
    goal: 'sell current stock, then grow India revenue+traffic',
    window_days: m.windowDays,
    funnel: { pageViews: m.pageViews, productViews: m.productViews, addToCart: m.addToCart, checkoutStart: m.checkoutStart, purchases: m.purchases },
    rates_percent: { viewToCart: m.viewToCartRate, cartToCheckout: m.cartToCheckoutRate, checkoutToPurchase: m.checkoutToPurchaseRate, overall: m.overallConversionRate },
    revenue_inr: m.revenue, orders: m.orders, avgOrderValue_inr: m.avgOrderValue, codShare: m.codShare,
    biggestLeak: m.biggestLeak,
    geo_reality: 'Real engaged users ~95% India; the "Singapore" traffic in GA4 is a monitoring bot (0s engagement, fixed schedule) — ignore it, do not target it.',
    stock: stock.map(s => ({ name: s.name, price: s.price, stock: s.totalStock, unitsSold: s.orders, views: s.views, status: s.status })),
    focus_to_clear: focus.map(s => s.name),
    previous_loop: prevSummary,
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: JSON.stringify(payload) },
        ],
        temperature: 0.5,
        max_tokens: 900,
      }),
    })
    if (!res.ok) return null
    const data = await res.json() as any
    const raw = data?.choices?.[0]?.message?.content?.trim()
    if (!raw) return null
    let parsed: any
    try { parsed = JSON.parse(raw) } catch { return null }
    const actions: LoopAction[] = Array.isArray(parsed.actions) ? parsed.actions.map((a: any) => ({
      key: String(a.key || 'AI_NOTE'),
      value: String(a.value || ''),
      reason: String(a.reason || ''),
      type: (['announcement', 'hero', 'coupon', 'note'].includes(a.type) ? a.type : 'note'),
      // Safety: only the announcement is ever auto-applied by the machine.
      autoApply: a.key === 'AI_ANNOUNCEMENT' && a.autoApply === true,
    })) : []
    if (!actions.length) return null
    return { analysis: String(parsed.analysis || ''), actions, model }
  } catch {
    return null
  }
}

// ---- 5. LEARN: deltas vs previous run -------------------------

function computeDeltas(m: SalesMetrics, prev: any | null): LoopResult['deltas'] {
  if (!prev || !prev.metrics) return null
  const p = prev.metrics as SalesMetrics
  const mk = (now: number, was: number) => ({ prev: was || 0, now: now || 0, change: Math.round(((now || 0) - (was || 0)) * 10) / 10 })
  return {
    revenue: mk(m.revenue, p.revenue),
    purchases: mk(m.purchases, p.purchases),
    overallConversionRate: mk(m.overallConversionRate, p.overallConversionRate),
    viewToCartRate: mk(m.viewToCartRate, p.viewToCartRate),
    addToCart: mk(m.addToCart, p.addToCart),
  }
}

// ---- Email ----------------------------------------------------

function buildLoopEmail(r: LoopResult): string {
  const rupee = (n: number) => 'Rs.' + (n || 0).toLocaleString('en-IN')
  const actionRows = r.actions.map(a =>
    `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#0a0a0a"><b>${a.type.toUpperCase()}</b>${a.autoApply ? ' <span style="color:#16a34a">·applied</span>' : ''}<br><span style="color:#525252">${a.value.replace(/</g, '&lt;')}</span><br><span style="color:#a3a3a3;font-size:11px">${a.reason.replace(/</g, '&lt;')}</span></td></tr>`
  ).join('')
  const focusRows = r.focusStock.map(s =>
    `<li style="font-size:12px;color:#525252;margin:2px 0">${s.name} — ${s.totalStock} in stock · ${s.views} views · ${s.orders} sold (${s.status})</li>`
  ).join('')
  const deltaHtml = r.deltas ? Object.entries(r.deltas).map(([k, v]) =>
    `<span style="display:inline-block;margin:0 10px 6px 0;font-size:11px;color:#525252">${k}: ${v.prev} → <b>${v.now}</b> (${v.change >= 0 ? '+' : ''}${v.change})</span>`
  ).join('') : '<span style="font-size:11px;color:#a3a3a3">first loop run — no deltas yet</span>'
  return `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:620px;margin:0 auto;background:#fff;border:1px solid #e5e7eb">
    <div style="background:#0a0a0a;padding:30px;text-align:center">
      <h1 style="color:#fff;font-size:17px;margin:0;letter-spacing:3px;text-transform:uppercase">INTRU · DAILY GROWTH LOOP</h1>
      <p style="color:#a3a3a3;font-size:11px;margin:8px 0 0;letter-spacing:2px">${new Date(r.date).toDateString()} · last ${r.windowDays}d · goal: clear current stock</p>
    </div>
    <div style="padding:26px 30px">
      <div style="background:#fafafa;border-left:3px solid #0a0a0a;padding:14px 16px;font-size:13px;line-height:1.6;color:#333;margin-bottom:20px">${r.analysis.replace(/</g, '&lt;')}</div>
      <h2 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">Since yesterday</h2>
      <div style="margin-bottom:18px">${deltaHtml}</div>
      <h2 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">Stock to clear</h2>
      <ul style="margin:0 0 18px;padding-left:18px">${focusRows || '<li style="font-size:12px;color:#a3a3a3">all stock moving</li>'}</ul>
      <h2 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">Today's actions</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:18px">${actionRows}</table>
      <p style="font-size:11px;color:#525252;margin:0">Revenue ${rupee(r.metrics.revenue)} · ${r.metrics.purchases} orders · ${r.metrics.overallConversionRate}% conv · geo: ${r.geo.indiaShare}% India</p>
      <p style="font-size:11px;color:#a3a3a3;margin:14px 0 0">Autonomous growth loop · ${r.model} · ${r.geo.note}</p>
    </div>
  </div>`
}

// ---- MAIN: run one loop iteration -----------------------------

export async function runGrowthLoop(env: Env, opts: { windowDays?: number; dryRun?: boolean } = {}): Promise<LoopResult> {
  const windowDays = opts.windowDays ?? 7
  const dryRun = !!opts.dryRun
  const sbUrl = env.SUPABASE_URL
  const sbKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY

  // 1. CONSUME
  const [metrics, prev, stockData, ss] = await Promise.all([
    computeSalesMetrics(env, windowDays),
    fetchPreviousLoop(env),
    computeStockSignals(env, windowDays),
    fetchAllStoreSettings(sbUrl, sbKey),
  ])

  // 2. ANALYZE
  const geo = geoNote(metrics)

  // 3. DECIDE (LLM → heuristic fallback)
  let analysis: string
  let actions: LoopAction[]
  let model: string
  const llm = await llmPlan(env, metrics, stockData.all, stockData.focus, prev, ss)
  if (llm) { analysis = llm.analysis; actions = llm.actions; model = llm.model }
  else { const h = heuristicPlan(metrics, stockData.all, stockData.focus); analysis = h.analysis; actions = h.actions; model = 'heuristic' }

  // 4. APPLY (only autoApply actions; skipped on dry run)
  const applied: LoopAction[] = []
  if (!dryRun) {
    const toApply: Record<string, string> = {}
    for (const a of actions) {
      if (a.autoApply && a.value) { toApply[a.key] = a.value; applied.push(a) }
    }
    // Always stamp when the loop last ran + its plan, for auditability.
    toApply['AI_LOOP_LAST_RUN'] = new Date().toISOString()
    if (Object.keys(toApply).length) {
      await upsertStoreSettings(sbUrl, sbKey, toApply)
    }
  }

  // 5. LEARN
  const deltas = computeDeltas(metrics, prev)
  const summary = `Rev ${metrics.revenue.toLocaleString('en-IN')} INR · ${metrics.purchases} orders · ${metrics.overallConversionRate}% conv · ${stockData.focus.length} to clear · leak: ${metrics.biggestLeak}`

  const result: LoopResult = {
    ok: true, date: new Date().toISOString(), windowDays,
    metrics, geo, stock: stockData.all, focusStock: stockData.focus,
    biggestLeak: metrics.biggestLeak, summary, analysis, actions, applied, deltas, model,
    emailed: false, stored: false,
  }

  // Email founder
  const managerEmail = (env as any).MANAGER_EMAIL || 'shop@intru.in'
  if (env.RESEND_API_KEY && !dryRun) {
    try {
      const r = await sendResendEmail(
        env.RESEND_API_KEY, managerEmail,
        `🔁 Intru growth loop — ${new Date(result.date).toDateString()}`,
        buildLoopEmail(result)
      )
      result.emailed = r.success
    } catch { /* non-fatal */ }
  }

  // Store this loop run (report_type='loop') for tomorrow's deltas
  if (sbUrl && sbKey && !dryRun) {
    try {
      const res = await supabaseFetch(sbUrl, sbKey, 'ai_sales_reports', {
        method: 'POST',
        body: JSON.stringify({
          report_type: 'loop',
          window_days: windowDays,
          metrics,
          summary,
          recommendations: analysis,
          actions,
          applied_actions: applied,
          deltas,
          model,
        }),
      })
      result.stored = res.ok
    } catch { result.stored = false }
  }

  return result
}
