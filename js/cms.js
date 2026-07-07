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
      role:    'MANAGING DIRECTOR',
      company: 'BROADCASTING COMPANY, LONDON',
      avatar:  'https://untitledui.com/images/avatars/orlando-diggs'
    },
    {
      quote:   'Network Consultancy have some really great engineers, and with their proactive approach, we are able to relax knowing our Network and security are in good hands. I would not hesitate to recommend Anup and his team.',
      role:    'IT DIRECTOR',
      company: 'PROFESSIONAL SERVICES FIRM, LONDON',
      avatar:  'https://untitledui.com/images/avatars/drew-cano'
    },
    {
      quote:   'Network Consultancy have some really great engineers, and with their proactive approach, we are able to relax knowing our Network and security are in good hands. I would not hesitate to recommend Anup and his team.',
      role:    'HEAD OF OPERATIONS',
      company: 'HEALTHCARE PROVIDER, BIRMINGHAM',
      avatar:  'https://untitledui.com/images/avatars/lana-steiner'
    },
    {
      quote:   'Network Consultancy have some really great engineers, and with their proactive approach, we are able to relax knowing our Network and security are in good hands. I would not hesitate to recommend Anup and his team.',
      role:    'MANAGING PARTNER',
      company: 'LEGAL FIRM, LONDON',
      avatar:  'https://untitledui.com/images/avatars/demi-wilkinson'
    },
    {
      quote:   'Network Consultancy have some really great engineers, and with their proactive approach, we are able to relax knowing our Network and security are in good hands. I would not hesitate to recommend Anup and his team.',
      role:    'OPERATIONS DIRECTOR',
      company: 'MANUFACTURING COMPANY, MIDLANDS',
      avatar:  'https://untitledui.com/images/avatars/zahir-mays'
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
    /* Build unique IDs so multiple sliders on one page don't clash */
    var uid  = 't' + (Date.now() % 100000);
    var pid  = uid + '-prev';
    var nid  = uid + '-next';
    var fid  = uid + '-fill';
    var tid  = uid + '-track';

    var cards = TESTIMONIALS.map(function (t) {
      return [
        '<div class="t-card">',
        '  <div class="t-stars">',
        '    <span class="t-star">&#9733;</span>'.repeat(5),
        '  </div>',
        '  <p class="t-quote">' + escHtml(t.quote) + '</p>',
        '  <div class="t-author">',
        '    <img class="t-avatar" src="' + t.avatar + '" alt="' + escHtml(t.role) + '" loading="lazy">',
        '    <div class="t-info">',
        '      <div class="t-role">' + escHtml(t.role) + '</div>',
        '      <div class="t-company">' + escHtml(t.company) + '</div>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    }).join('\n');

    container.innerHTML = [
      '<section class="testimonials">',
      '  <div class="testimonials__layout">',
      '    <div class="testimonials__left animate-fade-up">',
      '      <h2>What our<br>client says</h2>',
      '      <div class="t-nav">',
      '        <div class="t-arrows">',
      '          <img id="' + pid + '" class="t-arrow" src="/images/misc/icon-arrow-left.svg" alt="Previous testimonial">',
      '          <img id="' + nid + '" class="t-arrow" src="/images/misc/icon-arrow-right.svg" alt="Next testimonial">',
      '        </div>',
      '        <div class="t-progress">',
      '          <div id="' + fid + '" class="t-progress-fill"></div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="t-slider animate-fade-up">',
      '      <div id="' + tid + '" class="t-track">',
      cards,
      '      </div>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join('\n');

    revealAnimatedContent(container);

    /* Init slider */
    var track   = document.getElementById(tid);
    var fill    = document.getElementById(fid);
    var prevBtn = document.getElementById(pid);
    var nextBtn = document.getElementById(nid);
    var total   = TESTIMONIALS.length;
    var current = 0;

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      if (fill) fill.style.width = ((current + 1) / total * 100).toFixed(1) + '%';
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

    /* Keyboard: only fire when section is in view */
    document.addEventListener('keydown', function (e) {
      var s = container.querySelector('.testimonials');
      if (!s) return;
      var r = s.getBoundingClientRect();
      if (r.top > window.innerHeight || r.bottom < 0) return;
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    goTo(0);
  }

  function renderFAQ(container) {
    var faqSource = (typeof window !== 'undefined' && Array.isArray(window.PAGE_FAQ) && window.PAGE_FAQ.length) ? window.PAGE_FAQ : FAQ_ITEMS;
    var items = faqSource.map(function (item, i) {
      var num    = String(i + 1).padStart(2, '0');
      var state  = item.open ? 'open' : 'closed';
      var dStyle = item.open ? '' : ' style="display:none;"';
      return [
        '<div class="faq-item ' + state + ' animate-fade-up">',
        '  <div class="faq-header" role="button" tabindex="0" aria-expanded="' + item.open + '">',
        '    <div class="faq-header-left">',
        '      <span class="faq-num">' + num + '</span>',
        '      <span class="faq-q">' + escHtml(item.question) + '</span>',
        '    </div>',
        '    ' + STAR_SVG,
        '  </div>',
        '  <div class="faq-divider"' + dStyle + '></div>',
        '  <div class="faq-answer">' + escHtml(item.answer) + '</div>',
        '</div>'
      ].join('\n');
    }).join('\n');

    container.innerHTML = [
      '<section class="faq">',
      '  <h2 class="section-title animate-fade-up">FREQUENTLY ASKED QUESTIONS</h2>',
      '  <div class="faq-list stagger-children">',
      items,
      '  </div>',
      '</section>'
    ].join('\n');

    revealAnimatedContent(container);
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
