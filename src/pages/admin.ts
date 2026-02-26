import { shell } from '../components/shell'
import { STORE_CONFIG, PRODUCTS, LEGAL_PAGES } from '../data'

export function adminPage(env?: { razorpayKeyId?: string; googleClientId?: string }): string {
  const pj = JSON.stringify(PRODUCTS.map(p => ({ id: p.id, slug: p.slug, name: p.name, price: p.price, comparePrice: p.comparePrice, images: p.images, sizes: p.sizes, inStock: p.inStock })));
  const lj = JSON.stringify(LEGAL_PAGES.map(l => ({ slug: l.slug, title: l.title, content: l.content, updatedAt: l.updatedAt })));

  const body = `<style>
.adm{max-width:1100px;margin:0 auto;padding:40px 24px 100px}
/* Login */
.alog{max-width:400px;margin:120px auto;text-align:center}
.alog h1{font-family:var(--head);font-size:28px;text-transform:uppercase;letter-spacing:-.02em;margin-bottom:8px}
.alog p{font-size:13px;color:var(--g400);margin-bottom:28px}
.ainp{width:100%;padding:14px 18px;border:1.5px solid var(--g200);font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;margin-bottom:12px;background:var(--wh)}.ainp:focus{border-color:var(--bk)}
.abtn{width:100%;padding:16px;background:var(--bk);color:var(--wh);border:none;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;transition:all .2s}.abtn:hover{background:var(--g600)}
.aerr{font-size:12px;color:#e53e3e;margin-top:8px;display:none}
/* Dashboard */
.adsh{display:none}
.ahdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;padding-bottom:20px;border-bottom:1px solid var(--g100)}
.ahdr h1{font-family:var(--head);font-size:24px;text-transform:uppercase;letter-spacing:-.02em}
.aout{padding:10px 20px;background:none;border:1.5px solid var(--g200);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;transition:all .2s;border-radius:4px}.aout:hover{background:var(--bk);color:var(--wh);border-color:var(--bk)}
/* Tabs */
.atabs{display:flex;gap:0;margin-bottom:32px;border-bottom:2px solid var(--g100)}
.atab{padding:14px 24px;background:none;border:none;border-bottom:2px solid transparent;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g400);margin-bottom:-2px;transition:all .2s}.atab:hover{color:var(--bk)}.atab.act{color:var(--bk);border-bottom-color:var(--bk)}
.apan{display:none}.apan.act{display:block}
/* Orders */
.otbl{width:100%;border-collapse:collapse;font-size:13px}
.otbl th{text-align:left;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--g400);padding:12px 16px;border-bottom:2px solid var(--g100)}
.otbl td{padding:12px 16px;border-bottom:1px solid var(--g100);vertical-align:top}
.otbl tr:hover td{background:var(--g50)}
.ostatus{display:inline-block;padding:3px 10px;border-radius:3px;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
.ost-pending{background:#fef3c7;color:#92400e}.ost-shipped{background:#dbeafe;color:#1e40af}.ost-delivered{background:#d1fae5;color:#065f46}
.odet{max-height:0;overflow:hidden;transition:max-height .3s;padding:0 16px}.odet.open{max-height:400px;padding:12px 16px}
/* Product cards */
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
.asave{padding:10px 24px;background:var(--bk);color:var(--wh);border:none;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;transition:all .2s;border-radius:3px}.asave:hover{background:var(--g600)}
.atog{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;font-weight:600}
.atog input[type=checkbox]{width:16px;height:16px}
/* Legal editor */
.alsel{padding:10px 16px;border:1.5px solid var(--g200);font-size:13px;font-family:inherit;margin-bottom:16px;border-radius:4px;background:var(--wh)}
.alta{width:100%;min-height:400px;padding:16px;border:1.5px solid var(--g200);font-size:13px;font-family:'SF Mono',Consolas,monospace;line-height:1.7;resize:vertical;border-radius:4px}.alta:focus{border-color:var(--bk);outline:none}
.alprev{border:1.5px solid var(--g100);border-radius:8px;padding:24px;margin-top:16px;font-size:14px;line-height:1.8;max-height:500px;overflow-y:auto}
.alprev h2{font-size:18px;font-weight:700;margin:24px 0 10px;text-transform:uppercase}
.alprev p{margin-bottom:12px}
.alprev ul{margin:8px 0 12px 20px}
@media(max-width:768px){.apcards{grid-template-columns:1fr}.apc-imgs{grid-template-columns:repeat(2,1fr)}}
</style>

<div class="adm">
<!-- Login Screen -->
<div class="alog" id="alogin">
<h1>Admin Panel</h1>
<p>Enter the admin password to continue.</p>
<form onsubmit="event.preventDefault();doLogin()">
<input type="password" class="ainp" id="apwd" placeholder="Password" autocomplete="off">
<button type="submit" class="abtn">Authenticate</button>
</form>
<p class="aerr" id="aerr">Incorrect password. Try again.</p>
</div>

<!-- Dashboard -->
<div class="adsh" id="adsh">
<div class="ahdr"><h1>Admin &mdash; intru.in</h1><button class="aout" onclick="doLogout()">Sign Out</button></div>
<div class="atabs">
<button class="atab act" onclick="showTab(this,'tord')">Orders</button>
<button class="atab" onclick="showTab(this,'tprod')">Products</button>
<button class="atab" onclick="showTab(this,'tleg')">Legal</button>
</div>

<!-- Orders Tab -->
<div class="apan act" id="tord">
<table class="otbl">
<thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
<tbody id="otbody">
<tr><td>#INR-1001</td><td>demo@gmail.com</td><td>Essential Oversized Tee (M) x1</td><td>Rs.1,299</td><td><span class="ostatus ost-pending">Pending</span></td><td><button class="asave" onclick="alert('Update status in production with Supabase')">Update</button></td></tr>
<tr><td>#INR-1002</td><td>test@gmail.com</td><td>Midnight Cargo Joggers (L) x1, Structured Minimal Hoodie (XL) x1</td><td>Rs.4,498</td><td><span class="ostatus ost-shipped">Shipped</span></td><td><button class="asave" onclick="alert('Update status in production with Supabase')">Update</button></td></tr>
<tr><td>#INR-1003</td><td>user@gmail.com</td><td>Monochrome Zip Jacket (M) x2</td><td>Rs.5,998</td><td><span class="ostatus ost-delivered">Delivered</span></td><td><button class="asave" onclick="alert('Update status in production with Supabase')">Update</button></td></tr>
</tbody>
</table>
<p style="font-size:11px;color:var(--g400);margin-top:16px;text-align:center">Demo data shown. Connect Supabase for live order management.</p>
</div>

<!-- Products Tab -->
<div class="apan" id="tprod">
<div class="apcards" id="apcards"></div>
</div>

<!-- Legal Tab -->
<div class="apan" id="tleg">
<select class="alsel" id="alsel" onchange="switchLegal()"></select>
<textarea class="alta" id="alta" oninput="prevLegal()"></textarea>
<div class="alprev" id="alprev"></div>
<button class="asave" style="margin-top:16px" onclick="saveLegal()">Save Changes</button>
<p style="font-size:11px;color:var(--g400);margin-top:8px">Changes are saved locally. Connect Supabase for persistent storage in production.</p>
</div>
</div></div>

<script>
var AP='${STORE_CONFIG.adminPassword}';
var prods=${pj};
var legals=${lj};
var curLeg=0;

function doLogin(){
  var pwd=document.getElementById('apwd').value;
  if(pwd===AP){
    sessionStorage.setItem('iadm','1');
    document.getElementById('alogin').style.display='none';
    document.getElementById('adsh').style.display='block';
    initAdmin();
  } else {
    document.getElementById('aerr').style.display='block';
    document.getElementById('apwd').value='';
    document.getElementById('apwd').focus();
  }
}
function doLogout(){sessionStorage.removeItem('iadm');location.reload()}
if(sessionStorage.getItem('iadm')==='1'){document.addEventListener('DOMContentLoaded',function(){doLogin();document.getElementById('apwd').value=AP})}

function showTab(btn,id){
  document.querySelectorAll('.atab').forEach(function(t){t.classList.remove('act')});
  document.querySelectorAll('.apan').forEach(function(p){p.classList.remove('act')});
  btn.classList.add('act');
  document.getElementById(id).classList.add('act');
}

function initAdmin(){
  // Products
  var h='';
  prods.forEach(function(p,idx){
    h+='<div class="apc"><h3>'+p.name+'</h3>';
    h+='<div class="apc-imgs">';
    p.images.forEach(function(img,i){
      h+='<div><img src="'+img+'" alt="Image '+(i+1)+'" id="pimg_'+idx+'_'+i+'"><input type="text" value="'+img+'" onchange="updImg('+idx+','+i+',this.value)" placeholder="Image '+(i+1)+' URL"></div>';
    });
    h+='</div>';
    h+='<div class="apc-row"><div style="flex:1"><label>Price (INR)</label><input type="number" value="'+p.price+'" onchange="prods['+idx+'].price=parseInt(this.value)"></div>';
    h+='<div style="flex:1"><label>Compare Price</label><input type="number" value="'+(p.comparePrice||'')+'" onchange="prods['+idx+'].comparePrice=parseInt(this.value)||undefined"></div></div>';
    h+='<div class="atog"><input type="checkbox" '+(p.inStock?'checked':'')+' onchange="prods['+idx+'].inStock=this.checked"><span>In Stock</span></div>';
    h+='<button class="asave" onclick="saveProd('+idx+')">Save Product</button>';
    h+='</div>';
  });
  document.getElementById('apcards').innerHTML=h;

  // Legal
  var sel=document.getElementById('alsel');
  sel.innerHTML='';
  legals.forEach(function(l,i){
    var o=document.createElement('option');o.value=i;o.textContent=l.title;sel.appendChild(o);
  });
  switchLegal();
}

function updImg(pi,ii,url){
  prods[pi].images[ii]=url;
  document.getElementById('pimg_'+pi+'_'+ii).src=url;
}
function saveProd(idx){toast('Product "'+prods[idx].name+'" saved locally. Connect Supabase for production.')}

function switchLegal(){
  curLeg=parseInt(document.getElementById('alsel').value);
  document.getElementById('alta').value=legals[curLeg].content;
  prevLegal();
}
function prevLegal(){document.getElementById('alprev').innerHTML=document.getElementById('alta').value}
function saveLegal(){legals[curLeg].content=document.getElementById('alta').value;toast('Legal page "'+legals[curLeg].title+'" saved locally.')}
</script>`;

  return shell(
    'Admin — INTRU.IN',
    'Admin panel for intru.in store management.',
    body,
    { cls: 'admin-page', razorpayKeyId: env?.razorpayKeyId, googleClientId: env?.googleClientId }
  );
}
