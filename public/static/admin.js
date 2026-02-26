/* ═══════════════════════════════════════════════════
   intru.in — Admin Panel JavaScript
   ═══════════════════════════════════════════════════ */

let adminToken = localStorage.getItem('intru_admin_token') || '';

// ─── Login ───
async function adminLogin() {
  const password = document.getElementById('adminPassword')?.value;
  const errorEl = document.getElementById('loginError');

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();

    if (data.success) {
      adminToken = data.token;
      localStorage.setItem('intru_admin_token', adminToken);
      showDashboard();
    } else {
      if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Invalid password'; }
    }
  } catch (e) {
    if (errorEl) { errorEl.style.display = 'block'; errorEl.textContent = 'Connection error'; }
  }
}

function adminLogout() {
  adminToken = '';
  localStorage.removeItem('intru_admin_token');
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminLoginScreen').style.display = 'flex';
}

function authHeaders() {
  return { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' };
}

// ─── Dashboard ───
async function showDashboard() {
  document.getElementById('adminLoginScreen').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'flex';
  loadOrders();
}

// ─── Tabs ───
function showTab(name) {
  document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`tab-${name}`).style.display = 'block';
  event.currentTarget.classList.add('active');

  if (name === 'orders') loadOrders();
  if (name === 'products') loadProducts();
  if (name === 'legal') loadLegal();
  if (name === 'settings') loadSettings();
}

// ─── Toast ───
function adminToast(msg) {
  const el = document.getElementById('adminToast');
  if (el) {
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }
}

// ═══ ORDERS ═══
async function loadOrders() {
  try {
    const res = await fetch('/api/admin/orders', { headers: authHeaders() });
    if (res.status === 401) { adminLogout(); return; }
    const data = await res.json();
    const orders = data.orders || [];

    document.getElementById('ordersCount').textContent = orders.length;

    if (orders.length === 0) {
      document.getElementById('ordersBody').innerHTML = '';
      document.getElementById('ordersEmpty').style.display = 'block';
      return;
    }

    document.getElementById('ordersEmpty').style.display = 'none';
    document.getElementById('ordersBody').innerHTML = orders.map(o => {
      const items = JSON.parse(o.items || '[]');
      const itemNames = items.map(i => `${i.name} (×${i.quantity})`).join(', ');
      const statusOptions = ['received', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s =>
        `<option value="${s}" ${o.order_status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
      ).join('');
      const date = new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      return `<tr>
        <td><strong>${o.order_id}</strong></td>
        <td>${o.customer_name}<br><small style="color:#888;">${o.customer_email}</small></td>
        <td style="max-width:200px;"><small>${itemNames}</small></td>
        <td><strong>₹${o.total?.toLocaleString('en-IN')}</strong></td>
        <td><span style="color:${o.payment_status === 'paid' ? '#22c55e' : '#f59e0b'}">${o.payment_status}</span></td>
        <td>
          <select onchange="updateOrderStatus(${o.id}, this.value)">${statusOptions}</select>
        </td>
        <td><small>${date}</small></td>
        <td><button onclick="alert('Address: ${(o.shipping_address || 'N/A').replace(/'/g, "\\'")}')" class="btn-outline btn-sm">Details</button></td>
      </tr>`;
    }).join('');
  } catch (e) {
    console.error('Load orders error:', e);
  }
}

async function updateOrderStatus(id, status) {
  try {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ order_status: status })
    });
    adminToast('Order status updated');
  } catch (e) { adminToast('Error updating order'); }
}

// ═══ PRODUCTS ═══
async function loadProducts() {
  try {
    const res = await fetch('/api/admin/products', { headers: authHeaders() });
    if (res.status === 401) { adminLogout(); return; }
    const data = await res.json();
    const products = data.products || [];

    document.getElementById('productsList').innerHTML = products.map(p => {
      const imgs = JSON.parse(p.images || '[]');
      return `
        <div class="admin-product-card" id="product-${p.id}">
          <img src="${imgs[0] || ''}" alt="${p.name}">
          <div>
            <div class="admin-product-fields">
              <div>
                <label>Name</label>
                <input type="text" value="${escHtml(p.name)}" id="pName-${p.id}">
              </div>
              <div>
                <label>Price (₹)</label>
                <input type="number" value="${p.price}" id="pPrice-${p.id}">
              </div>
              <div>
                <label>Compare Price (₹)</label>
                <input type="number" value="${p.compare_price || ''}" id="pCompare-${p.id}">
              </div>
              <div>
                <label>In Stock</label>
                <select id="pStock-${p.id}">
                  <option value="1" ${p.in_stock ? 'selected' : ''}>Yes</option>
                  <option value="0" ${!p.in_stock ? 'selected' : ''}>No</option>
                </select>
              </div>
              <div class="full-width">
                <label>Short Description</label>
                <input type="text" value="${escHtml(p.short_description || '')}" id="pShort-${p.id}">
              </div>
              <div class="full-width">
                <label>Description</label>
                <textarea rows="2" id="pDesc-${p.id}">${escHtml(p.description)}</textarea>
              </div>
              <div class="full-width">
                <label>Image URLs (one per line)</label>
                <textarea rows="4" id="pImgs-${p.id}">${imgs.join('\\n')}</textarea>
              </div>
              <div>
                <button class="btn-primary btn-sm" onclick="saveProduct(${p.id})"><i class="fas fa-save"></i> Save</button>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
  } catch (e) { console.error('Load products error:', e); }
}

async function saveProduct(id) {
  try {
    const name = document.getElementById(`pName-${id}`)?.value;
    const price = parseFloat(document.getElementById(`pPrice-${id}`)?.value);
    const compare_price = parseFloat(document.getElementById(`pCompare-${id}`)?.value) || null;
    const in_stock = document.getElementById(`pStock-${id}`)?.value === '1';
    const short_description = document.getElementById(`pShort-${id}`)?.value;
    const description = document.getElementById(`pDesc-${id}`)?.value;
    const imagesText = document.getElementById(`pImgs-${id}`)?.value || '';
    const images = imagesText.split('\n').map(u => u.trim()).filter(u => u);

    await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ name, price, compare_price, in_stock, short_description, description, images })
    });
    adminToast('Product saved');
  } catch (e) { adminToast('Error saving product'); }
}

