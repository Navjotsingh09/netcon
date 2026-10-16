import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { CMS_PAGE_DEFINITIONS, validatePageContent } from '../lib/cms/pages.js';

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
