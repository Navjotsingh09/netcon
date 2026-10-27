import test from 'node:test';
import assert from 'node:assert/strict';
import { restrictPageSettings, advancedPageFields } from '../lib/cms/page-editing.js';

const baseline = { fields: {
  'meta:canonical': 'https://network-consultancy.com/about',
  'meta:robots': 'index, follow', 'meta:schema': '{"@type":"WebPage"}',
  'meta:redirect': '', 'meta:redirectStatus': '308', 'meta:title': 'About'
} };

test('editors can change copy and ordinary search metadata without changing protected settings', () => {
  const content = { sectionOrder: ['overview'], fields: { ...baseline.fields, 'meta:title': 'About us' } };
  assert.deepEqual(restrictPageSettings({ role: 'editor' }, content, baseline), content);
});

test('every advanced setting is enforced at save, not only hidden in the editor', () => {
  for (const key of advancedPageFields) {
    const content = { fields: { ...baseline.fields, [key]: 'changed' } };
    assert.throws(() => restrictPageSettings({ role: 'editor' }, content, baseline),
      (error) => error.name === 'PageContentError' && error.fields[key].includes('reviewer'));
  }
});

test('omission cannot clear editor-protected settings and does not mutate input', () => {
  const content = { fields: { 'meta:title': 'Edited' }, sectionOrder: [] };
  const result = restrictPageSettings({ role: 'editor' }, content, baseline);
  for (const key of advancedPageFields) assert.equal(result.fields[key], baseline.fields[key]);
  assert.deepEqual(content.fields, { 'meta:title': 'Edited' });
});

test('reviewers retain explicit control over advanced settings including removal', () => {
  const content = { fields: { 'meta:schema': '', 'meta:redirect': '/contact' } };
  assert.equal(restrictPageSettings({ role: 'reviewer' }, content, baseline), content);
});
