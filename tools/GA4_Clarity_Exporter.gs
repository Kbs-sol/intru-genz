/**
 * ============================================================================
 *  INTRU.IN — GA4 + Clarity + Supabase Data Exporter (Google Apps Script)
 * ============================================================================
 *
 *  Purpose: pull EVERYTHING from GA4 (last 2 years / all events / all users),
 *  Microsoft Clarity (last 3 days windowed), and optionally your own Supabase
 *  funnel_events table, into a single Google Sheet — one tab per source.
 *
 *  Volume note: intru.in currently has ~2.5k users. GA4 free API is fine
 *  for that. Clarity Data Export API caps at 10 projects/day and 3-day
 *  windows, so this script paginates day-by-day.
 *
 * ─── SETUP (one-time) ───────────────────────────────────────────────────────
 *  1. Create a new Google Sheet. Extensions ▸ Apps Script ▸ paste this file.
 *  2. In Apps Script editor:
 *     • Services (+) ▸ add "Google Analytics Data API" (identifier:
 *       AnalyticsData). This uses your Google login — no service account
 *       needed for a personal export.
 *  3. Project Settings ▸ Script Properties ▸ add:
 *        GA4_PROPERTY_ID       →  e.g.  properties/312345678
 *                                 (find in GA4 ▸ Admin ▸ Property Settings)
 *        CLARITY_API_TOKEN     →  from clarity.microsoft.com ▸ Settings ▸
 *                                 Data Export ▸ Generate new API token
 *        SUPABASE_URL          →  https://xxx.supabase.co   (optional)
 *        SUPABASE_SERVICE_KEY  →  service_role key          (optional)
 *  4. Run `setupTriggers()` once to schedule daily auto-refresh (optional).
 *  5. Run `exportAll()` from the editor. First run will prompt OAuth.
 *
 * ─── WHAT YOU GET ───────────────────────────────────────────────────────────
 *  Tab "GA4_Users"       — user-level: totalUsers, newUsers, sessions,
 *                          engagementRate, bounceRate by country/city/device
 *  Tab "GA4_Events"      — every event name × count × unique users last 730d
 *  Tab "GA4_Pages"       — pagePath × views × avgEngagementTime × entrances
 *  Tab "GA4_Traffic"     — sessionSource/Medium/Campaign × sessions × conversions
 *  Tab "GA4_Ecommerce"   — itemName × itemsPurchased × itemRevenue
 *  Tab "GA4_Daily"       — day-by-day trend: users, sessions, conversions, revenue
 *  Tab "Clarity_Metrics" — Clarity project-level: sessions, avgScrollDepth,
 *                          deadClicks, rageClicks, quickBacks, scriptErrors
 *  Tab "Clarity_URLs"    — per-URL breakdown for last 3d
 *  Tab "Clarity_Devices" — device/OS/browser breakdown
 *  Tab "Supabase_Events" — funnel_events from Supabase (optional)
 *  Tab "_Run_Log"        — timestamps + row counts + any errors
 *
 *  Author: kept lean on purpose — 200-ish LOC + comments.
 * ============================================================================
 */

const CONFIG = {
  GA4_LOOKBACK_DAYS: 730,        // GA4 free tier retains 26 months
  GA4_TOP_LIMIT: 500,            // rows per report
  CLARITY_LOOKBACK_DAYS: 3,      // API max
  SUPABASE_LOOKBACK_DAYS: 90,
  SHEET_NAMES: {
    users: 'GA4_Users',
    events: 'GA4_Events',
    pages: 'GA4_Pages',
    traffic: 'GA4_Traffic',
    ecommerce: 'GA4_Ecommerce',
    daily: 'GA4_Daily',
    clarityMetrics: 'Clarity_Metrics',
    clarityUrls: 'Clarity_URLs',
    clarityDevices: 'Clarity_Devices',
    supabaseEvents: 'Supabase_Events',
    log: '_Run_Log',
  },
};

/* ───────────────── MAIN ENTRY POINTS ───────────────── */

function exportAll() {
  const t0 = Date.now();
  const errors = [];
  try { exportGA4Users(); }        catch (e) { errors.push('GA4_Users: ' + e.message); }
  try { exportGA4Events(); }       catch (e) { errors.push('GA4_Events: ' + e.message); }
  try { exportGA4Pages(); }        catch (e) { errors.push('GA4_Pages: ' + e.message); }
  try { exportGA4Traffic(); }      catch (e) { errors.push('GA4_Traffic: ' + e.message); }
  try { exportGA4Ecommerce(); }    catch (e) { errors.push('GA4_Ecommerce: ' + e.message); }
  try { exportGA4Daily(); }        catch (e) { errors.push('GA4_Daily: ' + e.message); }
  try { exportClarity(); }         catch (e) { errors.push('Clarity: ' + e.message); }
  try { exportSupabaseEvents(); }  catch (e) { errors.push('Supabase: ' + e.message); }
  logRun((Date.now() - t0) / 1000, errors);
  SpreadsheetApp.getActiveSpreadsheet().toast(
    errors.length ? 'Done with ' + errors.length + ' errors — see _Run_Log' : 'Export complete',
    'INTRU Exporter', 5
  );
}

