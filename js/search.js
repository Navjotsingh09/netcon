(function () {
  'use strict';

  var index = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
  var maxResults = 5;
  var searchableCategories = ['services', 'industries', 'proof'];
  var activeClass = 'search-open';
  var showAllResults = false;

  var synonymMap = [
    { pattern: /wifi|wi-fi|wireless|signal|slow internet/g, replace: ' managed wireless lan network support ' },
    { pattern: /vpn|remote|home work|work from home|offsite/g, replace: ' remote access vpn secure access ' },
    { pattern: /security|breach|attack|cyber|ransomware|phishing/g, replace: ' firewall network security cyber security review ' },
    { pattern: /downtime|outage|continuity|resilience|recovery/g, replace: ' business continuity resilience managed network support ' },
    { pattern: /m365|office 365|microsoft 365|teams slow/g, replace: ' microsoft 365 network network health check ' },
    { pattern: /ai|llm|copilot|model workload/g, replace: ' ai-ready infrastructure assessment ' },
    { pattern: /cost|budget|roi|board|ceo/g, replace: ' network consultancy solutions case studies ' }
  ];

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
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
      '#site-search-modal .search-overlay { position: absolute; inset: 0; background: rgba(8,16,48,.58); backdrop-filter: blur(4px); }',
      '#site-search-modal .search-shell { position: relative; width: min(680px, calc(100% - 24px)); margin: 72px auto 0; background: #fff; border-radius: 10px; border: 1px solid #d6e2ef; box-shadow: 0 16px 36px rgba(10,22,54,.22); overflow: hidden; max-height: calc(100vh - 96px); display: flex; flex-direction: column; }',
      '#site-search-modal .search-topbar { background: #0982C5; padding: 14px 16px; color: #fff; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }',
      '#site-search-modal .search-topbar-title { font: 700 17px/1.2 Roboto Condensed, Helvetica Neue, Helvetica, Arial, sans-serif; letter-spacing: .01em; }',
      '#site-search-modal .search-topbar-sub { margin-top: 2px; font: 500 12px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; opacity: .9; max-width: 620px; }',
      '#site-search-modal .search-close { border: 0; background: rgba(255,255,255,.16); color: #fff; border-radius: 10px; width: 36px; height: 36px; cursor: pointer; font-size: 20px; line-height: 1; flex-shrink: 0; }',
      '#site-search-modal .search-head { display: flex; align-items: center; gap: 12px; padding: 16px 18px; border-bottom: 1px solid #d7e2ef; background: #fff; }',
      '#site-search-modal .search-input { flex: 1; border: 0; outline: 0; font: 600 16px/1.45 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #1f2f43; }',
      '#site-search-modal .search-body { overflow: auto; padding: 16px 18px 18px; }',
      '#site-search-modal .search-main { min-width: 0; }',
      '#site-search-modal .search-results-wrap { background: #fff; padding: 0; }',
      '#site-search-modal .search-results-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }',
      '#site-search-modal .search-results-title { margin: 0; font: 700 12px/1.3 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: .08em; color: #2d4f71; }',
      '#site-search-modal .search-see-all { border: 1px solid #c4d9f0; background: #f3f8ff; color: #1a4d79; border-radius: 999px; padding: 5px 10px; font: 700 11px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; cursor: pointer; }',
      '#site-search-modal .search-results { max-height: min(45vh, 420px); overflow: auto; padding-right: 2px; }',
      '#site-search-modal .search-hit { display: block; text-decoration: none; color: #0982C5; border-radius: 10px; padding: 10px; border: 1px solid #dbe6f2; background: #fff; margin-bottom: 8px; transition: border-color .14s ease, background .14s ease; }',
      '#site-search-modal .search-hit:hover { border-color: #9ec9ee; background: #f8fbff; }',
      '#site-search-modal .search-hit-title { font: 700 15px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; }',
      '#site-search-modal .search-hit-meta { display: flex; gap: 6px; flex-wrap: wrap; margin: 6px 0; }',
      '#site-search-modal .search-badge { border-radius: 999px; background: #eaf4ff; color: #1f4f79; padding: 3px 9px; font: 700 11px/1.25 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; }',
      '#site-search-modal .search-hit-url { margin-top: 2px; font: 500 12px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #5a6f83; }',
      '#site-search-modal .search-empty { padding: 14px 12px; color: #4b5f73; font: 500 14px/1.45 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; border: 1px dashed #c9d9ea; border-radius: 10px; background: #fdfefe; }',
      '@media (max-width: 640px) { #site-search-modal .search-shell { width: calc(100% - 12px); margin-top: 18px; border-radius: 10px; } #site-search-modal .search-topbar { padding: 12px; } #site-search-modal .search-topbar-title { font-size: 16px; } #site-search-modal .search-topbar-sub { font-size: 12px; } #site-search-modal .search-head { padding: 12px; } #site-search-modal .search-body { padding: 12px; } }',
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
      '  <div class="search-topbar">',
      '    <div>',
      '      <div class="search-topbar-title">Search</div>',
      '      <div class="search-topbar-sub">Tell us what you need, we\'ll point you to the best page quickly.</div>',
      '    </div>',
      '    <button type="button" class="search-close" aria-label="Close search" data-search-close="1">&times;</button>',
      '  </div>',
      '  <div class="search-head">',
      '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="8" stroke="#585151" stroke-width="2"></circle><path d="m21 21-4.35-4.35" stroke="#585151" stroke-width="2" stroke-linecap="round"></path></svg>',
      '    <input class="search-input" type="search" placeholder="Search services, industries, and case studies" aria-label="Search services, industries, and case studies">',
      '  </div>',
      '  <div class="search-body">',
      '    <section class="search-main">',
      '      <div class="search-results-wrap">',
      '        <div class="search-results-head">',
      '          <p class="search-results-title">Suggested pages</p>',
      '          <button type="button" class="search-see-all" data-search-see-all>See all</button>',
      '        </div>',
      '        <div class="search-results" aria-live="polite"></div>',
      '      </div>',
      '    </section>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(modal);

    renderPromptChips();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function tokenized(text) {
    var raw = normalize(text);
    synonymMap.forEach(function (rule) {
      raw = raw.replace(rule.pattern, rule.replace);
    });
    return raw.replace(/[^a-z0-9\s\-&]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function detectIntent(query) {
    if (!query) return 'discover';
    if (/urgent|outage|down|not working|issue|problem|slow|disconnect/.test(query)) return 'troubleshoot';
    if (/security|cyber|breach|risk|ransomware|firewall|mfa|vpn/.test(query)) return 'security';
    if (/cost|budget|board|roi|investment/.test(query)) return 'risk';
    if (/ai|copilot|llm|model/.test(query)) return 'ai';
    if (/support|help|assist|managed/.test(query)) return 'support';
    if (/case study|proof|results|example/.test(query)) return 'proof';
    if (/policy|terms|privacy|cookie|legal/.test(query)) return 'policy';
    if (/guide|download|blog|learn/.test(query)) return 'learn';
    if (/contact|call|talk|speak|consultation/.test(query)) return 'contact';
    if (/upgrade|migrate|deployment|design/.test(query)) return 'upgrade';
    return 'discover';
  }

  function buildInsight(intent, audience, query, topResult) {
    var hasQuery = !!query;
    var title = 'Suggested Next Step';
    var text = 'Start with the top matches below, then book a consultation if you need tailored advice.';

    if (!hasQuery) {
      return { title: 'Start with your question', text: 'Use plain words. We\'ll show the most relevant pages first.' };
    }

    if (intent === 'troubleshoot') {
      title = 'Performance or support issue';
      text = 'Start with Network Support, then use Network Health Check if the issue repeats.';
    } else if (intent === 'security') {
      title = 'Security-related request';
      text = 'Start with Firewall & Network Security or Cyber Security Review.';
    } else if (intent === 'ai') {
      title = 'AI readiness request';
      text = 'Begin with AI-Ready Infrastructure to assess network and operations readiness.';
    } else if (intent === 'risk') {
      title = 'Business and risk context';
      text = 'Use solution pages and case studies to evaluate impact and next steps.';
    } else if (intent === 'support') {
      title = 'Support path';
      text = 'Compare Network Support and Managed Network Support based on urgency and coverage.';
    } else if (intent === 'contact') {
      title = 'Contact request';
      text = 'Use the support actions below and we will route you to the right specialist.';
    }

    if (audience === 'non-technical') {
      text = text + ' We keep this simple and practical.';
    } else if (audience === 'manager') {
      text = text + ' Results prioritize business outcomes and risk.';
    } else {
      text = text + ' Results prioritize technical implementation detail.';
    }

    if (topResult && topResult.title) {
      text = text + ' Current strongest match: ' + topResult.title + '.';
    }

    return { title: title, text: text };
  }

  function intentScore(item, intent) {
    var arr = item.intents || [];
    if (!arr.length) return 0;
    if (arr.indexOf(intent) > -1) return 26;
    if (intent === 'troubleshoot' && arr.indexOf('support') > -1) return 12;
    if (intent === 'risk' && (arr.indexOf('security') > -1 || arr.indexOf('proof') > -1)) return 12;
    return 0;
  }

  function textScore(item, query) {
    var t = tokenized(item.title);
    var u = tokenized(item.url);
    var s = tokenized((item.summary || ''));
    var k = tokenized((item.keywords || []).join(' '));
    if (!query) return 1;
    var sc = 0;
    if (t === query) sc += 130;
    if (t.indexOf(query) === 0) sc += 80;
    if (t.indexOf(query) > -1) sc += 56;
    if (s.indexOf(query) > -1) sc += 42;
    if (k.indexOf(query) > -1) sc += 38;
    if (u.indexOf(query) > -1) sc += 26;
    return sc;
  }

  function renderResults(query) {
    var resultsEl = q('#site-search-modal .search-results');
    if (!resultsEl) return;

    var intent = detectIntent(query);

    var scored = index
      .filter(function (item) { return searchableCategories.indexOf(item.category) > -1; })
      .map(function (item) {
        var base = textScore(item, query);
        var total = base + intentScore(item, intent);
        if (!query) total = total + intentScore(item, intent);
        return { item: item, score: total };
      })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (x) { return x.item; });

    var capped = showAllResults ? scored : scored.slice(0, maxResults);
    var seeAllBtn = q('#site-search-modal [data-search-see-all]');
    if (seeAllBtn) {
      if (scored.length > maxResults) {
        seeAllBtn.style.display = '';
        seeAllBtn.textContent = showAllResults ? 'Show less' : ('See all (' + scored.length + ')');
      } else {
        seeAllBtn.style.display = 'none';
      }
    }

    if (!capped.length) {
      resultsEl.innerHTML = '<div class="search-empty">No matching service, industry, or case study found. Try a shorter search.</div>';
      return;
    }

    resultsEl.innerHTML = capped.map(function (item) {
      var badges = [];
      if (item.category) badges.push('<span class="search-badge">' + escHtml(item.category) + '</span>');
      if (item.intents && item.intents[0] && showAllResults) badges.push('<span class="search-badge">' + escHtml(item.intents[0]) + '</span>');
      return [
        '<a class="search-hit" href="' + escHtml(item.url) + '">',
        '  <div class="search-hit-title">' + escHtml(item.title) + '</div>',
        badges.length ? '  <div class="search-hit-meta">' + badges.join('') + '</div>' : '',
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
    showAllResults = false;
    input.value = prefill || '';
    renderResults(tokenized(input.value));
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
      return;
    }

    var seeAllBtn = e.target.closest('#site-search-modal [data-search-see-all]');
    if (seeAllBtn) {
      e.preventDefault();
      showAllResults = !showAllResults;
      var currentInput = q('#site-search-modal .search-input');
      renderResults(tokenized(currentInput ? currentInput.value : ''));
      return;
    }

  });

  document.addEventListener('input', function (e) {
    if (e.target && e.target.matches('#site-search-modal .search-input')) {
      showAllResults = false;
      renderResults(tokenized(e.target.value));
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
