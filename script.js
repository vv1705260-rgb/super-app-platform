// ===== ENHANCED INITIAL DATA =====
const DEFAULT_PRODUCTS = [
  {id: 1, name: "iPhone 15 Pro Max 512GB", price: 129900, mrp: 159900, category: "electronics", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500", desc: "A17 Pro chip, Titanium design, 48MP camera", stock: 15, rating: 4.9, views: 0, sold: 234},
  {id: 2, name: "MacBook Air M3", price: 114900, mrp: 134900, category: "electronics", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", desc: "M3 chip, 13.6-inch Liquid Retina, 18hr battery", stock: 8, rating: 4.8, views: 0, sold: 189},
  {id: 3, name: "Sony WH-1000XM5", price: 29990, mrp: 34990, category: "electronics", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500", desc: "Industry leading noise canceling, 30hr battery", stock: 25, rating: 4.7, views: 0, sold: 567},
  {id: 4, name: "Nike Air Jordan 1", price: 12995, mrp: 16995, category: "fashion", image: "https://images.unsplash.com/photo-1542291026-7eec6a1a5a85?w=500", desc: "Classic basketball sneaker, premium leather", stock: 12, rating: 4.6, views: 0, sold: 892},
  {id: 5, name: "Levi's 511 Slim Jeans", price: 3999, mrp: 5999, category: "fashion", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500", desc: "Slim fit stretch denim, midnight wash", stock: 30, rating: 4.5, views: 0, sold: 1245},
  {id: 6, name: "Atomic Habits Book", price: 499, mrp: 799, category: "books", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500", desc: "Build good habits, break bad ones by James Clear", stock: 50, rating: 4.9, views: 0, sold: 3456},
  {id: 7, name: "Instant Pot Duo 7-in-1", price: 7999, mrp: 9999, category: "home", image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500", desc: "Pressure cooker, slow cooker, rice cooker & more", stock: 18, rating: 4.7, views: 0, sold: 423},
  {id: 8, name: "Dyson V15 Detect", price: 62900, mrp: 70900, category: "home", image: "https://images.unsplash.com/photo-1558317374-067fb5fc6de2?w=500", desc: "Laser reveals microscopic dust, 60min runtime", stock: 6, rating: 4.8, views: 0, sold: 167}
];

const PROMO_CODES = {
  "NEXUS50": { discount: 50, min: 500, type: "flat" },
  "MEGA100": { discount: 100, min: 1000, type: "flat" },
  "FIRST20": { discount: 20, min: 0, type: "percent" },
  "FLASH30": { discount: 30, min: 2000, type: "percent", maxDiscount: 500 }
};

// ===== ENHANCED STATE =====
let currentUser = null;
let products = [];
let cart = [];
let wishlist = [];
let orders = [];
let users = [];
let recentlyViewed = [];
let compareList = [];
let isLoginMode = true;
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';
let appliedPromo = null;
let dealEndTime = Date.now() + 5 * 60 * 60 * 1000 + 23 * 60 * 1000 + 41 * 1000;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  checkAuth();
  initTheme();
  startDealTimer();
  initVoiceSearch();
  loadRecentlyViewed();

  if (currentUser) {
    renderProducts();
    updateCounts();
    updateProfileUI();
  }
});

function loadData() {
  products = JSON.parse(localStorage.getItem('ns_products')) || DEFAULT_PRODUCTS;
  cart = JSON.parse(localStorage.getItem('ns_cart')) || [];
  wishlist = JSON.parse(localStorage.getItem('ns_wishlist')) || [];
  orders = JSON.parse(localStorage.getItem('ns_orders')) || [];
  users = JSON.parse(localStorage.getItem('ns_users')) || [];
  currentUser = JSON.parse(localStorage.getItem('ns_currentUser'));
  recentlyViewed = JSON.parse(localStorage.getItem('ns_recentlyViewed')) || [];
  compareList = JSON.parse(localStorage.getItem('ns_compare')) || [];
}

function saveData() {
  localStorage.setItem('ns_products', JSON.stringify(products));
  localStorage.setItem('ns_cart', JSON.stringify(cart));
  localStorage.setItem('ns_wishlist', JSON.stringify(wishlist));
  localStorage.setItem('ns_orders', JSON.stringify(orders));
  localStorage.setItem('ns_users', JSON.stringify(users));
  localStorage.setItem('ns_currentUser', JSON.stringify(currentUser));
  localStorage.setItem('ns_recentlyViewed', JSON.stringify(recentlyViewed));
  localStorage.setItem('ns_compare', JSON.stringify(compareList));
}

// ===== NEW: RECENTLY VIEWED =====
function addToRecentlyViewed(id) {
  recentlyViewed = recentlyViewed.filter(pid => pid!== id);
  recentlyViewed.unshift(id);
  if (recentlyViewed.length > 5) recentlyViewed.pop();
  saveData();
  renderRecentlyViewed();
}

function loadRecentlyViewed() {
  renderRecentlyViewed();
}

function renderRecentlyViewed() {
  if (recentlyViewed.length === 0) return;

  let bar = document.querySelector('.recently-viewed');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'recently-viewed';
    document.body.appendChild(bar);
  }

  bar.innerHTML = '<span style="font-size:11px;font-weight:700;color:var(--text-muted);writing-mode:vertical-rl">RECENT</span>' +
    recentlyViewed.map(id => {
      const p = products.find(prod => prod.id === id);
      return p? `<img src="${p.image}" alt="${p.name}" onclick="quickView(${p.id})" title="${p.name}">` : '';
    }).join('');
}

// ===== NEW: VOICE SEARCH =====
function initVoiceSearch() {
  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;

  const micBtn = document.createElement('button');
  micBtn.innerHTML = '<span class="material-icons-round" style="font-size:20px">mic</span>';
  micBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:var(--text-muted);';
  micBtn.onclick = startVoiceSearch;
  searchBar.appendChild(micBtn);
}

function startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window)) {
    showToast('Voice search not supported', 'error');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.onstart = () => {
    document.querySelector('.search-bar').classList.add('voice-active');
    showToast('Listening...', 'success');
  };

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    document.getElementById('searchInput').value = transcript;
    currentSearch = transcript;
    renderProducts();
    showToast(`Searching for: ${transcript}`, 'success');
  };

  recognition.onend = () => {
    document.querySelector('.search-bar').classList.remove('voice-active');
  };

  recognition.start();
}

