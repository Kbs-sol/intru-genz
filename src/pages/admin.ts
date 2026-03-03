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
    images: p.images, sizes: p.sizes, inStock: p.inStock
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
.atabs{display:flex;gap:0;margin-bottom:32px;border-bottom:2px solid var(--g100);flex-wrap:wrap}
.atab{padding:14px 20px;background:none;border:none;border-bottom:2px solid transparent;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g400);margin-bottom:-2px;transition:all .2s}.atab:hover{color:var(--bk)}.atab.act{color:var(--bk);border-bottom-color:var(--bk)}
.apan{display:none}.apan.act{display:block}
.otbl-wrap{width:100%;overflow-x:auto;border:1.5px solid var(--g100);border-radius:8px;background:var(--wh)}
.otbl{width:100%;border-collapse:collapse;font-size:13px;min-width:900px}
.otbl th{text-align:left;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g400);padding:14px 12px;border-bottom:2px solid var(--g100);background:var(--g50)}
.otbl td{padding:12px 12px;border-bottom:1px solid var(--g100);vertical-align:top;line-height:1.5}
.otbl tr:last-child td{border-bottom:none}
.otbl tr:hover td{background:var(--g50)}
.otbl tr.cod-row{background:#fffbeb}
.ostatus{display:inline-block;padding:3px 10px;border-radius:3px;font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;white-space:nowrap}
.ost-cod{background:#fef3c7;color:#92400e;border:1px solid #d97706;margin-left:6px}
.ost-prepaid{background:#dcfce7;color:#166534;border:1px solid #16a34a;margin-left:6px}
.ost-pending{background:#fef3c7;color:#92400e}.ost-paid{background:#dcfce7;color:#166534}.ost-placed{background:#fef3c7;color:#92400e}.ost-shipped{background:#dbeafe;color:#1e40af}.ost-delivered{background:#dcfce7;color:#166534}.ost-payment_failed{background:#fee2e2;color:#991b1b}.ost-cancelled{background:#fecaca;color:#991b1b}
.oselect{padding:4px 8px;border:1px solid var(--g200);border-radius:3px;font-size:11px;font-family:inherit}
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
@media(max-width:768px){.apcards{grid-template-columns:1fr}.apc-imgs{grid-template-columns:repeat(2,1fr)}.ig-grid{grid-template-columns:repeat(2,1fr)}}
</style>

<div class="adm">
<div class="alog" id="alogin">
<h1>Admin Panel</h1>
<p>Enter the admin password to continue.</p>
<form onsubmit="event.preventDefault();doLogin()">
<input type="password" class="ainp" id="apwd" placeholder="Password" autocomplete="off">
<button type="submit" class="abtn">Authenticate</button>
</form>
<p class="aerr" id="aerr">Incorrect password. Try again.</p>
</div>

<div class="adsh" id="adsh">
<div class="ahdr"><h1>Admin &mdash; intru.in</h1><button class="aout" onclick="doLogout()">Sign Out</button></div>
<div class="atabs">
<button class="atab act" onclick="showTab(this,'tord')">Orders</button>
<button class="atab" onclick="showTab(this,'tprod')">Products</button>
<button class="atab" onclick="showTab(this,'tleg')">Legal</button>
<button class="atab" onclick="showTab(this,'tsize')">Size Chart</button>
<button class="atab" onclick="showTab(this,'tig')">IG Feed</button>
<button class="atab" onclick="showTab(this,'tsett')">Settings</button>
<button class="atab" onclick="showTab(this,'tlim')">Limits & Status</button>
</div>

<!-- Orders Tab -->
<div class="apan act" id="tord">
<div style="display:flex;align-items:center;margin-bottom:16px">
<span class="asrc" id="ordSrc"></span>
<button class="arefresh" onclick="loadOrders()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<div class="otbl-wrap">
<table class="otbl">
<thead><tr><th>Order ID</th><th>Customer Info</th><th>Items</th><th>Pricing</th><th>Method</th><th>Status</th><th>Actions</th></tr></thead>
<tbody id="otbody"><tr><td colspan="7" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr></tbody>
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

<!-- Legal Tab -->
<div class="apan" id="tleg">
<select class="alsel" id="alsel" onchange="switchLegal()"></select>
<textarea class="alta" id="alta" oninput="prevLegal()"></textarea>
<div class="alprev" id="alprev"></div>
<button class="asave" style="margin-top:16px" onclick="saveLegal()">Save to Supabase</button>
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
  fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pwd})})
  .then(function(r){return r.json()}).then(function(d){
    if(d.success){adminToken=pwd;sessionStorage.setItem('iadm','1');sessionStorage.setItem('iadm_t',pwd);
      document.getElementById('alogin').style.display='none';document.getElementById('adsh').style.display='block';initAdmin()}
    else{document.getElementById('aerr').style.display='block';document.getElementById('apwd').value='';document.getElementById('apwd').focus()}
  }).catch(function(){document.getElementById('aerr').style.display='block'});
}
function doLogout(){sessionStorage.removeItem('iadm');sessionStorage.removeItem('iadm_t');location.reload()}
if(sessionStorage.getItem('iadm')==='1'){document.addEventListener('DOMContentLoaded',function(){
  adminToken=sessionStorage.getItem('iadm_t');document.getElementById('alogin').style.display='none';document.getElementById('adsh').style.display='block';initAdmin()});}

