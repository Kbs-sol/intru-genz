import { renderShell } from '../components/shell'
import { PRODUCTS, LEGAL_PAGES, STORE_CONFIG } from '../data'

export function renderAdminPage(): string {
  const body = `
  <style>
    .admin-gate {
      max-width: 400px; margin: 100px auto; padding: 0 24px; text-align: center;
    }
    .admin-gate h1 {
      font-family: var(--font-serif); font-size: 28px; margin-bottom: 8px;
    }
    .admin-gate p { color: var(--gray-400); font-size: 14px; margin-bottom: 32px; }
    .admin-input {
      width: 100%; padding: 14px 16px; border: 1.5px solid var(--gray-200);
      font-size: 14px; font-family: inherit; margin-bottom: 16px;
      outline: none; transition: border-color 0.2s; text-align: center;
      letter-spacing: 4px;
    }
    .admin-input:focus { border-color: var(--black); }
    .admin-submit {
      width: 100%; padding: 16px; background: var(--black); color: var(--white);
      border: none; font-size: 13px; font-weight: 600; letter-spacing: 1px;
      text-transform: uppercase; cursor: pointer; transition: all 0.2s;
    }
    .admin-submit:hover { background: var(--gray-600); }
    .admin-error { color: #e53e3e; font-size: 13px; margin-top: 12px; display: none; }

    /* Admin Dashboard */
    .admin-dashboard { display: none; max-width: 1280px; margin: 0 auto; padding: 40px 24px 80px; }
    .admin-dashboard.visible { display: block; }
    .admin-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 40px;
    }
    .admin-header h1 { font-family: var(--font-serif); font-size: 28px; }
    .admin-logout {
      padding: 10px 20px; border: 1px solid var(--gray-200);
      background: none; font-size: 12px; font-weight: 600;
      letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
      transition: all 0.2s;
    }
    .admin-logout:hover { background: var(--gray-50); }

    /* Tabs */
    .admin-tabs {
      display: flex; gap: 0; border-bottom: 1px solid var(--gray-200);
      margin-bottom: 32px; overflow-x: auto;
    }
    .admin-tab {
      padding: 12px 24px; background: none; border: none;
      font-size: 13px; font-weight: 500; color: var(--gray-400);
      cursor: pointer; transition: all 0.2s; white-space: nowrap;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
    }
    .admin-tab.active { color: var(--black); border-bottom-color: var(--black); font-weight: 600; }
    .admin-tab:hover { color: var(--black); }

    .admin-panel { display: none; }
    .admin-panel.active { display: block; }

    /* Cards */
    .admin-card {
      border: 1px solid var(--gray-100); border-radius: 12px;
      padding: 24px; margin-bottom: 16px; background: var(--white);
      transition: box-shadow 0.2s;
    }
    .admin-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .admin-card-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    }
    .admin-card-title { font-size: 16px; font-weight: 600; }
    .admin-card-badge {
      font-size: 11px; font-weight: 600; padding: 4px 12px;
      border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .badge-green { background: #f0fdf4; color: #16a34a; }
    .badge-yellow { background: #fefce8; color: #ca8a04; }
    .badge-gray { background: var(--gray-50); color: var(--gray-500); }

    /* Product Editor */
    .product-edit-row {
      display: grid; grid-template-columns: 80px 1fr; gap: 16px;
      align-items: start; margin-bottom: 16px;
    }
    .product-edit-thumb {
      width: 80px; height: 100px; object-fit: cover; border-radius: 8px;
      background: var(--gray-50);
    }
    .product-edit-fields { display: grid; gap: 8px; }
    .admin-field-group { display: grid; grid-template-columns: 120px 1fr; gap: 8px; align-items: center; }
    .admin-field-label {
      font-size: 12px; font-weight: 600; color: var(--gray-400);
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .admin-field-input {
      width: 100%; padding: 8px 12px; border: 1px solid var(--gray-200);
      font-size: 13px; font-family: inherit; border-radius: 4px;
      outline: none; transition: border-color 0.2s;
    }
    .admin-field-input:focus { border-color: var(--black); }

    /* Legal Editor */
    .legal-editor {
      width: 100%; min-height: 300px; padding: 16px;
      border: 1px solid var(--gray-200); border-radius: 8px;
      font-size: 14px; font-family: inherit; line-height: 1.7;
      resize: vertical; outline: none;
    }
    .legal-editor:focus { border-color: var(--black); }

    .admin-save-btn {
      padding: 12px 24px; background: var(--black); color: var(--white);
      border: none; font-size: 12px; font-weight: 600;
      letter-spacing: 1px; text-transform: uppercase;
      cursor: pointer; transition: all 0.2s; border-radius: 4px;
    }
    .admin-save-btn:hover { background: var(--gray-600); }

    /* Stats */
    .admin-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
      margin-bottom: 32px;
    }
    .admin-stat {
      border: 1px solid var(--gray-100); border-radius: 12px;
      padding: 20px; text-align: center;
    }
    .admin-stat-value { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .admin-stat-label { font-size: 12px; color: var(--gray-400); text-transform: uppercase; letter-spacing: 1px; }

    /* Orders table */
    .orders-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .orders-table th {
      text-align: left; padding: 12px 16px; font-size: 11px;
      font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
      color: var(--gray-400); border-bottom: 1px solid var(--gray-200);
    }
    .orders-table td { padding: 14px 16px; border-bottom: 1px solid var(--gray-100); }

    @media (max-width: 768px) {
      .admin-stats { grid-template-columns: repeat(2, 1fr); }
      .admin-field-group { grid-template-columns: 1fr; }
      .product-edit-row { grid-template-columns: 1fr; }
    }
  </style>

  <!-- Login Gate -->
  <div class="admin-gate" id="adminGate">
    <h1>Admin Access</h1>
    <p>Enter the admin password to continue</p>
    <form onsubmit="event.preventDefault(); verifyAdmin();">
      <input class="admin-input" type="password" id="adminPassword" placeholder="••••••" autofocus>
      <button class="admin-submit" type="submit">Access Dashboard</button>
    </form>
    <p class="admin-error" id="adminError">Invalid password. Try again.</p>
  </div>

  <!-- Admin Dashboard -->
  <div class="admin-dashboard" id="adminDashboard">
    <div class="admin-header">
      <h1>Dashboard</h1>
      <button class="admin-logout" onclick="logoutAdmin()">Logout</button>
    </div>

    <!-- Stats -->
    <div class="admin-stats">
      <div class="admin-stat">
        <div class="admin-stat-value">6</div>
        <div class="admin-stat-label">Products</div>
      </div>
      <div class="admin-stat">
        <div class="admin-stat-value">0</div>
        <div class="admin-stat-label">Orders</div>
      </div>
      <div class="admin-stat">
        <div class="admin-stat-value">${STORE_CONFIG.currencySymbol}0</div>
        <div class="admin-stat-label">Revenue</div>
      </div>
      <div class="admin-stat">
        <div class="admin-stat-value">4</div>
        <div class="admin-stat-label">Legal Pages</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="admin-tabs">
      <button class="admin-tab active" onclick="switchTab('orders')">Orders</button>
      <button class="admin-tab" onclick="switchTab('products')">Products</button>
      <button class="admin-tab" onclick="switchTab('legal')">Legal Pages</button>
    </div>

    <!-- Orders Panel -->
    <div class="admin-panel active" id="panel-orders">
      <div class="admin-card">
        <div style="text-align:center;padding:40px;color:var(--gray-400);">
          <i class="fas fa-inbox" style="font-size:48px;margin-bottom:16px;display:block;"></i>
          <p style="font-size:15px;margin-bottom:8px;">No orders yet</p>
          <p style="font-size:13px;">Orders will appear here when customers complete checkout via Razorpay.</p>
          <p style="font-size:12px;margin-top:16px;color:var(--gray-300);">
            Connect Supabase to enable persistent order storage.
          </p>
        </div>
      </div>
    </div>

    <!-- Products Panel -->
    <div class="admin-panel" id="panel-products">
      ${PRODUCTS.map((p, idx) => `
      <div class="admin-card">
        <div class="admin-card-header">
          <span class="admin-card-title">${p.name}</span>
          <span class="admin-card-badge ${p.inStock ? 'badge-green' : 'badge-gray'}">${p.inStock ? 'In Stock' : 'Out of Stock'}</span>
        </div>
        <div class="product-edit-row">
          <img class="product-edit-thumb" src="${p.images[0]}" alt="${p.name}">
          <div class="product-edit-fields">
            <div class="admin-field-group">
              <span class="admin-field-label">Price (₹)</span>
              <input class="admin-field-input" type="number" value="${p.price}" data-product="${p.id}" data-field="price">
            </div>
            <div class="admin-field-group">
              <span class="admin-field-label">Compare Price</span>
              <input class="admin-field-input" type="number" value="${p.comparePrice || ''}" data-product="${p.id}" data-field="comparePrice" placeholder="Leave empty if none">
            </div>
            ${p.images.map((img, i) => `
            <div class="admin-field-group">
              <span class="admin-field-label">Image ${i + 1} URL</span>
              <input class="admin-field-input" type="url" value="${img}" data-product="${p.id}" data-field="image_${i}">
            </div>`).join('')}
          </div>
        </div>
        <button class="admin-save-btn" onclick="saveProduct('${p.id}')">
          <i class="fas fa-save" style="margin-right:6px;"></i> Save Changes
        </button>
        <span style="font-size:12px;color:var(--gray-400);margin-left:12px;">
          Connect Supabase to persist changes.
        </span>
      </div>`).join('\n')}
    </div>

    <!-- Legal Panel -->
    <div class="admin-panel" id="panel-legal">
      ${LEGAL_PAGES.map(p => `
      <div class="admin-card">
        <div class="admin-card-header">
          <span class="admin-card-title">${p.title}</span>
          <span class="admin-card-badge badge-gray">Last updated: ${p.updatedAt}</span>
        </div>
        <textarea class="legal-editor" data-slug="${p.slug}">${p.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        <div style="margin-top:12px;">
          <button class="admin-save-btn" onclick="saveLegal('${p.slug}')">
            <i class="fas fa-save" style="margin-right:6px;"></i> Save
          </button>
          <a href="/legal/${p.slug}" target="_blank" style="font-size:12px;color:var(--gray-400);margin-left:12px;text-decoration:underline;">
            Preview →
          </a>
        </div>
      </div>`).join('\n')}

      <div class="admin-card" style="border-style:dashed;text-align:center;padding:40px;">
        <i class="fas fa-plus" style="font-size:24px;color:var(--gray-300);margin-bottom:12px;display:block;"></i>
        <p style="font-size:14px;color:var(--gray-400);margin-bottom:4px;">Add New Legal Page</p>
        <p style="font-size:12px;color:var(--gray-300);">Connect Supabase to add custom pages dynamically.</p>
      </div>
    </div>
  </div>

  <script>
    // Admin auth
    async function verifyAdmin() {
      const pw = document.getElementById('adminPassword').value;
      try {
        const res = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw })
        });
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem('intru_admin', 'true');
          showDashboard();
        } else {
          document.getElementById('adminError').style.display = 'block';
        }
      } catch (e) {
        document.getElementById('adminError').style.display = 'block';
      }
    }

    function showDashboard() {
      document.getElementById('adminGate').style.display = 'none';
      document.getElementById('adminDashboard').classList.add('visible');
    }

    function logoutAdmin() {
      sessionStorage.removeItem('intru_admin');
      location.reload();
    }

    // Check session
    if (sessionStorage.getItem('intru_admin') === 'true') {
      showDashboard();
    }

    // Tabs
    function switchTab(tab) {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      document.querySelector('[onclick="switchTab(\\'' + tab + '\\')"]').classList.add('active');
      document.getElementById('panel-' + tab).classList.add('active');
    }

    // Save handlers (show toast — in production, these POST to Supabase)
    function saveProduct(productId) {
      showToast('Product saved! (Connect Supabase for persistence)');
    }
    function saveLegal(slug) {
      showToast('Legal page saved! (Connect Supabase for persistence)');
    }
  </script>
  `;

  return renderShell(
    'Admin — intru.in',
    'Admin dashboard for intru.in store management.',
    body,
    { bodyClass: 'admin-page' }
  );
}
