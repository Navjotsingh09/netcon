(function () {
  'use strict';

  const pageSlugs = { '/': 'home', '/index.html': 'home', '/about': 'about', '/about.html': 'about', '/contact': 'contact', '/contact.html': 'contact', '/privacy-policy': 'privacy-policy', '/privacy-policy.html': 'privacy-policy', '/terms-of-service': 'terms-of-service', '/terms-of-service.html': 'terms-of-service', '/cookie-policy': 'cookie-policy', '/cookie-policy.html': 'cookie-policy', '/accessibility': 'accessibility', '/accessibility.html': 'accessibility', '/complaint-form': 'complaint-form', '/complaint-form.html': 'complaint-form', '/contact-form': 'contact-form', '/contact-form.html': 'contact-form', '/services': 'services', '/services/index.html': 'services', '/services/network-consultancy': 'network-consultancy', '/services/network-consultancy.html': 'network-consultancy', '/services/business-continuity-and-network-resilience': 'business-continuity-and-network-resilience', '/services/business-continuity-and-network-resilience.html': 'business-continuity-and-network-resilience', '/services/firewall-and-network-security': 'firewall-and-network-security', '/services/firewall-and-network-security.html': 'firewall-and-network-security', '/services/managed-network-support': 'managed-network-support', '/services/managed-network-support.html': 'managed-network-support', '/services/managed-wireless-lan': 'managed-wireless-lan', '/services/managed-wireless-lan.html': 'managed-wireless-lan', '/services/network-design-and-deployment': 'network-design-and-deployment', '/services/network-design-and-deployment.html': 'network-design-and-deployment', '/services/network-installations': 'network-installations', '/services/network-installations.html': 'network-installations', '/services/network-support': 'network-support', '/services/network-support.html': 'network-support', '/services/remote-working-solutions': 'remote-working-solutions', '/services/remote-working-solutions.html': 'remote-working-solutions', '/industries': 'industries-landing', '/industries/index.html': 'industries-landing', '/industries/charity': 'industries-charity', '/industries/charity.html': 'industries-charity', '/industries/educational-institutes': 'industries-educational-institutes', '/industries/educational-institutes.html': 'industries-educational-institutes', '/industries/financial-services': 'industries-financial-services', '/industries/financial-services.html': 'industries-financial-services', '/industries/healthcare-and-clinics': 'industries-healthcare-and-clinics', '/industries/healthcare-and-clinics.html': 'industries-healthcare-and-clinics', '/industries/internal-it-teams': 'industries-internal-it-teams', '/industries/internal-it-teams.html': 'industries-internal-it-teams', '/industries/legal-firms': 'industries-legal-firms', '/industries/legal-firms.html': 'industries-legal-firms', '/industries/manufacturing': 'industries-manufacturing', '/industries/manufacturing.html': 'industries-manufacturing', '/industries/multi-site-businesses': 'industries-multi-site-businesses', '/industries/multi-site-businesses.html': 'industries-multi-site-businesses', '/industries/recruitment-agencies': 'industries-recruitment-agencies', '/industries/recruitment-agencies.html': 'industries-recruitment-agencies', '/solutions': 'solutions-landing', '/solutions/index.html': 'solutions-landing', '/solutions/ai-ready-infrastructure-review': 'solutions-ai-ready-infrastructure-review', '/solutions/ai-ready-infrastructure-review.html': 'solutions-ai-ready-infrastructure-review', '/solutions/cyber-security-review': 'solutions-cyber-security-review', '/solutions/cyber-security-review.html': 'solutions-cyber-security-review', '/solutions/network-health-check': 'solutions-network-health-check', '/solutions/network-health-check.html': 'solutions-network-health-check', '/resources': 'resources-landing', '/resources/index.html': 'resources-landing', '/resources/downloads': 'resources-downloads', '/resources/downloads.html': 'resources-downloads', '/resources/guides': 'resources-guides', '/resources/guides.html': 'resources-guides', '/case-studies': 'case-studies-landing', '/case-studies/index.html': 'case-studies-landing', '/case-studies/antal-international': 'case-studies-antal-international', '/case-studies/antal-international.html': 'case-studies-antal-international', '/case-studies/auriga-networks': 'case-studies-auriga-networks', '/case-studies/auriga-networks.html': 'case-studies-auriga-networks', '/case-studies/harry-dobbs-design': 'case-studies-harry-dobbs-design', '/case-studies/harry-dobbs-design.html': 'case-studies-harry-dobbs-design', '/case-studies/nta-core-network-upgrade': 'case-studies-nta-core-network-upgrade', '/case-studies/nta-core-network-upgrade.html': 'case-studies-nta-core-network-upgrade', '/case-studies/senate-computers': 'case-studies-senate-computers', '/case-studies/senate-computers.html': 'case-studies-senate-computers' };
  const slug = pageSlugs[window.location.pathname.replace(/\/$/, '') || '/'];
  if (!slug) return;

  function setMeta(selector, value) {
    if (!value) return;
    const element = document.querySelector(selector);
    if (element) element.setAttribute('content', value);
  }
  // Swap an existing heading element to the CMS-selected tag (h2/h3/h4) while preserving its class/id/children.
  // JS can't mutate tagName directly, so a same-position replacement node is created and the original is discarded.
  function setHeadingTag(element, tag) {
    if (!element || !tag) return element;
    const wanted = String(tag).toLowerCase();
    if (!/^h[1-4]$/.test(wanted) || element.tagName.toLowerCase() === wanted) return element;
    const replacement = document.createElement(wanted);
    if (element.className) replacement.className = element.className;
    if (element.id) replacement.id = element.id;
    while (element.firstChild) replacement.appendChild(element.firstChild);
    element.replaceWith(replacement);
    return replacement;
  }
  function applyPageContent(content) {
    const seo = content || {};
    const pageContent = seo.content || {};
    if (seo['seo.title']) document.title = seo['seo.title'];
    setMeta('meta[name="description"]', seo['seo.description']);
    setMeta('meta[property="og:title"]', seo['seo.ogTitle']);
    setMeta('meta[property="og:description"]', seo['seo.ogDescription']);
    if (seo['seo.canonicalUrl']) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.setAttribute('rel', 'canonical'); document.head.appendChild(link); }
      link.setAttribute('href', seo['seo.canonicalUrl']);
    }
    if (seo['seo.schemaMarkup']) {
      try {
        const schema = typeof seo['seo.schemaMarkup'] === 'string' ? JSON.parse(seo['seo.schemaMarkup']) : seo['seo.schemaMarkup'];
        const script = document.querySelector('script[type="application/ld+json"]');
        if (script) script.textContent = JSON.stringify(schema);
      } catch { return; }
    }
    if (pageContent.internalLinks) {
      const links = pageContent.internalLinks.split('\n').map((line) => line.trim()).filter(Boolean);
      if (links.length) {
        const list = document.querySelector('[data-cms="internal-links"]');
        if (list) {
          list.innerHTML = links.map((url) => `<a href="${url}">${url}</a>`).join('');
        }
      }
    }
    if (pageContent.redirects) {
      const lines = pageContent.redirects.split('\n').map((line) => line.trim()).filter(Boolean);
      if (lines.length) {
        const list = document.querySelector('[data-cms="redirects"]');
        if (list) {
          list.innerHTML = lines.map((line) => `<li>${line}</li>`).join('');
        }
      }
    }
    // Hero background is a muted looping <video poster>, not an <img> -- imageUrl maps to the poster frame; imageAlt has no accessible surface since the video is aria-hidden.
    if (pageContent.heroSlides) document.querySelectorAll('.hero__slide').forEach((slide, index) => { const item = pageContent.heroSlides[index]; if (!item) return; const title = slide.querySelector('.hero__title'); const description = slide.querySelector('.hero__sub'); const button = slide.querySelector('.hero__btn'); const video = slide.querySelector('.hero__bg'); if (title && item.heading) title.textContent = item.heading; if (description && item.paragraph) description.textContent = item.paragraph; if (button) { if (item.buttonText) button.textContent = item.buttonText; if (item.buttonUrl) button.href = item.buttonUrl; } if (video && item.imageUrl) video.poster = item.imageUrl; });
    if (pageContent.cards) document.querySelectorAll('.svc-card').forEach((card, index) => { const item = pageContent.cards[index]; if (!item) return; const heading = card.querySelector('.svc-card__label'); const paragraph = card.querySelector('.svc-card__desc'); const image = card.querySelector('img'); if (heading && item.heading) heading.textContent = item.heading; if (paragraph && item.paragraph) paragraph.textContent = item.paragraph; if (image && item.imageAlt) image.alt = item.imageAlt; });
    if (pageContent.introduction) { const heading = setHeadingTag(document.querySelector('.main-services__title, .ab-intro__title'), pageContent.introduction.headingTag); const paragraph = document.querySelector('.main-services__intro, .ab-intro p'); if (heading && pageContent.introduction.heading) heading.textContent = pageContent.introduction.heading; if (paragraph && pageContent.introduction.paragraph) paragraph.textContent = pageContent.introduction.paragraph; }
    if (pageContent.heroSlides && pageContent.heroSlides[0] && document.querySelector('.svcs-hero__title')) { const item = pageContent.heroSlides[0]; const heading = document.querySelector('.svcs-hero__title'); const paragraph = document.querySelector('.svcs-hero__sub'); const button = document.querySelector('.svcs-hero__cta'); if (heading && item.heading) heading.textContent = item.heading; if (paragraph && item.paragraph) paragraph.textContent = item.paragraph; if (button) { if (item.buttonText) button.textContent = item.buttonText; if (item.buttonUrl) button.href = item.buttonUrl; } }
    if (pageContent.heroSlides && pageContent.heroSlides[0] && document.querySelector('.nc-hero__title')) { const item = pageContent.heroSlides[0]; const heading = document.querySelector('.nc-hero__title'); const paragraph = document.querySelector('.nc-hero__sub'); const button = document.querySelector('.page-hero__cta-btn'); if (heading && item.heading) heading.textContent = item.heading; if (paragraph && item.paragraph) paragraph.textContent = item.paragraph; if (button) { if (item.buttonText) button.textContent = item.buttonText; if (item.buttonUrl) button.href = item.buttonUrl; } }
    if (pageContent.keySolutionAreasIntro) { const heading = setHeadingTag(document.getElementById('ksa-h'), pageContent.keySolutionAreasIntro.headingTag); const paragraph = heading?.nextElementSibling; if (heading && pageContent.keySolutionAreasIntro.heading) heading.textContent = pageContent.keySolutionAreasIntro.heading; if (paragraph && paragraph.tagName === 'P' && pageContent.keySolutionAreasIntro.paragraph) paragraph.textContent = pageContent.keySolutionAreasIntro.paragraph; const ksaImgAlt = document.getElementById('ksa-img'); if (ksaImgAlt && pageContent.keySolutionAreasIntro.imageAlt) ksaImgAlt.alt = pageContent.keySolutionAreasIntro.imageAlt; }
    if (Array.isArray(pageContent.keySolutionAreas) && pageContent.keySolutionAreas.length) { const tabs = [...document.querySelectorAll('#ksa .ksa__tab')]; pageContent.keySolutionAreas.forEach((item, index) => { const tab = tabs[index]; if (!tab || !item.title) return; tab.firstChild.textContent = item.title; }); if (window.__ncSetKsaData && window.__ncSetKsaData.ksa) window.__ncSetKsaData.ksa(pageContent.keySolutionAreas); }
    if (pageContent.whoWeServe) { const w = pageContent.whoWeServe; const heading = setHeadingTag(document.getElementById('wws-h'), w.headingTag); const paragraph = heading?.nextElementSibling; if (heading && w.heading) heading.textContent = w.heading; if (paragraph && paragraph.tagName === 'P' && w.paragraph) paragraph.textContent = w.paragraph; const img = document.querySelector('.wws__media img'); if (img) { if (w.imageUrl) img.src = w.imageUrl; if (w.imageAlt) img.alt = w.imageAlt; } if (w.tilesText) { const tiles = w.tilesText.split('\n').map((line) => line.trim()).filter(Boolean); document.querySelectorAll('.wws__item').forEach((node, index) => { if (tiles[index]) node.textContent = tiles[index]; }); } }
    if (pageContent.businessImpactIntro) { const heading = setHeadingTag(document.getElementById('biz-h'), pageContent.businessImpactIntro.headingTag); const paragraph = heading?.nextElementSibling; if (heading && pageContent.businessImpactIntro.heading) heading.textContent = pageContent.businessImpactIntro.heading; if (paragraph && paragraph.tagName === 'P' && pageContent.businessImpactIntro.paragraph) paragraph.textContent = pageContent.businessImpactIntro.paragraph; }
    if (pageContent.businessImpactLead) { const heading = setHeadingTag(document.getElementById('biz-lead-h') || document.querySelector('h2.biz-lead'), pageContent.businessImpactLead.headingTag); const paragraph = heading?.nextElementSibling; if (heading && pageContent.businessImpactLead.heading) heading.textContent = pageContent.businessImpactLead.heading; if (paragraph && paragraph.tagName === 'P' && pageContent.businessImpactLead.paragraph) paragraph.textContent = pageContent.businessImpactLead.paragraph; }
    if (Array.isArray(pageContent.businessImpact) && pageContent.businessImpact.length && window.__ncSetBusinessImpactSlides) { window.__ncSetBusinessImpactSlides(pageContent.businessImpact); }
    // "Our work process" (business-continuity page only) -- was never hydrated, so its per-step imageAlt fields were dead.
    if (pageContent.workProcessIntro) { const heading = setHeadingTag(document.getElementById('work-h'), pageContent.workProcessIntro.headingTag); if (heading && pageContent.workProcessIntro.heading) heading.textContent = pageContent.workProcessIntro.heading; }
    if (Array.isArray(pageContent.workProcess) && pageContent.workProcess.length) {
      const steps = [...document.querySelectorAll('[aria-labelledby="work-h"] .prob')];
      pageContent.workProcess.forEach((item, index) => {
        const step = steps[index]; if (!step || !item) return;
        const title = step.querySelector('.prob__label-title'); const desc = step.querySelector('.prob__label-desc'); const image = step.querySelector('img');
        if (title && item.title) title.textContent = item.title;
        if (desc && item.description) desc.textContent = item.description;
        if (image) { if (item.imageUrl) image.src = item.imageUrl; if (item.imageAlt) image.alt = item.imageAlt; }
      });
    }
    // "Cost of disruption" stat block (business-continuity page only) -- also never hydrated.
    if (pageContent.impactStat) {
      const heading = document.getElementById('cost-h'); const paragraphs = document.querySelectorAll('.cissues__text p');
      if (heading && pageContent.impactStat.heading) heading.textContent = pageContent.impactStat.heading;
      if (pageContent.impactStat.paragraph) { const values = pageContent.impactStat.paragraph.split(/\n\s*\n/).map((v) => v.trim()).filter(Boolean); values.forEach((value, index) => { if (paragraphs[index]) paragraphs[index].textContent = value; }); }
    }
    if (pageContent.whyChooseUs) { const w = pageContent.whyChooseUs; const heading = setHeadingTag(document.getElementById('whyc-h'), w.headingTag); const paragraphs = document.querySelectorAll('.whyc__content p'); if (heading && w.heading) heading.textContent = w.heading; if (paragraphs[0] && w.paragraph1) paragraphs[0].textContent = w.paragraph1; if (paragraphs[1] && w.paragraph2) paragraphs[1].textContent = w.paragraph2; const img = document.querySelector('.whyc__media img'); if (img) { if (w.imageUrl) img.src = w.imageUrl; if (w.imageAlt) img.alt = w.imageAlt; } }
    if (pageContent.whyChooseUsList && pageContent.whyChooseUsList.itemsText) { const heading = setHeadingTag(document.getElementById('whyc-h'), pageContent.whyChooseUsList.headingTag); if (heading && pageContent.whyChooseUsList.heading) heading.textContent = pageContent.whyChooseUsList.heading; const lines = pageContent.whyChooseUsList.itemsText.split('\n').map((line) => line.trim()).filter(Boolean); document.querySelectorAll('.whyc__list li').forEach((node, index) => { if (lines[index]) node.textContent = lines[index]; }); }
    if (pageContent.commonIssues) { const c = pageContent.commonIssues; const heading = setHeadingTag(document.getElementById('probs-h') || document.getElementById('cissues-h'), c.headingTag); const paragraph = heading?.nextElementSibling; if (heading && c.heading) heading.textContent = c.heading; if (paragraph && paragraph.tagName === 'P' && c.paragraph) paragraph.textContent = c.paragraph; if (c.itemsText) { const labels = c.itemsText.split('\n').map((line) => line.trim()).filter(Boolean); document.querySelectorAll('.prob__label, .cissues__list li').forEach((node, index) => { if (labels[index]) node.textContent = labels[index]; }); } }
    if (pageContent.acctIntro) { const a = pageContent.acctIntro; const eyebrow = document.querySelector('.acct__eyebrow'); const heading = setHeadingTag(document.getElementById('acct-h'), a.headingTag); const paragraphs = document.querySelectorAll('.acct__intro > p'); const cta = document.querySelector('.acct__cta'); if (eyebrow && a.eyebrow) eyebrow.textContent = a.eyebrow; if (heading && a.heading) heading.textContent = a.heading; [a.paragraph1, a.paragraph2, a.paragraph3].forEach((value, index) => { if (paragraphs[index] && value) paragraphs[index].textContent = value; }); if (cta) { if (a.buttonUrl) cta.setAttribute('href', a.buttonUrl); if (a.buttonText) { const svg = cta.querySelector('svg'); cta.textContent = a.buttonText; if (svg) cta.appendChild(svg); } } }
    if (Array.isArray(pageContent.acctCards) && pageContent.acctCards.length) { document.querySelectorAll('.acct__card').forEach((card, index) => { const item = pageContent.acctCards[index]; if (!item) return; const heading = card.querySelector('h3'); const paragraph = card.querySelector('p'); const image = card.querySelector('img'); if (heading && item.heading) heading.textContent = item.heading; if (paragraph && item.paragraph) paragraph.textContent = item.paragraph; if (image && item.imageAlt) image.alt = item.imageAlt; }); }
    if (pageContent.ravSection) {
      const r = pageContent.ravSection; let headings = [...document.querySelectorAll('.rav__text h3')]; const image = document.querySelector('.rav__media img');
      headings[0] = setHeadingTag(headings[0], r.heading1Tag);
      headings[1] = setHeadingTag(headings[1], r.heading2Tag);
      const setParagraphsBetween = (startHeading, endHeading, text) => {
        if (!startHeading || !text) return;
        const values = text.split(/\n\s*\n/).map((line) => line.trim()).filter(Boolean);
        const nodes = [];
        let node = startHeading.nextElementSibling;
        while (node && node !== endHeading) { if (node.tagName === 'P') nodes.push(node); node = node.nextElementSibling; }
        nodes.forEach((p, index) => { if (values[index]) p.textContent = values[index]; });
      };
      if (headings[0] && r.heading1) headings[0].textContent = r.heading1;
      if (headings[1] && r.heading2) headings[1].textContent = r.heading2;
      setParagraphsBetween(headings[0], headings[1], r.paragraph1);
      setParagraphsBetween(headings[1], null, r.paragraph2);
      if (image && r.imageAlt) image.alt = r.imageAlt;
    }
    if (pageContent.installationProcessLead) { const lead = setHeadingTag(document.querySelector('.adv-lead h2'), pageContent.installationProcessLead.headingTag); if (lead && pageContent.installationProcessLead.heading) lead.textContent = pageContent.installationProcessLead.heading; }
    if (pageContent.installationProcessIntro) { const heading = setHeadingTag(document.getElementById('proc-h'), pageContent.installationProcessIntro.headingTag); const paragraph = heading?.nextElementSibling; if (heading && pageContent.installationProcessIntro.heading) heading.textContent = pageContent.installationProcessIntro.heading; if (paragraph && paragraph.tagName === 'P' && pageContent.installationProcessIntro.paragraph) paragraph.textContent = pageContent.installationProcessIntro.paragraph; const img = document.getElementById('ksa2-img'); if (img && pageContent.installationProcessIntro.imageAlt) img.alt = pageContent.installationProcessIntro.imageAlt; }
    if (Array.isArray(pageContent.installationProcess) && pageContent.installationProcess.length) { const tabs = [...document.querySelectorAll('#ksa2 .ksa__tab')]; pageContent.installationProcess.forEach((item, index) => { const tab = tabs[index]; if (!tab || !item.title) return; tab.textContent = item.title; }); if (window.__ncSetKsaData && window.__ncSetKsaData.ksa2) window.__ncSetKsaData.ksa2(pageContent.installationProcess); }
    if (pageContent.contactCta) { const heading = setHeadingTag(document.querySelector('.nd-contact__title, .ctf-title'), pageContent.contactCta.headingTag); const paragraph = document.querySelector('.nd-contact__intro, .ctf-copy, .svc-cta-band__text'); const button = document.querySelector('.svc-cta-band__btn'); if (heading && pageContent.contactCta.heading) heading.textContent = pageContent.contactCta.heading; if (paragraph && pageContent.contactCta.paragraph) paragraph.textContent = pageContent.contactCta.paragraph; if (button) { if (pageContent.contactCta.buttonText) button.textContent = pageContent.contactCta.buttonText; if (pageContent.contactCta.buttonUrl) button.href = pageContent.contactCta.buttonUrl; } }
    if (Array.isArray(pageContent.servicesList) && pageContent.servicesList.length) { const tabs = [...document.querySelectorAll('.svl-overview__list-item')]; pageContent.servicesList.forEach((item, index) => { const tab = tabs[index]; if (!tab) return; if (item.title) { tab.textContent = item.title; tab.dataset.title = item.title; } if (item.copy) tab.dataset.copy = item.copy; if (item.imageUrl) { tab.dataset.img = item.imageUrl; tab.dataset.webp = item.imageUrl; } if (item.imageAlt) tab.dataset.alt = item.imageAlt; if (item.href) tab.dataset.href = item.href; if (index === 0) { const title = document.getElementById('svl-overview-title'); const copy = document.getElementById('svl-overview-copy'); const img = document.getElementById('svl-feature-img'); const source = document.getElementById('svl-feature-source'); if (title && item.title) title.textContent = item.title; if (copy && item.copy) copy.textContent = item.copy; if (img && item.imageUrl) { img.src = item.imageUrl; if (item.imageAlt) img.alt = item.imageAlt; } if (source && item.imageUrl) source.srcset = item.imageUrl; } }); }
    if (pageContent.highlight) { const highlight = pageContent.highlight; const heading = setHeadingTag(document.querySelector('.nd-highlight__copy h2'), highlight.headingTag); const paragraph = document.querySelector('.nd-highlight__copy p'); const points = document.querySelectorAll('.nd-highlight__copy ul li'); if (heading && highlight.heading) heading.textContent = highlight.heading; if (paragraph && highlight.paragraph) paragraph.textContent = highlight.paragraph; [highlight.point1, highlight.point2, highlight.point3].forEach((value, index) => { if (points[index] && value) points[index].textContent = value; }); }
    if (pageContent.expertCards) document.querySelectorAll('.nd-figma-card').forEach((card, index) => { const item = pageContent.expertCards[index]; if (!item) return; const heading = setHeadingTag(card.querySelector('.nd-figma-card__title'), item.headingTag); const lead = card.querySelector('.nd-figma-card__lead'); const paragraph = card.querySelector('.nd-figma-card__text'); const image = card.querySelector('img'); if (heading && item.heading) heading.textContent = item.heading; if (lead && (item.leadHeading || item.heading)) lead.textContent = item.leadHeading || item.heading; if (paragraph && item.paragraph) paragraph.textContent = item.paragraph; if (image && item.imageAlt) image.alt = item.imageAlt; });
    if (pageContent.managedSlides && window.__ncManagedSlides) {
      const slides = pageContent.managedSlides.map((item) => ({ titleHtml: (item.heading || '').replace(/\n/g, '<br>'), titleWide: true, intro: item.intro || '', points: (item.pointsText || '').split('\n').map((line) => line.trim()).filter(Boolean) }));
      window.__ncManagedSlides.set(slides);
    }
    // Rebuild (not just patch) the FAQ list so added/removed questions show, not just edited ones.
    if (Array.isArray(pageContent.faqs) && pageContent.faqs.length) {
      const list = document.getElementById('nd-faq-list') || document.querySelector('[data-faq-list]');
      if (list) {
        const usesDelegatedClicks = list.hasAttribute('data-faq-list');
        list.innerHTML = '';
        pageContent.faqs.forEach((item, index) => {
          const button = document.createElement('button');
          button.className = 'nd-faq__item' + (index === 0 ? ' is-open' : '');
          const span = document.createElement('span');
          const questionTag = /^h[1-6]$/.test(item.headingTag) ? item.headingTag : 'h3';
          const question = document.createElement(questionTag);
          question.style.font = 'inherit'; question.style.margin = '0'; question.style.color = 'inherit';
          question.textContent = item.question || '';
          span.append(question);
          const strong = document.createElement('strong'); strong.textContent = index === 0 ? '\u2212' : '+';
          button.append(span, strong);
          const panel = document.createElement('div'); panel.className = 'nd-faq__panel'; panel.textContent = item.answer || '';
          if (index !== 0) panel.hidden = true;
          list.append(button, panel);
        });
        // global.js already delegates .nd-faq__item clicks on pages using [data-faq-list]; binding our own here would double-toggle.
        if (!usesDelegatedClicks) {
          const items = [...list.querySelectorAll('.nd-faq__item')];
          items.forEach((btn) => btn.addEventListener('click', () => {
            const panel = btn.nextElementSibling, open = btn.classList.contains('is-open');
            items.forEach((b) => { b.classList.remove('is-open'); b.querySelector('strong').textContent = '+'; if (b.nextElementSibling) b.nextElementSibling.hidden = true; });
            if (!open) { btn.classList.add('is-open'); btn.querySelector('strong').textContent = '\u2212'; if (panel) panel.hidden = false; }
          }));
        }
      }
    }
    // Rebuild via the carousel's own renderer (window.__ncSetTestimonials from js/cms.js) so added/removed cards recalc slider metrics correctly.
    if (Array.isArray(pageContent.testimonials) && pageContent.testimonials.length && window.__ncSetTestimonials) {
      window.__ncSetTestimonials(pageContent.testimonials);
    } else if (Array.isArray(pageContent.testimonials) && pageContent.testimonials.length) {
      // Home/About use static .nd-t-card/.ab-test-card markup instead of the [data-cms="testimonials"] carousel, so patch those cards directly by index.
      document.querySelectorAll('.nd-t-card, .ab-test-card').forEach((card, index) => {
        const item = pageContent.testimonials[index];
        if (!item) return;
        const quote = card.querySelector('blockquote, .nd-t-card__quote, .ab-test-card__quote');
        const name = card.querySelector('.nd-t-card__name, .ab-test-card__name');
        const role = card.querySelector('.nd-t-card__role, .ab-test-card__role');
        const image = card.querySelector('img');
        if (quote && item.quote) quote.textContent = item.quote;
        if (name && item.name) name.textContent = item.name;
        if (role && item.role) role.textContent = item.role;
        if (image && item.imageAlt) image.alt = item.imageAlt;
      });
    }
    Object.entries(seo.content || {}).forEach(([key, value]) => {
      document.querySelectorAll(`[data-cms-key="${CSS.escape(key)}"]`).forEach((element) => {
        if (element.tagName === 'IMG') element.alt = String(value);
        else if (typeof value === 'string') element.textContent = value;
      });
    });
  }
  fetch(`/api/public/page?slug=${slug}`).then((response) => response.ok ? response.json() : null).then((data) => {
    if (data?.page?.content) applyPageContent(data.page.content);
  }).catch(() => {});
}());