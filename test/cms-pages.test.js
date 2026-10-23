import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { CMS_PAGE_DEFINITIONS, getCmsPageDefinition, validatePageContent } from '../lib/cms/pages.js';
import { describePageTemplate, readPageTemplate } from '../lib/cms/page-renderer.js';

const home = CMS_PAGE_DEFINITIONS.find((page) => page.slug === 'home');
const homepageHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function validContent() {
  return describePageTemplate(homepageHtml, home);
}

test('live homepage exposes fields without requiring pilot template markers', () => {
  assert.equal(home.dynamic, true);
  const content = validContent();
  assert.ok(content.fieldsSchema.some((field) => field.key.startsWith('heading:')));
  assert.ok(content.fieldsSchema.some((field) => field.key.startsWith('t:')));
  assert.deepEqual(content.sectionOrder, []);
});

test('page content accepts complete registered fields and section order', () => {
  const result = validatePageContent(home, validContent());
  assert.deepEqual(result.errors, {});
  assert.equal(Object.keys(result.content.fields).length, Object.keys(validContent().fields).length);
  assert.deepEqual(result.content.sectionOrder, []);
});

test('page content rejects unsafe and malformed URLs', () => {
  for (const value of ['javascript:alert(1)', 'https://', '//external.example/path', '/\\\\external.example/path']) {
    const input = validContent();
    const key = input.fieldsSchema.find((field) => field.key.startsWith('u:')).key;
    input.fields[key] = value;
    const result = validatePageContent(home, input);
    assert.match(result.errors[key], /HTTPS/);
  }
});

test('page content rejects unknown fields and unapproved layout reordering', () => {
  const input = validContent();
  input.fields['home.unregistered.field'] = 'not allowed';
  input.sectionOrder.push('unknown-section');
  const result = validatePageContent(home, input);
  assert.match(result.errors.fields, /unsupported field/i);
  assert.match(result.errors.sectionOrder, /cannot be changed/i);
});

test('registered marketing, legal and utility pages have main content and server routes', async () => {
  const dynamicPages = CMS_PAGE_DEFINITIONS.filter((page) => page.dynamic);
  assert.equal(dynamicPages.length, 42);
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const page of dynamicPages) {
    const html = await readPageTemplate(page);
    assert.match(html, /<main\b/, page.path);
    assert.equal(config.proxy.entrypoint, 'middleware.js');
    assert.ok(config.proxy.matcher.includes(page.path), page.path);
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