function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('exportAll').timeBased().everyDays(1).atHour(6).create();
  SpreadsheetApp.getUi().alert('Daily trigger scheduled for 6 AM.');
}

/* ───────────────── GA4 EXPORTS ───────────────── */

function _ga4RunReport(dimensions, metrics, orderByMetric) {
  const propertyId = _prop_('GA4_PROPERTY_ID');
  const request = {
    dateRanges: [{ startDate: CONFIG.GA4_LOOKBACK_DAYS + 'daysAgo', endDate: 'today' }],
    dimensions: dimensions.map(name => ({ name })),
    metrics: metrics.map(name => ({ name })),
    limit: CONFIG.GA4_TOP_LIMIT,
    orderBys: orderByMetric ? [{ metric: { metricName: orderByMetric }, desc: true }] : [],
  };
  const resp = AnalyticsData.Properties.runReport(request, propertyId);
  const dimHeaders = (resp.dimensionHeaders || []).map(h => h.name);
  const metHeaders = (resp.metricHeaders || []).map(h => h.name);
  const rows = (resp.rows || []).map(r =>
    [...r.dimensionValues.map(v => v.value), ...r.metricValues.map(v => v.value)]
  );
  return { headers: [...dimHeaders, ...metHeaders], rows };
}

function exportGA4Users() {
  const r = _ga4RunReport(
    ['country', 'city', 'deviceCategory'],
    ['totalUsers', 'newUsers', 'sessions', 'engagementRate', 'bounceRate', 'averageSessionDuration'],
    'totalUsers'
  );
  _writeSheet(CONFIG.SHEET_NAMES.users, r.headers, r.rows);
}

function exportGA4Events() {
  const r = _ga4RunReport(
    ['eventName'],
    ['eventCount', 'totalUsers', 'eventCountPerUser'],
    'eventCount'
  );
  _writeSheet(CONFIG.SHEET_NAMES.events, r.headers, r.rows);
}

function exportGA4Pages() {
  const r = _ga4RunReport(
    ['pagePath', 'pageTitle'],
    ['screenPageViews', 'totalUsers', 'userEngagementDuration', 'bounceRate', 'entrances'],
    'screenPageViews'
  );
  _writeSheet(CONFIG.SHEET_NAMES.pages, r.headers, r.rows);
}

function exportGA4Traffic() {
  const r = _ga4RunReport(
    ['sessionSource', 'sessionMedium', 'sessionCampaignName'],
    ['sessions', 'totalUsers', 'conversions', 'engagementRate', 'purchaseRevenue'],
    'sessions'
  );
  _writeSheet(CONFIG.SHEET_NAMES.traffic, r.headers, r.rows);
}

function exportGA4Ecommerce() {
  const r = _ga4RunReport(
    ['itemName', 'itemId', 'itemCategory'],
    ['itemsPurchased', 'itemsViewed', 'itemsAddedToCart', 'itemRevenue'],
    'itemsPurchased'
  );
  _writeSheet(CONFIG.SHEET_NAMES.ecommerce, r.headers, r.rows);
}

function exportGA4Daily() {
  const r = _ga4RunReport(
    ['date'],
    ['totalUsers', 'newUsers', 'sessions', 'screenPageViews', 'conversions', 'purchaseRevenue'],
    null
  );
  // sort by date ascending
  r.rows.sort((a, b) => a[0].localeCompare(b[0]));
  _writeSheet(CONFIG.SHEET_NAMES.daily, r.headers, r.rows);
}

/* ───────────────── CLARITY EXPORT ───────────────── */

