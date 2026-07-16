(function () {
  'use strict';
  var holder = document.getElementById('site-contact');
  if (!holder || holder.getAttribute('data-contact-ready')) return;
  holder.setAttribute('data-contact-ready', '1');
  holder.outerHTML = `  <section class="nd-contact section-shell" id="contact" aria-labelledby="contact-heading">
    <div class="nd-contact__surface">
      <div class="nd-contact__layout">
        <div class="nd-contact__intro animate-fade-up">
          <h2 class="nd-contact__title" id="contact-heading">Contact us today for a free consultation</h2>
          <p class="nd-contact__subtitle">We pride ourselves on delivering a flexible engagement style in order to meet your requirements. Contact us for your free consultation.</p>
        </div>

        <div class="nd-contact__tiles">
          <article class="nd-contact__tile">
            <span class="nd-contact__chip"><img src="/images/pages/contact-phone-icon.png" alt="Phone icon"></span>
            <div class="nd-contact__tile-copy">
              <h3>Chat customer services</h3>
              <p><a href="tel:+442031501401">+44 (0) 203 150 1401</a></p>
            </div>
          </article>

          <article class="nd-contact__tile">
            <span class="nd-contact__chip"><img src="/images/pages/contact-email-icon.png" alt="Envelope icon"></span>
            <div class="nd-contact__tile-copy">
              <h3>Chat to our sales</h3>
              <p><a href="mailto:info@network-consultancy.com">info@network-consultancy.com</a></p>
            </div>
          </article>

          <article class="nd-contact__tile">
            <span class="nd-contact__chip"><img src="/images/pages/contact-address-icon.png" alt="Location icon"></span>
            <div class="nd-contact__tile-copy">
              <h3>Address</h3>
              <p>London / South
20-22 Wenlock Rd
London N1 7GU</p>
            </div>
          </article>

          <article class="nd-contact__tile">
            <span class="nd-contact__chip"><img src="/images/pages/contact-address-icon-2.png" alt="Location icon"></span>
            <div class="nd-contact__tile-copy">
              <h3>Address</h3>
              <p>Birmingham
Beech House, Greenfield Crescent
Edgbaston, B15 3BE</p>
            </div>
          </article>
        </div>

        <form class="nd-contact__form" id="contact-form" method="post" action="https://api.web3forms.com/submit" novalidate>
          <input type="hidden" name="access_key" value="fbcd4bae-c2e9-4e0c-9bf1-9576bef8625b">
          <input type="hidden" name="subject" id="cf-subject" value="NetCon website enquiry">
          <input type="checkbox" name="botcheck" tabindex="-1" aria-hidden="true" style="display:none">
          <div class="nd-contact__row nd-contact__row--split">
            <label class="nd-contact__field">
              <span class="nd-contact__field-head"><span class="nd-contact__field-label">First Name</span><span class="nd-contact__required">*</span></span>
              <input id="cf-fname" type="text" name="first_name" autocomplete="given-name" placeholder="First name" required>
            </label>
            <label class="nd-contact__field">
              <span class="nd-contact__field-head"><span class="nd-contact__field-label">Last Name</span></span>
              <input id="cf-lname" type="text" name="last_name" autocomplete="family-name" placeholder="Last name">
            </label>
          </div>
          <div class="nd-contact__row nd-contact__row--split">
            <label class="nd-contact__field">
              <span class="nd-contact__field-head"><span class="nd-contact__field-label">Phone Number</span><span class="nd-contact__required">*</span></span>
              <input id="cf-phone" type="tel" name="phone" autocomplete="tel" placeholder="Phone Number" required>
            </label>
            <label class="nd-contact__field">
              <span class="nd-contact__field-head"><span class="nd-contact__field-label">Company Name</span></span>
              <input id="cf-company" type="text" name="company" autocomplete="organization" placeholder="Company Name">
            </label>
          </div>
          <label class="nd-contact__field">
            <span class="nd-contact__field-head"><span class="nd-contact__field-label">Your Email</span><span class="nd-contact__required">*</span></span>
            <input id="cf-email" type="email" name="email" autocomplete="email" placeholder="Enter your email" required>
          </label>
          <div class="nd-contact__row nd-contact__row--split">
            <label class="nd-contact__field">
              <span class="nd-contact__field-head"><span class="nd-contact__field-label">I Need Help With</span></span>
              <input id="cf-help" type="text" name="help" placeholder="e.g. Network Support, Security Review">
            </label>
            <label class="nd-contact__field">
              <span class="nd-contact__field-head"><span class="nd-contact__field-label">Scale of Business</span></span>
              <input id="cf-scale" type="text" name="scale" placeholder="e.g. 50 employees, 3 sites">
            </label>
          </div>
          <label class="nd-contact__field">
            <span class="nd-contact__field-head"><span class="nd-contact__field-label">Message</span><span class="nd-contact__required">*</span></span>
            <textarea id="cf-message" name="message" rows="4" placeholder="Tell us about your network requirements..." required></textarea>
          </label>
          <label class="nd-contact__field">
            <span class="nd-contact__field-head"><span class="nd-contact__field-label">Where Did You Hear About Us?</span></span>
            <select class="form-select" id="cf-referral" name="referral"><option value="">Please select&hellip;</option><option>Google / Search</option><option>LinkedIn</option><option>Referral from a colleague</option><option>Social Media</option><option>Other</option></select>
          </label>
          <!-- Source tracking fields (hidden) -->
          <input type="hidden" name="source_page" id="cf-source-page">
          <input type="hidden" name="source_family" id="cf-source-family">
          <input type="hidden" name="source_cta" id="cf-source-cta">
          <input type="hidden" name="inquiry_type" id="cf-inquiry-type">
          <input type="hidden" name="lead_status" id="cf-lead-status">
          <input type="hidden" name="action_required" id="cf-action-required">
          <input type="hidden" name="routing_team" id="cf-routing-team">
          <label class="nd-contact__agree">
            <span class="nd-contact__checkbox">
              <input id="cf-consent-privacy" type="checkbox" name="consent_privacy" value="yes" required>
              <span class="nd-contact__checkbox-box" aria-hidden="true"></span>
            </span>
            <span class="nd-contact__agree-text">By submitting this form, you agree to our processing of your corporate details in accordance with our <a href="/privacy-policy.html">Privacy Policy</a>.</span>
          </label>
          <label class="nd-contact__agree">
            <span class="nd-contact__checkbox">
              <input id="cf-consent-marketing" type="checkbox" name="consent_marketing" value="yes">
              <span class="nd-contact__checkbox-box" aria-hidden="true"></span>
            </span>
            <span class="nd-contact__agree-text">I want to receive B2B network insights and marketing emails.</span>
          </label>
          <button class="nd-contact__submit" type="submit">Send Enquiry</button>
          <div id="form-success" class="form-success" role="status" aria-live="polite">Thank you for your enquiry &mdash; we will be in touch shortly.</div>
          <div id="form-error"   class="form-error"   role="alert"  aria-live="assertive">Something went wrong. Please try again or call us directly on +44 (0) 203 150 1401.</div>
        </form>
      </div>
    </div>
  </section>`;

  // ---- Form submit (AJAX to Web3Forms, graceful fallback) ----
  var form = document.getElementById('contact-form');
  if (!form) return;
  var ok  = document.getElementById('form-success');
  var err = document.getElementById('form-error');

  function populateSourceFields() {
    if (!window.NetConSource || typeof window.NetConSource.toObject !== 'function') return;
    var sourceData = window.NetConSource.toObject();
    document.getElementById('cf-source-page').value = sourceData.source_page;
    document.getElementById('cf-source-family').value = sourceData.source_family;
    document.getElementById('cf-source-cta').value = sourceData.source_cta;
    document.getElementById('cf-inquiry-type').value = sourceData.inquiry_type;
    document.getElementById('cf-lead-status').value = sourceData.lead_status;
    document.getElementById('cf-action-required').value = sourceData.action_required;
    document.getElementById('cf-routing-team').value = sourceData.routing_team;
    var subj = document.getElementById('cf-subject');
    if (subj) subj.value = 'NetCon website enquiry \u2014 ' + sourceData.source_page + ' (' + sourceData.source_cta + ')';
  }

  form.addEventListener('submit', function (e) {
    if (window.__netconGlobalFormHandler) return;
    if (!form.action) return;
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (err && !err.dataset.defaultMessage) err.dataset.defaultMessage = err.textContent;
    var requiredConsents = form.querySelectorAll('input[type="checkbox"][required]');
    for (var i = 0; i < requiredConsents.length; i++) {
      if (!requiredConsents[i].checked) {
        if (ok) ok.style.display = 'none';
        if (err) {
          err.textContent = 'Please confirm the required consent before submitting the form.';
          err.style.display = 'block';
        }
        requiredConsents[i].focus();
        return;
      }
    }
    if (ok) ok.style.display = 'none';
    if (err) {
      err.style.display = 'none';
      if (err.dataset.defaultMessage) err.textContent = err.dataset.defaultMessage;
    }
    populateSourceFields();
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (r.ok) { form.reset(); if (ok) ok.style.display = 'block'; }
        else if (err) {
          if (err.dataset.defaultMessage) err.textContent = err.dataset.defaultMessage;
          err.style.display = 'block';
        }
      })
      .catch(function () {
        if (err) {
          if (err.dataset.defaultMessage) err.textContent = err.dataset.defaultMessage;
          err.style.display = 'block';
        }
      });
  });
})();
