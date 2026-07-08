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
  window.__netconGlobalFormHandler = true;

  if (form) {
    if (!form.querySelector('input[name="consent_privacy"]')) {
      var submit = form.querySelector('[type="submit"]');
      if (submit) {
        var consentBlock = document.createElement('div');
        consentBlock.className = 'form-consents';
        consentBlock.setAttribute('role', 'group');
        consentBlock.setAttribute('aria-label', 'Consent options');
        consentBlock.innerHTML = '' +
          '<div class="form-consent">' +
            '<input id="cf-consent-privacy" type="checkbox" name="consent_privacy" value="yes" required>' +
            '<label for="cf-consent-privacy">By submitting this form, you agree to our processing of your corporate details in accordance with our <a href="/privacy-policy.html">Privacy Policy</a>.</label>' +
          '</div>' +
          '<div class="form-consent">' +
            '<input id="cf-consent-marketing" type="checkbox" name="consent_marketing" value="yes">' +
            '<label for="cf-consent-marketing">I want to receive B2B network insights and marketing emails.</label>' +
          '</div>';
        submit.insertAdjacentElement('beforebegin', consentBlock);
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      if (btn && !btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
      if (error && !error.dataset.defaultMessage) error.dataset.defaultMessage = error.textContent;

      var requiredConsents = form.querySelectorAll('input[type="checkbox"][required]');
      for (var i = 0; i < requiredConsents.length; i++) {
        if (!requiredConsents[i].checked) {
          if (error) {
            error.textContent = 'Please confirm the required consent before submitting the form.';
            error.style.display = 'block';
          }
          if (success) success.style.display = 'none';
          requiredConsents[i].focus();
          return;
        }
      }

      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

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
            if (error && error.dataset.defaultMessage) error.textContent = error.dataset.defaultMessage;
            if (success) success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            throw new Error('Server error');
          }
        })
        .catch(function () {
          if (error)   error.style.display   = 'block';
          if (error && error.dataset.defaultMessage) error.textContent = error.dataset.defaultMessage;
          if (success) success.style.display = 'none';
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.originalText || 'Send Enquiry'; }
        });
    });
  }

  /* ── Case Study Floating Services ─────────────────────────── */
  function setupCaseStudyFloatingServices() {
    var ctaSections = document.querySelectorAll('.cs-blue-cta, .csd-cta-band');
    if (!ctaSections.length) return;

    var allServices = ['service 1', 'service 2', 'service 3', 'service 4', 'service 5', 'service 6'];

    function normalizeServiceName(value) {
      return (value || '').toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function createLane(labels, isReverse) {
      var lane = document.createElement('div');
      lane.className = 'nc-service-lane' + (isReverse ? ' is-reverse' : '');

      var track = document.createElement('div');
      track.className = 'nc-service-track';

      var base = labels.length ? labels.slice() : allServices.slice(0, 3);
      var doubled = base.concat(base);
      doubled.forEach(function (label) {
        var chip = document.createElement('span');
        chip.className = 'nc-service-chip';
        chip.textContent = label;
        track.appendChild(chip);
      });

      lane.appendChild(track);
      return lane;
    }

    ctaSections.forEach(function (section) {
      if (section.querySelector('.nc-service-floater')) return;

      var currentService = normalizeServiceName(section.getAttribute('data-current-service'));
      var services = allServices.filter(function (s) { return s !== currentService; });
      if (services.length < 4) services = allServices.slice();

      var laneOne = services.filter(function (_item, index) { return index % 2 === 0; });
      var laneTwo = services.filter(function (_item, index) { return index % 2 !== 0; });

      if (!laneOne.length || !laneTwo.length) {
        laneOne = allServices.slice(0, 3);
        laneTwo = allServices.slice(3, 6);
      }

      var container = section.querySelector('.cs-blue-inner, .csd-cta-inner');
      var card = section.querySelector('.cs-center-panel, .csd-cta-card');
      if (!container || !card) return;

      var oldMainRows = section.querySelector('.cs-tag-rows');
      if (oldMainRows) oldMainRows.setAttribute('hidden', 'hidden');
      var oldDetailRows = section.querySelector('.csd-pill-list');
      if (oldDetailRows) oldDetailRows.setAttribute('hidden', 'hidden');

      var floater = document.createElement('div');
      floater.className = 'nc-service-floater';
      floater.setAttribute('aria-hidden', 'true');

      floater.appendChild(createLane(laneOne, false));
      floater.appendChild(createLane(laneTwo, true));

      container.appendChild(floater);
    });
  }

  setupCaseStudyFloatingServices();

})();
