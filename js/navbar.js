(function () {
  'use strict';
  var holder = document.getElementById('site-navbar');
  if (!holder || holder.getAttribute('data-navbar-ready')) return;
  holder.setAttribute('data-navbar-ready', '1');

  holder.outerHTML = `  <nav class="navbar navbar--sticky" aria-label="Main navigation">
    <div class="navbar__box">
      <a href="/" class="navbar__logo" aria-label="Network Consultancy home">
        <img src="/images/misc/logo.png" alt="Network Consultancy" width="150" height="44" loading="eager">
      </a>
      <div class="navbar__right">
        <div class="navbar__links">
          <a href="/about.html" class="nav-link">About</a>

          <div class="has-mega">
            <span class="nav-link">Services <svg class="nav-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div class="mega-menu" role="region" aria-label="Services menu">
              <div class="mega-inner mega-inner--services">
                <div class="mega-featured">
                  <picture><source srcset="/images/pages/servers.jpg" type="image/jpeg"><img src="/images/pages/servers.jpg" alt="Services" loading="lazy"></picture>
                  <div class="mega-featured__body">
                    <span class="mega-featured__label">Services Overview</span>
                    <p class="mega-featured__title">Managed Network Services</p>
                    <p class="mega-featured__desc">Expert-led, end-to-end IT network support for growing businesses.</p>
                    <a href="/services/" class="mega-featured__link">View All Services &#8594;</a>
                  </div>
                </div>
                <div class="mega-items">
                  <a href="/services/network-consultancy.html" class="mega-item"><picture><source srcset="/images/services/service-1.webp" type="image/webp"><img src="/images/services/service-1.jpg" alt="" loading="lazy"></picture><span>Network Consultancy</span></a>
                  <a href="/services/network-design-deployment.html" class="mega-item"><picture><source srcset="/images/services/service-2.webp" type="image/webp"><img src="/images/services/service-2.jpg" alt="" loading="lazy"></picture><span>Network Design &amp; Deployment</span></a>
                  <a href="/services/network-installations.html" class="mega-item"><picture><source srcset="/images/services/service-3.webp" type="image/webp"><img src="/images/services/service-3.jpg" alt="" loading="lazy"></picture><span>Network Installations</span></a>
                  <a href="/services/network-support.html" class="mega-item"><picture><source srcset="/images/services/service-4.webp" type="image/webp"><img src="/images/services/service-4.jpg" alt="" loading="lazy"></picture><span>Network Support</span></a>
                  <a href="/services/managed-network-support.html" class="mega-item"><picture><source srcset="/images/features/feature-1.webp" type="image/webp"><img src="/images/features/feature-1.jpg" alt="" loading="lazy"></picture><span>Managed Network Support</span></a>
                  <a href="/services/managed-wireless-lan.html" class="mega-item"><picture><source srcset="/images/features/feature-2.webp" type="image/webp"><img src="/images/features/feature-2.jpg" alt="" loading="lazy"></picture><span>Managed Wireless LAN</span></a>
                  <a href="/services/firewall-network-security.html" class="mega-item"><picture><source srcset="/images/misc/why-choose-us.webp" type="image/webp"><img src="/images/misc/why-choose-us.jpg" alt="" loading="lazy"></picture><span>Firewall &amp; Network Security</span></a>
                  <a href="/services/remote-access-vpn.html" class="mega-item"><picture><source srcset="/images/banners/scroll-banner-1.webp" type="image/webp"><img src="/images/banners/scroll-banner-1.jpg" alt="" loading="lazy"></picture><span>Remote Access &amp; VPN Solutions</span></a>
                  <a href="/services/business-continuity.html" class="mega-item"><picture><source srcset="/images/banners/scroll-banner-2.webp" type="image/webp"><img src="/images/banners/scroll-banner-2.jpg" alt="" loading="lazy"></picture><span>Business Continuity &amp; Resilience</span></a>
                </div>
              </div>
            </div>
          </div>

          <div class="has-mega">
            <span class="nav-link">Solutions <svg class="nav-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div class="mega-menu" role="region" aria-label="Solutions menu">
              <div class="mega-inner mega-inner--solutions">
                <div class="mega-heading">
                  <span class="mega-heading__title">IT Networking Solutions</span>
                  <a href="/solutions/" class="mega-heading__all">View All Solutions &#8594;</a>
                </div>
                <div class="mega-cards">
                  <a href="/solutions/network-health-check.html" class="mega-card"><picture><source srcset="/images/pages/network-abstract.jpg" type="image/jpeg"><img class="mega-card__img" src="/images/pages/network-abstract.jpg" alt="" loading="lazy"></picture><div class="mega-card__body"><p class="mega-card__title">Network Health Check</p><p class="mega-card__desc">A comprehensive review of your network to identify weaknesses and opportunities.</p><span class="mega-card__link">Learn More &#8594;</span></div></a>
                  <a href="/solutions/ai-ready-infrastructure.html" class="mega-card"><picture><source srcset="/images/pages/technician.jpg" type="image/jpeg"><img class="mega-card__img" src="/images/pages/technician.jpg" alt="" loading="lazy"></picture><div class="mega-card__body"><p class="mega-card__title">AI-Ready Infrastructure</p><p class="mega-card__desc">Assess whether your infrastructure can support AI-driven business demands.</p><span class="mega-card__link">Learn More &#8594;</span></div></a>
                  <a href="/solutions/cyber-security-review.html" class="mega-card"><picture><source srcset="/images/pages/cyber-security.jpg" type="image/jpeg"><img class="mega-card__img" src="/images/pages/cyber-security.jpg" alt="" loading="lazy"></picture><div class="mega-card__body"><p class="mega-card__title">Cyber Security Review</p><p class="mega-card__desc">Identify vulnerabilities and close security gaps with expert analysis.</p><span class="mega-card__link">Learn More &#8594;</span></div></a>
                  <a href="/solutions/microsoft-365-network.html" class="mega-card"><picture><source srcset="/images/pages/professional.jpg" type="image/jpeg"><img class="mega-card__img" src="/images/pages/professional.jpg" alt="" loading="lazy"></picture><div class="mega-card__body"><p class="mega-card__title">Microsoft 365 &amp; Network</p><p class="mega-card__desc">Ensure seamless Microsoft 365 performance before you deploy.</p><span class="mega-card__link">Learn More &#8594;</span></div></a>
                </div>
              </div>
            </div>
          </div>

          <div class="has-mega">
            <span class="nav-link">Industries <svg class="nav-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
            <div class="mega-menu" role="region" aria-label="Industries menu">
              <div class="mega-inner mega-inner--industries">
                <div class="mega-ind-grid">
                  <a href="/industries/financial-services.html" class="mega-item"><picture><source srcset="/images/services/service-1.webp" type="image/webp"><img src="/images/services/service-1.jpg" alt="" loading="lazy"></picture><span>Financial Services</span></a>
                  <a href="/industries/healthcare-clinics.html" class="mega-item"><picture><source srcset="/images/features/feature-1.webp" type="image/webp"><img src="/images/features/feature-1.jpg" alt="" loading="lazy"></picture><span>Healthcare &amp; Clinics</span></a>
                  <a href="/industries/legal-firms.html" class="mega-item"><picture><source srcset="/images/services/service-2.webp" type="image/webp"><img src="/images/services/service-2.jpg" alt="" loading="lazy"></picture><span>Legal Firms</span></a>
                  <a href="/industries/manufacturing.html" class="mega-item"><picture><source srcset="/images/services/service-3.webp" type="image/webp"><img src="/images/services/service-3.jpg" alt="" loading="lazy"></picture><span>Manufacturing</span></a>
                  <a href="/industries/multi-site-businesses.html" class="mega-item"><picture><source srcset="/images/services/service-4.webp" type="image/webp"><img src="/images/services/service-4.jpg" alt="" loading="lazy"></picture><span>Multi-Site Businesses</span></a>
                  <a href="/industries/professional-services.html" class="mega-item"><picture><source srcset="/images/features/feature-2.webp" type="image/webp"><img src="/images/features/feature-2.jpg" alt="" loading="lazy"></picture><span>Professional Services</span></a>
                  <a href="/industries/recruitment-agencies.html" class="mega-item"><picture><source srcset="/images/misc/why-choose-us.webp" type="image/webp"><img src="/images/misc/why-choose-us.jpg" alt="" loading="lazy"></picture><span>Recruitment Agencies</span></a>
                  <a href="/industries/internal-it-teams.html" class="mega-item"><picture><source srcset="/images/misc/it-networking.webp" type="image/webp"><img src="/images/misc/it-networking.jpg" alt="" loading="lazy"></picture><span>Internal IT Teams</span></a>
                </div>
                <div class="mega-featured">
                  <picture><source srcset="/images/pages/industries.jpg" type="image/jpeg"><img src="/images/pages/industries.jpg" alt="Industries" loading="lazy"></picture>
                  <div class="mega-featured__body">
                    <span class="mega-featured__label">Industries We Serve</span>
                    <p class="mega-featured__title">Tailored Networks for Every Sector</p>
                    <p class="mega-featured__desc">From healthcare to finance, high-performance networks built for your industry.</p>
                    <a href="/industries/" class="mega-featured__link">Explore All &#8594;</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a href="/resources/blog/" class="nav-link">Blogs</a>
<a href="/case-studies/" class="nav-link">Case Studies</a>
        </div>
        <span class="nav-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#353535" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="#353535" stroke-width="2" stroke-linecap="round"/></svg></span>
        <a href="/contact.html" class="btn-blue">Enquire Here</a>
      </div>
      <button class="nav-hamburger" id="nav-hamburger" aria-label="Open navigation menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="nav-mobile" id="nav-mobile" role="dialog" aria-modal="true" aria-label="Navigation">
    <button class="nav-mobile__close" id="nav-mobile-close" aria-label="Close menu">&times;</button>
    <div class="nav-mobile__brand"><img src="/images/misc/logo.png" alt="Network Consultancy" width="140" height="40" loading="lazy"></div>
    <nav class="nav-mobile__links">
      <a href="/about.html" class="nav-mobile__link">About</a>
      <a href="/services/" class="nav-mobile__link">Services</a>
      <a href="/solutions/" class="nav-mobile__link">Solutions</a>
      <a href="/industries/" class="nav-mobile__link">Industries</a>
      <a href="/resources/blog/" class="nav-mobile__link">Blogs</a>
      <a href="/case-studies/" class="nav-mobile__link">Case Studies</a>
      <a href="/contact.html" class="nav-mobile__link">Contact</a>
    </nav>
    <a href="/contact.html" class="btn-blue">Enquire Here</a>
  </div>`;

  // ---- Active state by current path ----
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
  // Mega-menu triggers are <span> without href; match by first path segment vs link text
  var seg = path.split('/').filter(Boolean)[0] || '';
  if (seg) {
    Array.prototype.forEach.call(document.querySelectorAll('.navbar__links .nav-link, .nav-mobile__link'), function (el) {
      var t = (el.textContent || '').trim().toLowerCase();
      if (t && (t.indexOf(seg) === 0 || seg.indexOf(t.split(' ')[0]) === 0)) el.classList.add('active');
    });
  }

  // ---- Sticky shadow on scroll ----
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    }, { passive: true });
  }

  // ---- Hamburger / mobile drawer ----
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

  // ---- Mega-menu open on tap for touch (desktop uses :hover) ----
  var megas = document.querySelectorAll('.has-mega');
  Array.prototype.forEach.call(megas, function (m) {
    var trigger = m.querySelector('.nav-link');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      if (window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        m.classList.toggle('is-open');
      }
    });
  });
})();
