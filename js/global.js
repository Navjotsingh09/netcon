/**
 * Network Consultancy — Global JavaScript
 * Handles: FAQ accordion, contact form.
 * All navbar behaviour (sticky state, mega menus, mobile drawer)
 * lives in js/navbar.js alongside the injected markup.
 */
(function () {
  'use strict';
  /* ── Phone inputs: allow only digits, + - ( ) and spaces ────── */
  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!el || el.type !== 'tel') return;
    var cleaned = el.value.replace(/[^0-9+\-()\s]/g, '');
    if (cleaned !== el.value) {
      var pos = el.selectionStart - (el.value.length - cleaned.length);
      el.value = cleaned;
      if (pos >= 0) el.setSelectionRange(pos, pos);
    }
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

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('.nd-faq__item');
    if (!trigger) return;
    var list = trigger.parentElement;
    if (!list) return;
    var wasOpen = trigger.classList.contains('is-open');
    Array.prototype.forEach.call(list.querySelectorAll('.nd-faq__item'), function (item) {
      item.classList.remove('is-open');
      var mark = item.querySelector('strong');
      if (mark) mark.textContent = '+';
      if (item.nextElementSibling) item.nextElementSibling.hidden = true;
    });
    if (!wasOpen) {
      trigger.classList.add('is-open');
      var activeMark = trigger.querySelector('strong');
      if (activeMark) activeMark.textContent = '−';
      if (trigger.nextElementSibling) trigger.nextElementSibling.hidden = false;
    }
  });

  (function initTrustedSlider() {
    var trusted = document.querySelector('.nd-trusted');
    if (!trusted) return;

    var track = trusted.querySelector('.nd-trusted__track');
    var prevBtn = trusted.querySelector('.nd-trusted__nav--prev');
    var nextBtn = trusted.querySelector('.nd-trusted__nav--next');
    var dotsWrap = trusted.querySelector('.nd-trusted__dots');
    if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

    var desktopQuery = window.matchMedia('(min-width: 1025px)');
    var baseTranslate = 0;
    var step = 0;
    var currentIndex = 0;
    var cardCount = 0;
    var dots = [];
    var isAnimating = false;
    var transitionMs = 420;
    var isDesktop = desktopQuery.matches;

    function extractTranslateX(node) {
      var transform = window.getComputedStyle(node).transform;
      if (!transform || transform === 'none') return 0;
      var matrix = transform.match(/matrix\(([^)]+)\)/);
      if (matrix) {
        var parts = matrix[1].split(',');
        return parseFloat(parts[4]) || 0;
      }
      var matrix3d = transform.match(/matrix3d\(([^)]+)\)/);
      if (matrix3d) {
        var values = matrix3d[1].split(',');
        return parseFloat(values[12]) || 0;
      }
      return 0;
    }

    function updateDots() {
      if (!dots.length || !cardCount) return;
      var dotIndex = ((currentIndex % cardCount) + cardCount) % cardCount;
      dots.forEach(function (dot, index) {
        dot.classList.toggle('nd-trusted__dot--active', index === dotIndex);
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
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    });

    window.addEventListener('resize', configure);
    configure();
  }());

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
            '<label for="cf-consent-privacy">By submitting this form, you agree to our processing of your corporate details in accordance with our <a href="/privacy-policy">Privacy Policy</a>.</label>' +
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
      if (!form.checkValidity()) { form.reportValidity(); return; }
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

      // Populate source tracking fields if tracking is available
      if (window.NetConSource && typeof window.NetConSource.toObject === 'function') {
        var sourceData = window.NetConSource.toObject();
        document.getElementById('cf-source-page').value = sourceData.source_page;
        document.getElementById('cf-source-family').value = sourceData.source_family;
        document.getElementById('cf-source-cta').value = sourceData.source_cta;
        document.getElementById('cf-inquiry-type').value = sourceData.inquiry_type;
        document.getElementById('cf-lead-status').value = sourceData.lead_status;
        document.getElementById('cf-action-required').value = sourceData.action_required;
        document.getElementById('cf-routing-team').value = sourceData.routing_team;
        var subjectField = document.getElementById('cf-subject');
        if (subjectField) subjectField.value = 'NetCon website enquiry \u2014 ' + sourceData.source_page + ' (' + sourceData.source_cta + ')';
      }

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
    var ctaSections = document.querySelectorAll('.cs-blue-cta, .csd-cta-band, .svc-cta-band, .nhc-cta-band, .csr-cta-band, .m365-cta-band, .aif-cta-band, .industry-cta');
    if (!ctaSections.length) return;

    var allServices = [
      'Network Consultancy',
      'Network Support',
      'Managed Network Support',
      'Managed Wireless LAN',
      'Network Installations',
      'Network Design & Deployment',
      'Firewall & Network Security',
      'Remote Access & VPN',
      'Business Continuity'
    ];

    function normalizeServiceName(value) {
      return (value || '').toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function createLane(labels, fallback, isReverse) {
      var lane = document.createElement('div');
      lane.className = 'nc-service-lane' + (isReverse ? ' is-reverse' : '');

      var track = document.createElement('div');
      track.className = 'nc-service-track';

      var base = labels.length ? labels.slice() : fallback.slice(0, 3);
      var sequence = [];
      var targetItems = 18;
      for (var i = 0; i < targetItems; i++) {
        sequence.push(base[i % base.length]);
      }
      var doubled = sequence.concat(sequence);
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

      var container = section.querySelector('.cs-blue-inner, .csd-cta-inner, .industry-cta__inner') || section;
      var card = section.querySelector('.cs-center-panel, .csd-cta-card, .svc-cta-band__card, .nhc-cta-band__card, .csr-cta-band__card, .m365-cta-band__card, .aif-cta-band__card, .industry-cta__card');
      if (!card) return;

      /* Harvest labels from the section's own static chips (real service/solution
         names authored per page family); ignore "service N" placeholders. */
      var staticWrap = section.querySelector('.cs-tag-rows, .csd-pill-list, .svc-cta-band__tags, .nhc-cta-band__grid, .csr-cta-band__grid, .m365-cta-band__grid, .aif-cta-band__grid, .industry-cta__chips');
      var labels = [];
      if (staticWrap) {
        labels = Array.prototype.map.call(staticWrap.querySelectorAll('span'), function (el) {
          return (el.textContent || '').trim();
        }).filter(function (t) { return t && !/^service\s*\d+$/i.test(t); });
        staticWrap.style.display = 'none';
      }
      labels = labels.filter(function (t, i) { return labels.indexOf(t) === i; });
      if (!labels.length) labels = allServices.slice();

      var currentService = normalizeServiceName(section.getAttribute('data-current-service'));
      var services = labels.filter(function (s) { return normalizeServiceName(s) !== currentService; });
      if (services.length < 2) services = labels.slice();

      var laneOne = services.filter(function (_item, index) { return index % 2 === 0; });
      var laneTwo = services.filter(function (_item, index) { return index % 2 !== 0; });

      if (!laneOne.length || !laneTwo.length) {
        laneOne = services.slice();
        laneTwo = services.slice().reverse();
      }

      if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
      container.style.overflow = 'hidden';
      card.style.position = 'relative';
      card.style.zIndex = '2';

      var floater = document.createElement('div');
      floater.className = 'nc-service-floater';
      floater.setAttribute('aria-hidden', 'true');

      floater.appendChild(createLane(laneOne, services, false));
      floater.appendChild(createLane(laneTwo, services, true));

      container.appendChild(floater);
    });
  }

  setupCaseStudyFloatingServices();

})();