function showTab(btn,id){document.querySelectorAll('.atab').forEach(function(t){t.classList.remove('act')});document.querySelectorAll('.apan').forEach(function(p){p.classList.remove('act')});btn.classList.add('act');document.getElementById(id).classList.add('act')}

function initAdmin(){loadOrders();loadProducts();initLegal();loadSizeChart();loadIgFeed();loadSettings();loadLimits()}

/* ====== LIMITS [AG] ====== */
function loadLimits(){
  var dbEl=document.getElementById('limDb');var stEl=document.getElementById('limStorage');var emEl=document.getElementById('limEmail');
  fetch('/api/admin/limits').then(function(r){return r.json()}).then(function(d){
    dbEl.textContent=d.rows.toLocaleString();
    stEl.textContent=d.storageMb+' MB';
    emEl.textContent=d.emailsSentEst;
    // Color coding
    if(d.rows>450000)dbEl.style.color='var(--red)';
    if(d.emailsSentEst>2500)emEl.style.color='var(--red)';
  }).catch(function(){});
}

/* ====== ORDERS ====== */
function loadOrders(){
  document.getElementById('otbody').innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr>';
  fetch('/api/admin/orders').then(function(r){return r.json()}).then(function(d){
    var src=document.getElementById('ordSrc');
    src.textContent=d.source==='supabase'?'Live Database':'No Database';
    src.className='asrc '+(d.source==='supabase'?'asrc-db':'asrc-static');
    var orders=d.orders||[];
    if(!orders.length){document.getElementById('otbody').innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--g400)">No orders yet.</td></tr>';return}
    var h='';
    orders.forEach(function(o){
      var items=(o.items||[]).map(function(it){return(it.name||it.productId)+(it.size?' ('+it.size+')':'')+(it.quantity?' x'+it.quantity:'')}).join(', ');
      var st=o.status||'pending';var pm=o.payment_method||'—';
      var addr=o.shipping_address||{};
      var addrStr=[o.shipping_address_line1||addr.line1||addr.name||'',o.shipping_address_line2||addr.line2||'',o.shipping_city||addr.city||'',o.shipping_state||addr.state||'',o.shipping_pincode||addr.zipcode||addr.zip||''].filter(function(x){return x}).join(', ');
      var custName=o.customer_name||addr.name||(o.customer_email?o.customer_email.split('@')[0]:'—');
      var custPhone=o.customer_phone||addr.contact||'—';
      var isCod=pm==='cod';
      h+='<tr class="'+(isCod?'cod-row':'')+'">'
        +'<td style="font-weight:700;font-size:11px;min-width:100px;display:flex;flex-direction:column;gap:4px">#'+(o.razorpay_order_id||o.id||'').slice(-8).toUpperCase()
        +(isCod ? '<span class="ostatus ost-cod">COD</span>' : '<span class="ostatus ost-prepaid">⚡ PAID</span>') +'</td>'
        +'<td style="min-width:180px"><div style="font-size:12px;font-weight:700;color:var(--bk)">'+custName+'</div><div style="font-size:11px;color:var(--g500)">'+(o.customer_email||'')+'</div><div style="font-size:11px;font-weight:600;color:var(--g400);margin-top:2px"><i class="fas fa-phone-alt" style="font-size:9px"></i> '+(o.customer_phone||'')+'</div></td>'
        +'<td style="font-size:12px;min-width:200px;max-width:250px;white-space:normal;color:var(--g600)">'+items+'</td>'
        +'<td style="font-weight:800;min-width:110px;color:var(--bk)">Rs.'+(o.total||0).toLocaleString('en-IN')+(o.cod_fee>0?'<br><span style="font-size:9px;color:var(--g500);font-weight:400">incl. Rs.'+o.cod_fee+' COD fee</span>':'')+'</td>'
        +'<td><span style="font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 8px;border-radius:4px;border:1px solid '+(isCod?'#d97706':'#16a34a')+';'+(isCod?'background:#fef3c7;color:#92400e':'background:#dcfce7;color:#166534')+'">'+pm+'</span></td>'
        +'<td><span class="ostatus ost-'+st+'">'+st+'</span></td>'
        +'<td style="min-width:140px"><select class="oselect" style="width:100%" onchange="updateOrder(\\x27'+o.id+'\\x27,this.value)">'
        +'<option value="">Update...</option><option value="paid">Mark Paid</option><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select>'
        +'<button class="shiprocket-btn" style="width:100%;text-align:center" onclick="copyShiprocket(\\x27'+custName.replace(/'/g,'')+'\\x27,\\x27'+custPhone+'\\x27,\\x27'+addrStr.replace(/'/g,'')+'\\x27)"><i class="fas fa-shipping-fast" style="margin-right:4px"></i>Shiprocket Copy</button>'
        +'</td></tr>';
    });
    document.getElementById('otbody').innerHTML=h;
  }).catch(function(e){document.getElementById('otbody').innerHTML='<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--red)">Error: '+e.message+'</td></tr>'});
}

