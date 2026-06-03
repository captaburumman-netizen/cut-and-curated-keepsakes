/**
 * Injects shared nav and footer HTML into every page.
 * The `data-page` attribute on <body> highlights the active nav link.
 */
(function () {
  const currentPage = document.body.dataset.page || '';
  const isSubPage   = document.body.dataset.subpage === 'true'; // products/* pages
  const base        = isSubPage ? '../' : '';

  // ─── Navigation ───────────────────────────────────────────────
  const navLinks = [
    { href: `${base}index.html`,         id: 'home',    label: 'Home'          },
    { href: `${base}shop.html`,          id: 'shop',    label: 'Shop'          },
    { href: `${base}custom-orders.html`, id: 'custom',  label: 'Custom Orders' },
    { href: `${base}about.html`,         id: 'about',   label: 'About'         },
    { href: `${base}contact.html`,       id: 'contact', label: 'Contact'       },
  ];

  const navHTML = `
    <nav id="main-nav" aria-label="Main navigation">
      <div class="nav-inner">
        <a href="${base}index.html" class="nav-logo" aria-label="Cut & Curated Keepsakes — Home">
          <span class="nav-logo-wordmark">Cut &amp; Curated</span>
          <span class="nav-logo-tagline">Keepsakes</span>
        </a>
        <ul class="nav-links" role="list">
          ${navLinks.map(l => `
            <li><a href="${l.href}" ${l.id === currentPage ? 'class="active" aria-current="page"' : ''}>${l.label}</a></li>
          `).join('')}
        </ul>
        <div class="nav-actions">
          <a href="${base}cart.html" class="nav-cart-btn" aria-label="View cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Cart
            <span class="cart-badge" aria-label="items in cart">0</span>
          </a>
          <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>

    <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <nav class="mobile-menu-links">
        ${navLinks.map(l => `<a href="${l.href}" ${l.id === currentPage ? 'aria-current="page"' : ''}>${l.label}</a>`).join('')}
      </nav>
      <a href="${base}cart.html" class="btn btn-outline mobile-cart-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        View Cart
      </a>
    </div>
  `;

  // ─── Footer ────────────────────────────────────────────────────
  const footerHTML = `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="${base}index.html" class="nav-logo" aria-label="Cut & Curated Keepsakes">
              <span class="nav-logo-wordmark">Cut &amp; Curated</span>
              <span class="nav-logo-tagline">Keepsakes</span>
            </a>
            <p>Personalized resin, vinyl &amp; craft keepsakes — made by hand, made with love, made for you. Based in Edmond, Oklahoma.</p>
            <div class="footer-social">
              <a href="https://instagram.com/cutandcuratedks" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Follow us on Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="mailto:hello@cutandcuratedks.com" class="social-link" aria-label="Email us">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </a>
            </div>
          </div>
          <div class="footer-col">
            <h5>Shop</h5>
            <ul>
              <li><a href="${base}shop.html#resin">Resin Keepsakes</a></li>
              <li><a href="${base}shop.html#planners">Planners &amp; Binders</a></li>
              <li><a href="${base}shop.html#pens-bookmarks">Pens &amp; Bookmarks</a></li>
              <li><a href="${base}shop.html#keychains">Keychains &amp; Charms</a></li>
              <li><a href="${base}shop.html#trays">Trinket Trays</a></li>
              <li><a href="${base}shop.html#gift-baskets">Gift Baskets</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Info</h5>
            <ul>
              <li><a href="${base}custom-orders.html">Custom Orders</a></li>
              <li><a href="${base}about.html">Our Story</a></li>
              <li><a href="${base}contact.html">Contact Us</a></li>
              <li><a href="${base}contact.html#faq">FAQs</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Location</h5>
            <ul>
              <li><a href="#">Edmond, Oklahoma</a></li>
              <li><a href="#">ZIP 73012</a></li>
              <li><a href="${base}custom-orders.html">Local Pickup Available</a></li>
              <li><a href="https://instagram.com/cutandcuratedks" target="_blank" rel="noopener noreferrer">@cutandcuratedks</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} Cut &amp; Curated Keepsakes. All rights reserved.</p>
          <p>Made with love in Edmond, Oklahoma &nbsp;·&nbsp; <a href="mailto:hello@cutandcuratedks.com">hello@cutandcuratedks.com</a></p>
        </div>
      </div>
    </footer>
  `;

  // Inject into DOM
  const navMount = document.getElementById('nav-mount');
  if (navMount) navMount.outerHTML = navHTML;

  const footerMount = document.getElementById('footer-mount');
  if (footerMount) footerMount.outerHTML = footerHTML;
})();