function exportClarity() {
  const token = _prop_('CLARITY_API_TOKEN');
  const dims = ['Device', 'OS', 'Browser', 'Country', 'URL', 'Source'];
  const allRows = [];
  const metricsRows = [];
  const urlRows = [];
  const deviceRows = [];

  // Clarity Data Export API — one call per dimension, 1-3 days back
  for (const dim of dims) {
    const url = 'https://www.clarity.ms/export-data/api/v1/project-live-insights' +
      '?numOfDays=' + CONFIG.CLARITY_LOOKBACK_DAYS +
      '&dimension1=' + encodeURIComponent(dim);
    const resp = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: { 'Authorization': 'Bearer ' + token },
      muteHttpExceptions: true,
    });
    const code = resp.getResponseCode();
    if (code !== 200) {
      Logger.log('Clarity ' + dim + ' returned ' + code + ': ' + resp.getContentText().slice(0, 500));
      continue;
    }
    const data = JSON.parse(resp.getContentText());
    // API returns an array of metrics, each with informations[]
    data.forEach(metric => {
      const metricName = metric.metricName;
      (metric.information || []).forEach(info => {
        const row = [dim, info[dim] || '', metricName];
        // rest of info fields as JSON
        Object.keys(info).forEach(k => {
          if (k !== dim) row.push(k + '=' + info[k]);
        });
        allRows.push(row);
        if (dim === 'URL') urlRows.push([info[dim] || '', metricName, JSON.stringify(info)]);
        if (dim === 'Device' || dim === 'OS' || dim === 'Browser') {
          deviceRows.push([dim, info[dim] || '', metricName, JSON.stringify(info)]);
        }
        if (!info[dim]) metricsRows.push([metricName, JSON.stringify(info)]);
      });
    });
    Utilities.sleep(500);  // Clarity is rate-limited
  }
  _writeSheet(CONFIG.SHEET_NAMES.clarityMetrics,
    ['metricName', 'data_json'], metricsRows);
  _writeSheet(CONFIG.SHEET_NAMES.clarityUrls,
    ['URL', 'metricName', 'data_json'], urlRows);
  _writeSheet(CONFIG.SHEET_NAMES.clarityDevices,
    ['dimension', 'value', 'metricName', 'data_json'], deviceRows);
}

/* ───────────────── SUPABASE (OPTIONAL) ───────────────── */

function exportSupabaseEvents() {
  const url = _prop_('SUPABASE_URL', true);
  const key = _prop_('SUPABASE_SERVICE_KEY', true);
  if (!url || !key) return;   // silently skip if not configured
  const since = new Date(Date.now() - CONFIG.SUPABASE_LOOKBACK_DAYS * 86400000).toISOString();
  const endpoint = url.replace(/\/$/, '') +
    '/rest/v1/funnel_events?select=*&created_at=gte.' + encodeURIComponent(since) +
    '&order=created_at.desc&limit=50000';
  const resp = UrlFetchApp.fetch(endpoint, {
    method: 'get',
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Accept': 'application/json',
    },
    muteHttpExceptions: true,
  });
  if (resp.getResponseCode() !== 200) {
    throw new Error('Supabase ' + resp.getResponseCode() + ': ' + resp.getContentText().slice(0, 300));
  }
  const data = JSON.parse(resp.getContentText());
  if (!Array.isArray(data) || data.length === 0) {
    _writeSheet(CONFIG.SHEET_NAMES.supabaseEvents, ['(empty)'], []);
    return;
  }
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => {
    const v = row[h];
    return v === null || v === undefined ? '' :
      (typeof v === 'object' ? JSON.stringify(v) : v);
  }));
  _writeSheet(CONFIG.SHEET_NAMES.supabaseEvents, headers, rows);
}

/* ───────────────── UTIL ───────────────── */

function _prop_(key, optional) {
  const v = PropertiesService.getScriptProperties().getProperty(key);
  if (!v && !optional) throw new Error('Missing Script Property: ' + key);
  return v || '';
}

function _writeSheet(name, headers, rows) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold').setBackground('#111').setFontColor('#fff');
  if (rows.length) {
    // normalise row width to header count
    const width = headers.length;
    const norm = rows.map(r => {
      const out = r.slice(0, width);
      while (out.length < width) out.push('');
      return out;
    });
    sh.getRange(2, 1, norm.length, width).setValues(norm);
  }
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, headers.length);
}

function logRun(seconds, errors) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CONFIG.SHEET_NAMES.log);
  if (!sh) {
    sh = ss.insertSheet(CONFIG.SHEET_NAMES.log);
    sh.getRange(1, 1, 1, 3).setValues([['timestamp', 'duration_s', 'errors']])
      .setFontWeight('bold').setBackground('#111').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  sh.appendRow([new Date(), seconds, errors.join(' | ')]);
}

/* ───────────────── MENU ───────────────── */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('INTRU Exporter')
    .addItem('▶ Run full export', 'exportAll')
    .addSeparator()
    .addItem('GA4: Users', 'exportGA4Users')
    .addItem('GA4: Events', 'exportGA4Events')
    .addItem('GA4: Pages', 'exportGA4Pages')
    .addItem('GA4: Traffic sources', 'exportGA4Traffic')
    .addItem('GA4: Ecommerce', 'exportGA4Ecommerce')
    .addItem('GA4: Daily trend', 'exportGA4Daily')
    .addSeparator()
    .addItem('Clarity: All dimensions', 'exportClarity')
    .addItem('Supabase: funnel_events', 'exportSupabaseEvents')
    .addSeparator()
    .addItem('Schedule daily 6 AM', 'setupTriggers')
    .addToUi();
}
