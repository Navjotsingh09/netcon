(function () {
  'use strict';

  var index = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
  var maxResults = 5;
  var activeClass = 'search-open';
  var activeAudience = 'non-technical';
  var showAllResults = false;

  var audienceLabels = {
    'non-technical': 'I\'m new to IT',
    manager: 'I manage IT/business',
    technical: 'I\'m technical'
  };

  var starterPrompts = {
    'non-technical': [
      'Our office Wi-Fi is slow. What should we do?',
      'How can we keep our business internet reliable?',
      'We need help choosing the right network service.'
    ],
    manager: [
      'How do we reduce downtime risk across sites?',
      'What should we review before a Microsoft 365 rollout?',
      'Which service helps us improve security quickly?'
    ],
    technical: [
      'Best path for firewall hardening and segmentation?',
      'How to assess AI-readiness in our current network?',
      'Need co-managed support for multi-site networking.'
    ]
  };

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
      '#site-search-modal .search-shell { position: relative; width: min(980px, calc(100% - 24px)); margin: 34px auto 0; background: #fff; border-radius: 16px; border: 1px solid #d6e2ef; box-shadow: 0 16px 36px rgba(10,22,54,.22); overflow: hidden; max-height: calc(100vh - 68px); display: flex; flex-direction: column; }',
      '#site-search-modal .search-topbar { background: #0982C5; padding: 14px 16px; color: #fff; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }',
      '#site-search-modal .search-topbar-title { font: 700 17px/1.2 Roboto Condensed, Helvetica Neue, Helvetica, Arial, sans-serif; letter-spacing: .01em; }',
      '#site-search-modal .search-topbar-sub { margin-top: 2px; font: 500 12px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; opacity: .9; max-width: 620px; }',
      '#site-search-modal .search-close { border: 0; background: rgba(255,255,255,.16); color: #fff; border-radius: 10px; width: 36px; height: 36px; cursor: pointer; font-size: 20px; line-height: 1; flex-shrink: 0; }',
      '#site-search-modal .search-head { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid #d7e2ef; background: #fff; }',
      '#site-search-modal .search-input { flex: 1; border: 0; outline: 0; font: 600 16px/1.45 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #1f2f43; }',
      '#site-search-modal .search-body { overflow: auto; padding: 14px; display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 14px; }',
      '#site-search-modal .search-side { background: #fff; border: 1px solid #dde7f2; border-radius: 12px; padding: 12px; }',
      '#site-search-modal .search-side-title { margin: 0 0 8px; font: 700 12px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: .08em; color: #325675; }',
      '#site-search-modal .search-audience { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }',
      '#site-search-modal .search-audience-btn { border: 1px solid #c7d8ea; background: #fff; color: #1c4f78; border-radius: 999px; padding: 8px 12px; font: 700 12px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; cursor: pointer; }',
      '#site-search-modal .search-audience-btn.is-active { background: #dff0ff; border-color: #0982c5; color: #0b3f73; }',
      '#site-search-modal .search-prompts { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }',
      '#site-search-modal .search-prompt { border: 1px solid #d5e3f1; background: #f8fbff; color: #23425f; border-radius: 10px; padding: 8px 10px; font: 600 12px/1.3 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; cursor: pointer; text-align: left; }',
      '#site-search-modal .search-main { min-width: 0; display: flex; flex-direction: column; gap: 10px; }',
      '#site-search-modal .search-insight { border: 1px solid #d8e5f2; background: #f7fbff; border-radius: 12px; padding: 12px; }',
      '#site-search-modal .search-insight-kicker { font: 700 11px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: .09em; color: #0e4f85; margin-bottom: 6px; }',
      '#site-search-modal .search-insight-title { font: 700 16px/1.25 Roboto Condensed, Helvetica Neue, Helvetica, Arial, sans-serif; color: #102e74; margin-bottom: 5px; }',
      '#site-search-modal .search-insight-text { font: 500 13px/1.45 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #2f4a65; }',
      '#site-search-modal .search-results-wrap { background: #fff; border: 1px solid #dce7f4; border-radius: 12px; padding: 10px; }',
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
      '#site-search-modal .search-support { border: 1px solid #d6e4f3; background: #fff; border-radius: 12px; padding: 12px; }',
      '#site-search-modal .search-support-title { font: 700 14px/1.3 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #0982C5; margin-bottom: 7px; }',
      '#site-search-modal .search-support-text { font: 500 12px/1.45 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #4d6479; margin-bottom: 8px; }',
      '#site-search-modal .search-support-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }',
      '#site-search-modal .search-support-link { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; border-radius: 10px; padding: 9px 11px; font: 700 12px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; }',
      '#site-search-modal .search-support-link.primary { background: #0982c5; color: #fff; }',
      '#site-search-modal .search-support-link.secondary { background: #edf5ff; color: #124b86; border: 1px solid #c7def3; }',
      '#site-search-modal .search-help-input { width: 100%; border: 1px solid #cfe0f0; border-radius: 10px; padding: 10px 11px; font: 500 13px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #2f435a; }',
      '#site-search-modal .search-help-row { margin-top: 8px; display: flex; justify-content: flex-end; }',
      '#site-search-modal .search-help-send { border: 0; border-radius: 8px; padding: 9px 12px; font: 700 12px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #fff; background: #0982C5; cursor: pointer; }',
      '#site-search-modal .search-footnote { margin-top: 8px; font: 500 11px/1.4 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #6a7f93; }',
      '@media (max-width: 960px) { #site-search-modal .search-body { grid-template-columns: 1fr; } #site-search-modal .search-shell { margin-top: 18px; max-height: calc(100vh - 28px); } }',
      '@media (max-width: 640px) { #site-search-modal .search-shell { width: calc(100% - 12px); border-radius: 14px; } #site-search-modal .search-topbar { padding: 12px; } #site-search-modal .search-topbar-title { font-size: 16px; } #site-search-modal .search-topbar-sub { font-size: 12px; } #site-search-modal .search-head { padding: 10px 12px; } #site-search-modal .search-body { padding: 12px; gap: 10px; } #site-search-modal .search-prompts { flex-direction: column; } #site-search-modal .search-support-actions { flex-direction: column; } #site-search-modal .search-support-link { width: 100%; } }',
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
      '    <input class="search-input" type="search" placeholder="Ask a question about your network, security, Wi-Fi, VPN, Microsoft 365, or support..." aria-label="Ask a question">',
      '  </div>',
      '  <div class="search-body">',
      '    <aside class="search-side">',
      '      <p class="search-side-title">Choose your profile</p>',
      '      <div class="search-audience" role="group" aria-label="Choose user type">',
      '        <button type="button" class="search-audience-btn is-active" data-audience="non-technical">I\'m new to IT</button>',
      '        <button type="button" class="search-audience-btn" data-audience="manager">I manage IT/business</button>',
      '        <button type="button" class="search-audience-btn" data-audience="technical">I\'m technical</button>',
      '      </div>',
      '      <p class="search-side-title">Try asking</p>',
      '      <div class="search-prompts" data-search-prompts></div>',
      '      <div class="search-support">',
      '      <div class="search-support-title">Didn\'t find what you need?</div>',
      '      <div class="search-support-text">Still stuck? Send your issue and our team will help.</div>',
      '      <div class="search-support-actions">',
      '        <a class="search-support-link primary" href="/contact" data-search-contact>Book Network Assessment</a>',
      '        <a class="search-support-link secondary" href="mailto:info@network-consultancy.com?subject=Support%20Request" data-search-email>Email Support Team</a>',
      '      </div>',
      '      <input class="search-help-input" type="text" placeholder="Example: Our remote users are getting frequent VPN disconnects" aria-label="Describe what you could not find">',
      '      <div class="search-help-row"><button type="button" class="search-help-send">Send to support</button></div>',
      '      <div class="search-footnote">Suggestions are based on our service pages.</div>',
      '      </div>',
      '    </aside>',
      '    <section class="search-main">',
      '      <div class="search-insight" data-search-insight aria-live="polite"></div>',
      '      <div class="search-results-wrap">',
      '        <div class="search-results-head">',
      '          <p class="search-results-title">Best Matches</p>',
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

  function audienceScore(item) {
    var arr = item.audience || [];
    if (!arr.length) return 0;
    return arr.indexOf(activeAudience) > -1 ? 20 : 0;
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
    var insightEl = q('#site-search-modal [data-search-insight]');
    var contactLink = q('#site-search-modal [data-search-contact]');
    var emailLink = q('#site-search-modal [data-search-email]');
    if (!resultsEl) return;

    var intent = detectIntent(query);

    var scored = index
      .map(function (item) {
        var base = textScore(item, query);
        var total = base + audienceScore(item) + intentScore(item, intent);
        if (!query) total = total + audienceScore(item) + intentScore(item, intent);
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

    var insight = buildInsight(intent, activeAudience, query, scored[0]);
    if (insightEl) {
      insightEl.innerHTML = [
        '<div class="search-insight-kicker">AI Guidance</div>',
        '<div class="search-insight-title">' + escHtml(insight.title) + '</div>',
        '<div class="search-insight-text">' + escHtml(insight.text) + '</div>'
      ].join('');
    }

    if (contactLink) {
      contactLink.setAttribute('href', '/contact?query=' + encodeURIComponent(query || 'Network support enquiry'));
    }
    if (emailLink) {
      emailLink.setAttribute('href', 'mailto:info@network-consultancy.com?subject=' + encodeURIComponent('Support Request') + '&body=' + encodeURIComponent('User profile: ' + audienceLabels[activeAudience] + '\n\nQuestion: ' + (query || 'No query provided')));
    }

    if (!capped.length) {
      resultsEl.innerHTML = '<div class="search-empty">No clear match yet. Try a shorter question or contact support below.</div>';
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

  function renderPromptChips() {
    var promptsEl = q('#site-search-modal [data-search-prompts]');
    if (!promptsEl) return;
    var prompts = starterPrompts[activeAudience] || starterPrompts['non-technical'];
    promptsEl.innerHTML = prompts.map(function (text) {
      return '<button type="button" class="search-prompt" data-search-prompt="' + escHtml(text) + '">' + escHtml(text) + '</button>';
    }).join('');
  }

  function setAudience(audience) {
    if (!audienceLabels[audience]) return;
    activeAudience = audience;
    qa('#site-search-modal .search-audience-btn').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-audience') === audience);
    });
    showAllResults = false;
    renderPromptChips();
    var input = q('#site-search-modal .search-input');
    renderResults(tokenized(input ? input.value : ''));
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
    renderPromptChips();
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

    var audienceBtn = e.target.closest('#site-search-modal .search-audience-btn');
    if (audienceBtn) {
      e.preventDefault();
      setAudience(audienceBtn.getAttribute('data-audience'));
      return;
    }

    var promptBtn = e.target.closest('#site-search-modal .search-prompt');
    if (promptBtn) {
      e.preventDefault();
      var prompt = promptBtn.getAttribute('data-search-prompt') || '';
      var input = q('#site-search-modal .search-input');
      if (input) input.value = prompt;
      showAllResults = false;
      renderResults(tokenized(prompt));
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

    var sendBtn = e.target.closest('#site-search-modal .search-help-send');
    if (sendBtn) {
      e.preventDefault();
      var userText = q('#site-search-modal .search-help-input');
      var raw = userText ? userText.value.trim() : '';
      var current = q('#site-search-modal .search-input');
      var queryText = raw || (current ? current.value.trim() : '') || 'Support request';
      window.location.href = '/contact?query=' + encodeURIComponent(queryText) + '&audience=' + encodeURIComponent(activeAudience);
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
