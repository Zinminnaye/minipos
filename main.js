import './style.css';
import { registerSW } from 'virtual:pwa-register';
import {
  getProductsFromDB,
  syncProductsFromServer
} from './services/productService.js';
import { saveSale, getSaleHeaders, getSaleItems } from './services/saleService.js';
import { getCurrentSession, logout, onAuthStateChange } from './services/authService.js';

// Application state (mutable). Use `let` for variables that change.
let products = []; // Array of product objects
let cart = [];     // Array of items currently in cart
let currentCategory = 'all'; // Track active product category

// Utility: format numeric price as localized string with currency
// Template literals (backticks) allow easy interpolation: `Ks ${...}`
function formatPrice(price) {
  if (price === null || price === undefined) price = 0;
  return `Ks ${price.toLocaleString()}`;
}

// Render products into the DOM.
// Default parameters: ES6 allows `category = 'all'` and `searchTerm = ''`.
function renderProducts(category = 'all', searchTerm = '') {

  // Get target container from DOM
  const productsGrid = document.getElementById('productsGrid');

  // Filter using ternary operator and array.filter (ES6 arrow functions)
  let filteredProducts = category === 'all'
    ? products
    : products.filter(p => p.category === category);

  // Support simple client-side search (case-insensitive)
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(p =>
      p.stock_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Use map + join to build HTML string. Template literals make HTML insertion readable.
  productsGrid.innerHTML = filteredProducts.map(product => `
    <div class="col-md-6 col-lg-3">
      <div class="product-card" data-product-id="${product.id}">
       <img src="${product.image || 'placeholder.png'}" alt="${product.stock_name}" class="product-image mb-2">
        <div class="product-name">${product.stock_name}</div>
        <div class="product-price">${formatPrice(product.price)}</div>
      </div>
    </div>
  `).join('');

  // Attach click handlers to each product card. `dataset` is used to read data- attributes.
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const productId = card.dataset.productId; // string from `data-product-id`
      addToCart(productId);
    });
  });
}

// Add a product to the cart by product id
function addToCart(productId) {
  // Find product in the `products` array (array.find with arrow fn)
  const product = products.find(p => p.id === productId);
  if (!product) return; // guard clause

  // Check if item already in cart
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    // Mutate existing item quantity
    existingItem.quantity += 1;
  } else {
    // Spread operator `...product` copies properties into new object
    cart.push({
      ...product,
      quantity: 1
    });
  }

  updateCart(); // Re-render cart UI
}

// Remove a product from cart by id (filter returns a new array)
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

// Update the numeric quantity for a cart item
function updateQuantity(productId, quantity) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  const newQuantity = parseInt(quantity);
  if (newQuantity <= 0) {
    // If zero or negative, remove the item
    removeFromCart(productId);
  } else {
    item.quantity = newQuantity;
    updateCart();
  }
}

