(function () {
  'use strict';

  const pageSlugs = { '/': 'home', '/index.html': 'home', '/about': 'about', '/about.html': 'about', '/contact': 'contact', '/contact.html': 'contact', '/services': 'services', '/services/index.html': 'services' };
  const slug = pageSlugs[window.location.pathname.replace(/\/$/, '') || '/'];
  if (!slug) return;

  function setMeta(selector, value) {
    if (!value) return;
    const element = document.querySelector(selector);
    if (element) element.setAttribute('content', value);
  }
  function applyPageContent(content) {
    const seo = content || {};
    if (seo['seo.title']) document.title = seo['seo.title'];
    setMeta('meta[name="description"]', seo['seo.description']);
    setMeta('meta[property="og:title"]', seo['seo.ogTitle']);
    setMeta('meta[property="og:description"]', seo['seo.ogDescription']);
    if (seo['seo.schemaMarkup']) {
      try {
        const schema = typeof seo['seo.schemaMarkup'] === 'string' ? JSON.parse(seo['seo.schemaMarkup']) : seo['seo.schemaMarkup'];
        const script = document.querySelector('script[type="application/ld+json"]');
        if (script) script.textContent = JSON.stringify(schema);
      } catch { return; }
    }
    const pageContent = seo.content || {};
    if (pageContent.heroSlides) document.querySelectorAll('.hero__slide').forEach((slide, index) => { const item = pageContent.heroSlides[index]; if (!item) return; const title = slide.querySelector('.hero__title'); const description = slide.querySelector('.hero__sub'); const button = slide.querySelector('.hero__btn'); if (title && item.heading) title.textContent = item.heading; if (description && item.paragraph) description.textContent = item.paragraph; if (button) { if (item.buttonText) button.textContent = item.buttonText; if (item.buttonUrl) button.href = item.buttonUrl; } });
    if (pageContent.cards) document.querySelectorAll('.svc-card').forEach((card, index) => { const item = pageContent.cards[index]; if (!item) return; const heading = card.querySelector('.svc-card__label'); const paragraph = card.querySelector('.svc-card__desc'); const image = card.querySelector('img'); if (heading && item.heading) heading.textContent = item.heading; if (paragraph && item.paragraph) paragraph.textContent = item.paragraph; if (image && item.imageAlt) image.alt = item.imageAlt; });
    if (pageContent.introduction) { const heading = document.querySelector('.main-services__title, .ab-intro__title'); const paragraph = document.querySelector('.main-services__intro, .ab-intro p'); if (heading && pageContent.introduction.heading) heading.textContent = pageContent.introduction.heading; if (paragraph && pageContent.introduction.paragraph) paragraph.textContent = pageContent.introduction.paragraph; }
    if (pageContent.heroSlides && pageContent.heroSlides[0] && document.querySelector('.svcs-hero__title')) { const item = pageContent.heroSlides[0]; const heading = document.querySelector('.svcs-hero__title'); const paragraph = document.querySelector('.svcs-hero__sub'); const button = document.querySelector('.svcs-hero__cta'); if (heading && item.heading) heading.textContent = item.heading; if (paragraph && item.paragraph) paragraph.textContent = item.paragraph; if (button) { if (item.buttonText) button.textContent = item.buttonText; if (item.buttonUrl) button.href = item.buttonUrl; } }
    if (pageContent.contactCta) { const heading = document.querySelector('.nd-contact__title, .ctf-title'); const paragraph = document.querySelector('.nd-contact__intro, .ctf-copy, .svc-cta-band__text'); const button = document.querySelector('.svc-cta-band__btn'); if (heading && pageContent.contactCta.heading) heading.textContent = pageContent.contactCta.heading; if (paragraph && pageContent.contactCta.paragraph) paragraph.textContent = pageContent.contactCta.paragraph; if (button) { if (pageContent.contactCta.buttonText) button.textContent = pageContent.contactCta.buttonText; if (pageContent.contactCta.buttonUrl) button.href = pageContent.contactCta.buttonUrl; } }
    if (Array.isArray(pageContent.servicesList) && pageContent.servicesList.length) { const tabs = [...document.querySelectorAll('.svl-overview__list-item')]; pageContent.servicesList.forEach((item, index) => { const tab = tabs[index]; if (!tab) return; if (item.title) { tab.textContent = item.title; tab.dataset.title = item.title; } if (item.copy) tab.dataset.copy = item.copy; if (item.imageUrl) { tab.dataset.img = item.imageUrl; tab.dataset.webp = item.imageUrl; } if (item.imageAlt) tab.dataset.alt = item.imageAlt; if (item.href) tab.dataset.href = item.href; if (index === 0) { const title = document.getElementById('svl-overview-title'); const copy = document.getElementById('svl-overview-copy'); const img = document.getElementById('svl-feature-img'); const source = document.getElementById('svl-feature-source'); if (title && item.title) title.textContent = item.title; if (copy && item.copy) copy.textContent = item.copy; if (img && item.imageUrl) { img.src = item.imageUrl; if (item.imageAlt) img.alt = item.imageAlt; } if (source && item.imageUrl) source.srcset = item.imageUrl; } }); }
    if (pageContent.highlight) { const highlight = pageContent.highlight; const heading = document.querySelector('.nd-highlight__copy h2'); const paragraph = document.querySelector('.nd-highlight__copy p'); const points = document.querySelectorAll('.nd-highlight__copy ul li'); if (heading && highlight.heading) heading.textContent = highlight.heading; if (paragraph && highlight.paragraph) paragraph.textContent = highlight.paragraph; [highlight.point1, highlight.point2, highlight.point3].forEach((value, index) => { if (points[index] && value) points[index].textContent = value; }); }
    if (pageContent.expertCards) document.querySelectorAll('.nd-figma-card').forEach((card, index) => { const item = pageContent.expertCards[index]; if (!item) return; const heading = card.querySelector('.nd-figma-card__title'); const lead = card.querySelector('.nd-figma-card__lead'); const paragraph = card.querySelector('.nd-figma-card__text'); const image = card.querySelector('img'); if (heading && item.heading) heading.textContent = item.heading; if (lead && (item.leadHeading || item.heading)) lead.textContent = item.leadHeading || item.heading; if (paragraph && item.paragraph) paragraph.textContent = item.paragraph; if (image && item.imageAlt) image.alt = item.imageAlt; });
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
          const span = document.createElement('span'); span.textContent = item.question || '';
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