import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

export function adminPage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
  useMagicCheckout?: boolean;
}): string {
  const products = opts.products;
  const legalPages = opts.legalPages;
  const pj = JSON.stringify(products.map(p => ({
    id: p.id, slug: p.slug, name: p.name, tagline: p.tagline,
    price: p.price, comparePrice: p.comparePrice,
    images: p.images, sizes: p.sizes, inStock: p.inStock,
    sizeStock: p.sizeStock, stockCount: p.stockCount, seoTitle: p.seoTitle, seoDescription: p.seoDescription
  })));
  const lj = JSON.stringify(legalPages.map(l => ({
    slug: l.slug, title: l.title, content: l.content, updatedAt: l.updatedAt
  })));

  const body = `<style>
.adm{max-width:1100px;margin:0 auto;padding:40px 24px 100px}
.alog{max-width:400px;margin:120px auto;text-align:center}
.alog h1{font-family:var(--head);font-size:28px;text-transform:uppercase;letter-spacing:-.02em;margin-bottom:8px}
.alog p{font-size:13px;color:var(--g400);margin-bottom:28px}
.ainp{width:100%;padding:14px 18px;border:1.5px solid var(--g200);font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;margin-bottom:12px;background:var(--wh)}.ainp:focus{border-color:var(--bk)}
.abtn{width:100%;padding:16px;background:var(--bk);color:var(--wh);border:none;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;transition:all .2s}.abtn:hover{background:var(--g600)}
.aerr{font-size:12px;color:#e53e3e;margin-top:8px;display:none}
.adsh{display:none}
.ahdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;padding-bottom:20px;border-bottom:1px solid var(--g100)}
.ahdr h1{font-family:var(--head);font-size:24px;text-transform:uppercase;letter-spacing:-.02em}
.aout{padding:10px 20px;background:none;border:1.5px solid var(--g200);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:all .2s;border-radius:4px}.aout:hover{background:var(--bk);color:var(--wh);border-color:var(--bk)}
.atabs{display:flex;gap:0;margin-bottom:32px;border-bottom:2px solid var(--g100);overflow-x:auto;scrollbar-width:none}.atabs::-webkit-scrollbar{display:none}
.atab{padding:14px 20px;background:none;border:none;border-bottom:2px solid transparent;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--g400);white-space:nowrap;transition:all .2s}.atab:hover{color:var(--bk)}.atab.act{color:var(--bk);border-bottom-color:var(--bk)}
.apan{display:none}.apan.act{display:block}
.otbl-wrap{width:100%;overflow-x:auto;border:1.5px solid var(--g100);border-radius:8px;background:var(--wh)}
.otbl{width:100%;border-collapse:collapse;font-size:13px;min-width:860px}
@media(max-width:768px){
  .adm{padding:20px 16px 80px}
  .ahdr{flex-direction:column;gap:12px;align-items:flex-start}
  .otbl-wrap{-webkit-overflow-scrolling:touch}
}
.otbl th{text-align:left;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g500);padding:18px 16px;border-bottom:2px solid var(--g100);background:var(--g50)}
.otbl td{padding:18px 16px;border-bottom:1px solid var(--g100);vertical-align:top;line-height:1.6}
.otbl tr:last-child td{border-bottom:none}
.otbl tr:hover td{background:rgba(0,0,0,0.02)}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:32px}
.stat-card{padding:24px;background:var(--wh);border:1.5px solid var(--g100);border-radius:8px}
.stat-val{font-size:32px;font-family:var(--head);font-weight:900;letter-spacing:-1px}
.stat-label{font-size:10px;font-weight:700;color:var(--g400);text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.apcards{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.apc{border:1.5px solid var(--g100);border-radius:8px;padding:20px;transition:border-color .2s}.apc:hover{border-color:var(--bk)}
.apc h3{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px}
.apc-imgs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px}
.apc-imgs div{position:relative}
.apc-imgs img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:4px;background:var(--g50)}
.apc-imgs input{width:100%;padding:6px 8px;border:1px solid var(--g200);font-size:10px;font-family:inherit;margin-top:4px;border-radius:3px}
.apc-row{display:flex;gap:10px;margin-bottom:10px}
.apc-row label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--g400);display:block;margin-bottom:4px}
.apc-row input{padding:8px 12px;border:1.5px solid var(--g200);font-size:13px;font-family:inherit;border-radius:3px;width:100%}.apc-row input:focus{border-color:var(--bk);outline:none}
.asave{padding:10px 24px;background:var(--bk);color:var(--wh);border:none;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;transition:all .2s;border-radius:3px}.asave:hover{background:var(--g600)}.asave:disabled{background:var(--g300);cursor:not-allowed}
.atog{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;font-weight:600}
.atog input[type=checkbox]{width:16px;height:16px}
.alsel{padding:10px 16px;border:1.5px solid var(--g200);font-size:13px;font-family:inherit;margin-bottom:16px;border-radius:4px;background:var(--wh)}
.alta{width:100%;min-height:400px;padding:16px;border:1.5px solid var(--g200);font-size:13px;font-family:'SF Mono',Consolas,monospace;line-height:1.7;resize:vertical;border-radius:4px}.alta:focus{border-color:var(--bk);outline:none}
.alprev{border:1.5px solid var(--g100);border-radius:8px;padding:24px;margin-top:16px;font-size:14px;line-height:1.8;max-height:500px;overflow-y:auto}
.asrc{display:inline-flex;align-items:center;gap:6px;font-size:10px;padding:3px 10px;border-radius:3px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:16px}
.asrc-db{background:#d1fae5;color:#065f46}.asrc-static{background:#fef3c7;color:#92400e}
.arefresh{padding:8px 16px;background:none;border:1.5px solid var(--g200);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:all .2s;border-radius:3px;margin-left:12px}.arefresh:hover{background:var(--bk);color:var(--wh);border-color:var(--bk)}
/* Settings panel */
.sett-card{padding:20px;border:1.5px solid var(--g100);border-radius:8px;margin-bottom:16px}
.sett-card h4{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px}
.sett-card p{font-size:12px;color:var(--g400);margin-bottom:12px;line-height:1.6}
.sett-toggle{display:flex;align-items:center;gap:12px}
.sett-toggle label{font-size:13px;font-weight:600}
.switch{position:relative;display:inline-block;width:48px;height:26px}
.switch input{opacity:0;width:0;height:0}
.slider{position:absolute;cursor:pointer;inset:0;background:var(--g200);border-radius:26px;transition:.3s}
.slider::before{content:'';position:absolute;height:20px;width:20px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s}
.switch input:checked+.slider{background:var(--green)}
.switch input:checked+.slider::before{transform:translateX(22px)}
/* IG Feed */
.ig-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.ig-card{border:1.5px solid var(--g100);border-radius:6px;padding:12px;position:relative}
.ig-card img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;margin-bottom:8px}
.ig-card input{width:100%;padding:6px 8px;border:1px solid var(--g200);font-size:11px;font-family:inherit;margin-bottom:4px;border-radius:3px}
.shiprocket-btn{display:block;margin-top:4px;background:none;border:1px solid var(--g200);padding:4px 8px;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;cursor:pointer;border-radius:3px;font-family:inherit;transition:all .2s}
.shiprocket-btn:hover{background:var(--bk);color:var(--wh)}
/* Order status badges */
.ostatus{display:inline-block;padding:2px 8px;border-radius:3px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.ost-pending{background:#fef3c7;color:#92400e}.ost-placed{background:#dbeafe;color:#1e40af}.ost-paid{background:#d1fae5;color:#065f46}.ost-processing{background:#e0e7ff;color:#3730a3}.ost-shipped{background:#ede9fe;color:#5b21b6}.ost-delivered{background:#dcfce7;color:#166534}.ost-cancelled{background:#fee2e2;color:#991b1b}.ost-verified{background:#d1fae5;color:#065f46}.ost-cod{background:#fef3c7;color:#92400e}.ost-prepaid{background:#dbeafe;color:#1e40af}
.oselect{padding:8px 10px;border:1.5px solid var(--g200);font-size:12px;font-family:inherit;border-radius:3px;background:var(--wh);width:100%}
/* Coupon table */
.cpn-act{background:#d1fae5;color:#065f46}.cpn-inact{background:#fee2e2;color:#991b1b}
/* Toast */
.tc-ok-green{background:#065f46!important}.tc-err{background:#991b1b!important}
@media(max-width:768px){.apcards{grid-template-columns:1fr}.apc-imgs{grid-template-columns:repeat(2,1fr)}.ig-grid{grid-template-columns:repeat(2,1fr)}}
</style>

<div class="adm">
<div class="alog" id="alogin">
<h1>Admin Panel</h1>
<p>Enter the admin password to continue.</p>
<form onsubmit="doLogin(); return false;">
<input type="password" class="ainp" id="apwd" placeholder="Password" autocomplete="off">
<button type="submit" class="abtn">Authenticate</button>
</form>
<p class="aerr" id="aerr" style="display:none"></p>
</div>

<div class="adsh" id="adsh">
<div class="ahdr"><h1>Admin &mdash; Intru</h1><button class="aout" onclick="doLogout()">Sign Out</button></div>
<div class="atabs">
<button class="atab act" onclick="showTab(this,'tord')">Orders</button>
<button class="atab" onclick="showTab(this,'tana')">Analytics</button>
<button class="atab" onclick="showTab(this,'tprod')">Products</button>
<button class="atab" onclick="showTab(this,'tcpn')">🏷️ Coupons</button>
<button class="atab" onclick="showTab(this,'tcombo')">🔥 Combos</button>
<button class="atab" onclick="showTab(this,'tleg')">Legal</button>
<button class="atab" onclick="showTab(this,'tfaq')">❓ FAQs</button>
<button class="atab" onclick="showTab(this,'tblog')">📝 Blog</button>
<button class="atab" onclick="showTab(this,'tsize')">Size Chart</button>
<button class="atab" onclick="showTab(this,'tig')">IG Feed</button>
<button class="atab" onclick="showTab(this,'tsett')">Settings</button>
<button class="atab" onclick="showTab(this,'tai')">AI Stylist</button>
<button class="atab" onclick="showTab(this,'tlim')">Limits & Status</button>
<button class="atab" onclick="showTab(this,'tmaint')">&#x1F6A7; Maintenance</button>
</div>

<!-- Orders Tab -->
<div class="apan act" id="tord">
<div style="display:flex;align-items:center;margin-bottom:16px;gap:12px">
<span class="asrc" id="ordSrc"></span>
<div style="position:relative;flex:1 max-width:400px">
  <input type="text" id="ordSearch" placeholder="Search customer, email, phone, pincode..." class="oselect" style="width:100%;padding:8px 12px 8px 32px;margin:0" onkeyup="grepOrders()">
  <i class="fas fa-search" style="position:absolute;left:10px;top:10px;color:var(--g400);font-size:12px"></i>
</div>
<button class="arefresh" onclick="loadOrders()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<div class="otbl-wrap">
<table class="otbl">
<thead><tr><th>Order ID</th><th>Date &amp; Time</th><th>Customer Info</th><th>Items</th><th>Pricing</th><th>Status</th><th>Actions</th></tr></thead>
<tbody id="otbody"><tr><td colspan="7" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr></tbody>
</table>
</div>
</div>

<!-- Analytics Tab -->
<div class="apan" id="tana">
<div class="stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:20px">
  <div class="stat-card"><div class="stat-val" id="anaIdentify">...</div><div class="stat-label">Identified Leads</div></div>
  <div class="stat-card"><div class="stat-val" id="anaAddToCart">...</div><div class="stat-label">Add to Cart Events</div></div>
  <div class="stat-card"><div class="stat-val" id="anaCheckouts">...</div><div class="stat-label">Checkouts Started</div></div>
  <div class="stat-card"><div class="stat-val" id="anaPayments">...</div><div class="stat-label">Payments Success</div></div>
  <div class="stat-card"><div class="stat-val" id="anaConvRate">...</div><div class="stat-label">Conv Rate</div></div>
  <div class="stat-card"><div class="stat-val" id="anaTotalViews">...</div><div class="stat-label">Total Page Views</div></div>
</div>

<div class="stat-grid" style="grid-template-columns: 1fr; margin-bottom: 32px">
  <div class="stat-card" style="display:flex;justify-content:space-between;align-items:center;background:var(--bk);color:var(--wh)">
    <div>
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:0.8">Abandoned Cart Recovery</h3>
      <p style="font-size:11px;opacity:0.6;margin-top:4px">Trigger identification and recovery workflow for carts abandoned >24h.</p>
    </div>
    <div style="display:flex;gap:12px;align-items:center">
      <span id="abandonStatus" style="font-size:10px;font-weight:700;text-transform:uppercase"></span>
      <button class="asave" style="background:var(--wh);color:var(--bk);border:none" onclick="triggerAbandoned()">Trigger Now</button>
    </div>
  </div>
</div>

<div style="margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">
  <h2 style="font-family:var(--head);font-size:18px;text-transform:uppercase">Page Views &amp; Funnel</h2>
  <button class="arefresh" onclick="loadAnalytics()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<div class="otbl-wrap">
<table class="otbl" style="min-width:600px">
<thead><tr><th>Metric / Page</th><th>Type</th><th>Count</th><th>Last Activity</th></tr></thead>
<tbody id="anaTbody"><tr><td colspan="4" style="text-align:center;padding:40px;color:var(--g400)"><i class="fas fa-circle-notch fa-spin"></i> Loading analytics...</td></tr></tbody>
</table>
</div>
</div>

<!-- Products Tab -->
<div class="apan" id="tprod">
<div class="sett-card" style="margin-bottom:20px;background:var(--g50)">
<h4>Quick Upload</h4>
<p>Upload a photo directly to Supabase. It will auto-fill the first empty image slot in the product cards below.</p>
<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
<input type="file" id="imageUploaderProd" accept="image/*" style="font-size:12px">
<button class="asave" id="uploadBtnProd" onclick="handleAdminUpload('imageUploaderProd','products','uploadStatusProd','uploadBtnProd', 'lastUrlProd', 'lastUploadProd')">Upload to Products</button>
<span id="uploadStatusProd" style="font-size:11px;color:var(--g400)"></span>
</div>
<div id="lastUploadProd" style="margin-top:12px;display:none">
<label style="font-size:11px;color:var(--g400)">Last Uploaded URL (Auto-filled + Selectable to copy):</label>
<input type="text" id="lastUrlProd" readonly style="width:100%;font-size:11px;padding:6px;background:var(--w);border:1px solid var(--g100);margin-top:4px" onclick="this.select()">
</div>
</div>
<div style="display:flex;align-items:center;margin-bottom:16px">
<span class="asrc" id="prodSrc"></span>
<button class="arefresh" onclick="loadProducts()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<div class="apcards" id="apcards"></div>
</div>

<!-- Coupons Tab -->
<div class="apan" id="tcpn">
<div class="sett-card" style="margin-bottom:20px;background:var(--g50)">
<h4>Coupon Management</h4>
<p>Create and manage discount codes. Supports percentage (%) and flat (Rs.) discount types. Codes are case-insensitive.</p>
</div>

<!-- Create New Coupon -->
<div class="sett-card" style="margin-bottom:20px">
<h4>Create New Coupon</h4>
<div class="apc-row">
  <div style="flex:1.5"><label>Code <span style="font-weight:400;font-size:10px;color:var(--g400)">(e.g. INTRU20)</span></label><input type="text" id="cpnCode" class="ainp" style="margin:0;text-transform:uppercase" placeholder="SUMMER20" oninput="this.value=this.value.toUpperCase()"></div>
  <div style="flex:1"><label>Type</label>
  <select id="cpnType" class="ainp" style="margin:0">
    <option value="percent">Percentage (%)</option>
    <option value="flat">Flat (Rs.)</option>
  </select></div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Value</label><input type="number" id="cpnValue" class="ainp" style="margin:0" placeholder="20"></div>
  <div style="flex:1"><label>Min. Cart Total (Rs.)</label><input type="number" id="cpnMin" class="ainp" style="margin:0" placeholder="0"></div>
  <div style="flex:1"><label>Expiry Date <span style="font-weight:400;font-size:10px;color:var(--g400)">(optional)</span></label><input type="date" id="cpnExpiry" class="ainp" style="margin:0"></div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Max Uses <span style="font-weight:400;font-size:10px;color:var(--g400)">(0 = unlimited)</span></label><input type="number" id="cpnMaxUses" class="ainp" style="margin:0" placeholder="0"></div>
  <div style="flex:1;display:flex;align-items:flex-end"><label class="atog" style="margin-bottom:0"><input type="checkbox" id="cpnActive" checked> Active</label></div>
</div>
<button class="asave" onclick="createCoupon()"><i class="fas fa-plus" style="margin-right:6px"></i>Create Coupon</button>
</div>

<!-- Existing Coupons -->
<div style="display:flex;align-items:center;margin-bottom:16px">
<h3 style="font-family:var(--head);font-size:16px;text-transform:uppercase;flex:1">Existing Coupons</h3>
<button class="arefresh" onclick="loadCoupons()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<div class="otbl-wrap">
<table class="otbl" style="min-width:700px">
<thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min Total</th><th>Uses</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
<tbody id="cpnTbody"><tr><td colspan="8" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr></tbody>
</table>
</div>
</div>

<!-- Combo-Buy Tab -->
<div class="apan" id="tcombo">
<div class="sett-card" style="margin-bottom:20px;background:var(--g50)">
<h4>🔥 Combo-Buy Deals</h4>
<p>Create smart multi-product discount deals. When customers add qualifying products, a discount fires automatically — no coupon code needed. The best eligible combo wins (highest discount value).</p>
</div>

<!-- Create / Edit Combo form -->
<div class="sett-card" style="margin-bottom:20px" id="comboFormCard">
<h4 id="comboFormTitle">Create New Combo</h4>
<div class="apc-row">
  <div style="flex:2"><label>Combo Name <span style="font-weight:400;font-size:10px;color:var(--g400)">(shown in cart & admin)</span></label><input type="text" id="comboName" class="ainp" style="margin:0" placeholder="Any 2 Tees Deal"></div>
  <div style="flex:1"><label>Status</label>
  <select id="comboActive" class="ainp" style="margin:0">
    <option value="true">Active</option>
    <option value="false">Inactive</option>
  </select></div>
</div>
<div class="apc-row">
  <div style="flex:2"><label>Description <span style="font-weight:400;font-size:10px;color:var(--g400)">(internal note)</span></label><input type="text" id="comboDesc" class="ainp" style="margin:0" placeholder="Buy any 2 items and save 10%"></div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Discount Type</label>
  <select id="comboDiscType" class="ainp" style="margin:0" onchange="updateComboValueLabel()">
    <option value="percent">Percentage (%)</option>
    <option value="fixed">Fixed Amount (Rs.)</option>
  </select></div>
  <div style="flex:1"><label id="comboValueLabel">Discount Value (%)</label><input type="number" id="comboDiscValue" class="ainp" style="margin:0" placeholder="10" min="0"></div>
  <div style="flex:1"><label>Min. Products in Cart</label><input type="number" id="comboMinProducts" class="ainp" style="margin:0" placeholder="2" min="2" value="2"></div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Min. Subtotal (Rs.) <span style="font-weight:400;font-size:10px;color:var(--g400)">(0 = no min)</span></label><input type="number" id="comboMinSubtotal" class="ainp" style="margin:0" placeholder="0" min="0" value="0"></div>
</div>
<div class="apc-row">
  <div style="flex:1">
    <label>Required Products <span style="font-weight:400;font-size:10px;color:var(--g400)">(optional — all must be in cart; leave blank for any products)</span></label>
    <div id="comboProdPicker" style="border:1.5px solid var(--g200);border-radius:4px;max-height:140px;overflow-y:auto;background:var(--wh);padding:8px 12px;display:flex;flex-direction:column;gap:4px"></div>
    <input type="hidden" id="comboReqPids">
    <div style="font-size:10px;color:var(--g400);margin-top:4px">Check the products that ALL must be in cart to trigger this combo.</div>
  </div>
</div>
<div class="apc-row">
  <div style="flex:1">
    <label>Required Categories <span style="font-weight:400;font-size:10px;color:var(--g400)">(optional — comma-separated, e.g. tshirt,hoodie — at least one must match)</span></label>
    <input type="text" id="comboReqCats" class="ainp" style="margin:0" placeholder="tshirt,hoodie — or leave blank">
  </div>
</div>
<div style="display:flex;gap:10px;align-items:center;margin-top:12px">
  <button class="asave" id="comboSubmitBtn" onclick="submitCombo()"><i class="fas fa-plus" id="comboSubmitIcon" style="margin-right:6px"></i><span id="comboSubmitLabel">Create Combo</span></button>
  <button id="comboCancelEditBtn" class="arefresh" style="display:none" onclick="resetComboForm()">Cancel Edit</button>
</div>
</div>

<!-- Existing Combos table -->
<div style="display:flex;align-items:center;margin-bottom:16px">
<h3 style="font-family:var(--head);font-size:16px;text-transform:uppercase;flex:1">Active &amp; Inactive Combos</h3>
<button class="arefresh" onclick="loadCombos()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<div class="otbl-wrap">
<table class="otbl" style="min-width:960px">
<thead><tr><th>Name</th><th>Discount</th><th>Activation Rules</th><th>Uses</th><th>Created</th><th>Status</th><th>Actions</th></tr></thead>
<tbody id="comboTbody"><tr><td colspan="6" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr></tbody>
</table>
</div>
</div>

<!-- Legal Tab -->
<div class="apan" id="tleg">
<select class="alsel" id="alsel" onchange="switchLegal()"></select>
<textarea class="alta" id="alta" oninput="prevLegal()"></textarea>
<div class="alprev" id="alprev"></div>
<button class="asave" style="margin-top:16px" onclick="saveLegal()">Save to Supabase</button>
</div>

<!-- FAQ Tab -->
<div class="apan" id="tfaq">
<div class="sett-card" style="margin-bottom:20px;background:var(--g50)">
<h4>❓ Frequently Asked Questions</h4>
<p>Full CRUD control over FAQs shown on <a href="/faq" target="_blank" style="color:var(--bk);text-decoration:underline">/faq</a>. Only active FAQs are shown publicly. Answer supports inline HTML (&lt;a&gt;, &lt;strong&gt;) — plain text is fine too.</p>
<p style="margin-top:8px"><span class="asrc" id="faqSrc"></span></p>
</div>

<!-- Create / Edit FAQ form -->
<div class="sett-card" style="margin-bottom:20px" id="faqFormCard">
<h4 id="faqFormTitle">Create New FAQ</h4>
<div class="apc-row">
  <div style="flex:2"><label>Question</label><input type="text" id="faqQuestion" class="ainp" style="margin:0" placeholder="How long does shipping take?"></div>
  <div style="flex:1"><label>Category</label><input type="text" id="faqCategory" class="ainp" style="margin:0" placeholder="Shipping & Delivery" list="faqCategoryList">
  <datalist id="faqCategoryList">
    <option value="Sizing & Fit"></option>
    <option value="Shipping & Delivery"></option>
    <option value="Payments"></option>
    <option value="Returns & Exchanges"></option>
    <option value="Products & Drops"></option>
    <option value="Account & Support"></option>
  </datalist>
  </div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Answer <span style="font-weight:400;font-size:10px;color:var(--g400)">(HTML allowed — links: &lt;a href="..."&gt;text&lt;/a&gt;)</span></label>
  <textarea id="faqAnswer" class="alta" style="min-height:140px;font-size:13px" placeholder="Orders are dispatched within 36 hours..."></textarea>
  </div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Sort Order <span style="font-weight:400;font-size:10px;color:var(--g400)">(lower = shown first within category)</span></label><input type="number" id="faqSortOrder" class="ainp" style="margin:0" placeholder="10" value="10"></div>
  <div style="flex:1;display:flex;align-items:flex-end"><label class="atog" style="margin-bottom:0"><input type="checkbox" id="faqActive" checked> Active (shown on /faq)</label></div>
</div>
<div style="display:flex;gap:10px;align-items:center;margin-top:12px">
  <button class="asave" id="faqSubmitBtn" onclick="submitFaq()"><i class="fas fa-plus" id="faqSubmitIcon" style="margin-right:6px"></i><span id="faqSubmitLabel">Create FAQ</span></button>
  <button id="faqCancelEditBtn" class="arefresh" style="display:none" onclick="resetFaqForm()">Cancel Edit</button>
</div>
</div>

<!-- FAQ list -->
<div style="display:flex;align-items:center;margin-bottom:16px">
<h3 style="font-family:var(--head);font-size:16px;text-transform:uppercase;flex:1">Existing FAQs</h3>
<button class="arefresh" onclick="loadFaqs()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<div class="otbl-wrap">
<table class="otbl" style="min-width:800px">
<thead><tr><th style="width:170px">Category</th><th>Question</th><th style="width:60px">Sort</th><th style="width:80px">Status</th><th style="width:170px">Actions</th></tr></thead>
<tbody id="faqTbody"><tr><td colspan="5" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr></tbody>
</table>
</div>
</div>

<!-- Blog Tab -->
<div class="apan" id="tblog">
<div class="sett-card" style="margin-bottom:20px;background:var(--g50)">
<h4>📝 Blog Posts</h4>
<p>Full CRUD control over blog posts shown on <a href="/blog" target="_blank" style="color:var(--bk);text-decoration:underline">/blog</a>. Only published posts are shown publicly. Body accepts HTML (&lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;a&gt;).</p>
<p style="margin-top:8px"><span class="asrc" id="blogSrc"></span></p>
</div>

<!-- Create / Edit Blog post form -->
<div class="sett-card" style="margin-bottom:20px" id="blogFormCard">
<h4 id="blogFormTitle">Create New Blog Post</h4>
<div class="apc-row">
  <div style="flex:2"><label>Title</label><input type="text" id="blogTitle" class="ainp" style="margin:0" placeholder="The Best Oversized T-Shirt Brands in India (2026)" oninput="autoSlug()"></div>
  <div style="flex:1"><label>Slug <span style="font-weight:400;font-size:10px;color:var(--g400)">(URL — auto-filled)</span></label><input type="text" id="blogSlug" class="ainp" style="margin:0" placeholder="best-oversized-tshirt-brands-india"></div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Category</label><input type="text" id="blogCategory" class="ainp" style="margin:0" placeholder="Guides" list="blogCategoryList">
  <datalist id="blogCategoryList">
    <option value="Style"></option>
    <option value="Fabric"></option>
    <option value="Culture"></option>
    <option value="Guides"></option>
  </datalist>
  </div>
  <div style="flex:1"><label>Read time (mins)</label><input type="number" id="blogReadMins" class="ainp" style="margin:0" placeholder="5" value="5"></div>
  <div style="flex:1"><label>Published date</label><input type="date" id="blogPublished" class="ainp" style="margin:0"></div>
</div>
<div class="apc-row">
  <div style="flex:2"><label>Cover image URL <span style="font-weight:400;font-size:10px;color:var(--g400)">(upload below or paste an https:// URL)</span></label><input type="text" id="blogCover" class="ainp" style="margin:0" placeholder="https://intru.in/cdn/..."></div>
  <div style="flex:1"><label>Author</label><input type="text" id="blogAuthor" class="ainp" style="margin:0" value="Intru Editorial"></div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Cover upload <span style="font-weight:400;font-size:10px;color:var(--g400)">(auto-fills the URL field above)</span></label>
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <input type="file" id="blogCoverFile" accept="image/*" style="font-size:12px">
    <button type="button" class="asave" id="blogCoverBtn" onclick="handleAdminUpload('blogCoverFile','blog','blogCoverStatus','blogCoverBtn','blogCover','blogCoverPrev')" style="padding:8px 14px">Upload</button>
    <span id="blogCoverStatus" style="font-size:11px;color:var(--g400)"></span>
  </div>
  <div id="blogCoverPrev" style="display:none;margin-top:8px"></div>
  </div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Excerpt <span style="font-weight:400;font-size:10px;color:var(--g400)">(shown on /blog card)</span></label>
  <textarea id="blogExcerpt" class="alta" style="min-height:64px;font-size:13px" placeholder="One-liner shown on the blog index card..."></textarea>
  </div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>SEO title <span style="font-weight:400;font-size:10px;color:var(--g400)">(&lt;title&gt; tag — max ~60 chars)</span></label><input type="text" id="blogSeoTitle" class="ainp" style="margin:0"></div>
  <div style="flex:1"><label>SEO description <span style="font-weight:400;font-size:10px;color:var(--g400)">(meta desc — ~155 chars)</span></label><input type="text" id="blogSeoDesc" class="ainp" style="margin:0"></div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Keywords <span style="font-weight:400;font-size:10px;color:var(--g400)">(comma-separated — for meta keywords + schema)</span></label><input type="text" id="blogKeywords" class="ainp" style="margin:0"></div>
</div>
<div class="apc-row">
  <div style="flex:1"><label>Article body <span style="font-weight:400;font-size:10px;color:var(--g400)">(HTML — &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;a&gt;)</span></label>
  <textarea id="blogBody" class="alta" style="min-height:320px;font-size:13px" placeholder="<p>Intro paragraph...</p>&#10;<h2>Section heading</h2>&#10;<p>More content...</p>"></textarea>
  </div>
</div>
<div class="apc-row">
  <div style="flex:1;display:flex;align-items:center"><label class="atog" style="margin-bottom:0"><input type="checkbox" id="blogPublish" checked> Published (visible on /blog)</label></div>
</div>
<div style="display:flex;gap:10px;align-items:center;margin-top:12px">
  <button class="asave" id="blogSubmitBtn" onclick="submitBlog()"><i class="fas fa-plus" id="blogSubmitIcon" style="margin-right:6px"></i><span id="blogSubmitLabel">Create Post</span></button>
  <button id="blogCancelEditBtn" class="arefresh" style="display:none" onclick="resetBlogForm()">Cancel Edit</button>
</div>
</div>

<!-- Blog list -->
<div style="display:flex;align-items:center;margin-bottom:16px">
<h3 style="font-family:var(--head);font-size:16px;text-transform:uppercase;flex:1">Existing Blog Posts</h3>
<button class="arefresh" onclick="loadBlogs()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<div class="otbl-wrap">
<table class="otbl" style="min-width:900px">
<thead><tr><th style="width:220px">Title</th><th style="width:120px">Slug</th><th style="width:100px">Category</th><th style="width:110px">Published</th><th style="width:80px">Status</th><th style="width:210px">Actions</th></tr></thead>
<tbody id="blogTbody"><tr><td colspan="6" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr></tbody>
</table>
</div>
</div>

<!-- Size Chart Tab -->
<div class="apan" id="tsize">
<div style="display:flex;align-items:center;margin-bottom:16px">
<span class="asrc" id="sizeSrc"></span>
<button class="arefresh" onclick="loadSizeChart()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
<button class="asave" style="margin-left:8px" onclick="addSizeRow()"><i class="fas fa-plus" style="margin-right:4px"></i>Add Size</button>
</div>
<table class="otbl"><thead><tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th><th>Order</th><th>Action</th></tr></thead>
<tbody id="sizetbody"><tr><td colspan="5" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr></tbody></table>
</div>

<!-- Instagram Feed Tab -->
<div class="apan" id="tig">
<div class="sett-card" style="margin-bottom:20px;background:var(--g50)">
<h4>Feed Upload</h4>
<p>Upload a photo for the Instagram feed. It will auto-fill the first empty "Image URL" field below.</p>
<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
<input type="file" id="imageUploaderIg" accept="image/*" style="font-size:12px">
<button class="asave" id="uploadBtnIg" onclick="handleAdminUpload('imageUploaderIg','instagram_feed','uploadStatusIg','uploadBtnIg', 'lastUrlIg', 'lastUploadIg')">Upload to Feed</button>
<span id="uploadStatusIg" style="font-size:11px;color:var(--g400)"></span>
</div>
<div id="lastUploadIg" style="margin-top:12px;display:none">
<label style="font-size:11px;color:var(--g400)">Last Uploaded URL (Auto-filled + Selectable to copy):</label>
<input type="text" id="lastUrlIg" readonly style="width:100%;font-size:11px;padding:6px;background:var(--w);border:1px solid var(--g100);margin-top:4px" onclick="this.select()">
</div>
</div>
<div class="sett-card" style="margin-bottom:20px">
<h4>Instagram Feed Visibility</h4>
<p>Toggle the Instagram feed section ON/OFF on the homepage.</p>
<div class="sett-toggle">
<label>OFF</label>
<label class="switch"><input type="checkbox" id="settIgFeed" checked onchange="saveSetting('INSTAGRAM_FEED_ENABLED',this.checked?'true':'false')"><span class="slider"></span></label>
<label>ON (visible on homepage)</label>
</div>
</div>
<div style="display:flex;align-items:center;margin-bottom:16px">
<button class="asave" onclick="addIgItem()"><i class="fas fa-plus" style="margin-right:4px"></i>Add Image</button>
<button class="arefresh" onclick="loadIgFeed()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<div class="ig-grid" id="igGrid"><p style="color:var(--g400);grid-column:1/-1;text-align:center;padding:40px">Loading...</p></div>
</div>

<!-- Settings Tab -->
<div class="apan" id="tsett">
<div class="sett-card">
<h4>Payment Mode</h4>
<p>When OFF: Custom dual-mode checkout (Prepaid with free shipping + COD with Rs.99 fee).<br>When ON: Razorpay Magic Checkout handles everything (address, COD intelligence, 1-click).</p>
<div class="sett-toggle">
<label>Manual COD</label>
<label class="switch"><input type="checkbox" id="settMagic" onchange="saveSetting('USE_MAGIC_CHECKOUT',this.checked?'true':'false')"><span class="slider"></span></label>
<label>Razorpay Magic</label>
</div>
</div>
<div class="sett-card">
<h4>Size Guide Visibility</h4>
<p>Toggle the Size Guide button ON/OFF on product pages.</p>
<div class="sett-toggle">
<label>OFF</label>
<label class="switch"><input type="checkbox" id="settSizeGuide" checked onchange="saveSetting('SIZE_GUIDE_ENABLED',this.checked?'true':'false')"><span class="slider"></span></label>
<label>ON</label>
</div>
</div>
<div class="sett-card">
<h4>Manager Email</h4>
<p>COD alerts are sent to this email.</p>
<div style="display:flex;gap:8px"><input class="ainp" id="settManager" style="margin:0" placeholder="shop@intru.in">
<button class="asave" onclick="saveSetting('MANAGER_EMAIL',document.getElementById('settManager').value)">Save</button></div>
</div>
<div class="sett-card">
<h4>COD Fee (Rs.)</h4>
<p>Convenience fee added for Cash on Delivery orders.</p>
<div style="display:flex;gap:8px"><input class="ainp" id="settCodFee" type="number" style="margin:0;width:120px" placeholder="99">
<button class="asave" onclick="saveSetting('COD_FEE',document.getElementById('settCodFee').value)">Save</button></div>
</div>
<div class="sett-card">
<h4>Analytics & Insights</h4>
<p>Connect Google Analytics 4 and Microsoft Clarity. Leave blank to disable. Changes apply on next page load — no redeploy needed.</p>
<div style="display:flex;flex-direction:column;gap:10px">
<div style="display:flex;gap:8px;align-items:center">
<input class="ainp" id="settGa4" style="margin:0;flex:1" placeholder="GA4 Measurement ID (e.g. G-XXXXXXXXXX)">
<button class="asave" onclick="saveSetting('GA4_MEASUREMENT_ID',document.getElementById('settGa4').value.trim())">Save</button></div>
<div style="display:flex;gap:8px;align-items:center">
<input class="ainp" id="settClarity" style="margin:0;flex:1" placeholder="Microsoft Clarity Project ID (e.g. abcd1234ef)">
<button class="asave" onclick="saveSetting('CLARITY_PROJECT_ID',document.getElementById('settClarity').value.trim())">Save</button></div>
<div style="display:flex;gap:8px;align-items:center">
<input class="ainp" id="settGtm" style="margin:0;flex:1" placeholder="Google Tag Manager ID (e.g. GTM-XXXXXXX, or 'off' to disable)">
<button class="asave" onclick="saveSetting('GTM_CONTAINER_ID',document.getElementById('settGtm').value.trim())">Save</button></div>
<div class="sett-toggle" style="margin-top:6px">
<label>Exit-Intent OFF</label>
<label class="switch"><input type="checkbox" id="settExitIntent" checked onchange="saveSetting('EXIT_INTENT_ENABLED',this.checked?'true':'false')"><span class="slider"></span></label>
<label>Exit-Intent Recovery ON</label>
</div>
<p style="font-size:11px;color:var(--g400);margin:2px 0 0">Shows the email-capture prompt to desktop visitors about to leave — recovers abandoning traffic.</p>
</div>
</div>
<div class="sett-card">
<h4>AI Sales Agent</h4>
<p>Runs automatically once a day (GitHub Actions cron) to analyse your funnel and email sales-improvement recommendations to the manager. You can also run it on demand here.</p>
<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap">
<button class="asave" style="flex:0 0 auto" onclick="runSalesAgent()">Run sales report now</button>
<button class="asave" style="flex:0 0 auto;background:#0a0a0a" onclick="runGrowthLoop()">▶ Run growth loop now</button>
<span id="salesAgentStatus" style="font-size:12px;color:var(--g400)"></span>
</div>
<p style="font-size:11px;color:var(--g400);margin:0 0 8px">The <b>growth loop</b> is the self-improving daily system: it reads live funnel + stock, filters out bot (Singapore) traffic, decides an on-brand plan to clear current stock for Indian buyers, auto-applies a site-wide announcement bar, and learns from yesterday's results. Current announcement: <code id="aiAnnounceNow">—</code></p>
<div id="salesReportsList" style="font-size:12px;color:var(--g500)"></div>
<p style="font-size:11px;color:var(--g400);margin:8px 0 0">Tip: set Cloudflare secrets <code>CRON_SECRET</code> (required) and <code>OPENAI_API_KEY</code> (optional — enables richer LLM decisions; without it a built-in heuristic engine is used). Set <code>AI_ANNOUNCEMENT</code>=<code>off</code> to hide the bar.</p>
</div>
<div class="sett-card">
<h4>Site Maintenance</h4>
<p>Show a banner alerting customers about ongoing maintenance (e.g., missing images) while still allowing orders.</p>
<div class="sett-toggle" style="margin-bottom:12px">
<label>Banner OFF</label>
<label class="switch"><input type="checkbox" id="settBannerEn" onchange="saveSetting('MAINTENANCE_BANNER_ENABLED',this.checked?'true':'false')"><span class="slider"></span></label>
<label>Banner ON</label>
</div>
<div style="display:flex;flex-direction:column;gap:4px">
<label style="font-size:13px;font-weight:600">Banner Type:</label>
<select class="ainp" id="settBannerType" style="margin:0;width:100%;max-width:300px" onchange="saveSetting('MAINTENANCE_BANNER_TYPE',this.value)">
<option value="skippable">Skippable Full-Width (Allows closing)</option>
<option value="fixed">Fixed Top Header (Cannot be closed)</option>
</select>
</div>
</div>
</div>

<!-- Maintenance Tab -->
<div class="apan" id="tmaint">
  <div class="sett-card" style="background:var(--g50)">
    <h4>&#x1F6A7; Site Maintenance Control</h4>
    <p>Manage how maintenance mode behaves for your customers. Changes are applied instantly.</p>
  </div>

  <div class="sett-card">
    <h4>Maintenance Mode <span id="maintModeBadge" style="margin-left:8px;font-size:10px;padding:3px 8px;border-radius:12px;letter-spacing:1px;vertical-align:middle;text-transform:uppercase;font-family:var(--sans)"></span></h4>
    <p><strong>Off</strong> &mdash; site works normally.<br><strong>Soft</strong> &mdash; users see an agreement modal + top banner.<br><strong>Full</strong> &mdash; site is locked with a dedicated maintenance page.</p>
    <select class="ainp" id="settMaintMode" style="margin:0;max-width:300px">
      <option value="off">Off (Normal)</option>
      <option value="soft">Soft (Acknowledge + Banner)</option>
      <option value="full">Full (Locked Page)</option>
    </select>
  </div>

  <div class="sett-card">
    <h4>Maintenance Message</h4>
    <p>The main message shown to users in both soft and full modes.</p>
    <textarea class="ainp" id="settMaintMsg" style="margin:0;min-height:80px;padding:12px" placeholder="We're making improvements. Back soon!"></textarea>
  </div>

  <div class="sett-card">
    <h4>Estimated Return (ETA)</h4>
    <p>Optional text shown in full mode (e.g. "March 10, 2026").</p>
    <input type="text" class="ainp" id="settMaintEta" style="margin:0" placeholder="e.g. March 10, 2026">
  </div>

  <div style="margin-top:24px">
    <button class="abtn" id="maintenance-save-btn" onclick="saveMaintenanceConfig()" style="max-width:240px">Save Maintenance Settings</button>
  </div>

  <div class="sett-card" style="margin-top:40px;opacity:0.75">
    <h4>Preview (Soft Mode Modal)</h4>
    <div style="border:1.5px solid var(--g100);border-radius:6px;padding:24px;background:#f8f8f8;max-width:400px;text-align:center">
      <strong style="font-size:14px;font-family:var(--head);text-transform:uppercase;letter-spacing:-.03em">&#x1F6A7; Site Maintenance</strong>
      <p style="font-size:12px;color:var(--g500);margin:8px 0 16px;line-height:1.5">Your message will appear here. Users must agree to report bugs before browsing.</p>
      <div style="background:var(--wh);border:1px solid var(--g200);padding:10px;font-size:10px;color:var(--g400);margin-bottom:12px;text-align:left">&#9744; I understand the site is under active maintenance...</div>
      <div style="background:var(--bk);color:var(--wh);padding:10px;font-size:9px;font-weight:700;letter-spacing:1px;opacity:0.5">I UNDERSTAND — LET ME BROWSE</div>
    </div>
  </div>
</div>

<!-- AI Stylist Tab [AG] -->
<div class="apan" id="tai">
<div class="sett-card" style="background:var(--g50)">
  <h4>AI Stylist Engine</h4>
  <p>Configure the "brain" of your store's AI shopping assistant. All keys are stored securely in Supabase.</p>
</div>

<div class="sett-card">
  <h4>OpenRouter Config (Primary)</h4>
  <p>Highly recommended for best performance and latest models.</p>
  <div class="apc-row"><label>API Key</label><input type="password" id="aiOpenRouterKey" class="ainp" placeholder="sk-or-v1-..."></div>
  <div class="apc-row"><label>Default Model</label><input type="text" id="aiOpenRouterModel" class="ainp" placeholder="google/gemini-2.0-flash-001"></div>
</div>

<div class="sett-card">
  <h4>Groq Config (Secondary/Fast)</h4>
  <p>Used as an ultra-fast fallback for chat responses.</p>
  <div class="apc-row"><label>API Key</label><input type="password" id="aiGroqKey" class="ainp" placeholder="gsk_..."></div>
  <div class="apc-row"><label>Default Model</label><input type="text" id="aiGroqModel" class="ainp" placeholder="llama-3.3-70b-versatile"></div>
</div>

<div class="sett-card">
  <h4>Gemini Config (Direct Fallback)</h4>
  <p>Final fallback using direct Google AI API.</p>
  <div class="apc-row"><label>API Key</label><input type="password" id="aiGeminiKey" class="ainp" placeholder="AIzaSy..."></div>
</div>

<div class="sett-card">
  <h4>Stylist Persona</h4>
  <p>Define the AI's personality, tone, and knowledge boundaries.</p>
  <textarea class="alta" id="aiPrompt" style="min-height:200px" placeholder="You are the official Intru AI Stylist..."></textarea>
</div>

<button class="asave" onclick="saveAIConfig()">Save AI Configuration</button>
</div>

<!-- Limits & Status Tab [AG] -->
<div class="apan" id="tlim">
<div class="sett-card" style="background:var(--g50)">
  <h4>Free Tier Usage Statistics</h4>
  <p>Monitor your consumption across connected free services. Data is estimated based on current database records.</p>
</div>
<div class="apcards">
  <div class="apc">
    <h3>Database Rows</h3>
    <div style="font-size:24px;font-family:var(--head)" id="limDb">...</div>
    <div style="font-size:11px;color:var(--g400);margin-top:4px">of 500,000 (Supabase Free Limit)</div>
  </div>
  <div class="apc">
    <h3>Storage Estimate</h3>
    <div style="font-size:24px;font-family:var(--head)" id="limStorage">...</div>
    <div style="font-size:11px;color:var(--g400);margin-top:4px">of 5GB (Supabase Free Limit)</div>
  </div>
  <div class="apc">
    <h3>Emails Sent (Est)</h3>
    <div style="font-size:24px;font-family:var(--head)" id="limEmail">...</div>
    <div style="font-size:11px;color:var(--g400);margin-top:4px">of 3,000 (Resend Monthly Free Limit)</div>
  </div>
  <div class="apc">
    <h3>Service Status</h3>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
      <div style="display:flex;align-items:center;gap:8px;font-size:12px">
        <span style="width:10px;height:10px;background:var(--green);border-radius:50%"></span> Supabase DB Connected
      </div>
      <div style="display:flex;align-items:center;gap:8px;font-size:12px">
        <span style="width:10px;height:10px;background:var(--green);border-radius:50%"></span> Resend API Active
      </div>
    </div>
  </div>
</div>
</div>

</div></div>

<script>
var prods=${pj};var legals=${lj};var curLeg=0;var adminToken=null;

function doLogin(){
  var pwd=document.getElementById('apwd').value;
  var errEl=document.getElementById('aerr');
  fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pwd})})
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(d.success){
      adminToken=pwd;sessionStorage.setItem('iadm','1');sessionStorage.setItem('iadm_t',pwd);
      document.getElementById('alogin').style.display='none';document.getElementById('adsh').style.display='block';initAdmin();
    } else {
      errEl.style.display='block';
      errEl.textContent=d.error||'Invalid password';
      document.getElementById('apwd').value='';document.getElementById('apwd').focus();
    }
  }).catch(function(e){
    errEl.style.display='block';
    errEl.textContent='Connection error: '+e.message;
  });
}
function doLogout(){sessionStorage.removeItem('iadm');sessionStorage.removeItem('iadm_t');location.reload()}
if(sessionStorage.getItem('iadm')==='1'){document.addEventListener('DOMContentLoaded',function(){
  adminToken=sessionStorage.getItem('iadm_t');document.getElementById('alogin').style.display='none';document.getElementById('adsh').style.display='block';initAdmin()});}

function showTab(btn,id){document.querySelectorAll('.atab').forEach(function(t){t.classList.remove('act')});document.querySelectorAll('.apan').forEach(function(p){p.classList.remove('act')});btn.classList.add('act');document.getElementById(id).classList.add('act')}

function initAdmin(){getAdminSettings();loadOrders();loadAnalytics();loadProducts();loadCoupons();loadCombos();initLegal();loadFaqs();loadBlogs();loadSizeChart();loadIgFeed();loadLimits();loadAIConfig()}
function getAdminSettings(){loadSettings()}

/* ====== LIMITS [AG] ====== */
function loadLimits(){
  var dbEl=document.getElementById('limDb');var stEl=document.getElementById('limStorage');var emEl=document.getElementById('limEmail');
  fetch('/api/admin/limits',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}}).then(function(r){return r.json()}).then(function(d){
    dbEl.textContent=d.rows.toLocaleString();
    stEl.textContent=d.storageMb+' MB';
    emEl.textContent=d.emailsSentEst;
    // Color coding
    if(d.rows>450000)dbEl.style.color='var(--red)';
    if(d.emailsSentEst>2500)emEl.style.color='var(--red)';
  }).catch(function(){});
}

var rawOrders = [];
function grepOrders(){
  var q = document.getElementById('ordSearch').value.toLowerCase();
  renderOrders(rawOrders.filter(function(o){
    var addr = o.shipping_address || {};
    var items = (o.items || []).map(function(i){return i.name}).join(' ');
    var pool = [
      o.customer_name, o.customer_email, o.customer_phone, 
      o.razorpay_order_id, o.id, addr.pincode, addr.city, items
    ].join(' ').toLowerCase();
    return pool.indexOf(q) !== -1;
  }));
}

function loadOrders(){
  document.getElementById('otbody').innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr>';
  fetch('/api/admin/orders',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}}).then(function(r){return r.json()}).then(function(d){
    var src=document.getElementById('ordSrc');
    src.textContent=d.source==='supabase'?'Live Database':'No Database';
    src.className='asrc '+(d.source==='supabase'?'asrc-db':'asrc-static');
    rawOrders = d.orders || [];
    grepOrders();
  });
}

function fmtOrderDate(iso){
  if(!iso) return '<span style="color:var(--g400);font-size:10px">—</span>';
  try {
    var d = new Date(iso);
    var now = new Date();
    var diffMs = now - d;
    var diffMin = Math.floor(diffMs / 60000);
    var diffHr = Math.floor(diffMs / 3600000);
    var diffDay = Math.floor(diffMs / 86400000);
    var rel = '';
    if(diffMin < 1) rel = 'just now';
    else if(diffMin < 60) rel = diffMin + 'm ago';
    else if(diffHr < 24) rel = diffHr + 'h ago';
    else if(diffDay < 7) rel = diffDay + 'd ago';
    else rel = d.toLocaleDateString('en-IN', {day:'2-digit', month:'short'});
    var full = d.toLocaleString('en-IN', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true});
    var fresh = diffHr < 24;
    return '<div style="font-size:11px;font-weight:800;color:'+(fresh?'#16a34a':'var(--bk)')+';margin-bottom:3px">'+rel+(fresh?' 🔥':'')+'</div>'
      +'<div style="font-size:9px;color:var(--g500);font-weight:600;line-height:1.3">'+full+'</div>';
  } catch(e){ return '<span style="color:var(--g400);font-size:10px">—</span>'; }
}

function renderOrders(orders){
  if(!orders.length){document.getElementById('otbody').innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--g400)">No orders found.</td></tr>';return}
  // Sort newest first
  orders = orders.slice().sort(function(a,b){
    var ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    var tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });
  var h='';
  orders.forEach(function(o){
      var items=(o.items||[]).map(function(it){return(it.name||it.productId)+(it.size?' ('+it.size+')':'')+(it.quantity?' x'+it.quantity:'')}).join(', ');
      var st=o.status||'pending';var pm=o.payment_method||'—';
      var addr = o.shipping_address || {};
      var addrStr = [
        o.shipping_address_line1 || addr.line1 || addr.name || '',
        o.shipping_address_line2 || addr.line2 || '',
        o.shipping_city || addr.city || '',
        o.shipping_state || addr.state || '',
        o.shipping_pincode || addr.pincode || addr.zipcode || addr.zip || ''
      ].filter(function(x){return x}).join(', ');
      var custName = o.customer_name || addr.name || (o.customer_email?o.customer_email.split('@')[0]:'—');
      var custPhone = o.customer_phone || addr.phone || addr.contact || '—';
      var isCod=pm==='cod';
      var oid = o.id || '';
      var codVerified = o.cod_verified || o.metadata?.cod_verified;
      var codBadge = isCod ? (codVerified ? '<span class="ostatus ost-cod" style="background:#dcfce7;color:#166534;border:1px solid #86efac">✓ COD VERIFIED</span>' : '<span class="ostatus ost-cod">🚚 COD PENDING</span>') : '<span class="ostatus ost-prepaid">⚡ PREPAID</span>';
      h+='<tr class="'+(isCod?'cod-row':'prepaid-row')+'">'
        +'<td data-label="Order ID" style="min-width:110px"><div style="font-weight:800;font-size:12px;letter-spacing:-0.5px;margin-bottom:6px">#'+(o.razorpay_order_id||o.id||'').slice(-8).toUpperCase()+'</div>'
        +codBadge+'</td>'
        +'<td data-label="Date &amp; Time" style="min-width:130px">'+fmtOrderDate(o.created_at)+'</td>'
        +'<td data-label="Customer Info" style="min-width:200px"><div style="font-size:14px;font-weight:800;color:var(--bk);letter-spacing:-0.2px">'+custName+'</div>'
        +'<div style="font-size:11px;color:var(--g600);font-weight:600;margin:4px 0"><i class="fas fa-envelope" style="font-size:9px;width:12px"></i>'+(o.customer_email||'—')+'</div>'
        +'<div style="font-size:11px;color:var(--g600);font-weight:600"><i class="fas fa-phone" style="font-size:9px;width:12px"></i>'+(o.customer_phone||'—')+'</div>'
        +'<div style="margin-top:10px;font-size:10px;line-height:1.4;color:var(--g500);background:rgba(0,0,0,0.03);padding:6px;border-radius:4px;border:1px solid rgba(0,0,0,0.03)">'+addrStr+'</div></td>'
        +'<td data-label="Items" style="font-size:12px;min-width:180px;color:var(--bk);font-weight:500">'+items+'</td>'
        +'<td data-label="Pricing" style="min-width:110px"><div style="font-weight:800;font-size:15px;color:var(--bk)">Rs.'+(o.total||0).toLocaleString('en-IN')+'</div>'+(o.cod_fee>0?'<div style="font-size:9px;color:#92400e;font-weight:700;margin-top:2px">+ Rs.'+o.cod_fee+' COD handle</div>':'')+'</td>'
        +'<td data-label="Status"> <span class="ostatus ost-'+st+'">'+st+'</span></td>'
        +'<td data-label="Actions" style="min-width:170px"><select class="oselect" style="width:100%;margin-bottom:8px" onchange="updateOrder(\\x27'+oid+'\\x27,this.value)">'
        +'<option value="">Update Status...</option><option value="paid">Mark Paid</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select>'
        +'<button class="shiprocket-btn" style="width:100%;text-align:center;margin-bottom:6px" onclick="copyShiprocket(\\x27'+custName.replace(/'/g,'')+'\\x27,\\x27'+custPhone+'\\x27,\\x27'+addrStr.replace(/'/g,'')+'\\x27)"><i class="fas fa-copy" style="margin-right:4px"></i>Shiprocket Copy</button>'
        +(o.customer_email ? '<button class="shiprocket-btn" style="width:100%;text-align:center;background:#e0e7ff;color:#3730a3;border-color:#a5b4fc;margin-bottom:6px" onclick="openEmailComposer(\\x27'+oid+'\\x27,\\x27'+(o.customer_email||'')+'\\x27,\\x27'+custName.replace(/'/g,'')+'\\x27)"><i class="fas fa-paper-plane" style="margin-right:4px"></i>Send Custom Email</button>' : '')
        +(o.customer_email && (st === 'pending' || st === 'placed') ? '<button class="shiprocket-btn" style="width:100%;text-align:center;background:#fef3c7;color:#92400e;border-color:#fcd34d" onclick="sendAbandonedCart(\\x27'+oid+'\\x27,\\x27'+(o.customer_email||'')+'\\x27,this)"><i class="fas fa-envelope" style="margin-right:4px"></i>Send Recovery Email</button>' : '')
        +'</td></tr>';
    });
    document.getElementById('otbody').innerHTML = h;
}

/* ====== CUSTOM EMAIL COMPOSER [AG] ====== */
function openEmailComposer(orderId, email, name){
  var existing = document.getElementById('emailComposerModal');
  if(existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'emailComposerModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = '<div style="background:#fff;border-radius:12px;max-width:560px;width:100%;padding:28px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">'
    +'<h2 style="font-family:\\x27Archivo Black\\x27,sans-serif;font-size:16px;margin:0;text-transform:uppercase;letter-spacing:1px">✉️ Compose Email</h2>'
    +'<button onclick="document.getElementById(\\x27emailComposerModal\\x27).remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#666">&times;</button>'
    +'</div>'
    +'<div style="font-size:12px;color:#666;margin-bottom:12px"><strong>To:</strong> '+name+' &lt;'+email+'&gt;</div>'
    +'<label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;color:#333">Subject</label>'
    +'<input type="text" id="emailSubject" placeholder="e.g. About your Intru order" style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:6px;font-size:14px;margin-bottom:16px;box-sizing:border-box">'
    +'<label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;color:#333">Message</label>'
    +'<textarea id="emailBody" rows="10" placeholder="Type your message. Line breaks preserved. Instagram DM link auto-added at the footer." style="width:100%;padding:12px;border:2px solid #e5e7eb;border-radius:6px;font-size:14px;font-family:inherit;line-height:1.6;box-sizing:border-box;resize:vertical"></textarea>'
    +'<div style="font-size:10px;color:#666;margin-top:8px;line-height:1.5">💡 Sent from <strong>shop@intru.in</strong>. Footer auto-includes Instagram DM link. Grievance-officer email is embedded as required by law but not shown as reply option.</div>'
    +'<div style="display:flex;gap:12px;margin-top:20px">'
    +'<button onclick="document.getElementById(\\x27emailComposerModal\\x27).remove()" style="flex:1;padding:14px;border:2px solid #e5e7eb;background:#fff;border-radius:6px;font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:1px;cursor:pointer">Cancel</button>'
    +'<button id="emailSendBtn" onclick="sendCustomEmail(\\x27'+orderId+'\\x27,\\x27'+email+'\\x27,\\x27'+name.replace(/\\x27/g,'')+'\\x27)" style="flex:2;padding:14px;background:#0a0a0a;color:#fff;border:none;border-radius:6px;font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:1px;cursor:pointer">Send Email</button>'
    +'</div></div>';
  document.body.appendChild(modal);
}
function sendCustomEmail(orderId, email, name){
  var subject = document.getElementById('emailSubject').value.trim();
  var body = document.getElementById('emailBody').value.trim();
  if(!subject || !body){ alert('Subject and message are required.'); return; }
  var btn = document.getElementById('emailSendBtn');
  btn.disabled = true; btn.textContent = 'Sending...';
  fetch('/api/admin/orders/'+orderId+'/email', {
    method: 'POST',
    headers: { 'content-type':'application/json', 'x-admin-token':sessionStorage.getItem('iadm_t') },
    body: JSON.stringify({ email: email, name: name, subject: subject, body: body })
  }).then(function(r){ return r.json(); }).then(function(d){
    if(d.ok){
      btn.textContent = '✓ Sent!';
      setTimeout(function(){ document.getElementById('emailComposerModal').remove(); }, 900);
    } else {
      btn.disabled = false; btn.textContent = 'Send Email';
      alert('Failed: '+(d.error||'unknown error'));
    }
  }).catch(function(e){
    btn.disabled = false; btn.textContent = 'Send Email';
    alert('Network error: '+e.message);
  });
}

/* ====== ANALYTICS [AG v15.4] ====== */
function loadAnalytics(){
  document.getElementById('anaTbody').innerHTML='<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--g400)"><i class="fas fa-circle-notch fa-spin"></i> Loading analytics...</td></tr>';
  fetch('/api/admin/analytics',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}})
  .then(function(r){return r.json()})
  .then(function(d){
    if(!d.success){ document.getElementById('anaTbody').innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--red);padding:40px"><i class="fas fa-exclamation-circle" style="margin-right:6px"></i>Failed to load — check Supabase connection.</td></tr>'; return; }

    var views = d.views || [];
    var funnelEvents = d.funnel || [];

    /* Count funnel event types from full list */
    var identifyCount=0, atcCount=0, checkoutCount=0, payCount=0;
    funnelEvents.forEach(function(e){
      if(e.event_type==='identify') identifyCount++;
      else if(e.event_type==='add_to_cart') atcCount++;
      else if(e.event_type==='checkout_start') checkoutCount++;
      else if(e.event_type==='payment_success') payCount++;
    });

    /* Total page views */
    var totalViews = views.reduce(function(a,v){ return a + (v.count||0); }, 0);

    /* Update stat cards */
    document.getElementById('anaIdentify').textContent = identifyCount.toLocaleString();
    document.getElementById('anaAddToCart').textContent = atcCount.toLocaleString();
    document.getElementById('anaCheckouts').textContent = checkoutCount.toLocaleString();
    document.getElementById('anaPayments').textContent = payCount.toLocaleString();
    var conv = identifyCount ? ((payCount / identifyCount) * 100).toFixed(1) : '0';
    document.getElementById('anaConvRate').textContent = conv + '%';
    document.getElementById('anaTotalViews').textContent = totalViews.toLocaleString();

    var h='';

    /* === Page Views Section === */
    if(views.length){
      h += '<tr><td colspan="4" style="background:#0a0a0a;color:#fff;font-weight:800;padding:10px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1px">📊 Page Views</td></tr>';
      views.forEach(function(s){
        var bar = Math.min(100, Math.round((s.count / (totalViews||1)) * 100));
        h += '<tr><td style="font-weight:700;color:var(--bk);font-family:monospace;font-size:12px">'+(s.path||'/')
          +'<div style="height:3px;background:var(--g100);border-radius:2px;margin-top:6px;width:100%"><div style="height:3px;background:var(--bk);width:'+bar+'%;border-radius:2px"></div></div></td>'
          +'<td><span style="background:var(--g100);color:var(--g500);font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">page_view</span></td>'
          +'<td style="font-weight:900;font-size:18px;color:var(--bk)">'+(s.count||0).toLocaleString()+'</td>'
          +'<td style="font-size:10px;color:var(--g400)">'+(s.last_viewed_at ? new Date(s.last_viewed_at).toLocaleString() : '—')+'</td></tr>';
      });
    }

    /* === Funnel Summary === */
    var funnelSummary = [
      {label:'👤 Identify (Email Captured)',count:identifyCount,color:'#dbeafe',tc:'#1e40af'},
      {label:'🛒 Add to Cart',count:atcCount,color:'#fef3c7',tc:'#92400e'},
      {label:'💳 Checkout Started',count:checkoutCount,color:'#f3e8ff',tc:'#7c3aed'},
      {label:'✅ Payment Success',count:payCount,color:'#d1fae5',tc:'#065f46'}
    ];
    var maxFunnel = Math.max(identifyCount,1);
    h += '<tr><td colspan="4" style="background:#0a0a0a;color:#fff;font-weight:800;padding:10px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1px;border-top:4px solid rgba(255,255,255,.1)">🔥 Funnel Events Summary</td></tr>';
    funnelSummary.forEach(function(fs){
      var pct = Math.round((fs.count / maxFunnel) * 100);
      h += '<tr><td style="font-weight:700;color:var(--bk)">'+fs.label
        +'<div style="height:3px;background:var(--g100);border-radius:2px;margin-top:6px;width:100%"><div style="height:3px;background:'+fs.tc+';width:'+pct+'%;border-radius:2px"></div></div></td>'
        +'<td><span style="background:'+fs.color+';color:'+fs.tc+';font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">funnel</span></td>'
        +'<td style="font-weight:900;font-size:18px;color:var(--bk)">'+fs.count.toLocaleString()+'</td>'
        +'<td style="font-size:10px;color:var(--g400)">'+(pct > 0 ? pct+'% of leads' : '—')+'</td></tr>';
    });

    /* === Product Performance from funnel events === */
    var productCounts = {};
    funnelEvents.forEach(function(e){
      if(e.event_type === 'add_to_cart' && e.product_id){
        productCounts[e.product_id] = (productCounts[e.product_id]||0)+1;
      }
    });
    var sortedProducts = Object.keys(productCounts).sort(function(a,b){ return productCounts[b]-productCounts[a]; });
    if(sortedProducts.length){
      h += '<tr><td colspan="4" style="background:var(--g50);font-weight:800;padding:10px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1px;border-top:2px solid var(--g100)">🛍️ Top Products (Add to Cart)</td></tr>';
      sortedProducts.slice(0,10).forEach(function(pid){
        var prodName = prods.find(function(p){return p.id===pid;});
        h += '<tr><td style="font-weight:700;color:var(--bk)">'+(prodName ? prodName.name : pid)+'<div style="font-size:10px;font-weight:400;color:var(--g400);font-family:monospace">'+pid+'</div></td>'
          +'<td><span style="background:#fef3c7;color:#92400e;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">add_to_cart</span></td>'
          +'<td style="font-weight:900;font-size:18px;color:var(--bk)">'+productCounts[pid]+'</td>'
          +'<td style="font-size:10px;color:var(--g400)">—</td></tr>';
      });
    }

    /* === Recent Funnel Events === */
    if(funnelEvents.length){
      h += '<tr><td colspan="4" style="background:var(--g50);font-weight:800;padding:8px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1px;border-top:2px solid var(--g100)">📋 Recent Events (last 25)</td></tr>';
      funnelEvents.slice(0,25).forEach(function(e){
        var evtColors = {identify:'#dbeafe',add_to_cart:'#fef3c7',checkout_start:'#f3e8ff',payment_success:'#d1fae5'};
        var evtTcs = {identify:'#1e40af',add_to_cart:'#92400e',checkout_start:'#7c3aed',payment_success:'#065f46'};
        var ec = evtColors[e.event_type]||'#f3f4f6'; var etc = evtTcs[e.event_type]||'#374151';
        h += '<tr><td style="font-size:11px;font-family:monospace;color:var(--g500)">'+(e.email||'<i>anonymous</i>')+'</td>'
          +'<td><span style="background:'+ec+';color:'+etc+';font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px">'+e.event_type+'</span></td>'
          +'<td style="font-size:11px;color:var(--g600)">'+(e.product_id||'—')+(e.metadata?'<br><span style="font-size:9px;color:var(--g400);font-family:monospace">'+JSON.stringify(e.metadata).slice(0,50)+'</span>':'')+'</td>'
          +'<td style="font-size:10px;color:var(--g400)">'+new Date(e.created_at).toLocaleString()+'</td></tr>';
      });
    }

    document.getElementById('anaTbody').innerHTML = h || '<tr><td colspan="4" style="text-align:center;padding:40px;color:var(--g400)">No data yet. Analytics will populate as customers interact.</td></tr>';
  }).catch(function(err){ document.getElementById('anaTbody').innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--red);padding:40px"><i class="fas fa-exclamation-circle" style="margin-right:6px"></i>Failed to load. Check console for details.</td></tr>'; console.error(err); });
}

function triggerAbandoned(){
  var st = document.getElementById('abandonStatus');
  st.textContent = 'Triggering...';
  fetch('/api/admin/abandoned/trigger', {
    method: 'POST',
    headers: { 'x-admin-token': sessionStorage.getItem('iadm_t') }
  })
  .then(function(r){ return r.json() })
  .then(function(d){
    if(d.success) {
      toast('Recovery emails sent: ' + d.sent, 'ok-green');
      st.textContent = 'DONE: ' + d.sent + ' SENT';
      setTimeout(function(){ st.textContent = ''; }, 5000);
    } else {
      toast(d.error || 'Failed', 'err');
      st.textContent = 'FAILED';
    }
  }).catch(function(){ toast('Trigger failed', 'err'); st.textContent = ''; });
}

function sendAbandonedCart(orderId, email, btn){
  if(!email || !orderId){toast('No email found for this order','err');return}
  if(!confirm('Send abandoned cart recovery email to ' + email + '?')) return;
  var origText = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Sending...';
  fetch('/api/admin/abandoned/send-single', {
    method: 'POST',
    headers: {'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},
    body: JSON.stringify({ orderId: orderId, email: email })
  })
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      toast('Recovery email sent to '+email,'ok-green');
      btn.textContent = '✓ Sent';
      btn.style.background = '#d1fae5';
      btn.style.color = '#065f46';
    } else {
      toast(d.error || 'Failed to send','err');
      btn.innerHTML = origText;
      btn.disabled = false;
    }
  }).catch(function(){toast('Network error','err');btn.innerHTML=origText;btn.disabled=false});
}

function copyShiprocket(name,phone,addr){
  var txt='Name: '+name+'\\nPhone: '+phone+'\\nAddress: '+addr;
  if(navigator.clipboard){navigator.clipboard.writeText(txt).then(function(){toast('Copied for Shiprocket!','ok-green')}).catch(function(){fallbackCopy(txt)})}else{fallbackCopy(txt)}
}
function fallbackCopy(txt){var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Copied!','ok-green')}

function updateOrder(orderId,newStatus){
  if(!newStatus)return;
  fetch('/api/admin/orders/'+orderId,{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},body:JSON.stringify({status:newStatus})})
  .then(function(r){return r.json()}).then(function(d){
    if(d.success){toast('Order updated!','ok-green');loadOrders()}
    else{toast('Update failed','err')}
  }).catch(function(e){toast('Error: '+e.message,'err')});
}

/* ====== PRODUCTS ====== */
function loadProducts(){
  fetch('/api/products').then(function(r){return r.json()}).then(function(d){
    var src=document.getElementById('prodSrc');
    src.textContent=d.source==='static'?'Static Fallback':'Live Database';
    src.className='asrc '+(d.source==='static'?'asrc-static':'asrc-db');
    prods=d.products||[];renderProdCards();
  }).catch(function(e){toast('Error: '+e.message,'err');renderProdCards()});
}
function renderProdCards(){
  var h='';prods.forEach(function(p,idx){
    var imgs=p.images||[];while(imgs.length<4)imgs.push('');
    var sizeStockStr = JSON.stringify(p.sizeStock || {}, null, 2);
    var stockStr = JSON.stringify(p.stockCount || {}, null, 2);
    h+='<div class="apc"><h3>'+p.name+' <span style="font-size:10px;color:var(--g400);font-weight:400">'+p.id+'</span></h3>';
    h+='<div class="apc-imgs">';for(var i=0;i<4;i++){h+='<div><img src="'+(imgs[i]||'')+'" alt="" id="pimg_'+idx+'_'+i+'" onerror="this.src=\\x27\\x27"><input value="'+(imgs[i]||'')+'" onchange="updImg('+idx+','+i+',this.value)" placeholder="Image '+(i+1)+'"></div>'}h+='</div>';
    h+='<div class="apc-row"><div style="flex:1"><label>Name</label><input value="'+p.name+'" id="pname_'+idx+'"></div></div>';
    h+='<div class="apc-row"><div style="flex:1"><label>Price</label><input type="number" value="'+p.price+'" id="pprice_'+idx+'"></div><div style="flex:1"><label>Compare</label><input type="number" value="'+(p.comparePrice||'')+'" id="pcmp_'+idx+'"></div></div>';
    h+='<div class="apc-row"><div style="flex:1"><label>Per-Size Stock (JSON: {"S":10, "M":5, "L":0})</label><textarea id="psizestock_'+idx+'" style="width:100%;height:60px;font-family:monospace;font-size:11px;padding:8px;border:1.5px solid var(--g200);border-radius:3px">'+sizeStockStr+'</textarea></div></div>';
    h+='<div class="apc-row"><div style="flex:1"><label>Total Stock Count (JSON: {"S":10, "M":5})</label><textarea id="pstockobj_'+idx+'" style="width:100%;height:60px;font-family:monospace;font-size:11px;padding:8px;border:1.5px solid var(--g200);border-radius:3px">'+stockStr+'</textarea></div></div>';
    h+='<details style="margin:16px 0;border:1px solid var(--g200);padding:12px;border-radius:4px"><summary style="cursor:pointer;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--g500)">SEO (Optional)</summary>';
    h+='<div style="margin-top:12px"><div class="apc-row"><div style="flex:1"><label>SEO Title <span style="font-size:10px;color:var(--g400)">(Leave blank to auto-generate)</span></label><input value="'+(p.seoTitle||'')+'" id="pseotitle_'+idx+'"></div></div>';
    h+='<div class="apc-row"><div style="flex:1"><label>SEO Description <span style="font-size:10px;color:var(--g400)">(Leave blank to auto-generate)</span></label><input value="'+(p.seoDescription||'')+'" id="pseodesc_'+idx+'"></div></div></div></details>';
    h+='<div class="atog"><input type="checkbox" id="pstock_'+idx+'" '+(p.inStock!==false?'checked':'')+' ><span>Active/In Stock</span></div>';
    h+='<button class="asave" onclick="saveProd('+idx+')">Save Product</button></div>';
  });document.getElementById('apcards').innerHTML=h;
}
function updImg(pi,ii,url){var imgs=prods[pi].images||[];while(imgs.length<4)imgs.push('');imgs[ii]=url;prods[pi].images=imgs;var el=document.getElementById('pimg_'+pi+'_'+ii);if(el)el.src=url}
function saveProd(idx){
  var p=prods[idx];var name=document.getElementById('pname_'+idx).value;var price=parseInt(document.getElementById('pprice_'+idx).value)||p.price;
  var cmp=parseInt(document.getElementById('pcmp_'+idx).value)||null;var inStock=document.getElementById('pstock_'+idx).checked;
  var seoTitle=document.getElementById('pseotitle_'+idx).value;var seoDesc=document.getElementById('pseodesc_'+idx).value;
  var sizeStockObj={};try{sizeStockObj=JSON.parse(document.getElementById('psizestock_'+idx).value)}catch(e){toast('Invalid Size Stock JSON','err');return}
  var stockObj={};try{stockObj=JSON.parse(document.getElementById('pstockobj_'+idx).value)}catch(e){toast('Invalid Stock JSON','err');return}
  var imgs=(p.images||[]).filter(function(u){return u&&u.trim()});
  fetch('/api/admin/products/'+p.id,{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},body:JSON.stringify({name:name,price:price,compare_price:cmp,in_stock:inStock,images:imgs,seo_title:seoTitle,seo_description:seoDesc,size_stock:sizeStockObj,stock_count:stockObj})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast('"'+name+'" saved','ok-green')}else{toast(d.error||'Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}

/* ====== LEGAL ====== */
function initLegal(){var sel=document.getElementById('alsel');sel.innerHTML='';legals.forEach(function(l,i){var o=document.createElement('option');o.value=i;o.textContent=l.title;sel.appendChild(o)});switchLegal()}
function switchLegal(){curLeg=parseInt(document.getElementById('alsel').value);document.getElementById('alta').value=legals[curLeg].content;prevLegal()}
function prevLegal(){document.getElementById('alprev').innerHTML=document.getElementById('alta').value}
function saveLegal(){
  var l=legals[curLeg];var content=document.getElementById('alta').value;
  fetch('/api/admin/legal/'+l.slug,{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},body:JSON.stringify({content:content,updated_at:new Date().toISOString().split('T')[0]})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){legals[curLeg].content=content;toast('"'+l.title+'" saved','ok-green')}else{toast(d.error||'Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}

/* ====== SIZE CHART ====== */
var sizeData=[];
function loadSizeChart(){
  document.getElementById('sizetbody').innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr>';
  fetch('/api/size-chart').then(function(r){return r.json()}).then(function(d){
    var src=document.getElementById('sizeSrc');src.textContent=d.source==='supabase'?'Live':'Static';src.className='asrc '+(d.source==='supabase'?'asrc-db':'asrc-static');
    sizeData=d.sizes||[];renderSizeChart();
  }).catch(function(e){document.getElementById('sizetbody').innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--red)">Error</td></tr>'});
}
function renderSizeChart(){
  if(!sizeData.length){document.getElementById('sizetbody').innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--g400)">No sizes.</td></tr>';return}
  var h='';sizeData.forEach(function(s,idx){
    h+='<tr><td><input value="'+s.size_label+'" id="szl_'+idx+'" style="padding:6px;border:1px solid var(--g200);font-size:13px;font-weight:700;width:60px;font-family:inherit;border-radius:3px" '+(s.size_label?'readonly':'')+'></td>'
      +'<td><input type="number" value="'+s.chest+'" id="szc_'+idx+'" style="padding:6px;border:1px solid var(--g200);font-size:13px;width:70px;font-family:inherit;border-radius:3px;text-align:center"></td>'
      +'<td><input type="number" value="'+s.length+'" id="szlen_'+idx+'" style="padding:6px;border:1px solid var(--g200);font-size:13px;width:70px;font-family:inherit;border-radius:3px;text-align:center"></td>'
      +'<td><input type="number" value="'+(s.sort_order||idx+1)+'" id="szo_'+idx+'" style="padding:6px;border:1px solid var(--g200);font-size:13px;width:50px;font-family:inherit;border-radius:3px;text-align:center"></td>'
      +'<td style="display:flex;gap:6px"><button class="asave" style="padding:6px 12px" onclick="saveSize('+idx+')">Save</button>'
      +'<button style="padding:6px 12px;background:none;border:1.5px solid var(--red);color:var(--red);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-radius:3px;cursor:pointer;font-family:inherit" onclick="deleteSize('+idx+')">Del</button></td></tr>';
  });document.getElementById('sizetbody').innerHTML=h;
}
function addSizeRow(){sizeData.push({size_label:'',chest:0,length:0,sort_order:sizeData.length+1});renderSizeChart();var el=document.getElementById('szl_'+(sizeData.length-1));if(el){el.removeAttribute('readonly');el.focus()}}
function saveSize(idx){
  var label=document.getElementById('szl_'+idx).value.trim().toUpperCase();var chest=parseFloat(document.getElementById('szc_'+idx).value)||0;
  var len=parseFloat(document.getElementById('szlen_'+idx).value)||0;var order=parseInt(document.getElementById('szo_'+idx).value)||idx+1;
  if(!label){toast('Label required','err');return}
  fetch('/api/admin/size-chart/'+encodeURIComponent(label),{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},body:JSON.stringify({chest:chest,length:len,sort_order:order})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast('"'+label+'" saved','ok-green');loadSizeChart()}else{toast(d.error||'Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}
function deleteSize(idx){
  var label=sizeData[idx].size_label;if(!label){sizeData.splice(idx,1);renderSizeChart();return}
  if(!confirm('Delete "'+label+'"?'))return;
  fetch('/api/admin/size-chart/'+encodeURIComponent(label),{method:'DELETE',headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}}).then(function(r){return r.json()}).then(function(d){if(d.success){toast('Deleted','ok-green');loadSizeChart()}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}

/* ====== INSTAGRAM FEED ====== */
var igFeed=[];
function loadIgFeed(){
  document.getElementById('igGrid').innerHTML='<p style="color:var(--g400);grid-column:1/-1;text-align:center;padding:40px">Loading...</p>';
  fetch('/api/instagram-feed').then(function(r){return r.json()}).then(function(d){
    igFeed=d.feed||[];renderIgFeed();
  }).catch(function(){document.getElementById('igGrid').innerHTML='<p style="color:var(--red);grid-column:1/-1;text-align:center">Error</p>'});
}
function renderIgFeed(){
  if(!igFeed.length){document.getElementById('igGrid').innerHTML='<p style="color:var(--g400);grid-column:1/-1;text-align:center;padding:40px">No feed items. Click "Add Image" to start.</p>';return}
  var h='';igFeed.forEach(function(item,idx){
    h+='<div class="ig-card"><img src="'+(item.image_url||'')+'" alt="" onerror="this.src=\\x27\\x27">'
      +'<input value="'+(item.image_url||'')+'" placeholder="Image URL" onchange="igFeed['+idx+'].image_url=this.value">'
      +'<input value="'+(item.link_url||'')+'" placeholder="Link URL" onchange="igFeed['+idx+'].link_url=this.value">'
      +'<input value="'+(item.caption||'')+'" placeholder="Caption" onchange="igFeed['+idx+'].caption=this.value">'
      +'<div style="display:flex;gap:4px;margin-top:6px">'
      +'<button class="asave" style="padding:4px 10px;font-size:9px" onclick="saveIgItem('+idx+')">Save</button>'
      +'<button style="padding:4px 10px;background:none;border:1px solid var(--red);color:var(--red);font-size:9px;font-weight:700;border-radius:3px;cursor:pointer;font-family:inherit" onclick="deleteIgItem('+idx+')">Del</button>'
      +'</div></div>';
  });document.getElementById('igGrid').innerHTML=h;
}
function addIgItem(){
  fetch('/api/admin/instagram-feed',{method:'POST',headers:{'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},body:JSON.stringify({image_url:'',sort_order:igFeed.length})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast('Added','ok-green');loadIgFeed()}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}
function saveIgItem(idx){
  var item=igFeed[idx];if(!item||!item.id)return;
  fetch('/api/admin/instagram-feed/'+item.id,{method:'PATCH',headers:{'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},body:JSON.stringify({image_url:item.image_url,link_url:item.link_url,caption:item.caption})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast('Saved','ok-green')}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}
function deleteIgItem(idx){
  var item=igFeed[idx];if(!item||!item.id)return;if(!confirm('Delete this feed item?'))return;
  fetch('/api/admin/instagram-feed/'+item.id,{method:'DELETE',headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}}).then(function(r){return r.json()}).then(function(d){if(d.success){toast('Deleted','ok-green');loadIgFeed()}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}

/* ====== SETTINGS ====== */
function loadSettings(){
  fetch('/api/admin/settings',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}}).then(function(r){return r.json()}).then(function(d){
    var s=d.settings||{};
    document.getElementById('settMagic').checked=s.USE_MAGIC_CHECKOUT==='true';
    document.getElementById('settManager').value=s.MANAGER_EMAIL||'shop@intru.in';
    document.getElementById('settCodFee').value=s.COD_FEE||'99';
    var _ga=document.getElementById('settGa4'); if(_ga)_ga.value=s.GA4_MEASUREMENT_ID||'';
    var _cl=document.getElementById('settClarity'); if(_cl)_cl.value=s.CLARITY_PROJECT_ID||'';
    var _gtm=document.getElementById('settGtm'); if(_gtm)_gtm.value=(s.GTM_CONTAINER_ID!==undefined?s.GTM_CONTAINER_ID:'GTM-PCQCS3JV');
    var _ei=document.getElementById('settExitIntent'); if(_ei)_ei.checked=s.EXIT_INTENT_ENABLED!=='false';
    document.getElementById('settIgFeed').checked=s.INSTAGRAM_FEED_ENABLED!=='false';
    const settSizeGuide = document.getElementById('settSizeGuide');
    if (settSizeGuide) settSizeGuide.checked=s.SIZE_GUIDE_ENABLED!=='false';
    // Maintenance
    var mm=document.getElementById('settMaintMode'); if(mm) mm.value=s.MAINTENANCE_MODE||'off';
    var mMsg=document.getElementById('settMaintMsg'); if(mMsg) mMsg.value=s.MAINTENANCE_MESSAGE||'';
    var mEta=document.getElementById('settMaintEta'); if(mEta) mEta.value=s.MAINTENANCE_ETA||'';
    if(typeof updateMaintBadge === 'function') updateMaintBadge(s.MAINTENANCE_MODE||'off');
  }).catch(function(){});
  if(typeof loadSalesReports==='function') loadSalesReports();
}
function saveSetting(key,val){
  fetch('/api/admin/settings/'+encodeURIComponent(key),{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},body:JSON.stringify({value:val})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast(key+' updated','ok-green')}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}

/* ====== AI SALES AGENT [AG] ====== */
function runSalesAgent(){
  var st=document.getElementById('salesAgentStatus'); if(st)st.textContent='Running…';
  var pwd=sessionStorage.getItem('iadm_t')||'';
  fetch('/api/ai/sales-report?days=7&key='+encodeURIComponent(pwd))
   .then(function(r){return r.json()})
   .then(function(d){
     if(d&&d.ok){
       if(st)st.textContent='Done — '+(d.emailed?'emailed':'not emailed')+', '+(d.stored?'saved':'not saved')+' ('+(d.model||'')+')';
       toast('Sales report generated','ok-green');
       loadSalesReports();
     } else {
       if(st)st.textContent='Failed: '+((d&&d.error)||'unknown');
       toast('Sales agent failed','err');
     }
   }).catch(function(e){if(st)st.textContent='Error: '+e.message;toast('Error','err')});
}
function runGrowthLoop(){
  var st=document.getElementById('salesAgentStatus'); if(st)st.textContent='Running growth loop…';
  var pwd=sessionStorage.getItem('iadm_t')||'';
  fetch('/api/ai/loop?days=7&key='+encodeURIComponent(pwd),{method:'POST'})
   .then(function(r){return r.json()})
   .then(function(d){
     if(d&&d.ok){
       var appl=(d.applied||[]).length;
       if(st)st.textContent='Loop done — '+appl+' action(s) applied, '+(d.emailed?'emailed':'not emailed')+' ('+(d.model||'')+')';
       var an=document.getElementById('aiAnnounceNow');
       var annAction=(d.applied||[]).filter(function(a){return a.key==='AI_ANNOUNCEMENT'})[0];
       if(an&&annAction)an.textContent=annAction.value;
       toast('Growth loop ran — '+appl+' change(s) live','ok-green');
       loadSalesReports();
     } else {
       if(st)st.textContent='Loop failed: '+((d&&d.error)||'unknown');
       toast('Growth loop failed','err');
     }
   }).catch(function(e){if(st)st.textContent='Error: '+e.message;toast('Error','err')});
}
function loadSalesReports(){
  var box=document.getElementById('salesReportsList'); if(!box)return;
  fetch('/api/admin/sales-reports',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}})
   .then(function(r){return r.json()})
   .then(function(d){
     var rows=(d&&d.reports)||[];
     if(!rows.length){box.innerHTML='<em style="color:var(--g400)">No reports yet. Run one above or wait for the daily run.</em>';return}
     box.innerHTML=rows.slice(0,10).map(function(rep){
       var dt=new Date(rep.created_at||rep.report_date).toLocaleDateString();
       var sum=(rep.summary||'').replace(/</g,'&lt;');
       var isLoop=(rep.report_type==='loop');
       var recs=(rep.recommendations||'').replace(/</g,'&lt;').replace(/\\n/g,'<br>');
       var extra='';
       if(isLoop){
         var acts=(rep.actions||[]);
         extra+='<div style="margin-top:8px"><b>Actions:</b><ul style="margin:4px 0;padding-left:16px">'+acts.map(function(a){
           return '<li>'+(a.autoApply?'✅ ':'💡 ')+'<b>'+(a.type||'').replace(/</g,'&lt;')+'</b>: '+(a.value||'').replace(/</g,'&lt;')+'</li>';
         }).join('')+'</ul></div>';
         if(rep.deltas&&Object.keys(rep.deltas).length){
           extra+='<div style="margin-top:4px"><b>Since yesterday:</b> '+Object.keys(rep.deltas).map(function(k){
             var v=rep.deltas[k];return k+' '+v.prev+'→'+v.now+' ('+(v.change>=0?'+':'')+v.change+')';
           }).join(' · ')+'</div>';
         }
       }
       var tag=isLoop?'<span style="background:#0a0a0a;color:#fff;font-size:9px;padding:1px 6px;border-radius:4px;margin-right:6px">LOOP</span>':'';
       return '<details style="margin:6px 0;border:1px solid var(--g100);padding:8px 10px;border-radius:6px"><summary style="cursor:pointer;font-weight:600">'+tag+dt+' — '+sum+'</summary><div style="margin-top:8px;white-space:normal">'+recs+extra+'</div></details>';
     }).join('');
   }).catch(function(){box.innerHTML='<em style="color:var(--g400)">Could not load reports.</em>'});
}

/* ====== AI STYLIST [AG] ====== */
function loadAIConfig(){
  fetch('/api/admin/settings',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}}).then(function(r){return r.json()}).then(function(d){
    var s=d.settings||{};
    document.getElementById('aiOpenRouterKey').value=s.AI_OPENROUTER_KEY||'';
    document.getElementById('aiOpenRouterModel').value=s.AI_OPENROUTER_MODEL||'google/gemini-2.0-flash-001';
    document.getElementById('aiGroqKey').value=s.AI_GROQ_KEY||'';
    document.getElementById('aiGroqModel').value=s.AI_GROQ_MODEL||'llama-3.3-70b-versatile';
    document.getElementById('aiGeminiKey').value=s.AI_GEMINI_KEY||'';
    document.getElementById('aiPrompt').value=s.AI_SYSTEM_PROMPT||'';
  }).catch(function(){});
}
function saveAIConfig(){
  var keys=['AI_OPENROUTER_KEY','AI_OPENROUTER_MODEL','AI_GROQ_KEY','AI_GROQ_MODEL','AI_GEMINI_KEY','AI_SYSTEM_PROMPT'];
  var vals=[
    document.getElementById('aiOpenRouterKey').value,
    document.getElementById('aiOpenRouterModel').value,
    document.getElementById('aiGroqKey').value,
    document.getElementById('aiGroqModel').value,
    document.getElementById('aiGeminiKey').value,
    document.getElementById('aiPrompt').value
  ];
  var count=0;
  keys.forEach(function(k,i){
    fetch('/api/admin/settings/'+encodeURIComponent(k),{method:'PUT',headers:{'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},body:JSON.stringify({value:vals[i]})})
    .then(function(r){return r.json()}).then(function(d){
      if(d.success){count++;if(count===keys.length)toast('AI Configuration Saved','ok-green')}
    });
  });
}
function saveMaintenanceConfig(){
  var mode = document.getElementById('settMaintMode').value;
  var msg = document.getElementById('settMaintMsg').value;
  var eta = document.getElementById('settMaintEta').value;
  var keys = ['MAINTENANCE_MODE', 'MAINTENANCE_MESSAGE', 'MAINTENANCE_ETA'];
  var vals = [mode, msg, eta];
  var count = 0;
  var failed = false;
  keys.forEach(function(k, i){
    fetch('/api/admin/settings/'+encodeURIComponent(k), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('iadm_t') },
      body: JSON.stringify({ value: vals[i] })
    }).then(function(r){ return r.json() }).then(function(d){
      if(!d.success) failed = true;
      count++; 
      if(count === keys.length) {
        if(!failed) {
          toast('Maintenance mode updated', 'ok-green');
          updateMaintBadge(mode);
        } else {
          toast('Failed to save &mdash; try again', 'err');
        }
      }
    }).catch(function(e){
      failed = true; count++;
      if(count === keys.length) toast('Failed to save &mdash; try again', 'err');
    });
  });
}
/* ====== COUPONS [AG v15.4] ====== */
var cpnData = [];
function loadCoupons(){
  document.getElementById('cpnTbody').innerHTML='<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--g400)"><i class="fas fa-circle-notch fa-spin"></i> Loading...</td></tr>';
  fetch('/api/admin/coupons',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}})
  .then(function(r){return r.json()})
  .then(function(d){
    cpnData = d.coupons || [];
    renderCoupons();
  }).catch(function(){document.getElementById('cpnTbody').innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--red);padding:30px">Error loading coupons. Check Supabase connection.</td></tr>'});
}

function renderCoupons(){
  if(!cpnData.length){
    document.getElementById('cpnTbody').innerHTML='<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--g400)">No coupons yet. Create one above!</td></tr>';
    return;
  }
  var h='';
  cpnData.forEach(function(c){
    var isExpired = c.expiry_at && new Date(c.expiry_at) < new Date();
    var statusBadge = !c.is_active ? '<span style="background:#fee2e2;color:#991b1b;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">Inactive</span>'
      : isExpired ? '<span style="background:#fef3c7;color:#92400e;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">Expired</span>'
      : '<span style="background:#d1fae5;color:#065f46;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">Active</span>';
    var typeLabel = c.type === 'percent' ? c.value+'% OFF' : 'Rs.'+c.value+' OFF';
    var uses = (c.current_uses || 0) + (c.max_uses ? ' / '+c.max_uses : ' / ∞');
    var expiry = c.expiry_at ? new Date(c.expiry_at).toLocaleDateString('en-IN') : '—';
    h += '<tr>'
      + '<td style="font-weight:800;font-family:monospace;font-size:13px;letter-spacing:.5px">'+c.code+'</td>'
      + '<td><span style="background:var(--g100);color:var(--g600);font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">'+c.type+'</span></td>'
      + '<td style="font-weight:700;color:var(--bk)">'+typeLabel+'</td>'
      + '<td style="color:var(--g500)">'+(c.min_total ? 'Rs.'+c.min_total : '—')+'</td>'
      + '<td style="font-weight:700">'+uses+'</td>'
      + '<td style="color:var(--g500)">'+expiry+'</td>'
      + '<td>'+statusBadge+'</td>'
      + '<td style="display:flex;gap:6px;flex-wrap:wrap">'
      + '<button class="asave" style="padding:4px 10px;font-size:9px;background:'+(c.is_active?'#ef4444':'var(--bk)')+'" onclick="toggleCoupon(\\x27'+c.code+'\\x27,'+(c.is_active?'false':'true')+')">'+( c.is_active ? 'Deactivate' : 'Activate')+'</button>'
      + '<button style="padding:4px 10px;background:none;border:1.5px solid var(--red);color:var(--red);font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;border-radius:3px;cursor:pointer;font-family:inherit" onclick="deleteCoupon(\\x27'+c.code+'\\x27)">Delete</button>'
      + '</td></tr>';
  });
  document.getElementById('cpnTbody').innerHTML = h;
}

function createCoupon(){
  var code = document.getElementById('cpnCode').value.trim().toUpperCase();
  var type = document.getElementById('cpnType').value;
  var value = parseFloat(document.getElementById('cpnValue').value);
  var minTotal = parseFloat(document.getElementById('cpnMin').value) || 0;
  var expiry = document.getElementById('cpnExpiry').value;
  var maxUses = parseInt(document.getElementById('cpnMaxUses').value) || null;
  var isActive = document.getElementById('cpnActive').checked;
  if(!code || !value){ toast('Code and value are required','err'); return; }
  if(type === 'percent' && (value < 1 || value > 100)){ toast('Percentage must be 1–100','err'); return; }
  var payload = { code: code, type: type, value: value, min_total: minTotal||null, is_active: isActive, max_uses: maxUses };
  if(expiry) payload.expiry_at = new Date(expiry).toISOString();
  fetch('/api/admin/coupons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('iadm_t') },
    body: JSON.stringify(payload)
  })
  .then(function(r){ return r.json() })
  .then(function(d){
    if(d.success){
      toast('Coupon "'+code+'" created!','ok-green');
      document.getElementById('cpnCode').value='';
      document.getElementById('cpnValue').value='';
      document.getElementById('cpnMin').value='';
      document.getElementById('cpnExpiry').value='';
      document.getElementById('cpnMaxUses').value='';
      loadCoupons();
    } else { toast(d.error||'Failed to create','err'); }
  }).catch(function(e){ toast('Error: '+e.message,'err'); });
}

function toggleCoupon(code, newState){
  fetch('/api/admin/coupons/'+encodeURIComponent(code), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('iadm_t') },
    body: JSON.stringify({ is_active: newState === 'true' || newState === true })
  })
  .then(function(r){ return r.json() })
  .then(function(d){
    if(d.success){ toast('Coupon updated','ok-green'); loadCoupons(); }
    else { toast(d.error||'Failed','err'); }
  }).catch(function(e){ toast('Error: '+e.message,'err'); });
}

function deleteCoupon(code){
  if(!confirm('Permanently delete coupon "'+code+'"?')) return;
  fetch('/api/admin/coupons/'+encodeURIComponent(code), {
    method: 'DELETE',
    headers: { 'x-admin-token': sessionStorage.getItem('iadm_t') }
  })
  .then(function(r){ return r.json() })
  .then(function(d){
    if(d.success){ toast('Coupon deleted','ok-green'); loadCoupons(); }
    else { toast(d.error||'Failed','err'); }
  }).catch(function(e){ toast('Error: '+e.message,'err'); });
}

/* ====== COMBO-BUY MANAGEMENT [Combo Feature] ====== */
var comboData = [];
var editingComboId = null;

function loadCombos(){
  document.getElementById('comboTbody').innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--g400)"><i class="fas fa-circle-notch fa-spin"></i> Loading...</td></tr>';
  fetch('/api/admin/combos',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}})
  .then(function(r){return r.json()})
  .then(function(d){
    comboData = d.combos || [];
    renderCombos();
    renderComboProdPicker([]); /* Initialize product picker after prods are loaded */
  }).catch(function(){
    document.getElementById('comboTbody').innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--red);padding:30px">Error loading combos. Check Supabase connection.</td></tr>';
  });
}

function renderCombos(){
  if(!comboData.length){
    document.getElementById('comboTbody').innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--g400)">No combos yet. Create one above!</td></tr>';
    return;
  }
  var h='';
  comboData.forEach(function(c){
    var discLabel = c.discount_type === 'percent'
      ? c.discount_value + '% OFF'
      : 'Rs.' + c.discount_value + ' OFF';
    var discType = c.discount_type === 'percent' ? 'Percentage' : 'Fixed';

    /* Build rules pills */
    var ruleParts = [];
    ruleParts.push('<span style="background:#e0e7ff;color:#3730a3;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;white-space:nowrap">≥ ' + c.min_products + ' products</span>');
    if(c.min_subtotal) ruleParts.push('<span style="background:#fef3c7;color:#92400e;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;white-space:nowrap">Min ₹' + c.min_subtotal + '</span>');
    if(c.required_product_ids && c.required_product_ids.length) {
      /* Try to resolve names from prods */
      var pidNames = c.required_product_ids.map(function(pid){
        var p = prods.find(function(x){return x.id===pid});
        return p ? p.name : pid.slice(-6);
      });
      ruleParts.push('<span style="background:#f3e8ff;color:#7c3aed;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;white-space:nowrap" title="'+c.required_product_ids.join(', ')+'">Requires: '+pidNames.join(', ')+'</span>');
    }
    if(c.required_categories && c.required_categories.length)
      ruleParts.push('<span style="background:#fce7f3;color:#9d174d;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;white-space:nowrap">Cats: '+c.required_categories.join(', ')+'</span>');
    var rules = '<div style="display:flex;flex-wrap:wrap;gap:4px;line-height:1.8">' + ruleParts.join('') + '</div>';

    var statusBadge = c.is_active
      ? '<span style="background:#d1fae5;color:#065f46;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">Active</span>'
      : '<span style="background:#fee2e2;color:#991b1b;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">Inactive</span>';

    var createdAt = c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '—';

    /* escape for inline onclick - use split/join to avoid regex literal escaping issues */
    var safeId = c.id.split("'").join('');
    var safeName = (c.name||'').split("'").join('');

    h += '<tr>'
      + '<td style="min-width:160px"><div style="font-weight:800;font-size:13px;letter-spacing:-.2px">' + (c.name||'') + '</div>'
      + '<div style="font-size:10px;color:var(--g400);margin-top:2px;line-height:1.4">' + (c.description||'—') + '</div></td>'
      + '<td style="min-width:110px"><div style="font-weight:800;font-size:16px;color:var(--bk)">' + discLabel + '</div>'
      + '<div style="font-size:9px;color:var(--g400);text-transform:uppercase;letter-spacing:.5px;margin-top:2px">' + discType + '</div></td>'
      + '<td style="min-width:220px">' + rules + '</td>'
      + '<td style="font-weight:700;font-size:15px">' + (c.apply_count || 0) + '</td>'
      + '<td style="font-size:11px;color:var(--g500)">' + createdAt + '</td>'
      + '<td>' + statusBadge + '</td>'
      + '<td style="min-width:220px">'
      + '<div style="display:flex;flex-direction:column;gap:6px">'
      + '<button class="asave" style="padding:5px 12px;font-size:9px" onclick="editCombo(\\x27' + safeId + '\\x27)"><i class="fas fa-pen" style="margin-right:4px"></i>Edit</button>'
      + '<button class="asave" style="padding:5px 12px;font-size:9px;background:' + (c.is_active ? '#ef4444' : '#16a34a') + '" '
      + 'onclick="toggleCombo(\\x27' + safeId + '\\x27,' + !c.is_active + ')">'
      + (c.is_active ? '<i class="fas fa-ban" style="margin-right:4px"></i>Deactivate' : '<i class="fas fa-check" style="margin-right:4px"></i>Activate')
      + '</button>'
      + '<button style="padding:5px 12px;background:none;border:1.5px solid var(--red);color:var(--red);font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;border-radius:3px;cursor:pointer;font-family:inherit" '
      + 'onclick="deleteCombo(\\x27' + safeId + '\\x27,\\x27' + safeName + '\\x27)"><i class="fas fa-trash" style="margin-right:4px"></i>Delete</button>'
      + '</div>'
      + '</td></tr>';
  });
  document.getElementById('comboTbody').innerHTML = h;
}

function updateComboValueLabel(){
  var type = document.getElementById('comboDiscType').value;
  var lbl = document.getElementById('comboValueLabel');
  if(lbl) lbl.textContent = type === 'percent' ? 'Discount Value (%)' : 'Discount Value (Rs.)';
}

/* ── Product picker for combo form ── */
function renderComboProdPicker(selectedIds){
  var picker = document.getElementById('comboProdPicker');
  if(!picker) return;
  if(!prods || !prods.length){
    picker.innerHTML = '<span style="font-size:11px;color:var(--g400);font-style:italic">No products loaded — save first then refresh</span>';
    return;
  }
  var sel = selectedIds || [];
  var h = '';
  prods.forEach(function(p){
    var checked = sel.indexOf(p.id) !== -1 ? 'checked' : '';
    h += '<label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;padding:2px 0">'
      + '<input type="checkbox" value="'+p.id+'" '+checked+' onchange="syncComboPids()">'
      + '<span><strong>'+p.name+'</strong> <span style="color:var(--g400);font-size:10px">'+p.id+'</span></span>'
      + '</label>';
  });
  picker.innerHTML = h;
}

function syncComboPids(){
  var picker = document.getElementById('comboProdPicker');
  var hidden = document.getElementById('comboReqPids');
  if(!picker || !hidden) return;
  var checked = [];
  picker.querySelectorAll('input[type=checkbox]:checked').forEach(function(cb){
    checked.push(cb.value);
  });
  hidden.value = checked.join(',');
}

function resetComboForm(){
  editingComboId = null;
  document.getElementById('comboFormTitle').textContent = 'Create New Combo';
  document.getElementById('comboSubmitLabel').textContent = 'Create Combo';
  document.getElementById('comboSubmitIcon').className = 'fas fa-plus';
  document.getElementById('comboCancelEditBtn').style.display = 'none';
  /* clear fields */
  ['comboName','comboDesc','comboDiscValue','comboReqPids','comboReqCats'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value='';
  });
  document.getElementById('comboMinProducts').value = '2';
  document.getElementById('comboMinSubtotal').value = '0';
  document.getElementById('comboDiscType').value = 'percent';
  document.getElementById('comboActive').value = 'true';
  updateComboValueLabel();
  renderComboProdPicker([]);
  document.getElementById('comboFormCard').scrollIntoView({behavior:'smooth',block:'start'});
}

function editCombo(id){
  var c = comboData.find(function(x){ return x.id === id; });
  if(!c){ toast('Combo not found','err'); return; }
  editingComboId = id;
  document.getElementById('comboFormTitle').textContent = 'Edit Combo: ' + (c.name || '');
  document.getElementById('comboSubmitLabel').textContent = 'Save Changes';
  document.getElementById('comboSubmitIcon').className = 'fas fa-save';
  document.getElementById('comboCancelEditBtn').style.display = 'inline-block';
  document.getElementById('comboName').value = c.name || '';
  document.getElementById('comboDesc').value = c.description || '';
  document.getElementById('comboDiscType').value = c.discount_type || 'percent';
  document.getElementById('comboDiscValue').value = c.discount_value || '';
  document.getElementById('comboMinProducts').value = c.min_products || 2;
  document.getElementById('comboMinSubtotal').value = c.min_subtotal || 0;
  document.getElementById('comboActive').value = c.is_active ? 'true' : 'false';
  var selPids = (c.required_product_ids && c.required_product_ids.length) ? c.required_product_ids : [];
  document.getElementById('comboReqPids').value = selPids.join(',');
  document.getElementById('comboReqCats').value = (c.required_categories && c.required_categories.length) ? c.required_categories.join(',') : '';
  updateComboValueLabel();
  renderComboProdPicker(selPids);
  document.getElementById('comboFormCard').scrollIntoView({behavior:'smooth',block:'start'});
}

function submitCombo(){
  var name = document.getElementById('comboName').value.trim();
  var desc = document.getElementById('comboDesc').value.trim();
  var discType = document.getElementById('comboDiscType').value;
  var discValue = parseFloat(document.getElementById('comboDiscValue').value);
  var minProducts = parseInt(document.getElementById('comboMinProducts').value) || 2;
  var minSubtotal = parseFloat(document.getElementById('comboMinSubtotal').value) || 0;
  var isActive = document.getElementById('comboActive').value === 'true';
  var reqPidsRaw = document.getElementById('comboReqPids').value.trim();
  var reqCatsRaw = document.getElementById('comboReqCats').value.trim();

  if(!name){ toast('Combo name is required','err'); return; }
  if(isNaN(discValue) || discValue < 0){ toast('Discount value must be ≥ 0','err'); return; }
  if(discType === 'percent' && discValue > 100){ toast('Percentage cannot exceed 100','err'); return; }
  if(minProducts < 2){ toast('Min. products must be at least 2','err'); return; }

  var reqPids = reqPidsRaw ? reqPidsRaw.split(',').map(function(s){return s.trim();}).filter(Boolean) : null;
  var reqCats = reqCatsRaw ? reqCatsRaw.split(',').map(function(s){return s.trim().toLowerCase();}).filter(Boolean) : null;

  var payload = {
    name: name,
    description: desc,
    discount_type: discType,
    discount_value: discValue,
    min_products: minProducts,
    min_subtotal: minSubtotal > 0 ? minSubtotal : null,
    is_active: isActive,
    required_product_ids: reqPids,
    required_categories: reqCats
  };

  var btn = document.getElementById('comboSubmitBtn');
  btn.disabled = true;
  btn.textContent = editingComboId ? 'Saving...' : 'Creating...';

  var url = editingComboId ? '/api/admin/combos/' + encodeURIComponent(editingComboId) : '/api/admin/combos';
  var method = editingComboId ? 'PATCH' : 'POST';

  fetch(url, {
    method: method,
    headers: {'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},
    body: JSON.stringify(payload)
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(d.success){
      toast(editingComboId ? 'Combo updated!' : 'Combo "' + name + '" created!', 'ok-green');
      resetComboForm();
      loadCombos();
    } else {
      toast(d.error || 'Failed', 'err');
    }
  })
  .catch(function(e){ toast('Error: ' + e.message, 'err'); })
  .finally(function(){
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus" id="comboSubmitIcon" style="margin-right:6px"></i><span id="comboSubmitLabel">' + (editingComboId ? 'Save Changes' : 'Create Combo') + '</span>';
  });
}

function toggleCombo(id, newState){
  fetch('/api/admin/combos/' + encodeURIComponent(id), {
    method: 'PATCH',
    headers: {'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},
    body: JSON.stringify({ is_active: newState })
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(d.success){ toast('Combo ' + (newState ? 'activated' : 'deactivated'), 'ok-green'); loadCombos(); }
    else { toast(d.error || 'Failed', 'err'); }
  }).catch(function(e){ toast('Error: ' + e.message, 'err'); });
}

function deleteCombo(id, name){
  if(!confirm('Permanently delete combo: ' + name + '. This cannot be undone.')) return;
  fetch('/api/admin/combos/' + encodeURIComponent(id), {
    method: 'DELETE',
    headers: {'x-admin-token':sessionStorage.getItem('iadm_t')}
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(d.success){ toast('Combo deleted', 'ok-green'); loadCombos(); }
    else { toast(d.error || 'Failed to delete', 'err'); }
  }).catch(function(e){ toast('Error: ' + e.message, 'err'); });
}

function updateMaintBadge(mode) {
  var b = document.getElementById('maintModeBadge');
  if(!b) return;
  if(mode === 'off') {
    b.innerHTML = '&#9679; OFF';
    b.style.background = 'var(--g100)';
    b.style.color = 'var(--g500)';
  } else {
    b.innerHTML = '&#9679; LIVE';
    b.style.background = '#dcfce7';
    b.style.color = '#166534';
  }
}

/* ═════════════════════════════════════════════════════════════════
   FAQ CRUD — full admin management for /faq entries
   ═════════════════════════════════════════════════════════════════ */
var faqData = [];
var editingFaqId = null;

function loadFaqs(){
  var tb = document.getElementById('faqTbody');
  if(!tb) return;
  tb.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--g400)"><i class="fas fa-circle-notch fa-spin"></i> Loading...</td></tr>';
  fetch('/api/admin/faqs',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}})
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.error){ tb.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--red);padding:30px">'+d.error+'</td></tr>'; return; }
    faqData = d.faqs || [];
    var src = document.getElementById('faqSrc');
    if(src){
      if(d.source === 'supabase'){ src.className='asrc asrc-db'; src.innerHTML='<i class="fas fa-database"></i> Live from Supabase &middot; '+faqData.length+' rows'; }
      else { src.className='asrc asrc-static'; src.innerHTML='<i class="fas fa-file-code"></i> Seed preview &middot; connect Supabase to enable writes'; }
    }
    renderFaqs();
  }).catch(function(e){
    tb.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--red);padding:30px">Error loading FAQs: '+e.message+'</td></tr>';
  });
}

function renderFaqs(){
  var tb = document.getElementById('faqTbody');
  if(!tb) return;
  if(!faqData.length){
    tb.innerHTML='<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--g400)">No FAQs yet. Create one above!</td></tr>';
    return;
  }
  var h='';
  faqData.forEach(function(f){
    var isActive = f.is_active !== false;
    var statusBadge = isActive
      ? '<span style="background:#d1fae5;color:#065f46;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">Active</span>'
      : '<span style="background:#fee2e2;color:#991b1b;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">Hidden</span>';
    var qEsc = String(f.question||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var cEsc = String(f.category||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var safeId = String(f.id).split("'").join('');
    h += '<tr>'
      + '<td><span style="background:#f3f4f6;font-size:10px;font-weight:700;padding:3px 8px;border-radius:3px;text-transform:uppercase;letter-spacing:.5px">' + cEsc + '</span></td>'
      + '<td style="font-weight:600;font-size:13px;line-height:1.4">' + qEsc + '</td>'
      + '<td style="font-weight:700;color:var(--g500)">' + (f.sort_order != null ? f.sort_order : 0) + '</td>'
      + '<td>' + statusBadge + '</td>'
      + '<td>'
      + '<div style="display:flex;flex-direction:column;gap:6px">'
      + '<button class="asave" style="padding:5px 12px;font-size:9px" onclick="editFaq(\\x27' + safeId + '\\x27)"><i class="fas fa-pen" style="margin-right:4px"></i>Edit</button>'
      + '<button style="padding:5px 12px;background:none;border:1.5px solid var(--red);color:var(--red);font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;border-radius:3px;cursor:pointer;font-family:inherit" '
      + 'onclick="deleteFaq(\\x27' + safeId + '\\x27)"><i class="fas fa-trash" style="margin-right:4px"></i>Delete</button>'
      + '</div>'
      + '</td></tr>';
  });
  tb.innerHTML = h;
}

function editFaq(id){
  var f = faqData.find(function(x){ return String(x.id) === String(id); });
  if(!f){ toast('FAQ not found', 'err'); return; }
  if(String(id).indexOf('-') === 0){
    toast('This is a seed preview row — connect Supabase to edit.', 'err');
    return;
  }
  editingFaqId = id;
  document.getElementById('faqQuestion').value = f.question || '';
  document.getElementById('faqAnswer').value = f.answer || '';
  document.getElementById('faqCategory').value = f.category || '';
  document.getElementById('faqSortOrder').value = f.sort_order != null ? f.sort_order : 10;
  document.getElementById('faqActive').checked = f.is_active !== false;
  document.getElementById('faqFormTitle').textContent = 'Edit FAQ #' + id;
  document.getElementById('faqSubmitLabel').textContent = 'Save Changes';
  document.getElementById('faqSubmitIcon').className = 'fas fa-save';
  document.getElementById('faqCancelEditBtn').style.display = '';
  document.getElementById('faqFormCard').scrollIntoView({behavior:'smooth', block:'start'});
}

function resetFaqForm(){
  editingFaqId = null;
  document.getElementById('faqQuestion').value = '';
  document.getElementById('faqAnswer').value = '';
  document.getElementById('faqCategory').value = '';
  document.getElementById('faqSortOrder').value = 10;
  document.getElementById('faqActive').checked = true;
  document.getElementById('faqFormTitle').textContent = 'Create New FAQ';
  document.getElementById('faqSubmitLabel').textContent = 'Create FAQ';
  document.getElementById('faqSubmitIcon').className = 'fas fa-plus';
  document.getElementById('faqCancelEditBtn').style.display = 'none';
}

function submitFaq(){
  var question = document.getElementById('faqQuestion').value.trim();
  var answer = document.getElementById('faqAnswer').value.trim();
  var category = document.getElementById('faqCategory').value.trim();
  var sortOrder = parseInt(document.getElementById('faqSortOrder').value, 10) || 0;
  var isActive = document.getElementById('faqActive').checked;
  if(!question || !answer || !category){ toast('Question, answer, and category are required', 'err'); return; }
  var payload = { question: question, answer: answer, category: category, sort_order: sortOrder, is_active: isActive };
  var url = editingFaqId ? '/api/admin/faqs/' + encodeURIComponent(editingFaqId) : '/api/admin/faqs';
  var method = editingFaqId ? 'PATCH' : 'POST';
  fetch(url, {
    method: method,
    headers: {'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},
    body: JSON.stringify(payload)
  })
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      toast(editingFaqId ? 'FAQ updated' : 'FAQ created', 'ok-green');
      resetFaqForm();
      loadFaqs();
    } else {
      toast('Error: ' + (d.error || 'unknown'), 'err');
    }
  }).catch(function(e){ toast('Error: ' + e.message, 'err'); });
}

function deleteFaq(id){
  if(String(id).indexOf('-') === 0){
    toast('This is a seed preview row — connect Supabase to delete.', 'err');
    return;
  }
  if(!confirm('Delete this FAQ permanently? This cannot be undone.')) return;
  fetch('/api/admin/faqs/' + encodeURIComponent(id), {
    method: 'DELETE',
    headers: {'x-admin-token':sessionStorage.getItem('iadm_t')}
  })
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){ toast('FAQ deleted', 'ok-green'); loadFaqs(); }
    else { toast('Error: ' + (d.error || 'unknown'), 'err'); }
  }).catch(function(e){ toast('Error: ' + e.message, 'err'); });
}

/* ═════════════════════════════════════════════════════════════════
   BLOG CRUD — full admin management for /blog entries
   ═════════════════════════════════════════════════════════════════ */
var blogData = [];
var editingBlogSlug = null; /* original slug when editing (slug may be renamed) */

function loadBlogs(){
  var tb = document.getElementById('blogTbody');
  if(!tb) return;
  tb.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--g400)"><i class="fas fa-circle-notch fa-spin"></i> Loading...</td></tr>';
  fetch('/api/admin/blog',{headers:{'x-admin-token':sessionStorage.getItem('iadm_t')}})
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.error){ tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--red);padding:30px">'+d.error+'</td></tr>'; return; }
    blogData = d.posts || [];
    var src = document.getElementById('blogSrc');
    if(src){
      if(d.source === 'supabase'){ src.className='asrc asrc-db'; src.innerHTML='<i class="fas fa-database"></i> Live from Supabase &middot; '+blogData.length+' posts'; }
      else { src.className='asrc asrc-static'; src.innerHTML='<i class="fas fa-file-code"></i> Seed preview &middot; connect Supabase to enable writes'; }
    }
    renderBlogs();
  }).catch(function(e){
    tb.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--red);padding:30px">Error loading blogs: '+e.message+'</td></tr>';
  });
}

function renderBlogs(){
  var tb = document.getElementById('blogTbody');
  if(!tb) return;
  if(!blogData.length){
    tb.innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--g400)">No blog posts yet. Create one above!</td></tr>';
    return;
  }
  var h='';
  blogData.forEach(function(p){
    var isPub = p.is_published !== false;
    var statusBadge = isPub
      ? '<span style="background:#d1fae5;color:#065f46;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">Live</span>'
      : '<span style="background:#fef3c7;color:#92400e;font-size:9px;font-weight:700;padding:2px 8px;border-radius:3px;text-transform:uppercase">Draft</span>';
    var tEsc = String(p.title||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var sEsc = String(p.slug||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var cEsc = String(p.category||'Style').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var pubDate = p.published_iso || '—';
    var safeSlug = String(p.slug||'').split("'").join('');
    h += '<tr>'
      + '<td style="font-weight:700;font-size:13px;line-height:1.4">' + tEsc + '</td>'
      + '<td><a href="/blog/' + sEsc + '" target="_blank" style="font-size:11px;font-family:monospace;color:var(--bk);text-decoration:underline">' + sEsc + '</a></td>'
      + '<td><span style="background:#f3f4f6;font-size:10px;font-weight:700;padding:3px 8px;border-radius:3px;text-transform:uppercase;letter-spacing:.5px">' + cEsc + '</span></td>'
      + '<td style="font-size:11px;color:var(--g500)">' + pubDate + '</td>'
      + '<td>' + statusBadge + '</td>'
      + '<td>'
      + '<div style="display:flex;flex-direction:column;gap:6px">'
      + '<button class="asave" style="padding:5px 12px;font-size:9px" onclick="editBlog(\\x27' + safeSlug + '\\x27)"><i class="fas fa-pen" style="margin-right:4px"></i>Edit</button>'
      + '<a href="/blog/' + sEsc + '" target="_blank" class="arefresh" style="padding:5px 12px;font-size:9px;text-align:center;text-decoration:none"><i class="fas fa-external-link-alt" style="margin-right:4px"></i>View</a>'
      + '<button style="padding:5px 12px;background:none;border:1.5px solid var(--red);color:var(--red);font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;border-radius:3px;cursor:pointer;font-family:inherit" '
      + 'onclick="deleteBlog(\\x27' + safeSlug + '\\x27)"><i class="fas fa-trash" style="margin-right:4px"></i>Delete</button>'
      + '</div>'
      + '</td></tr>';
  });
  tb.innerHTML = h;
}

function editBlog(slug){
  var p = blogData.find(function(x){ return x.slug === slug; });
  if(!p){ toast('Post not found', 'err'); return; }
  editingBlogSlug = slug;
  document.getElementById('blogTitle').value = p.title || '';
  document.getElementById('blogSlug').value = p.slug || '';
  document.getElementById('blogCategory').value = p.category || 'Style';
  document.getElementById('blogReadMins').value = p.read_mins != null ? p.read_mins : 5;
  document.getElementById('blogPublished').value = p.published_iso || '';
  document.getElementById('blogCover').value = p.cover || '';
  document.getElementById('blogAuthor').value = p.author || 'Intru Editorial';
  document.getElementById('blogExcerpt').value = p.excerpt || '';
  document.getElementById('blogSeoTitle').value = p.seo_title || '';
  document.getElementById('blogSeoDesc').value = p.seo_desc || '';
  document.getElementById('blogKeywords').value = p.keywords || '';
  document.getElementById('blogBody').value = p.body || '';
  document.getElementById('blogPublish').checked = p.is_published !== false;
  document.getElementById('blogFormTitle').textContent = 'Edit Blog Post: ' + (p.title || slug);
  document.getElementById('blogSubmitLabel').textContent = 'Save Changes';
  document.getElementById('blogSubmitIcon').className = 'fas fa-save';
  document.getElementById('blogCancelEditBtn').style.display = '';
  /* Show cover preview if any */
  if(p.cover){
    var prev = document.getElementById('blogCoverPrev');
    if(prev){ prev.style.display=''; prev.innerHTML = '<img src="'+p.cover+'" style="max-width:220px;max-height:140px;border:1px solid var(--g100);border-radius:4px">'; }
  }
  document.getElementById('blogFormCard').scrollIntoView({behavior:'smooth', block:'start'});
}

function resetBlogForm(){
  editingBlogSlug = null;
  ['blogTitle','blogSlug','blogCategory','blogCover','blogExcerpt','blogSeoTitle','blogSeoDesc','blogKeywords','blogBody'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
  document.getElementById('blogReadMins').value = 5;
  document.getElementById('blogPublished').value = '';
  document.getElementById('blogAuthor').value = 'Intru Editorial';
  document.getElementById('blogPublish').checked = true;
  document.getElementById('blogFormTitle').textContent = 'Create New Blog Post';
  document.getElementById('blogSubmitLabel').textContent = 'Create Post';
  document.getElementById('blogSubmitIcon').className = 'fas fa-plus';
  document.getElementById('blogCancelEditBtn').style.display = 'none';
  var prev = document.getElementById('blogCoverPrev');
  if(prev){ prev.style.display='none'; prev.innerHTML=''; }
}

function submitBlog(){
  var title = document.getElementById('blogTitle').value.trim();
  var slug = document.getElementById('blogSlug').value.trim();
  var body = document.getElementById('blogBody').value.trim();
  if(!title || !slug || !body){ toast('Title, slug, and body are required', 'err'); return; }
  var payload = {
    title: title,
    slug: slug,
    category: document.getElementById('blogCategory').value.trim() || 'Style',
    read_mins: parseInt(document.getElementById('blogReadMins').value, 10) || 5,
    published_iso: document.getElementById('blogPublished').value || undefined,
    cover: document.getElementById('blogCover').value.trim(),
    author: document.getElementById('blogAuthor').value.trim() || 'Intru Editorial',
    excerpt: document.getElementById('blogExcerpt').value.trim(),
    seo_title: document.getElementById('blogSeoTitle').value.trim(),
    seo_desc: document.getElementById('blogSeoDesc').value.trim(),
    keywords: document.getElementById('blogKeywords').value.trim(),
    body: body,
    is_published: document.getElementById('blogPublish').checked
  };
  var url = editingBlogSlug ? '/api/admin/blog/' + encodeURIComponent(editingBlogSlug) : '/api/admin/blog';
  var method = editingBlogSlug ? 'PATCH' : 'POST';
  fetch(url, {
    method: method,
    headers: {'Content-Type':'application/json','x-admin-token':sessionStorage.getItem('iadm_t')},
    body: JSON.stringify(payload)
  })
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      toast(editingBlogSlug ? 'Post updated' : 'Post created', 'ok-green');
      resetBlogForm();
      loadBlogs();
    } else {
      toast('Error: ' + (d.error || 'unknown'), 'err');
    }
  }).catch(function(e){ toast('Error: ' + e.message, 'err'); });
}

function deleteBlog(slug){
  if(!confirm('Delete blog post "' + slug + '" permanently? This cannot be undone.')) return;
  fetch('/api/admin/blog/' + encodeURIComponent(slug), {
    method: 'DELETE',
    headers: {'x-admin-token':sessionStorage.getItem('iadm_t')}
  })
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){ toast('Post deleted', 'ok-green'); loadBlogs(); }
    else { toast('Error: ' + (d.error || 'unknown'), 'err'); }
  }).catch(function(e){ toast('Error: ' + e.message, 'err'); });
}

/* Auto-generate slug from title as user types (only if slug is empty or editing new) */
function autoSlug(){
  var t = document.getElementById('blogTitle').value;
  var slugEl = document.getElementById('blogSlug');
  if(!slugEl || editingBlogSlug) return; /* don't overwrite when editing */
  slugEl.value = String(t).toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,80);
}
</script>`;

  return shell(
    'Admin | Intru',
    'Admin panel for Intru store management.',
    body,
    { cls: 'admin-page', razorpayKeyId: opts.razorpayKeyId, googleClientId: opts.googleClientId, products, legalPages, useMagicCheckout: !!opts.useMagicCheckout }
  );
}
