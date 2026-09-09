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
    Object.entries(seo.content || {}).forEach(([key, value]) => {
      document.querySelectorAll(`[data-cms-key="${CSS.escape(key)}"]`).forEach((element) => {
        if (element.tagName === 'IMG') element.alt = String(value);
        else if (typeof value === 'string') element.textContent = value;
      });
    });
  }
  fetch(`/api/public/page/${slug}`).then((response) => response.ok ? response.json() : null).then((data) => {
    if (data?.page?.content) applyPageContent(data.page.content);
  }).catch(() => {});
}());