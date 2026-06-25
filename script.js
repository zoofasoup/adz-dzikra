/**
 * ============================================================
 *  Adz Dzikra — Landing Page Script
 *  Vanilla JS · No Dependencies
 * ============================================================
 *
 *  Sections handled:
 *    1. Navigation (sticky, smooth scroll, active highlight)
 *    2. Scroll‑triggered animations (Intersection Observer)
 *    3. Sticky CTA bar
 *    4. Product showcase interactions
 *    5. FAQ accordion
 *    6. Grosir form → WhatsApp
 *    7. WA CTA links (eceran)
 *    8. Pricing toggle
 *    9. Analytics event tracking stubs
 *   10. Scroll‑depth tracking
 *   11. Mobile menu
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* -------------------------------------------------------
   *  0. CONSTANTS & CACHED DOM NODES
   * ----------------------------------------------------- */

  /** @type {string} Replace with the actual WhatsApp number */
  const WA_NUMBER = '628XXX';

  const nav          = document.getElementById('navbar');
  const heroSection  = document.getElementById('hero');
  const orderSection = document.getElementById('order');
  const stickyCTA    = document.getElementById('stickyCta');
  const mobileToggle = document.querySelector('.nav-toggle');
  const mobileMenu   = document.querySelector('.nav-mobile');
  const mobileOverlay = document.querySelector('.nav-mobile-overlay');
  const navLinks     = document.querySelectorAll('a[href^="#"]');
  const sections     = document.querySelectorAll('section[id]');
  const faqItems     = document.querySelectorAll('.faq-item');
  const grosirForm   = document.getElementById('grosirForm');
  const pricingToggles = document.querySelectorAll('.pricing-toggle, [data-pricing-toggle]');

  /* -------------------------------------------------------
   *  1. NAVIGATION
   * ----------------------------------------------------- */

  // 1a. Sticky nav — toggle navbar--solid / navbar--transparent
  const handleStickyNav = () => {
    if (!nav || !heroSection) return;

    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

    if (window.scrollY > heroBottom) {
      nav.classList.remove('navbar--transparent');
      nav.classList.add('navbar--solid');
    } else {
      nav.classList.remove('navbar--solid');
      nav.classList.add('navbar--transparent');
    }
  };

  // 1b. Smooth scroll for anchor links & CTAs
  const smoothScrollTo = (targetEl) => {
    if (!targetEl) return;

    const navHeight = nav ? nav.offsetHeight : 0;
    const top = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        smoothScrollTo(target);

        // Close mobile menu if open
        closeMobileMenu();
      }
    });
  });

  // 1c. Active section highlighting in nav
  const activateNavLink = () => {
    if (!sections.length) return;

    const scrollY   = window.scrollY;
    const navHeight = nav ? nav.offsetHeight : 0;

    let current = '';

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - navHeight - 100;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  };


  /* -------------------------------------------------------
   *  2. SCROLL ANIMATIONS (Intersection Observer)
   * ----------------------------------------------------- */

  // 2a. Generic .animate-in → .visible
  const animateInObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          animateInObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.animate-in').forEach((el) => {
    animateInObserver.observe(el);
  });

  // 2b. Staggered animations for grid items
  const staggerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const children = entry.target.querySelectorAll(
          '.grid-item, .card, .product-card, .feature-item, .testimonial-card'
        );

        children.forEach((child, index) => {
          // Stagger each child by 120ms
          child.style.transitionDelay = `${index * 120}ms`;
          child.classList.add('visible');
        });

        staggerObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(
    '.grid, .card-grid, .product-grid, .features-grid, .testimonials-grid'
  ).forEach((grid) => {
    staggerObserver.observe(grid);
  });

  // 2c. Trust bar counter animation
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach((counter) => animateCounter(counter));

        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  /**
   * Animate a number from 0 to its data-count value.
   * Supports an optional data-suffix attribute (e.g. "+", "K").
   */
  const animateCounter = (el) => {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = 2000; // ms
    const start    = performance.now();

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      el.textContent = Math.floor(eased * target).toLocaleString('id-ID') + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // Observe trust bar counters
  const trustSection = document.getElementById('trust');
  if (trustSection) {
    counterObserver.observe(trustSection);
  }


  /* -------------------------------------------------------
   *  3. STICKY CTA BAR
   * ----------------------------------------------------- */

  const handleStickyCTA = () => {
    if (!stickyCTA || !heroSection) return;

    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    const pastHero   = window.scrollY > heroBottom;

    // Hide when #order section is visible in the viewport
    let orderVisible = false;
    if (orderSection) {
      const rect = orderSection.getBoundingClientRect();
      orderVisible = rect.top < window.innerHeight && rect.bottom > 0;
    }

    if (pastHero && !orderVisible) {
      stickyCTA.classList.add('visible');
      stickyCTA.setAttribute('aria-hidden', 'false');
    } else {
      stickyCTA.classList.remove('visible');
      stickyCTA.setAttribute('aria-hidden', 'true');
    }
  };


  /* -------------------------------------------------------
   *  4. PRODUCT SHOWCASE INTERACTIONS
   * ----------------------------------------------------- */

  // 4a. Card flip / expand
  document.querySelectorAll('.product-card[data-flip]').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      const isFlipped = card.classList.contains('flipped');
      card.setAttribute('aria-expanded', String(isFlipped));
    });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // 4b. Progress indicator animation
  const progressObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const bars = entry.target.querySelectorAll('.progress-bar, [data-progress]');
        bars.forEach((bar) => {
          const value = bar.getAttribute('data-progress') || bar.style.getPropertyValue('--progress') || '100';
          bar.style.setProperty('--progress', value);
          bar.classList.add('animate');
        });

        progressObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.product-showcase, .showcase').forEach((section) => {
    progressObserver.observe(section);
  });


  /* -------------------------------------------------------
   *  5. FAQ ACCORDION
   * ----------------------------------------------------- */

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');

    if (!question || !answer) return;

    // Initial ARIA setup
    const id = answer.id || `faq-answer-${Math.random().toString(36).slice(2, 9)}`;
    answer.id = id;
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', id);
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', question.id || '');

    // Collapse by default (set max-height to 0)
    answer.style.maxHeight = '0';
    answer.style.overflow  = 'hidden';
    answer.style.transition = 'max-height 0.35s ease, opacity 0.35s ease';
    answer.style.opacity   = '0';

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close all other items first (only‑one‑open behaviour)
      faqItems.forEach((other) => {
        const otherQ = other.querySelector('.faq-question');
        const otherA = other.querySelector('.faq-answer');
        if (other !== item && otherQ && otherA) {
          otherQ.setAttribute('aria-expanded', 'false');
          other.classList.remove('active');
          otherA.style.maxHeight = '0';
          otherA.style.opacity   = '0';
        }
      });

      // Toggle current item
      if (isOpen) {
        question.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
        answer.style.maxHeight = '0';
        answer.style.opacity   = '0';
      } else {
        question.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity   = '1';

        trackEvent('faq_open', { question: question.textContent.trim().slice(0, 60) });
      }
    });

    // Keyboard accessibility
    question.setAttribute('tabindex', '0');
    question.setAttribute('role', 'button');

    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });


  /* -------------------------------------------------------
   *  6. GROSIR FORM → WHATSAPP
   * ----------------------------------------------------- */

  if (grosirForm) {
    grosirForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather fields
      const getValue = (name) => {
        const el = grosirForm.querySelector(`[name="${name}"]`);
        return el ? el.value.trim() : '';
      };

      const nama     = getValue('nama');
      const instansi = getValue('instansi');
      const kota     = getValue('kota');
      const jumlah   = getValue('jumlah') || getValue('qty');
      const wa       = getValue('whatsapp') || getValue('wa');

      // Validate required fields
      const errors = [];
      if (!nama)     errors.push('Nama wajib diisi');
      if (!instansi) errors.push('Instansi wajib diisi');
      if (!kota)     errors.push('Kota wajib diisi');
      if (!jumlah)   errors.push('Jumlah paket wajib diisi');
      if (!wa)       errors.push('Nomor WhatsApp wajib diisi');

      if (errors.length) {
        // Show inline validation (add .error class to empty fields)
        ['nama', 'instansi', 'kota', 'jumlah', 'qty', 'whatsapp', 'wa'].forEach((name) => {
          const field = grosirForm.querySelector(`[name="${name}"]`);
          if (field) {
            if (!field.value.trim()) {
              field.classList.add('error');
              field.setAttribute('aria-invalid', 'true');
            } else {
              field.classList.remove('error');
              field.removeAttribute('aria-invalid');
            }
          }
        });

        // Focus on first invalid field
        const firstInvalid = grosirForm.querySelector('.error');
        if (firstInvalid) firstInvalid.focus();

        return;
      }

      // Construct WhatsApp message
      const message = [
        'Halo Adz Dzikra, saya ingin menanyakan pemesanan grosir:',
        '',
        `Nama: ${nama}`,
        `Instansi: ${instansi}`,
        `Kota: ${kota}`,
        `Jumlah Paket: ${jumlah} paket`,
        `No. WA: ${wa}`,
      ].join('\n');

      const waURL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

      // Track event
      trackEvent('click_wa_grosir', { nama, kota, jumlah });
      trackEvent('form_submit_grosir', { nama, instansi, kota, jumlah });

      // Open WhatsApp in new tab
      window.open(waURL, '_blank', 'noopener,noreferrer');
    });

    // Clear error state on input
    grosirForm.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
      });
    });
  }


  /* -------------------------------------------------------
   *  7. WA CTA LINKS (Eceran)
   * ----------------------------------------------------- */

  /**
   * Bind click handlers to all WA order buttons.
   * Buttons should have [data-wa] or [data-wa-type] attribute:
   *   data-wa-type="eceran"  → standard retail message
   *   data-wa-type="grosir"  → scrolls to grosir form
   */
  document.querySelectorAll('[data-wa], .wa-order-btn, .btn-wa').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const type = btn.getAttribute('data-wa-type') || btn.getAttribute('data-wa') || 'eceran';

      if (type === 'grosir') {
        // Scroll to the grosir form instead
        e.preventDefault();
        const grosirSection = document.getElementById('grosir') || grosirForm;
        if (grosirSection) smoothScrollTo(grosirSection);
        trackEvent('click_wa_grosir', { source: 'cta_button' });
        return;
      }

      // Eceran (retail) — open WA with pre-filled message
      e.preventDefault();
      const message = 'Halo, saya mau pesan Adz Dzikra. Mohon info cara pemesanan.';
      const waURL   = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

      trackEvent('click_wa_order', { type: 'eceran', source: btn.textContent.trim().slice(0, 30) });

      window.open(waURL, '_blank', 'noopener,noreferrer');
    });
  });

  // Marketplace buttons (Shopee / Tokopedia)
  document.querySelectorAll('[data-marketplace]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const platform = btn.getAttribute('data-marketplace');
      trackEvent(`click_${platform}`, { url: btn.href || '' });
    });
  });


  /* -------------------------------------------------------
   *  8. PRICING TOGGLE
   * ----------------------------------------------------- */

  pricingToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const mode = toggle.getAttribute('data-mode');
      const newMode = mode === 'paket' ? 'jilid' : 'paket';

      // Update all toggles
      pricingToggles.forEach((t) => {
        t.setAttribute('data-mode', newMode);
        t.classList.toggle('active-paket', newMode === 'paket');
        t.classList.toggle('active-jilid', newMode === 'jilid');
        t.setAttribute('aria-pressed', String(newMode === 'paket'));
      });

      // Show/hide pricing elements
      document.querySelectorAll('[data-pricing]').forEach((el) => {
        const pricingType = el.getAttribute('data-pricing');
        if (pricingType === newMode) {
          el.classList.add('pricing-visible');
          el.classList.remove('pricing-hidden');
          el.removeAttribute('hidden');
        } else {
          el.classList.remove('pricing-visible');
          el.classList.add('pricing-hidden');
          el.setAttribute('hidden', '');
        }
      });

      trackEvent('pricing_toggle', { mode: newMode });
    });
  });


  /* -------------------------------------------------------
   *  9. ANALYTICS EVENT TRACKING (STUBS)
   * ----------------------------------------------------- */

  /**
   * Fire an analytics event to Google Analytics 4, Meta Pixel,
   * and the browser console.
   *
   * @param {string}              eventName - e.g. 'click_shopee'
   * @param {Record<string, any>} [params]  - optional payload
   */
  function trackEvent(eventName, params = {}) {
    // Console log for development
    console.log(`[Adz Dzikra Analytics] ${eventName}`, params);

    // Google Analytics 4 (gtag.js)
    if (typeof gtag === 'function') {
      try {
        gtag('event', eventName, params);
      } catch (err) {
        console.warn('[GA4] Failed to send event:', err);
      }
    }

    // Meta Pixel (fbq)
    if (typeof fbq === 'function') {
      try {
        // Map custom events → Meta standard / custom events
        const metaMap = {
          click_wa_order:      'Contact',
          click_wa_grosir:     'Contact',
          form_submit_grosir:  'Lead',
          click_shopee:        'ViewContent',
          click_tokopedia:     'ViewContent',
        };

        const metaEvent = metaMap[eventName] || eventName;
        fbq('trackCustom', metaEvent, params);
      } catch (err) {
        console.warn('[Meta Pixel] Failed to send event:', err);
      }
    }
  }

  // Expose globally for inline onclick handlers if needed
  window.adzTrackEvent = trackEvent;


  /* -------------------------------------------------------
   *  10. SCROLL DEPTH TRACKING
   * ----------------------------------------------------- */

  const scrollDepthMarks = new Set();

  const trackScrollDepth = () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

    [25, 50, 75, 100].forEach((mark) => {
      if (scrollPercent >= mark && !scrollDepthMarks.has(mark)) {
        scrollDepthMarks.add(mark);
        trackEvent('scroll_depth', { percent: mark });
      }
    });
  };


  /* -------------------------------------------------------
   *  11. MOBILE MENU
   * ----------------------------------------------------- */

  let menuOpen = false;

  const openMobileMenu = () => {
    if (!mobileMenu || !mobileToggle) return;
    menuOpen = true;

    mobileMenu.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    mobileToggle.classList.add('active');
    mobileToggle.setAttribute('aria-expanded', 'true');

    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.classList.add('menu-open');
  };

  const closeMobileMenu = () => {
    if (!mobileMenu || !mobileToggle) return;
    menuOpen = false;

    mobileMenu.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');

    // Unlock body scroll
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
  };

  if (mobileToggle) {
    mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
    mobileToggle.setAttribute('aria-expanded', 'false');

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuOpen ? closeMobileMenu() : openMobileMenu();
    });
  }

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (
      menuOpen &&
      mobileMenu &&
      !mobileMenu.contains(e.target) &&
      mobileToggle &&
      !mobileToggle.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) {
      closeMobileMenu();
      mobileToggle?.focus();
    }
  });


  /* -------------------------------------------------------
   *  SCROLL EVENT HANDLER (unified, performant)
   * ----------------------------------------------------- */

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      handleStickyNav();
      handleStickyCTA();
      activateNavLink();
      trackScrollDepth();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Fire once on load to set initial state
  onScroll();


  /* -------------------------------------------------------
   *  RESIZE HANDLER
   * ----------------------------------------------------- */

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Close mobile menu on desktop resize
      if (window.innerWidth > 768 && menuOpen) {
        closeMobileMenu();
      }
    }, 150);
  }, { passive: true });


  /* -------------------------------------------------------
   *  CONSOLE GREETING
   * ----------------------------------------------------- */

  console.log(
    '%c📚 Adz Dzikra %c— Buku Teks Islami',
    'color:#2d6a4f;font-size:16px;font-weight:bold',
    'color:#555;font-size:14px'
  );
});