// ===== NEW: CONFETTI ON PURCHASE =====
function createConfetti() {
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

// ===== ENHANCED CHECKOUT =====
function checkout() {
  if (cart.length === 0) return showToast('Cart is empty', 'error');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  let discount = 0;
  if (appliedPromo) {
    discount = appliedPromo.type === 'flat'? appliedPromo.discount : Math.round(subtotal * appliedPromo.discount / 100);
    if (appliedPromo.maxDiscount) discount = Math.min(discount, appliedPromo.maxDiscount);
  }

  const order = {
    id: Date.now(),
    userId: currentUser.id,
    date: new Date().toISOString(),
    items: [...cart],
    subtotal,
    discount,
    total: subtotal - discount,
    status: 'Confirmed'
  };

  orders.unshift(order);
  cart = [];
  appliedPromo = null;
  saveData();
  updateCounts();
  renderCart();
  closeSidebar();
  createConfetti();
  showToast('Order placed! Check email for invoice', 'success');

  // Update product sold count
  order.items.forEach(item => {
    const p = products.find(prod => prod.id === item.id);
    if (p) p.sold += item.qty;
  });
  saveData();
}

// ===== ENHANCED QUICK VIEW WITH TRACKING =====
function quickView(id) {
  const p = products.find(prod => prod.id === id);
  if (!p) return;

  p.views++;
  addToRecentlyViewed(id);
  saveData();

  const discount = Math.round((1 - p.price / p.mrp) * 100);
  const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
  const stockPercent = (p.stock / 50) * 100;

  document.getElementById('quickViewContent').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
      <div>
        <img src="${p.image}" alt="${p.name}" style="width:100%;border-radius:16px">
        <div class="stock-bar" style="margin-top:16px">
          <div class="stock-fill" style="width:${stockPercent}%"></div>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px">${p.stock} units left | ${p.sold} sold</div>
      </div>
      <div>
        <h2 style="font-family:'Outfit',sans-serif;font-size:28px;font-weight:800;margin-bottom:12px">${p.name}</h2>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <span style="color:var(--warning);font-size:18px">${stars}</span>
          <span style="color:var(--text-muted)">${p.rating} (${p.views} views)</span>
        </div>
        <div style="margin-bottom:16px">
          <span style="font-size:36px;font-weight:900">₹${p.price.toLocaleString('en-IN')}</span>
          <span style="margin-left:12px;text-decoration:line-through;color:var(--text-muted)">₹${p.mrp.toLocaleString('en-IN')}</span>
          <span style="margin-left:12px;color:var(--success);font-weight:700" class="price-drop">${discount}% OFF</span>
        </div>
        <p style="color:var(--text-muted);line-height:1.6;margin-bottom:24px">${p.desc}</p>
        <div style="display:flex;gap:12px">
          <button onclick="addToCart(${p.id}); closeModal('quickViewModal');" style="flex:1;padding:16px;background:var(--primary);color:white;border:none;border-radius:12px;font-weight:800;cursor:pointer">
            Add to Cart
          </button>
          <button onclick="toggleWishlist(${p.id}); renderProducts();" style="width:52px;background:var(--bg);border:none;border-radius:12px;cursor:pointer">
            <span class="material-icons-round">${wishlist.includes(p.id)? 'favorite' : 'favorite_border'}</span>
          </button>
        </div>
        <div style="margin-top:24px;padding:16px;background:var(--bg);border-radius:12px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span>Delivery:</span><strong>Free, 2-day delivery</strong>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span>Returns:</span><strong>7-day easy returns</strong>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('quickViewModal').classList.remove('hidden');
}

// ===== REST OF FUNCTIONS (same as before, abbreviated) =====
function checkAuth() {
  if (currentUser) {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  } else {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
  }
}

function toggleAuthMode() {
  isLoginMode =!isLoginMode;
  document.getElementById('authTitle').textContent = isLoginMode? 'Welcome to NexusStore' : 'Create Account';
  document.getElementById('authName').classList.toggle('hidden', isLoginMode);
  document.getElementById('authBtn').textContent = isLoginMode? 'Login' : 'Sign Up';
  document.getElementById('authSwitch').textContent = isLoginMode? 'New user? Create account' : 'Have account? Login';
}

function handleAuth() {
  const name = document.getElementById('authName').value.trim();
  const email = document.getElementById('authEmail').value.trim();
  const pass = document.getElementById('authPass').value.trim();

  if (!email ||!pass || (!isLoginMode &&!name)) return showToast('Please fill all fields', 'error');

  if (isLoginMode) {
    const user = users.find(u => u.email === email && u.pass === pass);
    if (user) {
      currentUser = user;
      saveData();
      checkAuth();
      renderProducts();
      updateCounts();
      updateProfileUI();
      showToast(`Welcome back, ${user.name}!`, 'success');
    } else {
      showToast('Invalid credentials', 'error');
    }
  } else {
    if (users.find(u => u.email === email)) return showToast('Email already exists', 'error');
    const newUser = { id: Date.now(), name, email, pass, isAdmin: email.includes('admin') };
    users.push(newUser);
    currentUser = newUser;
    saveData();
    checkAuth();
    renderProducts();
    updateCounts();
    updateProfileUI();
    showToast(`Welcome to NexusStore, ${name}!`, 'success');
  }
}

function logout() {
  currentUser = null;
  cart = [];
  wishlist = [];
  appliedPromo = null;
  saveData();
  checkAuth();
  closeProfileMenu();
  showToast('Logged out successfully', 'success');
}

function updateProfileUI() {
  if (!currentUser) return;
  document.getElementById('userNameBtn').textContent = currentUser.name.split(' ')[0];
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366F1&color=fff`;
  document.getElementById('userAvatarLarge').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=6366F1&color=fff`;
  document.getElementById('adminMenuBtn').style.display = currentUser.isAdmin? 'flex' : 'none';
  document.getElementById('adminBtn').style.display = currentUser.isAdmin? 'flex' : 'none';
}

function toggleProfileMenu() {
  document.getElementById('profileMenu').classList.toggle('hidden');
}

function closeProfileMenu() {
  document.getElementById('profileMenu').classList.add('hidden');
}

function initTheme() {
  const theme = localStorage.getItem('ns_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark'? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('ns_theme', newTheme);
  showToast(`${newTheme === 'dark'? 'Dark' : 'Light'} mode activated`, 'success');
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  let filtered = [...products];

  if (currentFilter!== 'all') filtered = filtered.filter(p => p.category === currentFilter);
  if (currentSearch) filtered = filtered.filter(p => p.name.toLowerCase().includes(currentSearch.toLowerCase()) || p.desc.toLowerCase().includes(currentSearch.toLowerCase()));
  if (currentSort === 'price-low') filtered.sort((a, b) => a.price - b.price);
  else if (currentSort === 'price-high') filtered.sort((a, b) => b.price - a.price);
  else if (currentSort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  grid.innerHTML = filtered.map(p => {
    const discount = Math.round((1 - p.price / p.mrp) * 100);
    const inWishlist = wishlist.includes(p.id);
    const stockBadge = p.stock < 10? `<div class="product-badge">Only ${p.stock} left!</div>` : '';
    const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));

    return `
      <div class="product-card">
        <div class="product-image">
          <img src="${p.image}" alt="${p.name}">
          ${stockBadge}
          <button class="wishlist-btn ${inWishlist? 'active' : ''}" onclick="toggleWishlist(${p.id})">
            <span class="material-icons-round">${inWishlist? 'favorite' : 'favorite_border'}</span>
          </button>
          <div class="quick-actions">
            <button class="quick-action-btn" onclick="quickView(${p.id})" title="Quick View">
              <span class="material-icons-round" style="font-size:20px">visibility</span>
            </button>
            <button class="quick-action-btn" onclick="addToCart(${p.id})" title="Add to Cart">
              <span class="material-icons-round" style="font-size:20px">shopping_cart</span>
            </button>
          </div>
        </div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <div class="product-rating">
            <span class="stars">${stars}</span>
            <span>${p.rating}</span>
          </div>
          <div class="product-price">
            <span class="price-current">₹${p.price.toLocaleString('en-IN')}</span>
            <span class="price-mrp">₹${p.mrp.toLocaleString('en-IN')}</span>
            <span class="price-discount">${discount}% OFF</span>
          </div>
          <div class="product-actions">
            <button class="btn-cart" onclick="addToCart(${p.id})">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterCategory(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-chip,.cat-card').forEach(el => el.classList.remove('active'));
  event.target.classList.add('active');
  renderProducts();
}

function searchProducts() {
  currentSearch = document.getElementById('searchInput').value;
  renderProducts();
}

function sortProducts() {
  currentSort = document.getElementById('sortSelect').value;
  renderProducts();
}

function goHome() {
  currentFilter = 'all';
  currentSearch = '';
  document.getElementById('searchInput').value = '';
  renderProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addToCart(id) {
  if (!currentUser) return showToast('Please login first', 'error');
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({...product, qty: 1 });
  saveData();
  updateCounts();
  renderCart();
  showToast(`${product.name} added to cart`, 'success');
  document.querySelector('.cart-icon').classList.add('has-items');
  setTimeout(() => document.querySelector('.cart-icon').classList.remove('has-items'), 500);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id!== id);
  saveData();
  updateCounts();
  renderCart();
  showToast('Removed from cart', 'success');
}

function updateCartQty(id, change) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) removeFromCart(id);
  else { saveData(); updateCounts(); renderCart(); }
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">Your cart is empty</div>';
    updateCartTotals();
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="price">₹${item.price.toLocaleString('en-IN')}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
          <button onclick="updateCartQty(${item.id}, -1)" style="width:28px;height:28px;border:none;background:var(--bg);border-radius:6px;cursor:pointer">-</button>
          <span style="font-weight:700;min-width:24px;text-align:center">${item.qty}</span>
          <button onclick="updateCartQty(${item.id}, 1)" style="width:28px;height:28px;border:none;background:var(--bg);border-radius:6px;cursor:pointer">+</button>
          <button onclick="removeFromCart(${item.id})" style="margin-left:auto;background:none;border:none;color:var(--danger);cursor:pointer">
            <span class="material-icons-round" style="font-size:20px">delete</span>
          </button>
        </div>
      </d
