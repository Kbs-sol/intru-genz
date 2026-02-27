import { shell } from '../components/shell'
import { STORE_CONFIG, type Product, type LegalPage } from '../data'

export function adminPage(opts: {
  razorpayKeyId?: string;
  googleClientId?: string;
  products: Product[];
  legalPages: LegalPage[];
}): string {
  const products = opts.products;
  const legalPages = opts.legalPages;
  // Serialise data for initial render (JS will fetch live data from API)
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
.atabs{display:flex;gap:0;margin-bottom:32px;border-bottom:2px solid var(--g100)}
.atab{padding:14px 24px;background:none;border:none;border-bottom:2px solid transparent;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g400);margin-bottom:-2px;transition:all .2s}.atab:hover{color:var(--bk)}.atab.act{color:var(--bk);border-bottom-color:var(--bk)}
.apan{display:none}.apan.act{display:block}
.otbl{width:100%;border-collapse:collapse;font-size:13px}
.otbl th{text-align:left;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g400);padding:12px 16px;border-bottom:2px solid var(--g100)}
.otbl td{padding:12px 16px;border-bottom:1px solid var(--g100);vertical-align:top}
.otbl tr:hover td{background:var(--g50)}
.ostatus{display:inline-block;padding:3px 10px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
.ost-pending{background:#fef3c7;color:#92400e}.ost-paid{background:#d1fae5;color:#065f46}.ost-shipped{background:#dbeafe;color:#1e40af}.ost-delivered{background:#d1fae5;color:#065f46}.ost-payment_failed{background:#fee2e2;color:#991b1b}.ost-cancelled{background:#fecaca;color:#991b1b}
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
.alprev h2{font-size:18px;font-weight:700;margin:24px 0 10px;text-transform:uppercase}
.alprev p{margin-bottom:12px}
.alprev ul{margin:8px 0 12px 20px}
.asrc{display:inline-flex;align-items:center;gap:6px;font-size:10px;padding:3px 10px;border-radius:3px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:16px}
.asrc-db{background:#d1fae5;color:#065f46}
.asrc-static{background:#fef3c7;color:#92400e}
.arefresh{padding:8px 16px;background:none;border:1.5px solid var(--g200);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:all .2s;border-radius:3px;margin-left:12px}.arefresh:hover{background:var(--bk);color:var(--wh);border-color:var(--bk)}
@media(max-width:768px){.apcards{grid-template-columns:1fr}.apc-imgs{grid-template-columns:repeat(2,1fr)}}
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
</div>

<!-- Orders Tab -->
<div class="apan act" id="tord">
<div style="display:flex;align-items:center;margin-bottom:16px">
<span class="asrc" id="ordSrc"></span>
<button class="arefresh" onclick="loadOrders()"><i class="fas fa-sync-alt" style="margin-right:4px"></i>Refresh</button>
</div>
<table class="otbl">
<thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
<tbody id="otbody"><tr><td colspan="6" style="text-align:center;padding:40px;color:var(--g400)">Loading orders...</td></tr></tbody>
</table>
</div>

<!-- Products Tab -->
<div class="apan" id="tprod">
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
</div></div>

<script>
var prods=${pj};
var legals=${lj};
var curLeg=0;
var adminToken=null;

/* ====== AUTH ====== */
function doLogin(){
  var pwd=document.getElementById('apwd').value;
  fetch('/api/admin/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pwd})})
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      adminToken=pwd;
      sessionStorage.setItem('iadm','1');
      sessionStorage.setItem('iadm_t',pwd);
      document.getElementById('alogin').style.display='none';
      document.getElementById('adsh').style.display='block';
      initAdmin();
    } else {
      document.getElementById('aerr').style.display='block';
      document.getElementById('apwd').value='';
      document.getElementById('apwd').focus();
    }
  }).catch(function(){
    document.getElementById('aerr').style.display='block';
  });
}
function doLogout(){sessionStorage.removeItem('iadm');sessionStorage.removeItem('iadm_t');location.reload()}

/* Auto-login */
if(sessionStorage.getItem('iadm')==='1'){
  document.addEventListener('DOMContentLoaded',function(){
    adminToken=sessionStorage.getItem('iadm_t');
    document.getElementById('alogin').style.display='none';
    document.getElementById('adsh').style.display='block';
    initAdmin();
  });
}

function showTab(btn,id){
  document.querySelectorAll('.atab').forEach(function(t){t.classList.remove('act')});
  document.querySelectorAll('.apan').forEach(function(p){p.classList.remove('act')});
  btn.classList.add('act');
  document.getElementById(id).classList.add('act');
}

/* ====== INIT ====== */
function initAdmin(){
  loadOrders();
  loadProducts();
  initLegal();
}

/* ====== ORDERS (live from API) ====== */
function loadOrders(){
  document.getElementById('otbody').innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--g400)">Loading...</td></tr>';
  fetch('/api/admin/orders')
  .then(function(r){return r.json()})
  .then(function(d){
    var src=document.getElementById('ordSrc');
    src.textContent=d.source==='supabase'?'Live Database':'No Database';
    src.className='asrc '+(d.source==='supabase'?'asrc-db':'asrc-static');
    var orders=d.orders||[];
    if(!orders.length){
      document.getElementById('otbody').innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--g400)">No orders yet.</td></tr>';
      return;
    }
    var h='';
    orders.forEach(function(o){
      var items=(o.items||[]).map(function(it){return(it.name||it.productId)+(it.size?' ('+it.size+')':'')+(it.quantity?' x'+it.quantity:'')}).join(', ');
      var st=o.status||'pending';
      h+='<tr>'
        +'<td style="font-weight:700;font-size:11px">#'+(o.razorpay_order_id||o.id||'').slice(-8).toUpperCase()+'</td>'
        +'<td>'+(o.customer_email||'—')+'</td>'
        +'<td style="font-size:12px;max-width:200px">'+items+'</td>'
        +'<td style="font-weight:700">Rs.'+(o.total||0).toLocaleString('en-IN')+'</td>'
        +'<td><span class="ostatus ost-'+st+'">'+st+'</span></td>'
        +'<td><select class="oselect" onchange="updateOrder(\\x27'+o.id+'\\x27,this.value)">'
        +'<option value="">Change...</option>'
        +'<option value="paid">Paid</option>'
        +'<option value="processing">Processing</option>'
        +'<option value="shipped">Shipped</option>'
        +'<option value="delivered">Delivered</option>'
        +'<option value="cancelled">Cancelled</option>'
        +'</select></td></tr>';
    });
    document.getElementById('otbody').innerHTML=h;
  }).catch(function(e){
    document.getElementById('otbody').innerHTML='<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--red)">Error: '+e.message+'</td></tr>';
  });
}

