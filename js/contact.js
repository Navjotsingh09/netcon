(function () {
  'use strict';
  var holder = document.getElementById('site-contact');
  if (!holder || holder.getAttribute('data-contact-ready')) return;
  holder.setAttribute('data-contact-ready', '1');
  holder.outerHTML = `  <section class="contact-section" id="contact" aria-labelledby="contact-heading">
    <div class="contact-layout">
      <div class="contact-info animate-fade-up">
        <h2 class="contact-info__heading" id="contact-heading">Contact us today for a free consultation</h2>
        <p class="contact-info__lead">We pride ourselves on delivering a flexible engagement style to meet your requirements. Contact us for your free consultation.</p>
        <div class="contact-detail">
          <div class="contact-detail__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>
          </div>
          <div>
            <p class="contact-detail__label">Phone</p>
            <p class="contact-detail__body"><a href="tel:+442031501401">+44 (0) 203 150 1401</a></p>
          </div>
        </div>
        <div class="contact-detail">
          <div class="contact-detail__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          </div>
          <div>
            <p class="contact-detail__label">Address</p>
            <p class="contact-detail__body">London / South<br>20-22 Wenlock Rd<br>London N1 7GU</p>
          </div>
        </div>
        <div class="contact-detail">
          <div class="contact-detail__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          </div>
          <div>
            <p class="contact-detail__label">Address</p>
            <p class="contact-detail__body">Beech House, Greenfield Crescent<br>Edgbaston, Birmingham, B15 3BE</p>
          </div>
        </div>
        <div class="contact-detail">
          <div class="contact-detail__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </div>
          <div>
            <p class="contact-detail__label">Email</p>
            <p class="contact-detail__body"><a href="mailto:info@network-consultancy.com">info@network-consultancy.com</a></p>
          </div>
        </div>
      </div>
      <div class="contact-form-wrap animate-fade-up">
        <form id="contact-form" method="post" action="https://api.web3forms.com/submit" novalidate>
          <input type="hidden" name="access_key" value="fbcd4bae-c2e9-4e0c-9bf1-9576bef8625b">
          <div class="form-row">
            <div class="form-group"><label for="cf-fname">First Name <span aria-hidden="true">*</span></label><input class="form-field" id="cf-fname" type="text" name="first_name" placeholder="First Name" autocomplete="given-name" required></div>
            <div class="form-group"><label for="cf-lname">Last Name</label><input class="form-field" id="cf-lname" type="text" name="last_name" placeholder="Last Name" autocomplete="family-name"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label for="cf-phone">Phone Number</label><input class="form-field" id="cf-phone" type="tel" name="phone" placeholder="Phone Number" autocomplete="tel"></div>
            <div class="form-group"><label for="cf-company">Company Name</label><input class="form-field" id="cf-company" type="text" name="company" placeholder="Company Name" autocomplete="organization"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label for="cf-help">I Need Help With</label><input class="form-field" id="cf-help" type="text" name="help" placeholder="e.g. Network Support, Security Review"></div>
            <div class="form-group"><label for="cf-scale">Scale of Business</label><input class="form-field" id="cf-scale" type="text" name="scale" placeholder="e.g. 50 employees, 3 sites"></div>
          </div>
          <div class="form-group" style="margin-bottom:16px;"><label for="cf-message">Message <span aria-hidden="true">*</span></label><textarea class="form-textarea" id="cf-message" name="message" placeholder="Tell us about your network requirements..." required></textarea></div>
          <div class="form-group" style="margin-bottom:24px;"><label for="cf-referral">Where Did You Hear About Us?</label><select class="form-select" id="cf-referral" name="referral"><option value="">Please select&hellip;</option><option>Google / Search</option><option>LinkedIn</option><option>Referral from a colleague</option><option>Social Media</option><option>Other</option></select></div>
          <!-- Source tracking fields (hidden) -->
          <input type="hidden" name="source_page" id="cf-source-page">
          <input type="hidden" name="source_family" id="cf-source-family">
          <input type="hidden" name="source_cta" id="cf-source-cta">
          <input type="hidden" name="inquiry_type" id="cf-inquiry-type">
          <input type="hidden" name="lead_status" id="cf-lead-status">
          <input type="hidden" name="action_required" id="cf-action-required">
          <input type="hidden" name="routing_team" id="cf-routing-team">
          <div class="form-consents" role="group" aria-label="Consent options">
            <div class="form-consent">
              <input id="cf-consent-privacy" type="checkbox" name="consent_privacy" value="yes" required>
              <label for="cf-consent-privacy">By submitting this form, you agree to our processing of your corporate details in accordance with our <a href="/privacy-policy.html">Privacy Policy</a>.</label>
            </div>
            <div class="form-consent">
              <input id="cf-consent-marketing" type="checkbox" name="consent_marketing" value="yes">
              <label for="cf-consent-marketing">I want to receive B2B network insights and marketing emails.</label>
            </div>
          </div>
          <button type="submit" class="btn-dark" style="width:100%;justify-content:center;">Send Enquiry</button>
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
  }

  form.addEventListener('submit', function (e) {
    if (window.__netconGlobalFormHandler) return;
    if (!form.action) return;
    e.preventDefault();
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