// Rebuild cart UI and attach per-item event listeners
function updateCart() {
  const cartItems = document.getElementById('cartItems');
  const cartItemCount = document.getElementById('cartItemCount');

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="text-center text-muted py-4">No items in cart</div>';
    cartItemCount.textContent = '0';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="flex-grow-1">
            <div class="cart-item-name">${item.stock_name}</div>
            <div class="cart-item-price">${formatPrice(item.price)} each</div>
          </div>
          <button class="delete-btn" data-product-id="${item.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <div class="quantity-controls">
            <button class="quantity-btn decrease-qty" data-product-id="${item.id}">
              <i class="bi bi-dash"></i>
            </button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
            <button class="quantity-btn increase-qty" data-product-id="${item.id}">
              <i class="bi bi-plus"></i>
            </button>
          </div>
          <div class="fw-bold text-success">${formatPrice(item.price * item.quantity)}</div>
        </div>
      </div>
    `).join('');

    // `reduce` example: compute total item count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemCount.textContent = totalItems;

    // Attach listeners for delete / quantity change buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.dataset.productId);
      });
    });

    document.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = cart.find(i => i.id === btn.dataset.productId);
        if (item) {
          updateQuantity(btn.dataset.productId, item.quantity - 1);
        }
      });
    });

    document.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = cart.find(i => i.id === btn.dataset.productId);
        if (item) {
          updateQuantity(btn.dataset.productId, item.quantity + 1);
        }
      });
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
      // `change` event gives `e.target.value` as string, pass to updateQuantity
      input.addEventListener('change', (e) => {
        updateQuantity(input.dataset.productId, e.target.value);
      });
    });
  }

  updateTotals();
}

// Recalculate subtotal, tax and total and write to DOM
function updateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // simple 5% tax example
  const total = subtotal + tax;

  document.getElementById('subtotal').textContent = formatPrice(subtotal);
  document.getElementById('tax').textContent = formatPrice(tax);
  document.getElementById('total').textContent = formatPrice(total);
}

// Clear the cart
function clearCart() {
  cart = [];
  updateCart();
}

// Example async function: attempt to sync products from server when online
// async/await is modern promise syntax that makes asynchronous code look synchronous
async function SaveProductsFromServer() {
  // Only try to sync if the browser is online
  if (navigator.onLine) {
    try {
      const freshProducts = await syncProductsFromServer();
      if (Array.isArray(freshProducts) && freshProducts.length) {
        products = freshProducts; // replace local cache
        renderProducts(currentCategory);
      }
    } catch (err) {
      // Use console.warn for non-fatal runtime issues
      console.warn('Server sync failed, using offline data', err);
    }
  }
}

async function checkAuthentication() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '/login.html';
    return false;
  }
}

// Application initialization: load data, render UI, wire event handlers
async function initializeApp() {
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) return;

  // Try to refresh products from server (if available)
  await SaveProductsFromServer();

  // Load cached products from IndexedDB (or other local DB) via service module
  try {
    products = await getProductsFromDB();
  } catch (err) {
    console.warn('Failed to load products from DB', err);
    products = [];
  }

  // Initial render
  renderProducts();
  updateCart();

  // Example: listening for clicks on favorite cards (uses data attributes)
  document.querySelectorAll('.favorite-card').forEach(card => {
    card.addEventListener('click', () => {
      const productId = card.dataset.product;
      addToCart(productId);
    });
  });

  // Category buttons: toggle classes and re-render products for selected category
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.remove('active', 'btn-danger');
        b.classList.add('btn-outline-secondary');
      });

      btn.classList.remove('btn-outline-secondary');
      btn.classList.add('active', 'btn-danger');

      currentCategory = btn.dataset.category;
      renderProducts(currentCategory);
    });
  });

  // Clear cart button (native confirm dialog shown)
  document.getElementById('clearCart').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      clearCart();
    }
  });

  // Search input: re-render as user types
  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderProducts(currentCategory, e.target.value);
  });

  // Payment buttons: prepare sale and call `saveSale` from service
  document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (cart.length === 0) {
        alert('Cart is empty! Please add items first.');
        return;
      }

      // Calculate total (including tax)
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.05;
      const paymentMethod = btn.textContent.trim();
      const saleHeader = {
        invoice_no:"POS-" + new Date().toISOString(),
        invoice_date: new Date().toISOString(),
        amount: total
      };
      const saleItems = cart.map(item => ({
        stock_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      // Persist the sale (may work offline depending on implementation)
      await saveSale(saleHeader, saleItems);

      alert(`Payment of ${formatPrice(total)} via ${paymentMethod} processed successfully!`);
      clearCart();
    });
  });

  addLogoutButton();
}

function addLogoutButton() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const logoutContainer = navbar.querySelector('.d-flex.align-items-center');
  if (logoutContainer && !document.getElementById('logoutBtn')) {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.className = 'btn btn-logout btn-sm ms-3';
    logoutBtn.innerHTML = '<i class="bi bi-box-arrow-right"></i> Logout';
    logoutBtn.addEventListener('click', async () => {
      try {
        await logout();
        window.location.href = '/login.html';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
    logoutContainer.appendChild(logoutBtn);
  }
}

// Register service worker with basic lifecycle callbacks. This keeps the PWA
// updated and allows offline usage when a service worker is available.
registerSW({
  onOfflineReady() {
    console.log('POS ready for offline use')
  },
  onNeedRefresh() {
    console.log('New version available')
  }
})

// Start the app once DOM has loaded. `DOMContentLoaded` is preferred over `load` for
// faster startup because it fires when the DOM is ready (images may still be loading).
document.addEventListener('DOMContentLoaded', initializeApp);
