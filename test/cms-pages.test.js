import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { CMS_PAGE_DEFINITIONS, getCmsPageDefinition, validatePageContent } from '../lib/cms/pages.js';

const home = CMS_PAGE_DEFINITIONS.find((page) => page.slug === 'home');
const homepageHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function validContent() {
  return {
    fields: Object.fromEntries(home.fields.map((field) => [
      field.key,
      field.type === 'url' ? 'https://example.com/contact' : `Sample ${field.key}`
    ])),
    sectionOrder: home.sections.map((section) => section.id)
  };
}

test('homepage template exposes every registered field and section', () => {
  const textFields = new Set(Array.from(homepageHtml.matchAll(/data-cms-field="([^"]+)"/g), (match) => match[1]));
  const urlFields = new Set(Array.from(homepageHtml.matchAll(/data-cms-url-field="([^"]+)"/g), (match) => match[1]));
  const sections = new Set(Array.from(homepageHtml.matchAll(/data-cms-section="([^"]+)"/g), (match) => match[1]));

  for (const field of home.fields) {
    const targetFields = field.type === 'url' ? urlFields : textFields;
    assert.ok(targetFields.has(field.key), `Missing template marker for ${field.key}`);
  }
  for (const section of home.sections) {
    assert.ok(sections.has(section.id), `Missing template section ${section.id}`);
  }
});

test('page content accepts complete registered fields and section order', () => {
  const result = validatePageContent(home, validContent());
  assert.deepEqual(result.errors, {});
  assert.equal(Object.keys(result.content.fields).length, home.fields.length);
  assert.deepEqual(result.content.sectionOrder, home.sections.map((section) => section.id));
});

test('page content rejects unsafe and malformed URLs', () => {
  for (const value of ['javascript:alert(1)', 'https://', '//external.example/path', '/\\\\external.example/path']) {
    const input = validContent();
    input.fields['home.hero.cisco.ctaUrl'] = value;
    const result = validatePageContent(home, input);
    assert.match(result.errors['home.hero.cisco.ctaUrl'], /HTTPS/);
  }
});

test('page content rejects unknown fields and incomplete section orders', () => {
  const input = validContent();
  input.fields['home.unregistered.field'] = 'not allowed';
  input.sectionOrder.pop();
  const result = validatePageContent(home, input);
  assert.match(result.errors.fields, /unsupported field/i);
  assert.match(result.errors.sectionOrder, /incomplete or invalid/i);
});

test('registered marketing pages have an editable page root and runtime', async () => {
  const dynamicPages = CMS_PAGE_DEFINITIONS.filter((page) => page.dynamic);
  assert.equal(dynamicPages.length, 36);
  for (const page of dynamicPages) {
    const html = await readFile(new URL(`..${page.path}`, import.meta.url), 'utf8');
    assert.match(html, new RegExp(`<main\\b[^>]*data-cms-page="${page.slug}"[^>]*data-cms-dynamic`), page.path);
    assert.ok(html.includes('<script src="/js/page-cms.js" defer></script>'), page.path);
  }
});

test('dynamic page content accepts safe text and link fields', () => {
  const definition = getCmsPageDefinition('about');
  const result = validatePageContent(definition, {
    fields: {
      'meta:title': 'About Network Consultancy',
      'meta:description': 'Network consultancy services.',
      't:section[1]/p[1]#0': 'Updated page copy',
      'u:section[1]/a[1]': '/contact.html'
    },
    sectionOrder: []
  });
  assert.deepEqual(result.errors, {});
});

test('dynamic page content rejects unsafe selectors, properties, and URLs', () => {
  const definition = getCmsPageDefinition('about');
  const result = validatePageContent(definition, {
    fields: {
      't:script[1]#0': 'Not allowed',
      'u:section[1]/div[1]': 'https://example.com',
      'u:section[1]/a[1]': 'javascript:alert(1)'
    },
    sectionOrder: []
  });
  assert.equal(result.errors['u:section[1]/a[1]'], 'Use an HTTPS, mailto, tel, site-relative, or anchor link.');
  assert.match(result.errors.fields, /unsupported field/i);
});
