(function () {
  'use strict';

  const pageSlugs = { '/': 'home', '/index.html': 'home', '/about': 'about', '/about.html': 'about', '/contact': 'contact', '/contact.html': 'contact' };
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
    if (pageContent.contactCta) { const heading = document.querySelector('.nd-contact__title, .ctf-title'); const paragraph = document.querySelector('.nd-contact__intro, .ctf-copy'); if (heading && pageContent.contactCta.heading) heading.textContent = pageContent.contactCta.heading; if (paragraph && pageContent.contactCta.paragraph) paragraph.textContent = pageContent.contactCta.paragraph; }
    if (pageContent.highlight) { const highlight = pageContent.highlight; const heading = document.querySelector('.nd-highlight__copy h2'); const paragraph = document.querySelector('.nd-highlight__copy p'); const points = document.querySelectorAll('.nd-highlight__copy ul li'); if (heading && highlight.heading) heading.textContent = highlight.heading; if (paragraph && highlight.paragraph) paragraph.textContent = highlight.paragraph; [highlight.point1, highlight.point2, highlight.point3].forEach((value, index) => { if (points[index] && value) points[index].textContent = value; }); }
    if (pageContent.expertCards) document.querySelectorAll('.nd-figma-card').forEach((card, index) => { const item = pageContent.expertCards[index]; if (!item) return; const heading = card.querySelector('.nd-figma-card__title'); const lead = card.querySelector('.nd-figma-card__lead'); const paragraph = card.querySelector('.nd-figma-card__text'); const image = card.querySelector('img'); if (heading && item.heading) heading.textContent = item.heading; if (lead && item.heading) lead.textContent = item.heading; if (paragraph && item.paragraph) paragraph.textContent = item.paragraph; if (image && item.imageAlt) image.alt = item.imageAlt; });
    if (pageContent.managedSlides && window.__ncManagedSlides) {
      const slides = pageContent.managedSlides.map((item) => ({ titleHtml: (item.heading || '').replace(/\n/g, '<br>'), titleWide: true, intro: item.intro || '', points: (item.pointsText || '').split('\n').map((line) => line.trim()).filter(Boolean) }));
      window.__ncManagedSlides.set(slides);
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