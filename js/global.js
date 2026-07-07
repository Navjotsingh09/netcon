/**
 * Network Consultancy — Global JavaScript
 * Handles: scroll-aware navbar, mega menu, mobile nav drawer, FAQ accordion, contact form
 */
(function () {
  'use strict';

  /* ── Scroll-aware navbar ───────────────────────────────────── */
  var stickyNav = document.querySelector('.navbar--sticky');
  if (stickyNav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 24) { stickyNav.classList.add('is-scrolled'); }
      else { stickyNav.classList.remove('is-scrolled'); }
    }, { passive: true });
  }

  /* ── Mega Menu ─────────────────────────────────────────────── */
  var triggers = document.querySelectorAll('.has-mega');
  function setMenuOpen(el, isOpen) {
    var trigger = el.querySelector('.nav-trigger, .nav-link');
    el.classList.toggle('is-open', isOpen);
    if (trigger && trigger.classList.contains('nav-trigger')) {
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  }

  function closeAllMenus(exceptEl) {
    triggers.forEach(function (t) {
      if (!exceptEl || t !== exceptEl) setMenuOpen(t, false);
    });
  }

  triggers.forEach(function (el) {
    var closeTimer;
    var trigger = el.querySelector('.nav-trigger, .nav-link');

    function openMenu() {
      clearTimeout(closeTimer);
      closeAllMenus(el);
      setMenuOpen(el, true);
    }

    function scheduleClose() {
      closeTimer = setTimeout(function () { setMenuOpen(el, false); }, 160);
    }

    el.addEventListener('mouseenter', openMenu);
    el.addEventListener('mouseleave', scheduleClose);

    var menu = el.querySelector('.mega-menu');
    if (menu) {
      menu.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
      menu.addEventListener('mouseleave', scheduleClose);
    }

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        if (window.matchMedia('(hover: hover)').matches) {
          if (trigger.classList.contains('nav-trigger')) e.preventDefault();
          if (el.classList.contains('is-open')) setMenuOpen(el, false);
          else openMenu();
        } else {
          e.preventDefault();
          if (el.classList.contains('is-open')) setMenuOpen(el, false);
          else openMenu();
        }
      });

      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (el.classList.contains('is-open')) setMenuOpen(el, false);
          else openMenu();
        }
        if (e.key === 'Escape') {
          setMenuOpen(el, false);
          trigger.focus();
        }
      });
    }

    el.addEventListener('focusin', function () {
      if (window.matchMedia('(hover: hover)').matches) openMenu();
    });

    el.addEventListener('focusout', function () {
      setTimeout(function () {
        if (!el.contains(document.activeElement)) setMenuOpen(el, false);
      }, 0);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-mega')) {
      closeAllMenus();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllMenus();
    }
  });

  /* ── Mobile Nav (slide-in drawer) ─────────────────────────── */
  var hb  = document.getElementById('nav-hamburger');
  var mn  = document.getElementById('nav-mobile');
  var mc  = document.getElementById('nav-mobile-close');

  /* Inject backdrop once */
  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function openNav() {
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (sbw > 0) document.body.style.paddingRight = sbw + 'px';
    if (mn) mn.classList.add('is-open');
    backdrop.classList.add('is-open');
    if (hb) { hb.classList.add('open'); hb.setAttribute('aria-expanded', 'true'); }
    if (mc) setTimeout(function () { mc.focus(); }, 30);
  }
  function closeNav() {
    if (mn) mn.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    if (hb) { hb.classList.remove('open'); hb.setAttribute('aria-expanded', 'false'); }
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    if (hb) hb.focus();
  }
  if (hb) hb.addEventListener('click', openNav);
  if (mc) mc.addEventListener('click', closeNav);
  backdrop.addEventListener('click', closeNav);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mn && mn.classList.contains('is-open')) closeNav();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024 && mn && mn.classList.contains('is-open')) closeNav();
  });

  /* ── FAQ Accordion ─────────────────────────────────────────── */
  /* Event delegation: works for both static HTML and CMS-injected FAQs */
  document.addEventListener('click', function (e) {
    var header = e.target.closest('.faq-header');
    if (!header) return;
    var item = header.closest('.faq-item');
    if (!item) return;
    var wasOpen = item.classList.contains('open');
    /* Close all FAQ items in the same list */
    var list = item.closest('.faq-list') || document;
    list.querySelectorAll('.faq-item').forEach(function (i) {
      i.classList.remove('open');
      i.classList.add('closed');
      var h = i.querySelector('.faq-header');
      if (h) h.setAttribute('aria-expanded', 'false');
      var d = i.querySelector('.faq-divider');
      if (d) d.style.display = 'none';
    });
    /* Re-open if it was closed */
    if (!wasOpen) {
      item.classList.remove('closed');
      item.classList.add('open');
      header.setAttribute('aria-expanded', 'true');
      var div = item.querySelector('.faq-divider');
      if (div) div.style.display = '';
    }
  });

  /* ── Contact Form ──────────────────────────────────────────── */
  var form    = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var error   = document.getElementById('form-error');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (r) {
          if (r.ok) {
            form.reset();
            if (success) success.style.display = 'block';
            if (error)   error.style.display   = 'none';
            if (success) success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            throw new Error('Server error');
          }
        })
        .catch(function () {
          if (error)   error.style.display   = 'block';
          if (success) success.style.display = 'none';
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Send Enquiry'; }
        });
    });
  }

})();
