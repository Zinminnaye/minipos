import './style.css'

const products = [
  {
    id: 'coca-cola',
    name: 'Coca Cola 330ml',
    price: 1500,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'lays-chips',
    name: "Lay's Chips Original",
    price: 2250,
    category: 'snacks',
    image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'kitkat',
    name: 'KitKat Chocolate',
    price: 1750,
    category: 'sweets',
    image: 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'mineral-water',
    name: 'Mineral Water 500ml',
    price: 750,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1346086/pexels-photo-1346086.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'pringles',
    name: 'Pringles Original',
    price: 3500,
    category: 'snacks',
    image: 'https://images.pexels.com/photos/4109998/pexels-photo-4109998.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'red-bull',
    name: 'Red Bull 250ml',
    price: 2500,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/2351838/pexels-photo-2351838.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'doritos',
    name: 'Doritos Nacho Cheese',
    price: 2750,
    category: 'snacks',
    image: 'https://images.pexels.com/photos/2762256/pexels-photo-2762256.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 'snickers',
    name: 'Snickers Bar',
    price: 1250,
    category: 'sweets',
    image: 'https://images.pexels.com/photos/5705480/pexels-photo-5705480.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

let cart = [];
let currentCategory = 'all';

function formatPrice(price) {
  return `Ks ${price.toLocaleString()}`;
}

function renderProducts(category = 'all', searchTerm = '') {
  const productsGrid = document.getElementById('productsGrid');

  let filteredProducts = category === 'all'
    ? products
    : products.filter(p => p.category === category);

  if (searchTerm) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  productsGrid.innerHTML = filteredProducts.map(product => `
    <div class="col-md-6 col-lg-3">
      <div class="product-card" data-product-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-name">${product.name}</div>
        <div class="product-price">${formatPrice(product.price)}</div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const productId = card.dataset.productId;
      addToCart(productId);
    });
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

function updateQuantity(productId, quantity) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  const newQuantity = parseInt(quantity);
  if (newQuantity <= 0) {
    removeFromCart(productId);
  } else {
    item.quantity = newQuantity;
    updateCart();
  }
}

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
            <div class="cart-item-name">${item.name}</div>
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

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemCount.textContent = totalItems;

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
      input.addEventListener('change', (e) => {
        updateQuantity(input.dataset.productId, e.target.value);
      });
    });
  }

  updateTotals();
}

function updateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  document.getElementById('subtotal').textContent = formatPrice(subtotal);
  document.getElementById('tax').textContent = formatPrice(tax);
  document.getElementById('total').textContent = formatPrice(total);
}

function clearCart() {
  cart = [];
  updateCart();
}

function initializeApp() {
  renderProducts();
  updateCart();

  document.querySelectorAll('.favorite-card').forEach(card => {
    card.addEventListener('click', () => {
      const productId = card.dataset.product;
      addToCart(productId);
    });
  });

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

  document.getElementById('clearCart').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      clearCart();
    }
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    renderProducts(currentCategory, e.target.value);
  });

  document.querySelectorAll('.payment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Cart is empty! Please add items first.');
        return;
      }

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.05;
      const paymentMethod = btn.textContent.trim();

      alert(`Payment of ${formatPrice(total)} via ${paymentMethod} processed successfully!`);
      clearCart();
    });
  });
}

document.addEventListener('DOMContentLoaded', initializeApp);