function updateOrder(orderId,newStatus){
  if(!newStatus)return;
  fetch('/api/admin/orders/'+orderId,{
    method:'PATCH',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({status:newStatus})
  }).then(function(r){return r.json()})
  .then(function(d){
    if(d.success){toast('Order updated to '+newStatus,'ok-green');loadOrders()}
    else{toast(d.error||'Update failed','err')}
  }).catch(function(e){toast('Error: '+e.message,'err')});
}

/* ====== PRODUCTS (live from API, save via upsert) ====== */
function loadProducts(){
  fetch('/api/products')
  .then(function(r){return r.json()})
  .then(function(d){
    var src=document.getElementById('prodSrc');
    src.textContent=d.source==='static'?'Static Fallback':'Live Database ('+d.source+')';
    src.className='asrc '+(d.source==='static'?'asrc-static':'asrc-db');
    prods=d.products||[];
    renderProdCards();
  }).catch(function(e){toast('Error loading products: '+e.message,'err');renderProdCards()});
}

function renderProdCards(){
  var h='';
  prods.forEach(function(p,idx){
    var imgs=p.images||[];
    // Ensure 4 image slots
    while(imgs.length<4)imgs.push('');
    h+='<div class="apc"><h3>'+p.name+' <span style="font-size:10px;color:var(--g400);font-weight:400">ID: '+p.id+'</span></h3>';
    h+='<div class="apc-imgs">';
    for(var i=0;i<4;i++){
      h+='<div><img src="'+(imgs[i]||'')+'" alt="Image '+(i+1)+'" id="pimg_'+idx+'_'+i+'" onerror="this.style.background=\\x27var(--g100)\\x27;this.src=\\x27\\x27">';
      h+='<input type="text" value="'+(imgs[i]||'')+'" onchange="updImg('+idx+','+i+',this.value)" placeholder="Image '+(i+1)+' URL"></div>';
    }
    h+='</div>';
    h+='<div class="apc-row"><div style="flex:1"><label>Name</label><input type="text" value="'+p.name+'" id="pname_'+idx+'"></div></div>';
    h+='<div class="apc-row"><div style="flex:1"><label>Price (INR)</label><input type="number" value="'+p.price+'" id="pprice_'+idx+'"></div>';
    h+='<div style="flex:1"><label>Compare Price</label><input type="number" value="'+(p.comparePrice||'')+'" id="pcmp_'+idx+'"></div></div>';
    h+='<div class="atog"><input type="checkbox" id="pstock_'+idx+'" '+(p.inStock!==false?'checked':'')+' ><span>In Stock</span></div>';
    h+='<button class="asave" onclick="saveProd('+idx+')">Save to Supabase</button>';
    h+='</div>';
  });
  document.getElementById('apcards').innerHTML=h;
}

