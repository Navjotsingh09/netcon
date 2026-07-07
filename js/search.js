(function () {
  'use strict';

  var index = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
  var maxResults = 10;
  var activeClass = 'search-open';

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ensureUi() {
    if (q('#site-search-modal')) return;

    var style = document.createElement('style');
    style.textContent = [
      '#site-search-modal { position: fixed; inset: 0; z-index: 1400; display: none; }',
      '#site-search-modal.is-open { display: block; }',
      '#site-search-modal .search-overlay { position: absolute; inset: 0; background: rgba(8,16,48,.55); backdrop-filter: blur(4px); }',
      '#site-search-modal .search-shell { position: relative; width: min(760px, calc(100% - 32px)); margin: 84px auto 0; background: #fff; border-radius: 14px; border: 1px solid rgba(9,130,197,.2); box-shadow: 0 24px 50px rgba(6,16,54,.28); overflow: hidden; }',
      '#site-search-modal .search-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid #e3e7ee; }',
      '#site-search-modal .search-input { flex: 1; border: 0; outline: 0; font: 500 16px/1.4 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #353535; }',
      '#site-search-modal .search-close { border: 0; background: #f0f4f8; border-radius: 8px; width: 34px; height: 34px; cursor: pointer; font-size: 20px; line-height: 1; color: #353535; }',
      '#site-search-modal .search-results { max-height: min(58vh, 460px); overflow: auto; padding: 8px; }',
      '#site-search-modal .search-hit { display: block; text-decoration: none; color: #162470; border-radius: 10px; padding: 10px 12px; border: 1px solid transparent; }',
      '#site-search-modal .search-hit:hover { background: rgba(9,130,197,.06); border-color: rgba(9,130,197,.16); }',
      '#site-search-modal .search-hit-title { font: 600 15px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; }',
      '#site-search-modal .search-hit-url { margin-top: 2px; font: 400 12px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #585151; }',
      '#site-search-modal .search-empty { padding: 14px 12px; color: #585151; font: 500 14px/1.4 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; }',
      'body.' + activeClass + ' { overflow: hidden; }'
    ].join('');
    document.head.appendChild(style);

    var modal = document.createElement('div');
    modal.id = 'site-search-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Site search');
    modal.innerHTML = [
      '<div class="search-overlay" data-search-close="1"></div>',
      '<div class="search-shell">',
      '  <div class="search-head">',
      '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="8" stroke="#585151" stroke-width="2"></circle><path d="m21 21-4.35-4.35" stroke="#585151" stroke-width="2" stroke-linecap="round"></path></svg>',
      '    <input class="search-input" type="search" placeholder="Search pages..." aria-label="Search pages">',
      '    <button type="button" class="search-close" aria-label="Close search" data-search-close="1">&times;</button>',
      '  </div>',
      '  <div class="search-results" aria-live="polite"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function score(item, query) {
    var t = normalize(item.title);
    var u = normalize(item.url);
    if (!query) return 1;
    if (t === query) return 120;
    if (t.indexOf(query) === 0) return 95;
    if (t.indexOf(query) > -1) return 70;
    if (u.indexOf(query) > -1) return 45;
    return 0;
  }

  function renderResults(query) {
    var resultsEl = q('#site-search-modal .search-results');
    if (!resultsEl) return;

    var scored = index
      .map(function (item) { return { item: item, score: score(item, query) }; })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, maxResults)
      .map(function (x) { return x.item; });

    if (!scored.length) {
      resultsEl.innerHTML = '<div class="search-empty">No matching pages found.</div>';
      return;
    }

    resultsEl.innerHTML = scored.map(function (item) {
      return [
        '<a class="search-hit" href="' + escHtml(item.url) + '">',
        '  <div class="search-hit-title">' + escHtml(item.title) + '</div>',
        '  <div class="search-hit-url">' + escHtml(item.url) + '</div>',
        '</a>'
      ].join('');
    }).join('');
  }

  function openSearch(prefill) {
    ensureUi();
    var modal = q('#site-search-modal');
    var input = q('#site-search-modal .search-input');
    if (!modal || !input) return;

    modal.classList.add('is-open');
    document.body.classList.add(activeClass);
    input.value = prefill || '';
    renderResults(normalize(input.value));
    setTimeout(function () { input.focus(); input.select(); }, 0);
  }

  function closeSearch() {
    var modal = q('#site-search-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove(activeClass);
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-search-trigger], .footer__search');
    if (trigger) {
      e.preventDefault();
      openSearch('');
      return;
    }

    if (e.target.closest('[data-search-close]')) {
      e.preventDefault();
      closeSearch();
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target && e.target.matches('#site-search-modal .search-input')) {
      renderResults(normalize(e.target.value));
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeSearch();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openSearch('');
    }
  });
})();
