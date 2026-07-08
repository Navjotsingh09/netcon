(function () {
  'use strict';

  var index = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
  var maxResults = 8;
  var activeClass = 'search-open';
  var activeAudience = 'non-technical';

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
      '#site-search-modal .search-overlay { position: absolute; inset: 0; background: rgba(6,18,56,.62); backdrop-filter: blur(5px); }',
      '#site-search-modal .search-shell { position: relative; width: min(980px, calc(100% - 32px)); margin: 56px auto 0; background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%); border-radius: 18px; border: 1px solid rgba(9,130,197,.25); box-shadow: 0 28px 56px rgba(6,16,54,.34); overflow: hidden; max-height: calc(100vh - 96px); display: flex; flex-direction: column; }',
      '#site-search-modal .search-topbar { background: linear-gradient(135deg, #162470 0%, #0f2f7f 55%, #0982c5 100%); padding: 14px 16px; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 16px; }',
      '#site-search-modal .search-topbar-title { font: 600 16px/1.3 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; letter-spacing: .02em; }',
      '#site-search-modal .search-topbar-sub { font: 400 12px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; opacity: .84; }',
      '#site-search-modal .search-head { display: flex; align-items: center; gap: 10px; padding: 14px 16px; border-bottom: 1px solid #dce5f0; background: #fff; }',
      '#site-search-modal .search-input { flex: 1; border: 0; outline: 0; font: 600 16px/1.4 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #353535; }',
      '#site-search-modal .search-close { border: 0; background: #edf3fb; border-radius: 9px; width: 36px; height: 36px; cursor: pointer; font-size: 20px; line-height: 1; color: #162470; }',
      '#site-search-modal .search-body { overflow: auto; padding: 14px 16px 18px; }',
      '#site-search-modal .search-audience { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }',
      '#site-search-modal .search-audience-btn { border: 1px solid #c9d9ea; background: #fff; color: #164070; border-radius: 999px; padding: 7px 12px; font: 600 12px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; cursor: pointer; }',
      '#site-search-modal .search-audience-btn.is-active { background: #e6f2ff; border-color: #0982c5; color: #0d2b7a; }',
      '#site-search-modal .search-prompts { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }',
      '#site-search-modal .search-prompt { border: 1px solid #d4e1ee; background: #f8fbff; color: #26435f; border-radius: 10px; padding: 8px 10px; font: 500 12px/1.3 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; cursor: pointer; }',
      '#site-search-modal .search-insight { border: 1px solid #c8ddf2; background: linear-gradient(120deg, rgba(9,130,197,.08), rgba(22,36,112,.07)); border-radius: 12px; padding: 12px; margin-bottom: 12px; }',
      '#site-search-modal .search-insight-kicker { font: 700 11px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: .08em; color: #0f3c6f; margin-bottom: 6px; }',
      '#site-search-modal .search-insight-title { font: 700 15px/1.3 Roboto Condensed, Helvetica Neue, Helvetica, Arial, sans-serif; color: #162470; margin-bottom: 5px; }',
      '#site-search-modal .search-insight-text { font: 500 13px/1.45 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #334d66; }',
      '#site-search-modal .search-results-title { font: 700 12px/1.3 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; text-transform: uppercase; letter-spacing: .08em; color: #2d4f71; margin: 0 0 8px; }',
      '#site-search-modal .search-results { max-height: min(40vh, 380px); overflow: auto; padding-right: 2px; }',
      '#site-search-modal .search-hit { display: block; text-decoration: none; color: #162470; border-radius: 12px; padding: 10px 12px; border: 1px solid #d9e5f2; background: #fff; margin-bottom: 8px; }',
      '#site-search-modal .search-hit:hover { background: rgba(9,130,197,.06); border-color: rgba(9,130,197,.16); }',
      '#site-search-modal .search-hit-title { font: 700 15px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; }',
      '#site-search-modal .search-hit-meta { display: flex; gap: 6px; flex-wrap: wrap; margin: 5px 0; }',
      '#site-search-modal .search-badge { border-radius: 999px; background: #ebf4ff; color: #1f4f79; padding: 2px 8px; font: 600 11px/1.3 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; }',
      '#site-search-modal .search-hit-url { margin-top: 2px; font: 500 12px/1.35 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #585151; }',
      '#site-search-modal .search-empty { padding: 14px 12px; color: #585151; font: 500 14px/1.4 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; border: 1px dashed #d2dfec; border-radius: 10px; background: #fff; }',
      '#site-search-modal .search-support { margin-top: 12px; border: 1px solid #d8e5f2; background: #fff; border-radius: 12px; padding: 12px; }',
      '#site-search-modal .search-support-title { font: 700 14px/1.3 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #162470; margin-bottom: 8px; }',
      '#site-search-modal .search-support-text { font: 500 12px/1.45 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #51667a; margin-bottom: 8px; }',
      '#site-search-modal .search-support-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }',
      '#site-search-modal .search-support-link { display: inline-flex; align-items: center; justify-content: center; text-decoration: none; border-radius: 10px; padding: 8px 10px; font: 600 12px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; }',
      '#site-search-modal .search-support-link.primary { background: #0982c5; color: #fff; }',
      '#site-search-modal .search-support-link.secondary { background: #edf5ff; color: #124b86; border: 1px solid #c7def3; }',
      '#site-search-modal .search-help-input { width: 100%; border: 1px solid #cfe0f0; border-radius: 9px; padding: 9px 10px; font: 500 13px/1.3 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #2f435a; }',
      '#site-search-modal .search-help-row { margin-top: 8px; display: flex; justify-content: flex-end; }',
      '#site-search-modal .search-help-send { border: 0; border-radius: 8px; padding: 8px 10px; font: 600 12px/1.2 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #fff; background: #162470; cursor: pointer; }',
      '#site-search-modal .search-footnote { margin-top: 8px; font: 500 11px/1.4 Barlow, Helvetica Neue, Helvetica, Arial, sans-serif; color: #6a7f93; }',
      '@media (max-width: 768px) { #site-search-modal .search-shell { width: calc(100% - 16px); margin-top: 16px; max-height: calc(100vh - 24px); } #site-search-modal .search-body { padding: 12px; } #site-search-modal .search-prompts { flex-direction: column; } #site-search-modal .search-support-actions { flex-direction: column; } #site-search-modal .search-support-link { width: 100%; } }',
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
      '      <div class="search-topbar-title">Network Consultancy Smart Search</div>',
      '      <div class="search-topbar-sub">Ask in plain English or technical language. We tailor results to your role.</div>',
      '    </div>',
      '  </div>',
      '  <div class="search-head">',
      '    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="8" stroke="#585151" stroke-width="2"></circle><path d="m21 21-4.35-4.35" stroke="#585151" stroke-width="2" stroke-linecap="round"></path></svg>',
      '    <input class="search-input" type="search" placeholder="Ask a question about your network, security, Wi-Fi, VPN, Microsoft 365, or support..." aria-label="Ask a question">',
      '    <button type="button" class="search-close" aria-label="Close search" data-search-close="1">&times;</button>',
      '  </div>',
      '  <div class="search-body">',
      '    <div class="search-audience" role="group" aria-label="Choose user type">',
      '      <button type="button" class="search-audience-btn is-active" data-audience="non-technical">I\'m new to IT</button>',
      '      <button type="button" class="search-audience-btn" data-audience="manager">I manage IT/business</button>',
      '      <button type="button" class="search-audience-btn" data-audience="technical">I\'m technical</button>',
      '    </div>',
      '    <div class="search-prompts" data-search-prompts></div>',
      '    <div class="search-insight" data-search-insight aria-live="polite"></div>',
      '    <p class="search-results-title">Best Matches</p>',
      '    <div class="search-results" aria-live="polite"></div>',
      '    <div class="search-support">',
      '      <div class="search-support-title">Didn\'t find what you need?</div>',
      '      <div class="search-support-text">Tell us your exact challenge and we\'ll route you to the right specialist.</div>',
      '      <div class="search-support-actions">',
      '        <a class="search-support-link primary" href="/contact.html" data-search-contact>Book Network Assessment</a>',
      '        <a class="search-support-link secondary" href="mailto:info@network-consultancy.com?subject=Support%20Request" data-search-email>Email Support Team</a>',
      '      </div>',
      '      <input class="search-help-input" type="text" placeholder="Example: Our remote users are getting frequent VPN disconnects" aria-label="Describe what you could not find">',
      '      <div class="search-help-row"><button type="button" class="search-help-send">Send to support</button></div>',
      '      <div class="search-footnote">AI-guided suggestions are based on our service catalogue and website content.</div>',
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
      return {
        title: 'Describe your challenge in your own words',
        text: 'You can ask simple or technical questions. We\'ll prioritize the right services, solutions, and pages for your role.'
      };
    }

    if (intent === 'troubleshoot') {
      title = 'This looks like a live performance/support issue';
      text = 'Prioritize rapid diagnosis and stabilization. Check Network Support and Network Health Check first, then escalate for guided remediation.';
    } else if (intent === 'security') {
      title = 'Security-focused request detected';
      text = 'Review Firewall & Network Security and Cyber Security Review. These services target risk reduction and practical hardening actions.';
    } else if (intent === 'ai') {
      title = 'AI readiness question detected';
      text = 'Begin with AI-Ready Infrastructure and validate bandwidth, segmentation, and resilience before production AI rollouts.';
    } else if (intent === 'risk') {
      title = 'Business-risk and investment context detected';
      text = 'Prioritize solutions with measurable uptime and risk impact. Case studies can help compare expected outcomes.';
    } else if (intent === 'support') {
      title = 'Operational support path detected';
      text = 'Managed Network Support and Network Support are likely starting points, depending on whether you need proactive or reactive help.';
    } else if (intent === 'contact') {
      title = 'Direct expert contact requested';
      text = 'Use the support actions below to route your question directly to our team and receive a tailored response.';
    }

    if (audience === 'non-technical') {
      text = text + ' We\'ll keep recommendations plain-language and action-focused.';
    } else if (audience === 'manager') {
      text = text + ' Results are weighted toward business outcomes, continuity, and risk.';
    } else {
      text = text + ' Results are weighted toward implementation depth and technical relevance.';
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
      .slice(0, maxResults)
      .map(function (x) { return x.item; });

    var insight = buildInsight(intent, activeAudience, query, scored[0]);
    if (insightEl) {
      insightEl.innerHTML = [
        '<div class="search-insight-kicker">AI Guidance</div>',
        '<div class="search-insight-title">' + escHtml(insight.title) + '</div>',
        '<div class="search-insight-text">' + escHtml(insight.text) + '</div>'
      ].join('');
    }

    if (contactLink) {
      contactLink.setAttribute('href', '/contact.html?query=' + encodeURIComponent(query || 'Network support enquiry'));
    }
    if (emailLink) {
      emailLink.setAttribute('href', 'mailto:info@network-consultancy.com?subject=' + encodeURIComponent('Support Request') + '&body=' + encodeURIComponent('User profile: ' + audienceLabels[activeAudience] + '\n\nQuestion: ' + (query || 'No query provided')));
    }

    if (!scored.length) {
      resultsEl.innerHTML = '<div class="search-empty">No exact page match found yet. Try a simpler phrase, switch profile, or send your question to support below.</div>';
      return;
    }

    resultsEl.innerHTML = scored.map(function (item) {
      var badges = [];
      if (item.category) badges.push('<span class="search-badge">' + escHtml(item.category) + '</span>');
      if (item.intents && item.intents[0]) badges.push('<span class="search-badge">' + escHtml(item.intents[0]) + '</span>');
      return [
        '<a class="search-hit" href="' + escHtml(item.url) + '">',
        '  <div class="search-hit-title">' + escHtml(item.title) + '</div>',
        badges.length ? '  <div class="search-hit-meta">' + badges.join('') + '</div>' : '',
        item.summary ? '  <div class="search-insight-text">' + escHtml(item.summary) + '</div>' : '',
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
      renderResults(tokenized(prompt));
      return;
    }

    var sendBtn = e.target.closest('#site-search-modal .search-help-send');
    if (sendBtn) {
      e.preventDefault();
      var userText = q('#site-search-modal .search-help-input');
      var raw = userText ? userText.value.trim() : '';
      var current = q('#site-search-modal .search-input');
      var queryText = raw || (current ? current.value.trim() : '') || 'Support request';
      window.location.href = '/contact.html?query=' + encodeURIComponent(queryText) + '&audience=' + encodeURIComponent(activeAudience);
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target && e.target.matches('#site-search-modal .search-input')) {
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
