const products = [
  {id:1,name:'Contour Wool Coat',type:'outerwear',price:320,detail:'Italian wool / Cocoa',badge:'NEW',colors:['#342e2b','#d9d1c2'],image:'assets/product-coat.jpg'},
  {id:2,name:'Folded Shoulder Shirt',type:'tops',price:145,detail:'Organic poplin / Chalk',badge:'DROP 04',colors:['#e8e5dc','#1a1a1a'],image:'assets/product-shirt.jpg'},
  {id:3,name:'Column Knit Dress',type:'tops',price:190,detail:'Merino blend / Ink',badge:'',colors:['#171717','#784c39'],image:'assets/product-dress.jpg'},
  {id:4,name:'Arc Mini Bag',type:'accessories',price:175,detail:'Vegetable leather / Oxide',badge:'LOW STOCK',colors:['#a93c28','#111'],image:'assets/product-bag.jpg'},
  {id:5,name:'Transit Mac',type:'outerwear',price:280,detail:'Technical cotton / Sand',badge:'',colors:['#c0aa83','#393b39'],image:'assets/product-mac.jpg'},
  {id:6,name:'Second Skin Top',type:'tops',price:95,detail:'Tencel jersey / Clay',badge:'NEW',colors:['#966855','#d7c8b8'],image:'assets/product-top.jpg'},
  {id:7,name:'Frame Sunglasses',type:'accessories',price:130,detail:'Bio acetate / Smoke',badge:'',colors:['#161616','#c4aa7a'],image:'assets/product-glasses.jpg'},
  {id:8,name:'Soft Geometry Tote',type:'accessories',price:210,detail:'Recycled nylon / Graphite',badge:'EXCLUSIVE',colors:['#2d2e2f','#806d55'],image:'assets/product-tote.jpg'}
];

let cart = [];
const productGrid = document.querySelector('#productGrid');
const overlay = document.querySelector('#overlay');
const cartDrawer = document.querySelector('#cartDrawer');
const searchPanel = document.querySelector('#searchPanel');
const quickView = document.querySelector('#quickView');
const toast = document.querySelector('#toast');

function renderProducts(filter = 'all', query = '') {
  const normalized = query.toLowerCase().trim();
  productGrid.innerHTML = products
    .filter(p => (filter === 'all' || p.type === filter) && (!normalized || `${p.name} ${p.detail} ${p.type}`.toLowerCase().includes(normalized)))
    .map(p => `<article class="product-card" data-type="${p.type}">
      <div class="product-visual" data-quick="${p.id}">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <button class="quick-button" data-quick="${p.id}">QUICK VIEW +</button>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3><span class="price">€${p.price}</span>
        <p>${p.detail}</p><span class="color-dots">${p.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span>
      </div>
    </article>`).join('');
}

function lockPage(locked = true) { document.body.classList.toggle('locked', locked); }
function closePanels() {
  [cartDrawer, searchPanel, quickView].forEach(el => { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); });
  overlay.classList.remove('open'); lockPage(false);
}
function openPanel(panel) {
  closePanels(); panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); overlay.classList.add('open'); lockPage(true);
}

function openQuickView(id) {
  const p = products.find(item => item.id === Number(id));
  quickView.innerHTML = `<div class="quick-view-image"><img src="${p.image}" alt="${p.name}"></div>
    <div class="quick-view-info">
      <button class="close-button" data-close="quick">CLOSE ×</button>
      <p class="eyebrow">${p.type} / DROP 04</p>
      <h2>${p.name}</h2><span class="q-price">€${p.price}</span>
      <p>${p.detail}. A precise, adaptable piece with considered proportions and an easy everyday feel.</p>
      <span class="size-label">SELECT SIZE</span>
      <div class="sizes"><button>XS</button><button class="selected">S</button><button>M</button><button>L</button></div>
      <button class="add-button" data-add="${p.id}">ADD TO BAG — €${p.price}</button>
    </div>`;
  openPanel(quickView);
}

function addToCart(id) {
  const p = products.find(item => item.id === Number(id));
  const existing = cart.find(item => item.id === p.id);
  existing ? existing.qty++ : cart.push({...p, qty:1});
  renderCart();
  toast.textContent = `${p.name} added to your bag`;
  toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200);
  closePanels();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelector('#cartCount').textContent = count;
  const items = document.querySelector('#cartItems');
  const summary = document.querySelector('#cartSummary');
  if (!cart.length) {
    items.innerHTML = `<div class="empty-cart"><span>0</span><p>Your bag is waiting.</p><button data-close="cart">DISCOVER THE COLLECTION</button></div>`;
    summary.querySelector('strong').textContent = '€0'; return;
  }
  items.innerHTML = cart.map(p => `<div class="cart-line"><img src="${p.image}" alt=""><div><h4>${p.name}</h4><p>Size S · Qty ${p.qty}</p><button data-remove="${p.id}">REMOVE</button></div><strong>€${p.price * p.qty}</strong></div>`).join('');
  summary.querySelector('strong').textContent = `€${cart.reduce((sum,p) => sum + p.price * p.qty, 0)}`;
}

document.querySelector('#filters').addEventListener('click', e => {
  const button = e.target.closest('[data-filter]'); if (!button) return;
  document.querySelectorAll('.filter').forEach(el => el.classList.remove('active')); button.classList.add('active'); renderProducts(button.dataset.filter);
});
productGrid.addEventListener('click', e => { const trigger = e.target.closest('[data-quick]'); if (trigger) openQuickView(trigger.dataset.quick); });
document.querySelector('#cartButton').addEventListener('click', () => openPanel(cartDrawer));
document.querySelector('#searchButton').addEventListener('click', () => { openPanel(searchPanel); setTimeout(() => document.querySelector('#searchInput').focus(), 450); });
overlay.addEventListener('click', closePanels);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanels(); });
document.addEventListener('click', e => {
  const close = e.target.closest('[data-close]'); if (close) closePanels();
  const add = e.target.closest('[data-add]'); if (add) addToCart(add.dataset.add);
  const remove = e.target.closest('[data-remove]'); if (remove) { cart = cart.filter(p => p.id !== Number(remove.dataset.remove)); renderCart(); }
  const size = e.target.closest('.sizes button'); if (size) { size.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected')); size.classList.add('selected'); }
  const query = e.target.closest('[data-query]'); if (query) { const input=document.querySelector('#searchInput'); input.value=query.dataset.query; input.dispatchEvent(new Event('input')); }
});
document.querySelector('#searchInput').addEventListener('input', e => { renderProducts('all', e.target.value); if(e.target.value) setTimeout(closePanels, 250); });
document.querySelector('#newsletterForm').addEventListener('submit', e => { e.preventDefault(); toast.textContent = 'Welcome to the private list'; toast.classList.add('show'); e.target.reset(); setTimeout(()=>toast.classList.remove('show'),2400); });
document.querySelector('#menuButton').addEventListener('click', () => { openPanel(searchPanel); document.querySelector('#searchPanel .eyebrow').textContent='NAVIGATE / EXPLORE'; });

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); }), {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
window.addEventListener('scroll', () => document.querySelector('.site-header').classList.toggle('scrolled', scrollY > 20));
window.addEventListener('pointermove', e => { const glow=document.querySelector('.cursor-glow'); glow.style.left=`${e.clientX}px`; glow.style.top=`${e.clientY}px`; });

renderProducts(); renderCart();