function updImg(pi,ii,url){
  var imgs=prods[pi].images||[];
  while(imgs.length<4)imgs.push('');
  imgs[ii]=url;
  prods[pi].images=imgs;
  var el=document.getElementById('pimg_'+pi+'_'+ii);
  if(el)el.src=url;
}

function saveProd(idx){
  var p=prods[idx];
  var name=document.getElementById('pname_'+idx).value;
  var price=parseInt(document.getElementById('pprice_'+idx).value)||p.price;
  var cmp=parseInt(document.getElementById('pcmp_'+idx).value)||null;
  var inStock=document.getElementById('pstock_'+idx).checked;
  var imgs=(p.images||[]).filter(function(u){return u&&u.trim()});

  var payload={name:name,price:price,compare_price:cmp,in_stock:inStock,images:imgs};

  var btn=event.target;
  btn.disabled=true;btn.textContent='SAVING...';

  fetch('/api/admin/products/'+p.id,{
    method:'PATCH',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  }).then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      toast('Product "'+name+'" saved to Supabase','ok-green');
      prods[idx].name=name;prods[idx].price=price;prods[idx].comparePrice=cmp;prods[idx].inStock=inStock;
    } else {
      toast(d.error||'Save failed — is Supabase configured?','err');
    }
  }).catch(function(e){toast('Error: '+e.message,'err')})
  .finally(function(){btn.disabled=false;btn.textContent='SAVE TO SUPABASE'});
}

/* ====== LEGAL (live save to Supabase) ====== */
function initLegal(){
  var sel=document.getElementById('alsel');
  sel.innerHTML='';
  legals.forEach(function(l,i){
    var o=document.createElement('option');o.value=i;o.textContent=l.title;sel.appendChild(o);
  });
  switchLegal();
}

function switchLegal(){
  curLeg=parseInt(document.getElementById('alsel').value);
  document.getElementById('alta').value=legals[curLeg].content;
  prevLegal();
}
function prevLegal(){document.getElementById('alprev').innerHTML=document.getElementById('alta').value}

function saveLegal(){
  var l=legals[curLeg];
  var content=document.getElementById('alta').value;
  fetch('/api/admin/legal/'+l.slug,{
    method:'PATCH',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({content:content,updated_at:new Date().toISOString().split('T')[0]})
  }).then(function(r){return r.json()})
  .then(function(d){
    if(d.success){
      legals[curLeg].content=content;
      toast('Legal page "'+l.title+'" saved to Supabase','ok-green');
    } else {
      toast(d.error||'Save failed — is Supabase configured?','err');
    }
  }).catch(function(e){toast('Error: '+e.message,'err')});
}
</script>`;

  return shell(
    'Admin — INTRU.IN',
    'Admin panel for intru.in store management.',
    body,
    { cls: 'admin-page', razorpayKeyId: opts.razorpayKeyId, googleClientId: opts.googleClientId, products, legalPages }
  );
}