function copyShiprocket(name,phone,addr){
  var txt='Name: '+name+'\\nPhone: '+phone+'\\nAddress: '+addr;
  if(navigator.clipboard){navigator.clipboard.writeText(txt).then(function(){toast('Copied for Shiprocket!','ok-green')}).catch(function(){fallbackCopy(txt)})}else{fallbackCopy(txt)}
}
function fallbackCopy(txt){var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Copied!','ok-green')}

function updateOrder(orderId,newStatus){
  if(!newStatus)return;
  fetch('/api/admin/orders/'+orderId,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:newStatus})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast('Order updated','ok-green');loadOrders()}else{toast(d.error||'Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
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
    h+='<div class="apc"><h3>'+p.name+' <span style="font-size:10px;color:var(--g400);font-weight:400">'+p.id+'</span></h3>';
    h+='<div class="apc-imgs">';for(var i=0;i<4;i++){h+='<div><img src="'+(imgs[i]||'')+'" alt="" id="pimg_'+idx+'_'+i+'" onerror="this.src=\\x27\\x27"><input value="'+(imgs[i]||'')+'" onchange="updImg('+idx+','+i+',this.value)" placeholder="Image '+(i+1)+'"></div>'}h+='</div>';
    h+='<div class="apc-row"><div style="flex:1"><label>Name</label><input value="'+p.name+'" id="pname_'+idx+'"></div></div>';
    h+='<div class="apc-row"><div style="flex:1"><label>Price</label><input type="number" value="'+p.price+'" id="pprice_'+idx+'"></div><div style="flex:1"><label>Compare</label><input type="number" value="'+(p.comparePrice||'')+'" id="pcmp_'+idx+'"></div></div>';
    h+='<div class="atog"><input type="checkbox" id="pstock_'+idx+'" '+(p.inStock!==false?'checked':'')+' ><span>In Stock</span></div>';
    h+='<button class="asave" onclick="saveProd('+idx+')">Save</button></div>';
  });document.getElementById('apcards').innerHTML=h;
}
function updImg(pi,ii,url){var imgs=prods[pi].images||[];while(imgs.length<4)imgs.push('');imgs[ii]=url;prods[pi].images=imgs;var el=document.getElementById('pimg_'+pi+'_'+ii);if(el)el.src=url}
function saveProd(idx){
  var p=prods[idx];var name=document.getElementById('pname_'+idx).value;var price=parseInt(document.getElementById('pprice_'+idx).value)||p.price;
  var cmp=parseInt(document.getElementById('pcmp_'+idx).value)||null;var inStock=document.getElementById('pstock_'+idx).checked;
  var imgs=(p.images||[]).filter(function(u){return u&&u.trim()});
  fetch('/api/admin/products/'+p.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,price:price,compare_price:cmp,in_stock:inStock,images:imgs})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast('"'+name+'" saved','ok-green')}else{toast(d.error||'Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}

/* ====== LEGAL ====== */
function initLegal(){var sel=document.getElementById('alsel');sel.innerHTML='';legals.forEach(function(l,i){var o=document.createElement('option');o.value=i;o.textContent=l.title;sel.appendChild(o)});switchLegal()}
function switchLegal(){curLeg=parseInt(document.getElementById('alsel').value);document.getElementById('alta').value=legals[curLeg].content;prevLegal()}
function prevLegal(){document.getElementById('alprev').innerHTML=document.getElementById('alta').value}
function saveLegal(){
  var l=legals[curLeg];var content=document.getElementById('alta').value;
  fetch('/api/admin/legal/'+l.slug,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:content,updated_at:new Date().toISOString().split('T')[0]})})
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
  fetch('/api/admin/size-chart/'+encodeURIComponent(label),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({chest:chest,length:len,sort_order:order})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast('"'+label+'" saved','ok-green');loadSizeChart()}else{toast(d.error||'Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}
function deleteSize(idx){
  var label=sizeData[idx].size_label;if(!label){sizeData.splice(idx,1);renderSizeChart();return}
  if(!confirm('Delete "'+label+'"?'))return;
  fetch('/api/admin/size-chart/'+encodeURIComponent(label),{method:'DELETE'}).then(function(r){return r.json()}).then(function(d){if(d.success){toast('Deleted','ok-green');loadSizeChart()}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
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
  fetch('/api/admin/instagram-feed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image_url:'',sort_order:igFeed.length})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast('Added','ok-green');loadIgFeed()}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}
function saveIgItem(idx){
  var item=igFeed[idx];if(!item||!item.id)return;
  fetch('/api/admin/instagram-feed/'+item.id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({image_url:item.image_url,link_url:item.link_url,caption:item.caption})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast('Saved','ok-green')}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}
function deleteIgItem(idx){
  var item=igFeed[idx];if(!item||!item.id)return;if(!confirm('Delete this feed item?'))return;
  fetch('/api/admin/instagram-feed/'+item.id,{method:'DELETE'}).then(function(r){return r.json()}).then(function(d){if(d.success){toast('Deleted','ok-green');loadIgFeed()}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}

/* ====== SETTINGS ====== */
function loadSettings(){
  fetch('/api/admin/settings').then(function(r){return r.json()}).then(function(d){
    var s=d.settings||{};
    document.getElementById('settMagic').checked=s.USE_MAGIC_CHECKOUT==='true';
    document.getElementById('settManager').value=s.MANAGER_EMAIL||'shop@intru.in';
    document.getElementById('settCodFee').value=s.COD_FEE||'99';
    document.getElementById('settIgFeed').checked=s.INSTAGRAM_FEED_ENABLED!=='false';
  }).catch(function(){});
}
function saveSetting(key,val){
  fetch('/api/admin/settings/'+encodeURIComponent(key),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:val})})
  .then(function(r){return r.json()}).then(function(d){if(d.success){toast(key+' updated','ok-green')}else{toast('Failed','err')}}).catch(function(e){toast('Error: '+e.message,'err')});
}
</script>`;

  return shell(
    'Admin — INTRU.IN',
    'Admin panel for intru.in store management.',
    body,
    { cls: 'admin-page', razorpayKeyId: opts.razorpayKeyId, googleClientId: opts.googleClientId, products, legalPages, useMagicCheckout: opts.useMagicCheckout }
  );
}
