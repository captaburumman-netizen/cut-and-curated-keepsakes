/**
 * Main JS — navigation, interactions, page-specific logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initScrollAnimations();
  initProductFilters();
  initProductPage();
  initShopGrid();
  initNewsletterForm();
});

// ─── Navigation ───────────────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = current;
  }, { passive: true });
}

// ─── Mobile menu ─────────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// ─── Scroll animations ────────────────────────────────────────────
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in, .slide-up').forEach((el) => observer.observe(el));
}

// ─── Shop product grid ────────────────────────────────────────────
function initShopGrid() {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;
  renderProductGrid('all');
}

function renderProductGrid(categoryId) {
  const grid = document.getElementById('shop-grid');
  if (!grid) return;

  const products = categoryId === 'all' ? PRODUCTS : PRODUCTS.filter((p) => p.category === categoryId);

  grid.innerHTML = products.map((p) => `
    <article class="product-card slide-up" itemscope itemtype="https://schema.org/Product">
      <a href="products/${p.id}.html" class="product-card-image-link" tabindex="-1" aria-hidden="true">
        <div class="product-card-image">
          <img src="${p.image}" alt="${p.imageAlt}" loading="lazy" itemprop="image" onerror="this.src='images/placeholder.jpg'">
          ${p.processingTime ? `<span class="product-badge">Made to Order</span>` : ''}
        </div>
      </a>
      <div class="product-card-body">
        <p class="product-card-category">${p.categoryLabel}</p>
        <h3 class="product-card-name" itemprop="name">
          <a href="products/${p.id}.html">${p.name}</a>
        </h3>
        <p class="product-card-description">${p.shortDescription}</p>
        <div class="product-card-footer">
          <span class="product-card-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <span itemprop="price" content="${p.price / 100}">${p.displayPrice}</span>
          </span>
          <div class="product-card-actions">
            <a href="products/${p.id}.html" class="btn btn-outline btn-sm">View Details</a>
            ${p.hasPersonalization
              ? `<a href="products/${p.id}.html" class="btn btn-primary btn-sm">Personalize & Add</a>`
              : `<button class="btn btn-primary btn-sm" onclick="quickAddToCart('${p.id}')" aria-label="Add ${p.name} to cart">Add to Cart</button>`
            }
          </div>
        </div>
      </div>
    </article>
  `).join('');

  // Re-run scroll animations for new cards
  initScrollAnimations();
}

// Quick add (no personalization needed)
function quickAddToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;
  Cart.addItem(product, 1, {});
}

// ─── Category filters ─────────────────────────────────────────────
function initProductFilters() {
  const filterContainer = document.getElementById('category-filters');
  if (!filterContainer) return;

  // Render filter buttons
  filterContainer.innerHTML = CATEGORIES.map((cat) => `
    <button class="filter-btn${cat.id === 'all' ? ' active' : ''}" data-category="${cat.id}" aria-pressed="${cat.id === 'all'}">
      ${cat.label}
    </button>
  `).join('');

  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterContainer.querySelectorAll('.filter-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    renderProductGrid(btn.dataset.category);
  });
}

// ─── Individual product page ──────────────────────────────────────
function initProductPage() {
  const container = document.getElementById('product-page-content');
  if (!container) return;

  // Get product ID from data attribute on body or from URL path
  const productId = document.body.dataset.productId;
  if (!productId) return;

  const product = getProductById(productId);
  if (!product) {
    container.innerHTML = '<p class="text-center">Product not found. <a href="../shop.html">Back to shop</a></p>';
    return;
  }

  // Update SEO
  document.title = `${product.name} — Cut & Curated Keepsakes`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = product.shortDescription;

  // Render personalization form + add to cart
  const formHtml = product.hasPersonalization ? `
    <div class="personalization-form">
      <h3 class="personalization-title">✦ Personalize Your Order</h3>
      ${product.personalizationFields.map((field) => `
        <div class="form-group">
          <label for="field-${field.key}" class="form-label">
            ${field.label}${field.required ? ' <span class="required" aria-hidden="true">*</span>' : ' <span class="optional">(optional)</span>'}
          </label>
          <input type="text" id="field-${field.key}" name="${field.key}" class="form-input personalization-input"
            placeholder="${field.placeholder}" ${field.required ? 'required' : ''} autocomplete="off">
        </div>
      `).join('')}
    </div>
  ` : '';

  container.innerHTML = `
    <div class="product-page-grid">
      <div class="product-page-image">
        <img src="../${product.image}" alt="${product.imageAlt}" class="product-main-image" onerror="this.src='../images/placeholder.jpg'">
      </div>
      <div class="product-page-info">
        <p class="product-page-category">${product.categoryLabel}</p>
        <h1 class="product-page-name" itemprop="name">${product.name}</h1>
        <p class="product-page-price">${product.displayPrice}</p>
        ${product.processingTime ? `
          <div class="processing-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Handcrafted to order — please allow <strong>${product.processingTime}</strong></span>
          </div>
        ` : ''}
        <div class="product-page-description">
          ${product.description.split('\n').filter(l => l.trim()).map((line) =>
            line.startsWith('✦') ? `<p class="product-feature">${line}</p>` : `<p>${line}</p>`
          ).join('')}
        </div>
        ${formHtml}
        <div class="product-page-actions">
          <div class="qty-selector">
            <label for="product-qty" class="form-label">Quantity</label>
            <div class="qty-control">
              <button class="qty-btn" id="qty-dec" aria-label="Decrease quantity">−</button>
              <input type="number" id="product-qty" value="1" min="1" max="99" class="qty-input" aria-label="Quantity">
              <button class="qty-btn" id="qty-inc" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="btn btn-primary btn-lg btn-full" id="add-to-cart-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add to Cart
          </button>
        </div>
        <p class="shipping-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          Free local pickup in Edmond, OK · Standard shipping available
        </p>
      </div>
    </div>
  `;

  // Qty controls
  const qtyInput = document.getElementById('product-qty');
  document.getElementById('qty-dec')?.addEventListener('click', () => {
    const v = parseInt(qtyInput.value);
    if (v > 1) qtyInput.value = v - 1;
  });
  document.getElementById('qty-inc')?.addEventListener('click', () => {
    const v = parseInt(qtyInput.value);
    qtyInput.value = v + 1;
  });

  // Add to cart
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    if (product.hasPersonalization) {
      const requiredFields = product.personalizationFields.filter((f) => f.required);
      for (const field of requiredFields) {
        const input = document.getElementById(`field-${field.key}`);
        if (!input || !input.value.trim()) {
          input?.focus();
          input?.classList.add('input-error');
          input?.addEventListener('input', () => input.classList.remove('input-error'), { once: true });
          alert(`Please fill in: ${field.label}`);
          return;
        }
      }
    }

    const personalization = {};
    product.personalizationFields?.forEach((field) => {
      const val = document.getElementById(`field-${field.key}`)?.value.trim();
      if (val) personalization[field.key] = val;
    });

    const qty = parseInt(document.getElementById('product-qty')?.value) || 1;
    Cart.addItem(product, qty, personalization);
  });
}

// ─── Newsletter / form helpers ────────────────────────────────────
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value;
    if (email) {
      form.innerHTML = `<p class="success-message">✦ Thank you! We'll be in touch.</p>`;
    }
  });
}
