/**
 * NetCon Accessibility Widget v2.0
 * WCAG 2.2 Level AA
 * Profiles: Epilepsy Safe, Seizure Safe, ADHD, Low Vision
 * Content:  Font Size, Highlight Titles/Links, Dyslexia Font,
 *           Letter Spacing, Line Height, Font Weight, Text Align
 * Colour:   Dark/Light/High Contrast, High/Low Saturation, Monochrome
 * Nav:      Mute Sounds, Page Read, Reading Guide, Pause Animations, Big Cursor
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'nc_a11y_v2';
  var FONT_ZOOM   = {'-3':0.75,'-2':0.82,'-1':0.91,'0':1,'1':1.12,'2':1.25,'3':1.40,'4':1.56,'5':1.75};
  var FONT_MIN = -3, FONT_MAX = 5;

  var defaults = {
    fontScale:       0,
    /* Profiles */
    epilepsySafe:    false,
    seizureSafe:     false,
    adhd:            false,
    lowVision:       false,
    /* Content */
    highlightTitles: false,
    highlightLinks:  false,
    dyslexia:        false,
    letterSpacing:   false,
    lineHeight:      false,
    fontWeight:      false,
    textAlign:       'default',   /* 'default' | 'left' | 'center' | 'right' */
    /* Colour */
    darkContrast:    false,
    lightContrast:   false,
    highContrast:    false,
    highSaturation:  false,
    lowSaturation:   false,
    monochrome:      false,
    /* Navigation */
    muteSounds:      false,
    pageRead:        false,
    readingGuide:    false,
    pauseAnimations: false,
    bigCursor:       false
  };

  var state = copy(defaults);

  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      Object.keys(defaults).forEach(function (k) {
        if (k in saved && typeof saved[k] === typeof defaults[k]) state[k] = saved[k];
      });
    }
  } catch (_) {}

  function copy(o) { return JSON.parse(JSON.stringify(o)); }
  function save()  { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {} }
  function $id(id) { return document.getElementById(id); }

  /* ── Apply all state to DOM ─────────────────────────────────── */
  function applyAll() {
    var html = document.documentElement;
    var body = document.body;

    /* Profiles override individual toggles */
    var eff = copy(state);
    if (eff.epilepsySafe) { eff.pauseAnimations = true; eff.lowSaturation  = true; }
    if (eff.seizureSafe)  { eff.pauseAnimations = true; eff.darkContrast   = true; }
    if (eff.adhd)         { eff.lineHeight = true; eff.letterSpacing = true; eff.highlightLinks = true; }
    if (eff.lowVision)    { eff.highContrast = true; if (eff.fontScale < 2) eff.fontScale = 2; }

    /* 1. Font scale */
    var z = FONT_ZOOM[String(eff.fontScale)] || 1;
    html.style.zoom = (z === 1) ? '' : String(z);

    /* 2. CSS filters */
    var filters = [];
    if (eff.monochrome)                          filters.push('grayscale(100%)');
    else if (eff.highSaturation)                 filters.push('saturate(250%)');
    else if (eff.lowSaturation)                  filters.push('saturate(30%)');
    if (eff.lightContrast && !eff.darkContrast)  filters.push('brightness(1.2) contrast(1.1)');
    html.style.filter = filters.length ? filters.join(' ') : '';

    /* 3. Body class map */
    var classMap = {
      'a11y-high-contrast':    eff.highContrast    && !eff.monochrome,
      'a11y-dark-contrast':    eff.darkContrast    && !eff.highContrast,
      'a11y-light-contrast':   eff.lightContrast   && !eff.darkContrast && !eff.highContrast,
      'a11y-highlight-titles': eff.highlightTitles,
      'a11y-highlight-links':  eff.highlightLinks,
      'a11y-dyslexia':         eff.dyslexia,
      'a11y-letter-spacing':   eff.letterSpacing,
      'a11y-line-height':      eff.lineHeight,
      'a11y-font-weight':      eff.fontWeight,
      'a11y-pause-animations': eff.pauseAnimations,
      'a11y-big-cursor':       eff.bigCursor,
      'a11y-reading-guide':    eff.readingGuide
    };
    Object.keys(classMap).forEach(function (cls) { body.classList.toggle(cls, !!classMap[cls]); });

    /* Text alignment */
    body.classList.remove('a11y-align-left', 'a11y-align-center', 'a11y-align-right');
    if (eff.textAlign !== 'default') body.classList.add('a11y-align-' + eff.textAlign);

    /* Mute sounds */
    document.querySelectorAll('audio, video').forEach(function (m) { m.muted = !!eff.muteSounds; });

    save();
    syncUI();
  }

  /* ── Page Read (Web Speech API) ─────────────────────────────── */
  var _ttsHandler = null;
  function enablePageRead() {
    if (!window.speechSynthesis) return;
    _ttsHandler = function (e) {
      var t = e.target;
      if (!t || (t.closest && t.closest('#a11y-widget'))) return;
      var tags = ['P','H1','H2','H3','H4','H5','H6','LI','TD','TH','LABEL','A','BUTTON','SPAN'];
      if (tags.indexOf(t.tagName) === -1) return;
      var text = (t.getAttribute('aria-label') || t.textContent || '').trim().slice(0, 250);
      if (!text) return;
      window.speechSynthesis.cancel();
      var utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-GB';
      window.speechSynthesis.speak(utt);
    };
    document.addEventListener('mouseover', _ttsHandler);
  }
  function disablePageRead() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (_ttsHandler) { document.removeEventListener('mouseover', _ttsHandler); _ttsHandler = null; }
  }

  /* ── Reading Guide ──────────────────────────────────────────── */
  var _guideEl = null, _guideMover = null;
  function enableReadingGuide() {
    if (!_guideEl) {
      _guideEl = document.createElement('div');
      _guideEl.id = 'a11y-reading-guide-el';
      _guideEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(_guideEl);
    }
    _guideMover = function (e) { if (_guideEl) _guideEl.style.top = e.clientY + 'px'; };
    document.addEventListener('mousemove', _guideMover);
  }
  function disableReadingGuide() {
    if (_guideMover) { document.removeEventListener('mousemove', _guideMover); _guideMover = null; }
  }

  /* ── Sync button pressed states ─────────────────────────────── */
  function syncUI() {
    setPressed('a11y-btn-epilepsy',  state.epilepsySafe);
    setPressed('a11y-btn-seizure',   state.seizureSafe);
    setPressed('a11y-btn-adhd',      state.adhd);
    setPressed('a11y-btn-lowvision', state.lowVision);

    setPressed('a11y-btn-htitles',   state.highlightTitles);
    setPressed('a11y-btn-hlinks',    state.highlightLinks);
    setPressed('a11y-btn-dyslexia',  state.dyslexia);
    setPressed('a11y-btn-lspacing',  state.letterSpacing);
    setPressed('a11y-btn-lheight',   state.lineHeight);
    setPressed('a11y-btn-fweight',   state.fontWeight);

    var alignBtn = $id('a11y-btn-align');
    if (alignBtn) {
      var alignOn = state.textAlign !== 'default';
      alignBtn.setAttribute('aria-pressed', String(alignOn));
      alignBtn.classList.toggle('is-active', alignOn);
      var alignMap = {'default':'Text Align','left':'Align Left','center':'Align Centre','right':'Align Right'};
      var lbl = alignBtn.querySelector('.a11y-option__label');
      if (lbl) lbl.textContent = alignMap[state.textAlign] || 'Text Align';
    }

    setPressed('a11y-btn-dark',      state.darkContrast);
    setPressed('a11y-btn-light',     state.lightContrast);
    setPressed('a11y-btn-hcontrast', state.highContrast);
    setPressed('a11y-btn-hsat',      state.highSaturation);
    setPressed('a11y-btn-lsat',      state.lowSaturation);
    setPressed('a11y-btn-mono',      state.monochrome);

    setPressed('a11y-btn-mute',      state.muteSounds);
    setPressed('a11y-btn-read',      state.pageRead);
    setPressed('a11y-btn-guide',     state.readingGuide);
    setPressed('a11y-btn-motion',    state.pauseAnimations);
    setPressed('a11y-btn-cursor',    state.bigCursor);

    var decBtn = $id('a11y-font-dec'), incBtn = $id('a11y-font-inc'), pct = $id('a11y-font-pct');
    if (decBtn) decBtn.disabled = (state.fontScale <= FONT_MIN);
    if (incBtn) incBtn.disabled = (state.fontScale >= FONT_MAX);
    if (pct)    pct.textContent = Math.round((FONT_ZOOM[String(state.fontScale)] || 1) * 100) + '%';
  }

  function setPressed(id, active) {
    var btn = $id(id);
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(!!active));
    btn.classList.toggle('is-active', !!active);
  }

  function reset() {
    disablePageRead();
    disableReadingGuide();
    state = copy(defaults);
    applyAll();
  }

  /* ── Widget HTML ────────────────────────────────────────────── */
  var W = '';

  W += '<div id="a11y-widget" role="complementary" aria-label="Accessibility options">';
  W += '<div id="a11y-overlay" class="a11y-overlay" aria-hidden="true"></div>';

  /* Trigger button */
  W += '<button id="a11y-trigger" class="a11y-trigger" type="button"';
  W += ' aria-expanded="false" aria-controls="a11y-panel" aria-haspopup="dialog"';
  W += ' aria-label="Open accessibility options" title="Accessibility">';
  W += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26"';
  W += ' fill="white" aria-hidden="true">';
  W += '<circle cx="12" cy="4" r="2.5"/>';
  W += '<path d="M19.5 8h-15a.5.5 0 000 1H9v5l-2.5 5h.5c.18 0 .34-.1.44-.27L12 14l4.56 4.73';
  W += 'c.1.17.26.27.44.27h.5L15 14V9h4.5a.5.5 0 000-1z"/>';
  W += '</svg></button>';

  /* Panel */
  W += '<div id="a11y-panel" class="a11y-panel" role="dialog"';
  W += ' aria-label="Accessibility options" aria-modal="true">';

  /* ── Header ── */
  W += '<div class="a11y-panel__header">';
  W += '<div class="a11y-panel__header-left">';
  W += '<svg viewBox="0 0 24 24" width="22" height="22" fill="white" aria-hidden="true">';
  W += '<circle cx="12" cy="4" r="2.5"/>';
  W += '<path d="M19.5 8h-15a.5.5 0 000 1H9v5l-2.5 5h.5c.18 0 .34-.1.44-.27L12 14l4.56 4.73';
  W += 'c.1.17.26.27.44.27h.5L15 14V9h4.5a.5.5 0 000-1z"/>';
  W += '</svg>';
  W += '<h2 class="a11y-panel__title">Accessibility</h2>';
  W += '</div>';
  W += '<div class="a11y-panel__header-actions">';
  W += '<button id="a11y-reset-all" class="a11y-header-btn" type="button"';
  W += ' aria-label="Reset all accessibility settings" title="Reset all">';
  W += '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white"';
  W += ' stroke-width="2" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M3 12a9 9 0 1 0 2.4-6"/><polyline points="1 6 3.5 8.5 6 6"/>';
  W += '</svg></button>';
  W += '<button id="a11y-close" class="a11y-header-btn" type="button"';
  W += ' aria-label="Close accessibility panel">';
  W += '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white"';
  W += ' stroke-width="2.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M18 6 6 18M6 6l12 12"/>';
  W += '</svg></button>';
  W += '</div></div>'; /* /header */

  /* ── Body ── */
  W += '<div class="a11y-panel__body">';

  /* — Profiles — */
  W += '<div class="a11y-section">';
  W += '<p class="a11y-section__label">Accessibility Profiles</p>';
  W += '<div class="a11y-grid a11y-grid--2">';

  W += '<button class="a11y-option a11y-profile-btn" id="a11y-btn-epilepsy" type="button"';
  W += ' aria-pressed="false" aria-label="Epilepsy Safe Mode — reduces flashing and saturation">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M12 3L4 7v5c0 4.4 3.5 8.5 8 9.9 4.5-1.4 8-5.5 8-9.9V7z"/>';
  W += '<path d="M12 9v3l2 2"/></svg>';
  W += '<span class="a11y-option__label">Epilepsy Safe</span></button>';

  W += '<button class="a11y-option a11y-profile-btn" id="a11y-btn-seizure" type="button"';
  W += ' aria-pressed="false" aria-label="Seizure Safe Mode — dark contrast and no animations">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">';
  W += '<path d="M13 2L4.5 13.5H11L9.5 22 20 10.5H13.5z"/></svg>';
  W += '<span class="a11y-option__label">Seizure Safe</span></button>';

  W += '<button class="a11y-option a11y-profile-btn" id="a11y-btn-adhd" type="button"';
  W += ' aria-pressed="false" aria-label="ADHD Friendly — improved spacing and link highlighting">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" aria-hidden="true">';
  W += '<circle cx="12" cy="12" r="3"/>';
  W += '<circle cx="12" cy="12" r="7"/>';
  W += '<circle cx="12" cy="12" r="10.5"/></svg>';
  W += '<span class="a11y-option__label">ADHD</span></button>';

  W += '<button class="a11y-option a11y-profile-btn" id="a11y-btn-lowvision" type="button"';
  W += ' aria-pressed="false" aria-label="Low Vision — larger text and high contrast">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>';
  W += '<circle cx="12" cy="12" r="3"/></svg>';
  W += '<span class="a11y-option__label">Low Vision</span></button>';

  W += '</div></div>';

  /* — Content Adjustments — */
  W += '<div class="a11y-section">';
  W += '<p class="a11y-section__label">Content Adjustments</p>';

  /* Font size row */
  W += '<div class="a11y-font-row" role="group" aria-label="Adjust text size">';
  W += '<div class="a11y-font-row__label">';
  W += '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"';
  W += ' stroke-width="2" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M4 6h16M12 6v12M17 16h4M19 14v4"/></svg>';
  W += '<span>Font Size</span></div>';
  W += '<div class="a11y-font-row__controls">';
  W += '<button id="a11y-font-dec" class="a11y-font-ctrl" type="button"';
  W += ' aria-label="Decrease text size">&#8722;</button>';
  W += '<span id="a11y-font-pct" class="a11y-font-pct" aria-live="polite" aria-atomic="true">100%</span>';
  W += '<button id="a11y-font-inc" class="a11y-font-ctrl" type="button"';
  W += ' aria-label="Increase text size">&#43;</button>';
  W += '</div></div>';

  /* Content options grid */
  W += '<div class="a11y-grid">';

  W += '<button class="a11y-option" id="a11y-btn-htitles" type="button"';
  W += ' aria-pressed="false" aria-label="Highlight all headings">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="2" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M4 6h16M12 6v12"/><path d="M8 20h8" stroke-width="3"/></svg>';
  W += '<span class="a11y-option__label">Highlight<br>Titles</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-hlinks" type="button"';
  W += ' aria-pressed="false" aria-label="Highlight all links">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>';
  W += '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  W += '<span class="a11y-option__label">Highlight<br>Links</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-dyslexia" type="button"';
  W += ' aria-pressed="false" aria-label="Dyslexia-friendly font">';
  W += '<span class="a11y-icon-text" aria-hidden="true">Aa</span>';
  W += '<span class="a11y-option__label">Dyslexia<br>Font</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-lspacing" type="button"';
  W += ' aria-pressed="false" aria-label="Increase letter spacing">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M4 20L8 5l4 15M5.5 15h5M16 5v15M13 8h6"/></svg>';
  W += '<span class="a11y-option__label">Letter<br>Spacing</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-lheight" type="button"';
  W += ' aria-pressed="false" aria-label="Increase line height">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M3 8l3-3 3 3M6 5v14M3 16l3 3 3-3"/>';
  W += '<path d="M13 6h8M13 12h6M13 18h8"/></svg>';
  W += '<span class="a11y-option__label">Line<br>Height</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-fweight" type="button"';
  W += ' aria-pressed="false" aria-label="Increase font weight">';
  W += '<span class="a11y-icon-text a11y-icon-bold" aria-hidden="true">B</span>';
  W += '<span class="a11y-option__label">Font<br>Weight</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-align" type="button"';
  W += ' aria-pressed="false" aria-label="Cycle text alignment: left, centre, right">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M3 6h18M3 12h14M3 18h18"/></svg>';
  W += '<span class="a11y-option__label">Text Align</span></button>';

  W += '</div></div>';

  /* — Colour Adjustments — */
  W += '<div class="a11y-section">';
  W += '<p class="a11y-section__label">Colour Adjustments</p>';
  W += '<div class="a11y-grid">';

  W += '<button class="a11y-option" id="a11y-btn-dark" type="button"';
  W += ' aria-pressed="false" aria-label="Dark contrast mode">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  W += '<span class="a11y-option__label">Dark<br>Contrast</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-light" type="button"';
  W += ' aria-pressed="false" aria-label="Light contrast mode">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<circle cx="12" cy="12" r="5"/>';
  W += '<path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2';
  W += 'M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  W += '<span class="a11y-option__label">Light<br>Contrast</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-hcontrast" type="button"';
  W += ' aria-pressed="false" aria-label="High contrast black and white mode">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">';
  W += '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>';
  W += '<path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/></svg>';
  W += '<span class="a11y-option__label">High<br>Contrast</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-hsat" type="button"';
  W += ' aria-pressed="false" aria-label="High saturation mode">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">';
  W += '<path d="M12 3L6 12c0 3.3 2.7 6 6 6s6-2.7 6-6z" fill="currentColor"/></svg>';
  W += '<span class="a11y-option__label">High<br>Saturation</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-lsat" type="button"';
  W += ' aria-pressed="false" aria-label="Low saturation mode">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M12 3L6 12c0 3.3 2.7 6 6 6s6-2.7 6-6z"/></svg>';
  W += '<span class="a11y-option__label">Low<br>Saturation</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-mono" type="button"';
  W += ' aria-pressed="false" aria-label="Monochrome greyscale mode">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">';
  W += '<path d="M12 3L6 12c0 3.3 2.7 6 6 6s6-2.7 6-6z" fill="none"';
  W += ' stroke="currentColor" stroke-width="1.5"/>';
  W += '<path d="M12 3L12 18c3.3 0 6-2.7 6-6z" fill="currentColor"/></svg>';
  W += '<span class="a11y-option__label">Monochrome</span></button>';

  W += '</div></div>';

  /* — Navigation Adjustments — */
  W += '<div class="a11y-section">';
  W += '<p class="a11y-section__label">Navigation Adjustments</p>';
  W += '<div class="a11y-grid">';

  W += '<button class="a11y-option" id="a11y-btn-mute" type="button"';
  W += ' aria-pressed="false" aria-label="Mute all audio and video">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M11 5L6 9H2v6h4l5 4V5z"/>';
  W += '<path d="M23 9l-6 6M17 9l6 6"/></svg>';
  W += '<span class="a11y-option__label">Mute<br>Sounds</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-read" type="button"';
  W += ' aria-pressed="false" aria-label="Hover to hear page content read aloud">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>';
  W += '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>';
  W += '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
  W += '<span class="a11y-option__label">Page<br>Read</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-guide" type="button"';
  W += ' aria-pressed="false" aria-label="Reading guide ruler — follows your mouse">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"';
  W += ' stroke-width="1.5" stroke-linecap="round" aria-hidden="true">';
  W += '<line x1="3" y1="12" x2="21" y2="12" stroke-width="2"/>';
  W += '<line x1="3" y1="8"  x2="21" y2="8"  stroke-dasharray="4 2"/>';
  W += '<line x1="3" y1="16" x2="21" y2="16" stroke-dasharray="4 2"/></svg>';
  W += '<span class="a11y-option__label">Reading<br>Guide</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-motion" type="button"';
  W += ' aria-pressed="false" aria-label="Pause all animations and transitions">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">';
  W += '<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>';
  W += '<rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>';
  W += '<span class="a11y-option__label">Pause<br>Animations</span></button>';

  W += '<button class="a11y-option" id="a11y-btn-cursor" type="button"';
  W += ' aria-pressed="false" aria-label="Enable large cursor">';
  W += '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">';
  W += '<path d="M5 3l14 9-7.5 2-3.5 7z"/></svg>';
  W += '<span class="a11y-option__label">Big<br>Cursor</span></button>';

  W += '</div></div>';
  W += '</div>'; /* /panel__body */

  /* Footer */
  W += '<div class="a11y-panel__footer">';
  W += '<button id="a11y-reset-footer" class="a11y-reset-btn" type="button"';
  W += ' aria-label="Reset all accessibility settings to default">';
  W += '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"';
  W += ' stroke-width="2" stroke-linecap="round" aria-hidden="true">';
  W += '<path d="M3 12a9 9 0 1 0 2.4-6"/><polyline points="1 6 3.5 8.5 6 6"/>';
  W += '</svg> Reset All Settings</button>';
  W += '</div>';
  W += '</div>'; /* /panel */
  W += '</div>'; /* /widget */

  /* ── Focus trap ─────────────────────────────────────────────── */
  function trapFocus(e) {
    var panel = $id('a11y-panel');
    if (!panel || !panel.classList.contains('is-open')) return;
    var nodes = panel.querySelectorAll(
      'button:not(:disabled), [href], input, select, [tabindex]:not([tabindex="-1"])'
    );
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    }
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    var container = document.createElement('div');
    container.innerHTML = W;
    document.body.appendChild(container.firstElementChild);

    var trigger  = $id('a11y-trigger');
    var panel    = $id('a11y-panel');
    var overlay  = $id('a11y-overlay');
    var closeBtn = $id('a11y-close');
    var widget   = $id('a11y-widget');

    if (widget) {
      widget.style.position = 'fixed';
      widget.style.top = '0';
      widget.style.left = '0';
      widget.style.width = '0';
      widget.style.height = '0';
    }

    function openPanel() {
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      widget.classList.add('panel-open');
      overlay.classList.add('is-active');
      document.addEventListener('keydown', trapFocus);
      setTimeout(function () { if (closeBtn) closeBtn.focus(); }, 80);
    }

    function closePanel() {
      panel.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      widget.classList.remove('panel-open');
      overlay.classList.remove('is-active');
      document.removeEventListener('keydown', trapFocus);
      trigger.focus();
    }

    trigger.addEventListener('click', function () {
      panel.classList.contains('is-open') ? closePanel() : openPanel();
    });
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) closePanel();
    });

    /* Font Size */
    $id('a11y-font-inc').addEventListener('click', function () {
      if (state.fontScale < FONT_MAX) { state.fontScale++; applyAll(); }
    });
    $id('a11y-font-dec').addEventListener('click', function () {
      if (state.fontScale > FONT_MIN) { state.fontScale--; applyAll(); }
    });

    /* Profiles */
    $id('a11y-btn-epilepsy').addEventListener('click',  function () { state.epilepsySafe = !state.epilepsySafe; applyAll(); });
    $id('a11y-btn-seizure').addEventListener('click',   function () { state.seizureSafe  = !state.seizureSafe;  applyAll(); });
    $id('a11y-btn-adhd').addEventListener('click',      function () { state.adhd         = !state.adhd;         applyAll(); });
    $id('a11y-btn-lowvision').addEventListener('click', function () { state.lowVision    = !state.lowVision;    applyAll(); });

    /* Content */
    $id('a11y-btn-htitles').addEventListener('click',  function () { state.highlightTitles = !state.highlightTitles; applyAll(); });
    $id('a11y-btn-hlinks').addEventListener('click',   function () { state.highlightLinks  = !state.highlightLinks;  applyAll(); });
    $id('a11y-btn-dyslexia').addEventListener('click', function () { state.dyslexia        = !state.dyslexia;        applyAll(); });
    $id('a11y-btn-lspacing').addEventListener('click', function () { state.letterSpacing   = !state.letterSpacing;   applyAll(); });
    $id('a11y-btn-lheight').addEventListener('click',  function () { state.lineHeight      = !state.lineHeight;      applyAll(); });
    $id('a11y-btn-fweight').addEventListener('click',  function () { state.fontWeight      = !state.fontWeight;      applyAll(); });
    $id('a11y-btn-align').addEventListener('click', function () {
      var cycle = { 'default': 'left', 'left': 'center', 'center': 'right', 'right': 'default' };
      state.textAlign = cycle[state.textAlign] || 'default';
      applyAll();
    });

    /* Colour — contrast group (mutually exclusive) */
    $id('a11y-btn-dark').addEventListener('click', function () {
      var on = !state.darkContrast;
      state.darkContrast = on;
      if (on) { state.lightContrast = false; state.highContrast = false; }
      applyAll();
    });
    $id('a11y-btn-light').addEventListener('click', function () {
      var on = !state.lightContrast;
      state.lightContrast = on;
      if (on) { state.darkContrast = false; state.highContrast = false; }
      applyAll();
    });
    $id('a11y-btn-hcontrast').addEventListener('click', function () {
      var on = !state.highContrast;
      state.highContrast = on;
      if (on) { state.darkContrast = false; state.lightContrast = false; }
      applyAll();
    });

    /* Colour — saturation group (mutually exclusive) */
    $id('a11y-btn-hsat').addEventListener('click', function () {
      var on = !state.highSaturation;
      state.highSaturation = on;
      if (on) { state.lowSaturation = false; state.monochrome = false; }
      applyAll();
    });
    $id('a11y-btn-lsat').addEventListener('click', function () {
      var on = !state.lowSaturation;
      state.lowSaturation = on;
      if (on) { state.highSaturation = false; state.monochrome = false; }
      applyAll();
    });
    $id('a11y-btn-mono').addEventListener('click', function () {
      var on = !state.monochrome;
      state.monochrome = on;
      if (on) { state.highSaturation = false; state.lowSaturation = false; }
      applyAll();
    });

    /* Navigation */
    $id('a11y-btn-mute').addEventListener('click',   function () { state.muteSounds      = !state.muteSounds;      applyAll(); });
    $id('a11y-btn-motion').addEventListener('click', function () { state.pauseAnimations = !state.pauseAnimations; applyAll(); });
    $id('a11y-btn-cursor').addEventListener('click', function () { state.bigCursor       = !state.bigCursor;       applyAll(); });

    $id('a11y-btn-read').addEventListener('click', function () {
      state.pageRead = !state.pageRead;
      if (state.pageRead) enablePageRead(); else disablePageRead();
      applyAll();
    });

    $id('a11y-btn-guide').addEventListener('click', function () {
      state.readingGuide = !state.readingGuide;
      if (state.readingGuide) enableReadingGuide(); else disableReadingGuide();
      applyAll();
    });

    /* Reset */
    function doReset() { reset(); }
    $id('a11y-reset-all').addEventListener('click',    doReset);
    $id('a11y-reset-footer').addEventListener('click', doReset);

    /* Apply persisted state on load */
    if (state.pageRead)     enablePageRead();
    if (state.readingGuide) enableReadingGuide();
    applyAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
