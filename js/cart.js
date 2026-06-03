/**
 * Cart management for Cut & Curated Keepsakes
 * Cart data is stored in localStorage so it persists across pages.
 */

const Cart = (() => {
  const STORAGE_KEY = 'ck_cart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
  }

  // Each cart item: { id, name, priceId, price, displayPrice, image, imageAlt, quantity, personalization }
  function addItem(product, quantity = 1, personalization = {}) {
    const cart = getCart();
    // Combine personalization into a readable note
    const personalizationNote = Object.entries(personalization)
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
      .join(' | ');

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
      if (personalizationNote) existing.personalizationNote = personalizationNote;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        priceId: product.priceId,
        price: product.price,
        displayPrice: product.displayPrice,
        image: product.image,
        imageAlt: product.imageAlt,
        processingTime: product.processingTime,
        quantity,
        personalizationNote: personalizationNote || '',
      });
    }
    saveCart(cart);
    showAddedToast(product.name);
  }

  function removeItem(productId) {
    const cart = getCart().filter((item) => item.id !== productId);
    saveCart(cart);
  }

  function updateQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find((i) => i.id === productId);
    if (!item) return;
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    item.quantity = quantity;
    saveCart(cart);
  }

  function clearCart() {
    saveCart([]);
  }

  function getTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateCartBadge() {
    const count = getCount();
    document.querySelectorAll('.cart-badge').forEach((badge) => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function showAddedToast(name) {
    const existing = document.getElementById('cart-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span><strong>${name}</strong> added to cart</span>
    `;
    document.body.appendChild(toast);
    // Force reflow before adding visible class
    void toast.offsetHeight;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  }

  // ─── Checkout ─────────────────────────────────────────────────
  async function checkout(overridePersonalization = {}) {
    const cart = getCart();
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    // Check for placeholder price IDs (dev safety check)
    const hasPlaceholders = cart.some((item) => item.priceId.includes('REPLACE'));
    if (hasPlaceholders) {
      alert('Checkout is not yet active — the store owner needs to connect real Stripe Price IDs. Check the README for setup instructions.');
      return;
    }

    const btn = document.getElementById('checkout-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Redirecting to payment…';
    }

    // Aggregate all personalization notes from cart items
    const allNotes = cart
      .filter((item) => item.personalizationNote)
      .map((item) => `[${item.name}] ${item.personalizationNote}`)
      .join('\n');

    const payload = {
      items: cart.map((item) => ({ priceId: item.priceId, quantity: item.quantity })),
      personalizationNote: overridePersonalization.personalizationNote || allNotes || null,
      colorPreference: overridePersonalization.colorPreference || null,
      giftMessage: overridePersonalization.giftMessage || null,
    };

    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error(err);
      alert('There was a problem starting checkout. Please try again or contact us directly.');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Proceed to Checkout';
      }
    }
  }

  // ─── Render cart page ──────────────────────────────────────────
  function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty');
    const summary = document.getElementById('cart-summary');
    if (!container) return;

    const cart = getCart();
    updateCartBadge();

    if (cart.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (summary) summary.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (summary) summary.style.display = 'block';

    container.innerHTML = cart.map((item) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.imageAlt}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-name">${item.name}</h3>
          ${item.personalizationNote ? `<p class="cart-item-personalization"><em>✦ ${item.personalizationNote}</em></p>` : ''}
          ${item.processingTime ? `<p class="cart-item-processing">Processing: ${item.processingTime}</p>` : ''}
          <div class="cart-item-controls">
            <div class="qty-control">
              <button class="qty-btn" aria-label="Decrease quantity" onclick="Cart.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" aria-label="Increase quantity" onclick="Cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
            </div>
            <button class="remove-btn" aria-label="Remove ${item.name}" onclick="Cart.removeItem('${item.id}')">Remove</button>
          </div>
        </div>
        <div class="cart-item-price">${item.displayPrice}</div>
      </div>
    `).join('');

    // Update totals
    const total = getTotal();
    const formatted = (total / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total-display');
    if (subtotalEl) subtotalEl.textContent = formatted;
    if (totalEl) totalEl.textContent = formatted;
  }

  // Initialize badge on page load
  document.addEventListener('DOMContentLoaded', updateCartBadge);
  window.addEventListener('cartUpdated', () => {
    if (document.getElementById('cart-items-container')) renderCartPage();
  });

  return { getCart, addItem, removeItem, updateQuantity, clearCart, getTotal, getCount, checkout, renderCartPage, updateCartBadge };
})();
