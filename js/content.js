/**
 * content.js — Content hydration layer for Cut & Curated Keepsakes
 *
 * Reads /content/pages/{pageId}.json and /content/global.json then applies
 * the values to the existing DOM. Falls back silently to hardcoded HTML if
 * any fetch fails or a selector cannot be found.
 *
 * Rules:
 *  - Simple IIFE, no imports, no ES modules.
 *  - All DOM writes happen after DOMContentLoaded.
 *  - fetch uses cache:'no-store' so edits are always fresh.
 *  - try/catch everywhere — never breaks the page.
 *  - textContent for user text; innerHTML only for hero h1 (may contain <em>).
 */
(function () {
  'use strict';

  /* ─── tiny helpers ─────────────────────────────────────────── */

  function qs(selector, root) {
    try { return (root || document).querySelector(selector); } catch (e) { return null; }
  }

  function qsa(selector, root) {
    try { return Array.from((root || document).querySelectorAll(selector)); } catch (e) { return []; }
  }

  function setText(selector, value, root) {
    if (value == null) return;
    var el = qs(selector, root);
    if (el) el.textContent = value;
  }

  function setHtml(selector, value, root) {
    if (value == null) return;
    var el = qs(selector, root);
    if (el) el.innerHTML = value;
  }

  function setAttr(selector, attr, value, root) {
    if (value == null) return;
    var el = qs(selector, root);
    if (el) el.setAttribute(attr, value);
  }

  function hideSectionEl(el) {
    if (el) el.style.display = 'none';
  }

  /* ─── fetch helper ─────────────────────────────────────────── */

  function fetchJSON(url) {
    return fetch(url, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .catch(function () { return null; });
  }

  /* ─── section appliers ─────────────────────────────────────── */

  function applyHero(section) {
    try {
      var s = section.settings || {};
      var heroEl = qs('.hero');
      if (!heroEl) return;

      if (section.visible === false) { hideSectionEl(heroEl); return; }

      setText('.hero-eyebrow', s.eyebrow, heroEl);

      // innerHTML to preserve <em> tags in heading
      if (s.heading != null) {
        var h1 = qs('h1', heroEl);
        if (h1) h1.innerHTML = s.heading;
      }

      setText('.hero-description', s.subheading, heroEl);

      var actions = qsa('.hero-actions a', heroEl);
      if (actions[0]) {
        if (s.primaryText != null) actions[0].textContent = s.primaryText;
        if (s.primaryLink != null) actions[0].href = s.primaryLink;
      }
      if (actions[1]) {
        if (s.secondaryText != null) actions[1].textContent = s.secondaryText;
        if (s.secondaryLink != null) actions[1].href = s.secondaryLink;
      }

      if (s.backgroundImage) {
        heroEl.style.backgroundImage = 'url(' + s.backgroundImage + ')';
        heroEl.style.backgroundSize = 'cover';
        heroEl.style.backgroundPosition = 'center';
      }
    } catch (e) { /* silent */ }
  }

  function applyFeaturedCollection(section) {
    try {
      var s = section.settings || {};
      if (section.visible === false) {
        var secEl = qs('#featured-grid');
        if (secEl) hideSectionEl(secEl.closest('section'));
        return;
      }

      setText('#featured-heading', s.heading);

      // Filter featured grid by productIds if provided
      if (s.productIds && s.productIds.length > 0) {
        var grid = qs('#featured-grid');
        if (grid) {
          // Wait a tick so products.js has time to render cards
          setTimeout(function () {
            try {
              var cards = qsa('[data-product-id]', grid);
              if (cards.length === 0) {
                // products.js may use different attr; try article/div children
                cards = qsa('.product-card', grid);
              }
              // Build a map of id → element
              var idMap = {};
              cards.forEach(function (card) {
                var pid = card.dataset.productId || card.getAttribute('data-id');
                if (pid) idMap[pid] = card;
              });
              // Re-order / filter
              var ids = s.productIds;
              var hasAny = ids.some(function (id) { return idMap[String(id)]; });
              if (hasAny) {
                // Remove all children then re-insert in order
                while (grid.firstChild) grid.removeChild(grid.firstChild);
                ids.forEach(function (id) {
                  var el = idMap[String(id)];
                  if (el) grid.appendChild(el);
                });
              }
            } catch (e) { /* silent */ }
          }, 200);
        }
      }

      // View-all link text
      if (s.viewAllText != null) {
        var viewAll = qs('.section a[href*="shop"]');
        if (viewAll) viewAll.textContent = s.viewAllText;
      }
    } catch (e) { /* silent */ }
  }

  function applyIconsText(section, headingId, gridSelector) {
    try {
      var s = section.settings || {};
      if (section.visible === false) {
        var headingEl = qs('#' + headingId);
        if (headingEl) hideSectionEl(headingEl.closest('section'));
        return;
      }

      setText('#' + headingId, s.heading);

      if (s.items && s.items.length > 0) {
        var cards = qsa(gridSelector + ' .feature-card');
        s.items.forEach(function (item, i) {
          var card = cards[i];
          if (!card) return;
          setText('h4', item.heading, card);
          setText('p', item.text, card);
        });
      }
    } catch (e) { /* silent */ }
  }

  function applyTestimonials(section) {
    try {
      var s = section.settings || {};
      if (section.visible === false) {
        var secEl = qs('.testimonials-section');
        if (secEl) hideSectionEl(secEl);
        return;
      }

      setText('#testimonials-heading', s.heading);

      if (s.items && s.items.length > 0) {
        var cards = qsa('.testimonials-grid .testimonial-card');
        s.items.forEach(function (item, i) {
          var card = cards[i];
          if (!card) return;
          var quote = qs('blockquote', card);
          if (quote && item.text != null) quote.textContent = '“' + item.text + '”';
          setText('.testimonial-name', item.name, card);
          setText('.testimonial-location', item.location, card);
        });
      }
    } catch (e) { /* silent */ }
  }

  function applyNewsletter(section) {
    try {
      var s = section.settings || {};
      if (section.visible === false) {
        var secEl = qs('.newsletter-section');
        if (secEl) hideSectionEl(secEl);
        return;
      }

      setText('#newsletter-heading', s.heading);

      // Subtitle paragraph — first <p> inside .newsletter-section
      if (s.subheading != null) {
        var sub = qs('.newsletter-section p');
        if (sub) sub.textContent = s.subheading;
      }

      setText('#newsletter-form button[type=submit]', s.buttonText);

      if (s.placeholder != null) {
        setAttr('#newsletter-email', 'placeholder', s.placeholder);
      }
    } catch (e) { /* silent */ }
  }

  /* ─── about page ────────────────────────────────────────────── */

  function applyTextImage(section) {
    try {
      var s = section.settings || {};
      var storySection = qs('#story-heading');
      var secEl = storySection ? storySection.closest('section') : null;

      if (section.visible === false) { hideSectionEl(secEl); return; }

      // eyebrow — first .script inside .about-text
      if (s.eyebrow != null) {
        var eyebrow = qs('.about-text .script');
        if (eyebrow) eyebrow.textContent = s.eyebrow;
      }

      setText('#story-heading', s.heading);

      // Body paragraphs — split on double newline
      if (s.body != null) {
        var paras = s.body.split(/\n\n+/);
        var pEls = qsa('.about-text p');
        paras.forEach(function (text, i) {
          if (pEls[i]) pEls[i].textContent = text;
        });
      }

      // Image
      if (s.image != null) {
        var img = qs('.about-image img');
        if (img) {
          img.src = s.image;
          if (s.imageAlt != null) img.alt = s.imageAlt;
        }
      }

      // CTA buttons
      var primaryBtn = qs('.about-text .btn-primary');
      if (primaryBtn) {
        if (s.primaryText != null) primaryBtn.textContent = s.primaryText;
        if (s.primaryLink != null) primaryBtn.href = s.primaryLink;
      }
      var secondaryBtn = qs('.about-text .btn-outline');
      if (secondaryBtn) {
        if (s.secondaryText != null) secondaryBtn.textContent = s.secondaryText;
        if (s.secondaryLink != null) secondaryBtn.href = s.secondaryLink;
      }
    } catch (e) { /* silent */ }
  }

  /* ─── shop / custom-orders page-header ─────────────────────── */

  function applyPageHeader(section) {
    try {
      var s = section.settings || {};
      var pageHero = qs('.page-hero');
      if (!pageHero) return;

      if (section.visible === false) { hideSectionEl(pageHero); return; }

      // eyebrow — .script or span.script inside .page-hero
      if (s.eyebrow != null) {
        var eyebrow = qs('.script', pageHero) || qs('span.script', pageHero);
        if (eyebrow) eyebrow.textContent = s.eyebrow;
      }

      setText('h1', s.heading, pageHero);
      setText('p', s.subheading, pageHero);
    } catch (e) { /* silent */ }
  }

  /* ─── contact page text-block ───────────────────────────────── */

  function applyContactTextBlock(section) {
    try {
      var s = section.settings || {};
      var pageHero = qs('.page-hero');

      if (section.visible === false) {
        if (pageHero) hideSectionEl(pageHero);
        return;
      }

      // page-hero headings
      if (pageHero) {
        if (s.eyebrow != null) {
          var eyebrow = qs('.script', pageHero);
          if (eyebrow) eyebrow.textContent = s.eyebrow;
        }
        setText('h1', s.heading, pageHero);
        setText('p', s.subheading, pageHero);
      }

      // email link
      if (s.email != null) {
        var emailLink = qs('.contact-info a[href^="mailto:"]');
        if (emailLink) {
          emailLink.textContent = s.email;
          emailLink.href = 'mailto:' + s.email;
        }
      }

      // response time text
      if (s.responseTime != null) {
        // The <p> following the email <a>
        var emailItem = qs('.contact-info a[href^="mailto:"]');
        if (emailItem) {
          var responseEl = emailItem.nextElementSibling;
          if (responseEl && responseEl.tagName === 'P') {
            responseEl.textContent = s.responseTime;
          }
        }
      }
    } catch (e) { /* silent */ }
  }

  /* ─── global.json applier ───────────────────────────────────── */

  function applyGlobal(data) {
    try {
      // ── Announcement bar ─────────────────────────────────────
      if (data.announcementBar) {
        var bar = data.announcementBar;
        var existingBar = qs('#announcement-bar');
        if (bar.visible === true) {
          var nav = qs('#main-nav');
          if (nav && !existingBar) {
            var barEl = document.createElement('div');
            barEl.id = 'announcement-bar';
            barEl.textContent = bar.text || '';
            barEl.style.cssText = [
              'background:' + (bar.backgroundColor || '#c9a96e'),
              'color:' + (bar.textColor || '#fff'),
              'text-align:center',
              'padding:8px 16px',
              'font-size:.85rem',
              'font-weight:500',
              'letter-spacing:.02em'
            ].join(';');
            nav.parentNode.insertBefore(barEl, nav);
          } else if (existingBar) {
            existingBar.style.display = '';
            if (bar.text != null) existingBar.textContent = bar.text;
            if (bar.backgroundColor) existingBar.style.background = bar.backgroundColor;
          }
        } else {
          if (existingBar) existingBar.style.display = 'none';
        }
      }

      // ── Nav logo ─────────────────────────────────────────────
      if (data.header) {
        var h = data.header;
        // Update all instances of nav-logo-wordmark / nav-logo-tagline
        if (h.logoText != null) {
          qsa('#main-nav .nav-logo-wordmark').forEach(function (el) {
            el.textContent = h.logoText;
          });
        }
        if (h.logoSub != null) {
          qsa('#main-nav .nav-logo-tagline').forEach(function (el) {
            el.textContent = h.logoSub;
          });
        }
      }

      // ── Footer ───────────────────────────────────────────────
      if (data.footer) {
        var f = data.footer;
        if (f.tagline != null) {
          // .footer-tagline or the brand paragraph in the footer
          var taglineEl = qs('.footer-tagline') || qs('footer .footer-brand p');
          if (taglineEl) taglineEl.textContent = f.tagline;
        }
        if (f.copyright != null) {
          var copyrightEl = qs('.footer-bottom p:first-child');
          if (copyrightEl) copyrightEl.textContent = f.copyright;
        }
      }
    } catch (e) { /* silent */ }
  }

  /* ─── page-level dispatcher ─────────────────────────────────── */

  function applyPageData(pageId, data) {
    if (!data || !Array.isArray(data.sections)) return;
    data.sections.forEach(function (section) {
      try {
        var id   = section.id   || '';
        var type = section.type || '';

        if (pageId === 'home') {
          if (type === 'hero')                                   applyHero(section);
          else if (type === 'featured-collection')               applyFeaturedCollection(section);
          else if (type === 'icons-text' && id === 'how-it-works') applyIconsText(section, 'process-heading', '.features-grid');
          else if (type === 'testimonials')                      applyTestimonials(section);
          else if (type === 'newsletter')                        applyNewsletter(section);

        } else if (pageId === 'about') {
          if (type === 'text-image' && id === 'story')          applyTextImage(section);
          else if (type === 'icons-text' && id === 'values')    applyIconsText(section, 'values-heading', '.features-grid');

        } else if (pageId === 'shop') {
          if (type === 'page-header')                            applyPageHeader(section);

        } else if (pageId === 'contact') {
          if (type === 'text-block')                             applyContactTextBlock(section);

        } else if (pageId === 'custom' || pageId === 'custom-orders') {
          if (type === 'page-header')                            applyPageHeader(section);
        }
      } catch (e) { /* silent */ }
    });
  }

  /* ─── bootstrap ─────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    var pageId = (document.body.dataset.page || '').trim();
    if (!pageId) return;

    // Map data-page="custom" to the JSON file "custom-orders.json"
    var jsonPageId = pageId === 'custom' ? 'custom-orders' : pageId;

    // Fetch page JSON and global JSON in parallel
    Promise.all([
      fetchJSON('/content/pages/' + jsonPageId + '.json'),
      fetchJSON('/content/global.json')
    ]).then(function (results) {
      var pageData   = results[0];
      var globalData = results[1];

      if (pageData)   applyPageData(pageId, pageData);
      if (globalData) applyGlobal(globalData);
    });
  });

})();
