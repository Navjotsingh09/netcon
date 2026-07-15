/**
 * cms.js — Network Consultancy shared content CMS
 *
 * Edit TESTIMONIALS and FAQ_ITEMS below to update every page at once.
 *
 * Usage: add a container to any page and include this script:
 *   <div data-cms="testimonials"></div>
 *   <div data-cms="faq"></div>
 *   <script src="/js/cms.js" defer></script>  (adjust path depth as needed)
 *
 * Subpages: use ../../js/cms.js etc.
 */
(function () {
  'use strict';

  /* ============================================================
     EDIT BELOW — all testimonials and FAQs site-wide
  ============================================================ */

  var TESTIMONIALS = [
    {
      quote:   'Network Consultancy have some really great engineers, and with their proactive approach, we are able to relax knowing our Network and security are in good hands. I would not hesitate to recommend Anup and his team.',
      name:    'Managing Director',
      role:    'Broadcasting Company, London',
      avatar:  '/images/features/feature-1.jpg'
    },
    {
      quote:   'Network Consultancy have some really great engineers, and with their proactive approach, we are able to relax knowing our Network and security are in good hands. I would not hesitate to recommend Anup and his team.',
      name:    'IT Director',
      role:    'Professional Services Firm, London',
      avatar:  '/images/features/feature-2.jpg'
    },
    {
      quote:   'Network Consultancy have some really great engineers, and with their proactive approach, we are able to relax knowing our Network and security are in good hands. I would not hesitate to recommend Anup and his team.',
      name:    'Head of Operations',
      role:    'Healthcare Provider, Birmingham',
      avatar:  '/images/services/service-1.jpg'
    },
    {
      quote:   'Network Consultancy have some really great engineers, and with their proactive approach, we are able to relax knowing our Network and security are in good hands. I would not hesitate to recommend Anup and his team.',
      name:    'Managing Partner',
      role:    'Legal Firm, London',
      avatar:  '/images/services/service-2.jpg'
    },
    {
      quote:   'Network Consultancy have some really great engineers, and with their proactive approach, we are able to relax knowing our Network and security are in good hands. I would not hesitate to recommend Anup and his team.',
      name:    'Operations Director',
      role:    'Manufacturing Company, Midlands',
      avatar:  '/images/services/service-3.jpg'
    }
  ];

  var FAQ_ITEMS = [
    {
      question: 'Can network consultancy help reduce cybersecurity risks?',
      answer:   'Yes. We do security audits to update out-of-date firewall configurations and block unauthorised device access before hackers can breach your data perimeter.',
      open:     true
    },
    {
      question: 'Do you provide support for businesses with multiple locations?',
      answer:   'Yes, we provide comprehensive multi-site support to ensure seamless network connectivity and management across all your business locations.',
      open:     false
    },
    {
      question: 'What makes Network Consultancy different from larger IT providers?',
      answer:   'We offer personalised, expert-led service with deep technical expertise and a commitment to understanding your business goals, delivering tailored solutions rather than one-size-fits-all approaches.',
      open:     false
    }
  ];

  /* ============================================================
     RENDER — do not edit below unless changing structure
  ============================================================ */

  var STAR_SVG = '<svg class="faq-icon" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M25 0L31.7523 18.2477L50 25L31.7523 31.7523L25 50L18.2477 31.7523L0 25L18.2477 18.2477L25 0Z" fill="white"/></svg>';

  function revealAnimatedContent(container) {
    container.querySelectorAll('.animate-fade-up, .animate-fade-in').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  function renderTestimonials(container) {
    var cards = TESTIMONIALS.map(function (t) {
      return [
        '<article class="nd-t-card">',
        '  <p class="nd-t-card__quote">\u201c' + escHtml(t.quote) + '\u201d</p>',
        '  <div class="nd-t-card__person">',
        '    <span class="nd-t-card__avatar" aria-hidden="true"><img src="' + t.avatar + '" alt="" loading="lazy"></span>',
        '    <div>',
        '      <p class="nd-t-card__name">' + escHtml(t.name) + '</p>',
        '      <p class="nd-t-card__role">' + escHtml(t.role) + '</p>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('\n');
    }).join('\n');

    var testimonialsTitle = container.getAttribute('data-title') || 'Trusted by Families and Small Business';

    container.innerHTML = [
      '<section class="nd-trusted section-shell">',
      '  <div class="nd-trusted__head">',
      '    <h2 class="nd-trusted__title">' + escHtml(testimonialsTitle) + '</h2>',
      '    <div class="nd-trusted__controls">',
      '      <button type="button" class="nd-trusted__nav nd-trusted__nav--prev" aria-label="Previous testimonial"><span aria-hidden="true">&#8249;</span></button>',
      '      <button type="button" class="nd-trusted__nav nd-trusted__nav--next" aria-label="Next testimonial"><span aria-hidden="true">&#8250;</span></button>',
      '    </div>',
      '  </div>',
      '  <div class="nd-trusted__viewport">',
      '    <div class="nd-trusted__track">',
      cards,
      '    </div>',
      '  </div>',
      '  <div class="nd-trusted__dots" aria-hidden="true"></div>',
      '</section>'
    ].join('\n');

    revealAnimatedContent(container);
    initTrustedSlider(container.querySelector('.nd-trusted'));
  }

  function initTrustedSlider(trusted) {
    if (!trusted) return;
    var track = trusted.querySelector('.nd-trusted__track');
    var prevBtn = trusted.querySelector('.nd-trusted__nav--prev');
    var nextBtn = trusted.querySelector('.nd-trusted__nav--next');
    var dotsWrap = trusted.querySelector('.nd-trusted__dots');
    if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

    var desktopQuery = window.matchMedia('(min-width: 1025px)');
    var baseTranslate = -175;
    var step = 0;
    var currentIndex = 0;
    var cardCount = 0;
    var dots = [];
    var isAnimating = false;
    var transitionMs = 420;
    var isDesktop = desktopQuery.matches;

    function extractTranslateX(node) {
      var t = window.getComputedStyle(node).transform;
      if (!t || t === 'none') return 0;
      var m = t.match(/matrix\(([^)]+)\)/);
      if (m) {
        var parts = m[1].split(',');
        return parseFloat(parts[4]) || 0;
      }
      return 0;
    }

    function updateDots() {
      if (!dots.length || !cardCount) return;
      var dotIndex = ((currentIndex % cardCount) + cardCount) % cardCount;
      dots.forEach(function (dot, i) {
        dot.classList.toggle('nd-trusted__dot--active', i === dotIndex);
      });
    }

    function setDesktopState(enabled) {
      isDesktop = enabled;
      if (!isDesktop) {
        isAnimating = false;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        track.style.transition = '';
        track.style.transform = '';
        track.style.willChange = '';
        currentIndex = 0;
        updateDots();
        return;
      }
      prevBtn.disabled = false;
      nextBtn.disabled = false;
      track.style.transition = 'transform ' + transitionMs + 'ms cubic-bezier(0.22, 0.61, 0.36, 1)';
      track.style.willChange = 'transform';
      track.style.transform = 'translateX(' + baseTranslate + 'px)';
      currentIndex = 0;
      updateDots();
    }

    function recalcMetrics() {
      var cards = Array.prototype.slice.call(track.querySelectorAll('.nd-t-card'));
      cardCount = cards.length;
      if (cardCount < 2) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }
      var firstLeft = cards[0].offsetLeft;
      var secondLeft = cards[1].offsetLeft;
      step = Math.max(1, secondLeft - firstLeft);

      if (!dots.length || dots.length !== cardCount) {
        dotsWrap.innerHTML = '';
        for (var i = 0; i < cardCount; i += 1) {
          var dot = document.createElement('span');
          dot.className = 'nd-trusted__dot';
          dotsWrap.appendChild(dot);
        }
        dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('.nd-trusted__dot'));
      }
    }

    function onNext() {
      if (!isDesktop || isAnimating || cardCount < 2) return;
      isAnimating = true;
      var done = false;

      function finish() {
        if (done) return;
        done = true;
        track.removeEventListener('transitionend', onEnd);
        var first = track.firstElementChild;
        if (first) track.appendChild(first);
        track.style.transition = 'none';
        track.style.transform = 'translateX(' + baseTranslate + 'px)';
        void track.offsetHeight;
        track.style.transition = 'transform ' + transitionMs + 'ms cubic-bezier(0.22, 0.61, 0.36, 1)';
        currentIndex = (currentIndex + 1) % cardCount;
        updateDots();
        isAnimating = false;
      }

      function onEnd(event) {
        if (event.propertyName !== 'transform') return;
        finish();
      }

      track.addEventListener('transitionend', onEnd);
      track.style.transform = 'translateX(' + (baseTranslate - step) + 'px)';
      window.setTimeout(finish, transitionMs + 60);
    }

    function onPrev() {
      if (!isDesktop || isAnimating || cardCount < 2) return;
      isAnimating = true;
      var done = false;
      var last = track.lastElementChild;
      if (last) track.insertBefore(last, track.firstElementChild);

      track.style.transition = 'none';
      track.style.transform = 'translateX(' + (baseTranslate - step) + 'px)';
      void track.offsetHeight;
      track.style.transition = 'transform ' + transitionMs + 'ms cubic-bezier(0.22, 0.61, 0.36, 1)';
      track.style.transform = 'translateX(' + baseTranslate + 'px)';

      function finish() {
        if (done) return;
        done = true;
        track.removeEventListener('transitionend', onEnd);
        currentIndex = (currentIndex - 1 + cardCount) % cardCount;
        updateDots();
        isAnimating = false;
      }

      function onEnd(event) {
        if (event.propertyName !== 'transform') return;
        finish();
      }

      track.addEventListener('transitionend', onEnd);
      window.setTimeout(finish, transitionMs + 60);
    }

    function configure() {
      recalcMetrics();
      if (!desktopQuery.matches) {
        setDesktopState(false);
        return;
      }
      if (!isDesktop) {
        setDesktopState(true);
      } else {
        baseTranslate = extractTranslateX(track) || -175;
        track.style.transform = 'translateX(' + baseTranslate + 'px)';
        updateDots();
      }
    }

    prevBtn.addEventListener('click', onPrev);
    nextBtn.addEventListener('click', onNext);

    trusted.addEventListener('keydown', function (event) {
      if (!isDesktop) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); onPrev(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); onNext(); }
    });

    window.addEventListener('resize', configure);
    configure();
  }

  function renderFAQ(container) {
    var faqSource = (typeof window !== 'undefined' && Array.isArray(window.PAGE_FAQ) && window.PAGE_FAQ.length) ? window.PAGE_FAQ : FAQ_ITEMS;
    var items = faqSource.map(function (item, i) {
      var openAttr = item.open ? ' is-open' : '';
      var mark     = item.open ? '\u2212' : '+';
      var hidden   = item.open ? '' : ' hidden';
      return [
        '<button class="nd-faq__item' + openAttr + '"><span>' + escHtml(item.question) + '</span><strong>' + mark + '</strong></button>',
        '<div class="nd-faq__panel"' + hidden + '>' + escHtml(item.answer) + '</div>'
      ].join('\n');
    }).join('\n');

    container.innerHTML = [
      '<section class="nd-faq section-shell">',
      '  <div class="nd-faq__left">',
      '    <h2 class="section-title">Frequently Asked Questions</h2>',
      '    <p>Still have questions? Get connected to our support team.</p>',
      '    <a href="/contact.html" class="nd-faq__cta">Contact us</a>',
      '  </div>',
      '  <div class="nd-faq__right" data-faq-list>',
      items,
      '  </div>',
      '</section>'
    ].join('\n');

    revealAnimatedContent(container);
    /* Click handling for .nd-faq__item is handled globally via event
       delegation in js/global.js, which works for both static HTML and
       CMS-injected FAQs. Do not attach a second listener here — doing so
       causes each click to fire twice (open, then immediately close). */
  }

  /* ── HTML escaping ─────────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Auto-init ─────────────────────────────────────────────── */
  function init() {
    document.querySelectorAll('[data-cms="testimonials"]').forEach(renderTestimonials);
    document.querySelectorAll('[data-cms="faq"]').forEach(renderFAQ);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
