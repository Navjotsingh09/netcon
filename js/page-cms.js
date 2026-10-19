(function () {
  'use strict';

  function isSafeUrl(value, attribute) {
    if (typeof value !== 'string' || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
    if (!value) return true;
    if (attribute === 'href' && /^#/.test(value)) return true;
    if (attribute === 'href' && /^tel:/i.test(value)) return /^tel:\+?[0-9().-]+(?:;ext=\d+)?$/i.test(value);
    if (attribute === 'href' && /^mailto:/i.test(value)) {
      try {
        const url = new URL(value);
        return url.protocol === 'mailto:' && Boolean(url.pathname) && !url.search && !url.hash;
      } catch {
        return false;
      }
    }
    if (/^https:\/\//i.test(value)) {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
      } catch {
        return false;
      }
    }
    if (value.startsWith('/') && !value.startsWith('//')) {
      try {
        return new URL(value, document.location.origin).origin === document.location.origin;
      } catch {
        return false;
      }
    }
    return false;
  }

  function applyFields(root, fields) {
    root.querySelectorAll('[data-cms-field]').forEach(function (element) {
      const key = element.getAttribute('data-cms-field');
      if (!Object.prototype.hasOwnProperty.call(fields, key) || typeof fields[key] !== 'string') return;
      const property = element.getAttribute('data-cms-property') || 'textContent';
      if (property === 'textContent') {
        element.textContent = fields[key];
        if (element.hasAttribute('data-cms-preserve-lines')) element.style.whiteSpace = 'pre-line';
        return;
      }
      if (!['content', 'placeholder', 'alt', 'src'].includes(property)) return;
      if (['src'].includes(property) && !isSafeUrl(fields[key], property)) return;
      element.setAttribute(property, fields[key]);
    });

    root.querySelectorAll('[data-cms-url-field]').forEach(function (element) {
      const key = element.getAttribute('data-cms-url-field');
      if (!Object.prototype.hasOwnProperty.call(fields, key) || typeof fields[key] !== 'string') return;
      const property = element.getAttribute('data-cms-url-property') || 'href';
      if (!['href', 'src'].includes(property) || !isSafeUrl(fields[key], property)) return;
      element.setAttribute(property, fields[key]);
    });
  }

  const editableTextTags = new Set(['A', 'BLOCKQUOTE', 'BUTTON', 'EM', 'FIGCAPTION', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'P', 'SMALL', 'SPAN', 'STRONG']);

  function resolveElementPath(root, path) {
    if (!path) return root;
    let current = root;
    for (const part of path.split('/')) {
      const match = /^([a-z][a-z0-9-]*)\[([1-9]\d*)\]$/.exec(part);
      if (!match) return null;
      const [, tag, index] = match;
      current = Array.from(current.children).filter(function (child) {
        return child.tagName.toLowerCase() === tag;
      })[Number(index) - 1];
      if (!current) return null;
    }
    return current;
  }

  function applyDynamicFields(root, fields) {
    Object.entries(fields).forEach(function ([key, value]) {
      if (typeof value !== 'string') return;
      if (key === 'meta:title') {
        document.title = value;
        return;
      }
      if (key === 'meta:description') {
        const description = document.querySelector('meta[name="description"]');
        if (description) description.setAttribute('content', value);
        return;
      }
      const textMatch = /^t:(.*)#(\d+)$/.exec(key);
      if (textMatch) {
        const element = resolveElementPath(root, textMatch[1]);
        if (!element || !editableTextTags.has(element.tagName)) return;
        const textNodes = Array.from(element.childNodes).filter(function (child) {
          return child.nodeType === Node.TEXT_NODE;
        });
        const textNode = textNodes[Number(textMatch[2])];
        if (textNode) textNode.nodeValue = value;
        return;
      }
      const urlMatch = /^u:(.+)$/.exec(key);
      if (urlMatch) {
        const anchor = resolveElementPath(root, urlMatch[1]);
        if (anchor?.tagName === 'A' && isSafeUrl(value, 'href')) anchor.setAttribute('href', value);
      }
    });
  }

  function reorderSections(root, order) {
    if (!Array.isArray(order)) return;
    const sections = new Map(
      Array.from(root.querySelectorAll(':scope > [data-cms-section]'))
        .map(function (section) { return [section.getAttribute('data-cms-section'), section]; })
    );
    if (order.length !== sections.size || order.some(function (id) { return !sections.has(id); })) return;

    const slots = [];
    sections.forEach(function (section) {
      const marker = document.createComment('page-cms-section');
      section.replaceWith(marker);
      slots.push(marker);
    });
    order.forEach(function (id, index) {
      slots[index].replaceWith(sections.get(id));
    });
  }

  async function applyPublishedPage(root) {
    const slug = root.getAttribute('data-cms-page');
    if (!slug) return;
    const response = await fetch(`/api/public/pages/${encodeURIComponent(slug)}`);
    if (response.status === 204) return;
    if (!response.ok) throw new Error(`Page content request failed (${response.status}).`);
    const result = await response.json();
    const content = result.revision?.content;
    if (!content || typeof content !== 'object') throw new Error('The published page content is invalid.');
    if (root.hasAttribute('data-cms-dynamic')) applyDynamicFields(root, content.fields || {});
    else {
      applyFields(document, content.fields || {});
      reorderSections(root, content.sectionOrder);
    }
  }

  const root = document.querySelector('[data-cms-page]');
  if (root) {
    applyPublishedPage(root).catch(function (error) {
      console.error('Published page content could not be applied.', error);
    });
  }
}());
