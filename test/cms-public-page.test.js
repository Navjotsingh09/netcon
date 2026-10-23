import assert from 'node:assert/strict';
import test from 'node:test';
import { getCmsPageDefinition } from '../lib/cms/pages.js';
import { describePageTemplate, readPageTemplate } from '../lib/cms/page-renderer.js';

test('public page handler serves only published content, redirects and explicit outage fallbacks', async (t) => {
  const names = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const originalEnv = names.map((name) => process.env[name]);
  process.env.SUPABASE_URL = 'https://cms-page-test.example';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-key';
  t.after(() => names.forEach((name, index) => {
    if (originalEnv[index] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[index];
  }));
  const definition = getCmsPageDefinition('about');
  const template = await readPageTemplate(definition);
  const content = describePageTemplate(template, definition);
  content.fields['meta:title'] = 'Published SEO check';
  let mode = 'static';
  let errorsLogged = 0;
  t.mock.method(console, 'error', () => { errorsLogged++; });
  t.mock.method(globalThis, 'fetch', async (input) => {
    const url = new URL(input);
    assert.equal(url.hostname, 'cms-page-test.example');
    if (mode === 'outage') return Response.json({ message: 'Test database unavailable' }, { status: 400 });
    if (url.pathname === '/rest/v1/cms_pages') {
      if (mode === 'static' || url.searchParams.get('slug') !== 'eq.about') return Response.json(null);
      return Response.json({ id: 'page-id', published_revision_id: 'published-id' });
    }
    assert.equal(url.pathname, '/rest/v1/cms_page_revisions');
    assert.equal(url.searchParams.get('id'), 'eq.published-id');
    assert.equal(url.searchParams.get('page_id'), 'eq.page-id');
    assert.equal(url.searchParams.get('status'), 'eq.published');
    const fields = { ...content.fields };
    if (mode === 'redirect') fields['meta:redirect'] = '/contact';
    if (mode === 'unsafe') fields['meta:redirect'] = '//external.example';
    return Response.json({ id: 'published-id', content: { fields, sectionOrder: [] } });
  });
  const { default: handler } = await import('../api/public/site.js');
  async function request(method = 'GET', page = 'about') {
    const result = { headers: {}, statusCode: null, body: null };
    const response = {
      setHeader(name, value) { result.headers[name] = value; },
      status(value) { result.statusCode = value; return this; },
      send(value) { result.body = value; return this; },
      end() { return this; }
    };
    await handler({ method, query: { page } }, response);
    return result;
  }
  await t.test('unpublished pages keep their exact static template', async () => {
    const result = await request();
    assert.equal(result.statusCode, 200);
    assert.equal(result.body, template);
    assert.equal(result.headers['X-CMS-Status'], 'static');
  });
  await t.test('raw HTML contains published SEO and not a draft', async () => {
    mode = 'published';
    const result = await request();
    assert.equal(result.statusCode, 200);
    assert.match(result.body, /<title>Published SEO check<\/title>/);
    assert.equal(result.headers['X-CMS-Status'], 'published');
    assert.match(result.headers['Cache-Control'], /s-maxage=60/);
  });
  await t.test('HEAD returns matching status and headers without HTML', async () => {
    const result = await request('HEAD');
    assert.equal(result.statusCode, 200);
    assert.equal(result.body, null);
    assert.equal(result.headers['X-CMS-Status'], 'published');
  });
  await t.test('published redirects return a real status and Location', async () => {
    mode = 'redirect';
    const result = await request();
    assert.equal(result.statusCode, 308);
    assert.equal(result.headers.Location, '/contact');
    assert.equal(result.headers['Cache-Control'], 'no-store');
  });
  await t.test('unsafe stored redirects never become response headers', async () => {
    mode = 'unsafe';
    const result = await request();
    assert.equal(result.statusCode, 200);
    assert.equal(result.headers.Location, undefined);
    assert.equal(result.headers['X-CMS-Status'], 'unavailable');
    assert.equal(result.body, template);
  });
  await t.test('database errors log and explicitly mark non-cached fallback', async () => {
    mode = 'outage';
    const before = errorsLogged;
    const result = await request();
    assert.ok(errorsLogged > before);
    assert.equal(result.body, template);
    assert.equal(result.headers['Cache-Control'], 'no-store');
    assert.equal(result.headers['X-CMS-Status'], 'unavailable');
    assert.match(result.headers.Warning, /CMS unavailable/);
  });
  await t.test('unknown pages and unsupported methods are rejected', async () => {
    assert.equal((await request('GET', 'missing')).statusCode, 404);
    assert.equal((await request('POST')).statusCode, 405);
  });
});
