/**
 * Network Consultancy — Site Navbar
 * Single source of truth for navbar markup + all nav behaviour
 * (mega menus, mobile drawer, sticky state, active links).
 * Injected into <div id="site-navbar"></div> on every page.
 */
(function () {
  'use strict';
  var holder = document.getElementById('site-navbar');
  if (!holder || holder.getAttribute('data-navbar-ready')) return;
  holder.setAttribute('data-navbar-ready', '1');

  /* ── Inline icon set (24×24, stroke) ─────────────────────── */
  function ico(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var ICONS = {
    bulb:      ico('<path d="M9.5 17.5h5M10.5 20.5h3M12 3a6 6 0 0 0-3.9 10.6c.6.5.9 1.2.9 1.9h6c0-.7.3-1.4.9-1.9A6 6 0 0 0 12 3z"/>'),
    nodes:     ico('<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M6.3 7.8 10.7 16M17.7 7.8 13.3 16M7.2 6h9.6"/>'),
    tool:      ico('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
    headset:   ico('<path d="M4.5 13a7.5 7.5 0 0 1 15 0"/><rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/><path d="M19.5 19a3 3 0 0 1-3 3H13"/>'),
    gauge:     ico('<path d="M12 14.5 15.5 11"/><path d="M20.5 15.5a8.5 8.5 0 1 0-17 0"/><path d="M5 19h14"/>'),
    wifi:      ico('<path d="M2.5 9.5a15 15 0 0 1 19 0M5.5 13a10 10 0 0 1 13 0M8.6 16.4a5.3 5.3 0 0 1 6.8 0"/><circle cx="12" cy="19.5" r="1.2" fill="currentColor" stroke="none"/>'),
    shield:    ico('<path d="M12 3l7 2.8v5.4c0 4.4-2.9 8.2-7 9.8-4.1-1.6-7-5.4-7-9.8V5.8L12 3z"/>'),
    lock:      ico('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    refresh:   ico('<path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/>'),
    pulse:     ico('<path d="M22 12h-4l-3 8-6-16-3 8H2"/>'),
    chip:      ico('<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9.5 2.5v3M14.5 2.5v3M9.5 18.5v3M14.5 18.5v3M2.5 9.5h3M2.5 14.5h3M18.5 9.5h3M18.5 14.5h3"/>'),
    search:    ico('<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.3-4.3"/>'),
    grid:      ico('<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>'),
    bank:      ico('<path d="M3 9.5 12 4l9 5.5M5.5 10v7.5M10 10v7.5M14 10v7.5M18.5 10v7.5M3 20.5h18"/>'),
    medical:   ico('<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>'),
    scales:    ico('<path d="M12 4v15M8.5 20.5h7M5 7h14"/><path d="M6.5 7 4 12.5a2.7 2.7 0 0 0 5 0L6.5 7zM17.5 7 15 12.5a2.7 2.7 0 0 0 5 0L17.5 7z"/>'),
    factory:   ico('<path d="M3 20.5V9l6 3.6V9l6 3.6V4.5h6v16H3z"/>'),
    buildings: ico('<path d="M3 20.5h18M5 20.5v-15h8v15M17 9.5h2.5v11M8 9h2M8 13h2"/>'),
    briefcase: ico('<rect x="3" y="7.5" width="18" height="13" rx="2"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18"/>'),
    users:     ico('<circle cx="9" cy="8" r="3.4"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16.3 5a3.4 3.4 0 0 1 0 6.2M20.5 20a5.5 5.5 0 0 0-3.7-5.2"/>'),
    monitor:   ico('<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6M12 17v4"/>')
  };
  var chevron = '<svg class="nav-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var arrowRight = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  /* ── Menu data ───────────────────────────────────────────── */
  var SERVICES = [
    { href: '/services/network-consultancy.html',       icon: 'bulb',    title: 'Network Consultancy',            desc: 'Independent advice on network strategy' },
    { href: '/services/network-design-deployment.html', icon: 'nodes',   title: 'Network Design & Deployment',    desc: 'Plan, design and roll out with confidence' },
    { href: '/services/network-installations.html',     icon: 'tool',    title: 'Network Installations',          desc: 'Professional on-site installation work' },
    { href: '/services/network-support.html',           icon: 'headset', title: 'Network Support',                desc: 'Fast, expert help when issues strike' },
    { href: '/services/managed-network-support.html',   icon: 'gauge',   title: 'Managed Network Support',        desc: 'Proactive monitoring and management' },
    { href: '/services/managed-wireless-lan.html',      icon: 'wifi',    title: 'Managed Wireless LAN',           desc: 'Business-grade Wi-Fi, managed for you' },
    { href: '/services/firewall-network-security.html', icon: 'shield',  title: 'Firewall & Network Security',    desc: 'Protect your perimeter, users and data' },
    { href: '/services/remote-access-vpn.html',         icon: 'lock',    title: 'Remote Access & VPN',            desc: 'Secure access for remote and hybrid teams' },
    { href: '/services/business-continuity.html',       icon: 'refresh', title: 'Business Continuity',            desc: 'Resilient networks that keep you running' }
  ];
  var SOLUTIONS = [
    { href: '/solutions/network-health-check.html',    icon: 'pulse',  title: 'Network Health Check',    desc: 'A comprehensive review of your network to identify weaknesses and opportunities.' },
    { href: '/solutions/ai-ready-infrastructure.html', icon: 'chip',   title: 'AI-Ready Infrastructure', desc: 'Assess whether your infrastructure can support AI-driven business demands.' },
    { href: '/solutions/cyber-security-review.html',   icon: 'search', title: 'Cyber Security Review',   desc: 'Identify vulnerabilities and close security gaps with expert analysis.' },
    { href: '/solutions/microsoft-365-network.html',   icon: 'grid',   title: 'Microsoft 365 & Network', desc: 'Ensure seamless Microsoft 365 performance before you deploy.' }
  ];
  var INDUSTRIES = [
    { href: '/industries/financial-services.html',    icon: 'bank',      title: 'Financial Services' },
    { href: '/industries/healthcare-clinics.html',    icon: 'medical',   title: 'Healthcare & Clinics' },
    { href: '/industries/legal-firms.html',           icon: 'scales',    title: 'Legal Firms' },
    { href: '/industries/manufacturing.html',         icon: 'factory',   title: 'Manufacturing' },
    { href: '/industries/multi-site-businesses.html', icon: 'buildings', title: 'Multi-Site Businesses' },
    { href: '/industries/professional-services.html', icon: 'briefcase', title: 'Professional Services' },
    { href: '/industries/recruitment-agencies.html',  icon: 'users',     title: 'Recruitment Agencies' },
    { href: '/industries/internal-it-teams.html',     icon: 'monitor',   title: 'Internal IT Teams' }
  ];

  /* ── Markup builders ─────────────────────────────────────── */
  function linkRow(item) {
    return '<a href="' + item.href + '" class="mm-link">' +
      '<span class="mm-ico">' + ICONS[item.icon] + '</span>' +
      '<span class="mm-txt"><span class="mm-title">' + item.title + '</span>' +
      (item.desc ? '<span class="mm-desc">' + item.desc + '</span>' : '') +
      '</span></a>';
  }
  function solutionCard(item) {
    return '<a href="' + item.href + '" class="mm-card">' +
      '<span class="mm-ico">' + ICONS[item.icon] + '</span>' +
      '<span class="mm-card__title">' + item.title + '</span>' +
      '<span class="mm-card__desc">' + item.desc + '</span>' +
      '<span class="mm-card__more">Learn more ' + arrowRight + '</span></a>';
  }
  function megaFoot(label, href, linkText) {
    return '<div class="mm-foot"><span class="mm-foot__label">' + label + '</span>' +
      '<a href="' + href + '" class="mm-foot__link">' + linkText + ' ' + arrowRight + '</a></div>';
  }
  function trigger(label, menuId) {
    return '<button type="button" class="nav-link nav-trigger" aria-haspopup="true" aria-expanded="false" aria-controls="' + menuId + '">' + label + ' ' + chevron + '</button>';
  }

  var servicesMega =
    '<div class="mega-menu mega-menu--services" id="mega-services" role="region" aria-label="Services menu">' +
      '<div class="mm-inner">' +
        '<aside class="mm-promo">' +
          '<span class="mm-promo__label">Services</span>' +
          '<p class="mm-promo__title">Managed Network Services</p>' +
          '<p class="mm-promo__desc">Expert-led, end-to-end IT network support for growing businesses.</p>' +
          '<a href="/services/" class="mm-promo__cta">View All Services ' + arrowRight + '</a>' +
        '</aside>' +
        '<div class="mm-grid mm-grid--services">' + SERVICES.map(linkRow).join('') + '</div>' +
      '</div>' +
      megaFoot('Not sure where to start?', '/solutions/network-health-check.html', 'Book a Network Health Check') +
    '</div>';

  var solutionsMega =
    '<div class="mega-menu mega-menu--solutions" id="mega-solutions" role="region" aria-label="Solutions menu">' +
      '<div class="mm-inner mm-inner--column">' +
        '<div class="mm-head"><span class="mm-head__title">IT Networking Solutions</span>' +
        '<a href="/solutions/" class="mm-head__all">View All Solutions ' + arrowRight + '</a></div>' +
        '<div class="mm-cards">' + SOLUTIONS.map(solutionCard).join('') + '</div>' +
      '</div>' +
      megaFoot('Not sure what fits?', '/contact.html', 'Talk to us') +
    '</div>';

  var industriesMega =
    '<div class="mega-menu mega-menu--industries" id="mega-industries" role="region" aria-label="Industries menu">' +
      '<div class="mm-inner">' +
        '<div class="mm-grid mm-grid--industries">' + INDUSTRIES.map(linkRow).join('') + '</div>' +
        '<aside class="mm-promo mm-promo--photo">' +
          '<picture><img src="/images/pages/industries.jpg" alt="" loading="lazy"></picture>' +
          '<div class="mm-promo__body">' +
            '<span class="mm-promo__label">Industries We Serve</span>' +
            '<p class="mm-promo__title">Tailored Networks for Every Sector</p>' +
            '<a href="/industries/" class="mm-promo__cta">Explore All ' + arrowRight + '</a>' +
          '</div>' +
        '</aside>' +
      '</div>' +
      megaFoot('Working in another sector?', '/contact.html', 'We can still help') +
    '</div>';

  /* ── Mobile drawer groups ────────────────────────────────── */
  function drawerGroup(label, href, items) {
    return '<div class="nav-mobile__group">' +
      '<div class="nav-mobile__row">' +
        '<a href="' + href + '" class="nav-mobile__link">' + label + '</a>' +
        '<button type="button" class="nav-mobile__toggle" aria-expanded="false" aria-label="Show ' + label + ' pages">' + chevron + '</button>' +
      '</div>' +
      '<div class="nav-mobile__sub">' +
        items.map(function (i) { return '<a href="' + i.href + '" class="nav-mobile__sublink">' + i.title + '</a>'; }).join('') +
        '<a href="' + href + '" class="nav-mobile__sublink nav-mobile__sublink--all">View all ' + arrowRight + '</a>' +
      '</div>' +
    '</div>';
  }

  holder.outerHTML =
  '<nav class="navbar navbar--sticky" aria-label="Main navigation">' +
    '<div class="navbar__box">' +
      '<a href="/" class="navbar__logo" aria-label="Network Consultancy home">' +
        '<img src="/images/misc/logo.png" alt="Network Consultancy" width="150" height="44" loading="eager">' +
      '</a>' +
      '<div class="navbar__right">' +
        '<div class="navbar__links">' +
          '<a href="/about.html" class="nav-link">About</a>' +
          '<div class="has-mega">' + trigger('Services', 'mega-services') + servicesMega + '</div>' +
          '<div class="has-mega">' + trigger('Solutions', 'mega-solutions') + solutionsMega + '</div>' +
          '<div class="has-mega">' + trigger('Industries', 'mega-industries') + industriesMega + '</div>' +
          '<a href="/case-studies/" class="nav-link">Case Studies</a>' +
          '<a href="/resources/blog/" class="nav-link">Blog</a>' +
        '</div>' +
        '<button type="button" class="nav-icon" data-search-trigger aria-label="Open site search"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
        '<a href="/contact.html" class="btn-blue">Enquire Here</a>' +
      '</div>' +
      '<button class="nav-hamburger" id="nav-hamburger" aria-label="Open navigation menu" aria-expanded="false">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
    '</div>' +
  '</nav>' +
  '<div class="nav-mobile" id="nav-mobile" role="dialog" aria-modal="true" aria-label="Navigation">' +
    '<button class="nav-mobile__close" id="nav-mobile-close" aria-label="Close menu">&times;</button>' +
    '<div class="nav-mobile__brand"><img src="/images/misc/logo.png" alt="Network Consultancy" width="140" height="40" loading="lazy"></div>' +
    '<nav class="nav-mobile__links">' +
      '<a href="/about.html" class="nav-mobile__link">About</a>' +
      drawerGroup('Services', '/services/', SERVICES) +
      drawerGroup('Solutions', '/solutions/', SOLUTIONS) +
      drawerGroup('Industries', '/industries/', INDUSTRIES) +
      '<a href="/case-studies/" class="nav-mobile__link">Case Studies</a>' +
      '<a href="/resources/blog/" class="nav-mobile__link">Blog</a>' +
      '<a href="/contact.html" class="nav-mobile__link">Contact</a>' +
    '</nav>' +
    '<a href="/contact.html" class="btn-blue">Enquire Here</a>' +
  '</div>';

  /* ── Active state by current path ────────────────────────── */
  var path = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  function markActive(sel) {
    var links = document.querySelectorAll(sel);
    Array.prototype.forEach.call(links, function (a) {
      var href = (a.getAttribute('href') || '').replace(/index\.html$/, '').replace(/\/$/, '') || '/';
      if (href === '/') return;
      if (path === href || path.indexOf(href + '/') === 0 || path.indexOf(href) === 0) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  }
  markActive('.navbar__links .nav-link');
  markActive('.nav-mobile__link');
  /* Mega triggers: match first path segment against trigger label */
  var seg = path.split('/').filter(Boolean)[0] || '';
  if (seg) {
    Array.prototype.forEach.call(document.querySelectorAll('.navbar__links .nav-trigger, .nav-mobile__link'), function (el) {
      var t = (el.textContent || '').trim().toLowerCase();
      if (t && (t.indexOf(seg) === 0 || seg.indexOf(t.split(' ')[0]) === 0)) el.classList.add('active');
    });
  }

  /* ── Sticky shadow on scroll ─────────────────────────────── */
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mega menu interactivity (hover intent + click + keys) ── */
  if (!window.__ncMegaBound) {
    window.__ncMegaBound = true;
    var triggers = document.querySelectorAll('.has-mega');

    var setMenuOpen = function (el, isOpen) {
      var btn = el.querySelector('.nav-trigger');
      el.classList.toggle('is-open', isOpen);
      if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };
    var closeAllMenus = function (exceptEl) {
      Array.prototype.forEach.call(triggers, function (t) {
        if (!exceptEl || t !== exceptEl) setMenuOpen(t, false);
      });
    };

    Array.prototype.forEach.call(triggers, function (el) {
      var closeTimer;
      var btn = el.querySelector('.nav-trigger');

      function openMenu() {
        clearTimeout(closeTimer);
        closeAllMenus(el);
        setMenuOpen(el, true);
      }
      function scheduleClose() {
        closeTimer = setTimeout(function () { setMenuOpen(el, false); }, 180);
      }

      el.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover)').matches) openMenu();
      });
      el.addEventListener('mouseleave', scheduleClose);

      if (btn) {
        btn.addEventListener('click', function () {
          if (el.classList.contains('is-open')) setMenuOpen(el, false);
          else openMenu();
        });
        btn.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') { setMenuOpen(el, false); btn.focus(); }
        });
      }

      el.addEventListener('focusout', function () {
        setTimeout(function () {
          if (!el.contains(document.activeElement)) setMenuOpen(el, false);
        }, 0);
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.has-mega')) closeAllMenus();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAllMenus();
    });
  }

  /* ── Hamburger / mobile drawer ───────────────────────────── */
  var hamburger = document.getElementById('nav-hamburger');
  var mobileNav = document.getElementById('nav-mobile');
  var mobileClose = document.getElementById('nav-mobile-close');

  var backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function openNav() {
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (sbw > 0) document.body.style.paddingRight = sbw + 'px';
    if (mobileNav) mobileNav.classList.add('is-open');
    backdrop.classList.add('is-open');
    if (hamburger) { hamburger.classList.add('open'); hamburger.setAttribute('aria-expanded', 'true'); }
    if (mobileClose) mobileClose.focus();
  }
  function closeNav() {
    if (mobileNav) mobileNav.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    if (hamburger) { hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); }
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
  if (hamburger) hamburger.addEventListener('click', openNav);
  if (mobileClose) mobileClose.addEventListener('click', closeNav);
  backdrop.addEventListener('click', closeNav);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('is-open')) closeNav();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && mobileNav && mobileNav.classList.contains('is-open')) closeNav();
  });

  /* Drawer accordion groups */
  Array.prototype.forEach.call(document.querySelectorAll('.nav-mobile__toggle'), function (tg) {
    tg.addEventListener('click', function () {
      var group = tg.closest('.nav-mobile__group');
      var isOpen = group.classList.contains('is-open');
      Array.prototype.forEach.call(document.querySelectorAll('.nav-mobile__group.is-open'), function (g) {
        g.classList.remove('is-open');
        var b = g.querySelector('.nav-mobile__toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        group.classList.add('is-open');
        tg.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
