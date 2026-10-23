import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseDocument, DomUtils } from 'htmlparser2';
import { getCmsPageDefinition, publicPagePath, validatePageContent } from './pages.js';

const textTags = new Set(['a', 'address', 'b', 'blockquote', 'button', 'caption', 'dd', 'dt', 'em', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'li', 'p', 'small', 'span', 'strong', 'td', 'th']);
const excludedTags = new Set(['script', 'style', 'svg', 'template', 'noscript']);
const elements = (node) => (node.children || []).filter((child) => child.type === 'tag' || child.type === 'script' || child.type === 'style');
const all = (node, predicate) => DomUtils.findAll(predicate, node.children || []);
const first = (node, predicate) => all(node, predicate)[0];
const attr = (node, name) => node?.attribs?.[name] || '';
const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export class PageContentError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'PageContentError';
    this.fields = fields;
  }
}

function pathFor(node, root) {
  const parts = [];
  while (node && node !== root) {
    const siblings = elements(node.parent).filter((sibling) => sibling.name === node.name);
    parts.unshift(`${node.name}[${siblings.indexOf(node) + 1}]`);
    node = node.parent;
  }
  return parts.join('/');
}

function resolve(root, path) {
  let node = root;
  for (const segment of path.split('/')) {
    const match = /^([a-z][a-z0-9-]*)\[([1-9]\d*)\]$/.exec(segment);
    if (!match) return null;
    node = elements(node).filter((child) => child.name === match[1])[Number(match[2]) - 1];
    if (!node) return null;
  }
  return node;
}

function replaceText(node, value) {
  const fragment = parseDocument(escape(value));
  node.children = fragment.children;
  for (const child of node.children) child.parent = node;
}

function fieldText(node, preserveLines) {
  if (!preserveLines) return DomUtils.textContent(node);
  if (node.name === 'br') return '\n';
  if (node.type === 'text') return node.data;
  return (node.children || []).map((child) => fieldText(child, true)).join('');
}

function appendHtml(parent, html) {
  for (const node of parseDocument(html).children) DomUtils.appendChild(parent, node);
}