// ═══ LEGAL PAGES ═══
async function loadLegal() {
  try {
    const res = await fetch('/api/admin/legal', { headers: authHeaders() });
    if (res.status === 401) { adminLogout(); return; }
    const data = await res.json();
    const pages = data.pages || [];

    document.getElementById('legalList').innerHTML = pages.map(p => `
      <div class="admin-legal-card" id="legal-${p.id}">
        <h3>
          <span>${escHtml(p.title)} <small style="color:#888;">/${p.slug}</small></span>
          <button class="btn-outline btn-sm" onclick="deleteLegal(${p.id}, '${escHtml(p.title)}')"><i class="fas fa-trash"></i></button>
        </h3>
        <div class="form-group">
          <label>Title</label>
          <input type="text" value="${escHtml(p.title)}" id="lTitle-${p.id}">
        </div>
        <div class="form-group">
          <label>Content (HTML)</label>
          <textarea rows="8" id="lContent-${p.id}">${escHtml(p.content)}</textarea>
        </div>
        <div class="form-group">
          <label>Active</label>
          <select id="lActive-${p.id}">
            <option value="1" ${p.is_active ? 'selected' : ''}>Yes</option>
            <option value="0" ${!p.is_active ? 'selected' : ''}>No</option>
          </select>
        </div>
        <button class="btn-primary btn-sm" onclick="saveLegal(${p.id})"><i class="fas fa-save"></i> Save</button>
      </div>
    `).join('');
  } catch (e) { console.error('Load legal error:', e); }
}

function showNewLegalForm() {
  document.getElementById('newLegalForm').style.display = 'block';
}

async function createLegalPage() {
  try {
    const slug = document.getElementById('newLegalSlug')?.value;
    const title = document.getElementById('newLegalTitle')?.value;
    const content = document.getElementById('newLegalContent')?.value;

    if (!slug || !title || !content) { adminToast('Fill in all fields'); return; }

    await fetch('/api/admin/legal', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ slug, title, content })
    });
    adminToast('Page created');
    document.getElementById('newLegalForm').style.display = 'none';
    loadLegal();
  } catch (e) { adminToast('Error creating page'); }
}

async function saveLegal(id) {
  try {
    const title = document.getElementById(`lTitle-${id}`)?.value;
    const content = document.getElementById(`lContent-${id}`)?.value;
    const is_active = document.getElementById(`lActive-${id}`)?.value === '1';

    await fetch(`/api/admin/legal/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ title, content, is_active })
    });
    adminToast('Page saved');
  } catch (e) { adminToast('Error saving page'); }
}

async function deleteLegal(id, title) {
  if (!confirm(`Delete "${title}"?`)) return;
  try {
    await fetch(`/api/admin/legal/${id}`, { method: 'DELETE', headers: authHeaders() });
    adminToast('Page deleted');
    loadLegal();
  } catch (e) { adminToast('Error deleting page'); }
}

// ═══ SETTINGS ═══
async function loadSettings() {
  try {
    const res = await fetch('/api/admin/settings', { headers: authHeaders() });
    if (res.status === 401) { adminLogout(); return; }
    const data = await res.json();
    const s = data.settings || {};

    setVal('settAdminPassword', s.admin_password);
    setVal('settRazorpayKeyId', s.razorpay_key_id);
    setVal('settRazorpayKeySecret', s.razorpay_key_secret);
    setVal('settBrandName', s.brand_name);
    setVal('settBrandTagline', s.brand_tagline);
    setVal('settFreeShipping', s.free_shipping_threshold);
    setVal('settShippingFee', s.flat_shipping_fee);
    setVal('settInstagram', s.instagram_url);
    setVal('settContactEmail', s.contact_email);
  } catch (e) { console.error('Load settings error:', e); }
}

async function saveSettings() {
  try {
    const settings = {
      admin_password: getVal('settAdminPassword'),
      razorpay_key_id: getVal('settRazorpayKeyId'),
      razorpay_key_secret: getVal('settRazorpayKeySecret'),
      brand_name: getVal('settBrandName'),
      brand_tagline: getVal('settBrandTagline'),
      free_shipping_threshold: getVal('settFreeShipping'),
      flat_shipping_fee: getVal('settShippingFee'),
      instagram_url: getVal('settInstagram'),
      contact_email: getVal('settContactEmail')
    };

    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ settings })
    });
    adminToast('Settings saved');
  } catch (e) { adminToast('Error saving settings'); }
}

// ─── Helpers ───
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}

function getVal(id) {
  return document.getElementById(id)?.value || '';
}

// ─── Init ───
if (adminToken) {
  showDashboard();
}
