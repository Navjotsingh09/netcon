/**
 * Network Consultancy — Global JavaScript
 * Handles: mega menu, mobile nav, FAQ accordion, contact form
 */
(function () {
  'use strict';

  /* ── Mega Menu ─────────────────────────────────────────────── */
  var triggers = document.querySelectorAll('.has-mega');
  triggers.forEach(function (el) {
    var closeTimer;
    function openMenu() {
      clearTimeout(closeTimer);
      triggers.forEach(function (t) {
        if (t !== el && t.classList.contains('is-open')) {
          var m = t.querySelector('.mega-menu');
          if (m) {
            m.style.transition = 'none';
            m.style.opacity = '0';
            m.style.visibility = 'hidden';
            m.style.transform = 'translateY(-8px)';
          }
          t.classList.remove('is-open');
          requestAnimationFrame(function () {
            if (m) { m.style.transition = ''; m.style.opacity = ''; m.style.visibility = ''; m.style.transform = ''; }
          });
        }
      });
      el.classList.add('is-open');
    }
    function scheduleClose() {
      closeTimer = setTimeout(function () { el.classList.remove('is-open'); }, 160);
    }
    el.addEventListener('mouseenter', openMenu);
    el.addEventListener('mouseleave', scheduleClose);
    var menu = el.querySelector('.mega-menu');
    if (menu) {
      menu.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
      menu.addEventListener('mouseleave', scheduleClose);
    }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-mega')) {
      triggers.forEach(function (t) { t.classList.remove('is-open'); });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      triggers.forEach(function (t) { t.classList.remove('is-open'); });
    }
  });

  /* ── Mobile Nav ────────────────────────────────────────────── */
  var hb  = document.getElementById('nav-hamburger');
  var mn  = document.getElementById('nav-mobile');
  var mc  = document.getElementById('nav-mobile-close');

  function openNav() {
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (sbw > 0) document.body.style.paddingRight = sbw + 'px';
    if (mn) mn.classList.add('is-open');
    if (hb) { hb.classList.add('open'); hb.setAttribute('aria-expanded', 'true'); }
    if (mc) setTimeout(function () { mc.focus(); }, 30);
  }
  function closeNav() {
    if (mn) mn.classList.remove('is-open');
    if (hb) { hb.classList.remove('open'); hb.setAttribute('aria-expanded', 'false'); }
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    if (hb) hb.focus();
  }
  if (hb) hb.addEventListener('click', openNav);
  if (mc) mc.addEventListener('click', closeNav);
  if (mn) mn.addEventListener('click', function (e) { if (e.target === mn) closeNav(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mn && mn.classList.contains('is-open')) closeNav();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1200 && mn && mn.classList.contains('is-open')) closeNav();
  });

  /* ── FAQ Accordion ─────────────────────────────────────────── */
  document.querySelectorAll('.faq-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      /* Close all */
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        i.classList.add('closed');
        i.querySelector('.faq-header').setAttribute('aria-expanded', 'false');
        var d = i.querySelector('.faq-divider');
        if (d) d.style.display = 'none';
      });
      /* Open clicked (if was closed) */
      if (!wasOpen) {
        item.classList.remove('closed');
        item.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        var d = item.querySelector('.faq-divider');
        if (d) d.style.display = '';
      }
    });
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