function templateUrl(value, definition, image = false) {
  if (value && !/^(?:https:|mailto:|tel:|#|\/)/i.test(value)) {
    const url = new URL(value, `https://network-consultancy.com${definition.path}`);
    value = url.pathname + url.search + url.hash;
  }
  return image ? value.replace(/ /g, '%20') : value;
}

export async function readPageTemplate(definition) {
  const filename = definition.slug === 'home' ? 'index.html' : definition.path.slice(1);
  return readFile(join(process.cwd(), filename), 'utf8');
}

export function describePageTemplate(html, definition) {
  const document = parseDocument(html);
  const root = first(document, (node) => node.name === 'main');
  if (!root) throw new Error(`The ${definition.title} template has no main content.`);
  const canonical = first(document, (node) => node.name === 'link' && attr(node, 'rel') === 'canonical');
  const schemaNodes = all(document, (node) => node.name === 'script' && attr(node, 'type') === 'application/ld+json');
  const schemas = schemaNodes.flatMap((node) => {
    const parsed = JSON.parse(DomUtils.textContent(node));
    return Array.isArray(parsed) ? parsed : [parsed];
  });
  const fields = {};
  const fieldsSchema = [];
  const sections = new Map([['search-metadata', { id: 'search-metadata', label: 'SEO and URL settings' }]]);
  function add(key, value, label, section, type = 'text', maxLength = 5000, options) {
    if (key.startsWith('u:') || key.startsWith('src:')) value = templateUrl(value, definition, key.startsWith('src:'));
    fields[key] = value;
    fieldsSchema.push({ key, label, section, type, maxLength, options });
  }
  if (!definition.dynamic) {
    for (const section of definition.sections) sections.set(section.id, section);
    for (const field of definition.fields) {
      const node = first(document, (candidate) => attr(candidate, field.type === 'url' ? 'data-cms-url-field' : 'data-cms-field') === field.key);
      if (!node) throw new Error(`Missing template field ${field.key}.`);
      fields[field.key] = field.property === 'textContent' ? fieldText(node, field.preserveLines) : attr(node, field.property);
      fieldsSchema.push(field);
    }
  }
  add('meta:title', DomUtils.textContent(first(document, (node) => node.name === 'title') || { children: [] }), 'Search title', 'search-metadata', 'text', 180);
  add('meta:description', attr(first(document, (node) => node.name === 'meta' && attr(node, 'name') === 'description'), 'content'), 'Search description', 'search-metadata', 'textarea', 360);
  add('meta:canonical', attr(canonical, 'href') || `https://network-consultancy.com${publicPagePath(definition)}`, 'Canonical URL', 'search-metadata', 'url', 2048);
  add('meta:robots', attr(first(document, (node) => node.name === 'meta' && attr(node, 'name') === 'robots'), 'content') || 'index, follow', 'Search indexing', 'search-metadata', 'select', 40, ['index, follow', 'noindex, follow', 'noindex, nofollow']);
  add('meta:schema', schemas.length ? JSON.stringify(schemas, null, 2) : '', 'Structured data (JSON-LD; blank removes template schemas)', 'search-metadata', 'textarea', 50000);
  add('meta:redirect', '', 'Redirect this page to (site-relative URL; blank disables)', 'search-metadata', 'text', 2048);
  add('meta:redirectStatus', '308', 'Redirect status', 'search-metadata', 'select', 3, ['301', '302', '307', '308']);
  function walk(node, excluded = false) {
    excluded ||= excludedTags.has(node.name);
    if (excluded) return;
    const path = node === root ? '' : pathFor(node, root);
    let section = node;
    while (section !== root && section.name !== 'section') section = section.parent;
    const sectionId = section === root ? 'page' : pathFor(section, root);
    const heading = first(section, (child) => /^h[1-6]$/.test(child.name));
    sections.set(sectionId, { id: sectionId, label: DomUtils.textContent(heading || { children: [] }).trim().slice(0, 100) || 'Page content' });
    if (textTags.has(node.name) && !attr(node, 'data-cms-field')) {
      (node.children || []).filter((child) => child.type === 'text').forEach((child, index) => {
        if (child.data.trim()) add(`t:${path}#${index}`, child.data, `Text · ${node.name} · ${child.data.trim().slice(0, 65)}`, sectionId, 'textarea');
      });
    }
    if (node.name === 'a' && !attr(node, 'data-cms-url-field')) add(`u:${path}`, attr(node, 'href'), `Link · ${DomUtils.textContent(node).trim().slice(0, 65)}`, sectionId, 'text', 2048);
    if (node.name === 'img') {
      add(`alt:${path}`, attr(node, 'alt'), `Image alt text · ${attr(node, 'src').split('/').pop()}`, sectionId, 'text', 2048);
      add(`src:${path}`, attr(node, 'src'), 'Image URL (changing it replaces picture sources too)', sectionId, 'text', 2048);
    }
    if (/^h[1-6]$/.test(node.name)) add(`heading:${path}`, node.name, `Heading level · ${DomUtils.textContent(node).slice(0, 65)}`, sectionId, 'select', 2, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
    for (const child of elements(node)) walk(child, excluded);
  }
  walk(root);
  const warnings = [];
  if (first(document, (node) => attr(node, 'id') === 'site-contact')) {
    warnings.push('The shared contact section is loaded separately and is not editable or shown in this preview.');
  }
  if (!fieldsSchema.some((field) => !field.key.startsWith('meta:'))) {
    warnings.push('This template contains no editable main-page content. Only its SEO settings are available.');
  }
  return { fields, fieldsSchema, warnings, sections: [...sections.values()], sectionOrder: definition.dynamic ? [] : definition.sections.map((section) => section.id) };
}

export function renderPageContent(html, definition, content, { preview = false } = {}) {
  const result = validatePageContent(definition, content);
  if (Object.keys(result.errors).length) throw new PageContentError('Invalid page content. Please correct the highlighted fields.', result.errors);
  const document = parseDocument(html);
  const root = first(document, (node) => node.name === 'main');
  const head = first(document, (node) => node.name === 'head');
  const fields = result.content.fields;
  if (!root || !head) throw new Error('The page template is missing its main content or head.');
  const targets = new Map();
  for (const key of Object.keys(fields)) {
    const match = /^(?:t|u|alt|src|heading):(.+?)(?:#\d+)?$/.exec(key);
    if (match) targets.set(key, resolve(root, match[1]));
  }
  for (const field of definition.fields) {
    if (!(field.key in fields)) continue;
    const nodes = all(document, (candidate) => attr(candidate, field.type === 'url' ? 'data-cms-url-field' : 'data-cms-field') === field.key);
    if (!nodes.length) throw new Error(`Missing template target ${field.key}.`);
    for (const node of nodes) {
      if (field.property === 'textContent') {
        if (fieldText(node, field.preserveLines) === fields[field.key]) continue;
        replaceText(node, fields[field.key]);
        if (field.preserveLines) node.attribs.style = `${attr(node, 'style')};white-space:pre-line`;
      } else node.attribs[field.property] = fields[field.key];
    }
  }
  for (const [key, node] of targets) {
    if (!node) throw new PageContentError('The template changed; re-open the page before publishing.', { [key]: 'This field no longer exists in the template.' });
    const value = fields[key];
    if (key.startsWith('t:')) {
      const text = (node.children || []).filter((child) => child.type === 'text')[Number(key.match(/#(\d+)$/)[1])];
      if (!text) throw new PageContentError('The template changed; re-open the page before publishing.', { [key]: 'This text no longer exists in the template.' });
      text.data = value;
    } else if (key.startsWith('u:')) node.attribs.href = value;
    else if (key.startsWith('alt:')) node.attribs.alt = value;
    else if (key.startsWith('heading:')) node.name = value;
    else if (key.startsWith('src:') && value !== templateUrl(attr(node, 'src'), definition, true)) {
      node.attribs.src = value;
      delete node.attribs.srcset;
      if (node.parent?.name === 'picture') for (const source of elements(node.parent).filter((child) => child.name === 'source')) DomUtils.removeElement(source);
    }
  }
  function meta(key, selector, markup, property = 'content') {
    if (!(key in fields)) return;
    const nodes = all(document, selector);
    if (nodes.length) {
      for (const node of nodes) {
        if (fields[key]) node.attribs[property] = fields[key];
        else DomUtils.removeElement(node);
      }
    }
    else if (fields[key]) appendHtml(head, markup(fields[key]));
  }
  if ('meta:title' in fields) {
    let title = first(document, (node) => node.name === 'title');
    if (!title) { appendHtml(head, '<title></title>'); title = first(document, (node) => node.name === 'title'); }
    replaceText(title, fields['meta:title']);
  }
  meta('meta:description', (node) => node.name === 'meta' && attr(node, 'name') === 'description', (value) => `<meta name="description" content="${escape(value)}">`);
  meta('meta:canonical', (node) => node.name === 'link' && attr(node, 'rel') === 'canonical', (value) => `<link rel="canonical" href="${escape(value)}">`, 'href');
  meta('meta:robots', (node) => node.name === 'meta' && attr(node, 'name') === 'robots', (value) => `<meta name="robots" content="${escape(value)}">`);
  for (const [key, property] of [['meta:title', 'og:title'], ['meta:description', 'og:description'], ['meta:canonical', 'og:url']]) {
    meta(key, (node) => node.name === 'meta' && attr(node, 'property') === property, (value) => `<meta property="${property}" content="${escape(value)}">`);
  }
  for (const [key, name] of [['meta:title', 'twitter:title'], ['meta:description', 'twitter:description']]) {
    for (const node of all(document, (candidate) => candidate.name === 'meta' && attr(candidate, 'name') === name)) node.attribs.content = fields[key] ?? attr(node, 'content');
  }
  if ('meta:schema' in fields) {
    for (const node of all(document, (candidate) => candidate.name === 'script' && attr(candidate, 'type') === 'application/ld+json')) DomUtils.removeElement(node);
    if (fields['meta:schema']) {
      const parsed = JSON.parse(fields['meta:schema']);
      for (const schema of Array.isArray(parsed) ? parsed : [parsed]) appendHtml(head, `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`);
    }
  }
  if (!definition.dynamic) {
    const sections = new Map(elements(root).filter((node) => attr(node, 'data-cms-section')).map((node) => [attr(node, 'data-cms-section'), node]));
    const ordered = content.sectionOrder.map((id) => sections.get(id));
    if (ordered.some((node) => !node)) throw new Error('A homepage section is missing from the template.');
    let index = 0;
    root.children = root.children.map((node) => sections.has(attr(node, 'data-cms-section')) ? ordered[index++] : node);
  }
  for (const script of all(document, (node) => node.name === 'script' && attr(node, 'src') === '/js/page-cms.js')) DomUtils.removeElement(script);
  if (preview) {
    for (const script of all(document, (node) => node.name === 'script' && attr(node, 'type') !== 'application/ld+json')) DomUtils.removeElement(script);
    for (const node of all(document, () => true)) {
      for (const name of Object.keys(node.attribs || {})) if (/^on/i.test(name)) delete node.attribs[name];
      if (['input', 'textarea', 'button', 'select'].includes(node.name)) node.attribs.disabled = '';
      if (node.name === 'form') delete node.attribs.action;
    }
    appendHtml(head, '<style>.animate-fade-up,.animate-fade-in,.stagger-children>*{opacity:1!important;transform:none!important}</style>');
    for (const node of all(document, (candidate) => candidate.name === 'base')) DomUtils.removeElement(node);
    appendHtml(head, `<base href="${escape(definition.path)}">`);
    for (const node of all(document, (candidate) => candidate.name === 'meta' && attr(candidate, 'name') === 'robots')) DomUtils.removeElement(node);
    appendHtml(head, '<meta name="robots" content="noindex, nofollow">');
  }
  return DomUtils.getOuterHTML(document);
}

export async function loadPublishedPage(client, slug) {
  const definition = getCmsPageDefinition(slug);
  if (!definition) throw new Error('Unknown CMS page.');
  const { data: page, error } = await client.from('cms_pages').select('id, published_revision_id').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!page?.published_revision_id) return null;
  const { data: revision, error: revisionError } = await client.from('cms_page_revisions').select('id, content').eq('id', page.published_revision_id).eq('page_id', page.id).eq('status', 'published').maybeSingle();
  if (revisionError) throw revisionError;
  if (!revision) throw new Error('Published page revision is missing.');
  return revision;
}
