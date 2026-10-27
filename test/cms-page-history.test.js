import test from 'node:test';
import assert from 'node:assert/strict';
import { getCmsPageDefinition } from '../lib/cms/pages.js';
import { readPageTemplate, describePageTemplate } from '../lib/cms/page-renderer.js';

test('page API scopes revision history and protects advanced changes', async (t) => {
  const names = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const original = names.map((name) => process.env[name]);
  names.forEach((name, index) => { process.env[name] = index ? 'test-key' : 'https://page-history-test.example'; });
  t.after(() => names.forEach((name, index) => {
    if (original[index] === undefined) delete process.env[name];
    else process.env[name] = original[index];
  }));
  const definition = getCmsPageDefinition('about');
  const defaults = describePageTemplate(await readPageTemplate(definition), definition);
  const revisionId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const requests = [];
  let role = 'reviewer';
  let missing = false;
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const url = new URL(input);
    requests.push({ url, options });
    if (url.pathname === '/auth/v1/user') return Response.json({ id: 'auth-user' });
    if (url.pathname === '/rest/v1/cms_users') {
      return Response.json(url.searchParams.has('supabase_user_id')
        ? { id: 'cms-user', role }
        : [{ id: 'cms-user', display_name: 'Test Reviewer' }]);
    }
    if (url.pathname === '/rest/v1/cms_pages') return Response.json({ id: 'page-about', published_revision_id: revisionId });
    if (url.pathname === '/rest/v1/cms_page_revisions') {
      assert.equal(url.searchParams.get('page_id'), 'eq.page-about');
      if (url.searchParams.has('id')) {
        assert.equal(url.searchParams.get('id'), `eq.${revisionId}`);
        return Response.json(missing ? null : { id: revisionId, content: defaults });
      }
      if (url.searchParams.get('select') === 'content') return Response.json({ content: defaults });
      return Response.json(Array.from({ length: 21 }, (_, index) => ({
        id: `${index}`, revision_number: 30 - index, created_by: 'cms-user', status: 'draft'
      })));
    }
    if (url.pathname === '/rest/v1/rpc/cms_save_page_draft') return Response.json({ id: 'new-draft', status: 'draft' });
    throw new Error(`Unexpected request: ${url.pathname}`);
  });
  const { default: handler } = await import('../api/cms/pages/[slug].js');
  async function request(query = {}, body, authorized = true) {
    const result = { headers: {} };
    await handler({ method: body ? 'POST' : 'GET', query: { slug: 'about', ...query },
      headers: authorized ? { authorization: 'Bearer test-session' } : {}, body }, {
      setHeader(key, value) { result.headers[key] = value; },
      status(value) { result.status = value; return this; },
      json(value) { result.body = value; return this; }
    });
    return result;
  }
  await t.test('history requires an authenticated CMS account', async () => {
    requests.length = 0;
    assert.equal((await request({ view: 'history' }, null, false)).status, 401);
    assert.equal(requests.length, 0);
  });
  await t.test('history is bounded, cursor-paginated, named and no-store', async () => {
    const result = await request({ view: 'history', before: '31' });
    assert.equal(result.status, 200);
    assert.equal(result.body.revisions.length, 20);
    assert.equal(result.body.hasMore, true);
    assert.equal(result.body.publishedRevisionId, revisionId);
    assert.equal(result.body.revisions[0].createdByName, 'Test Reviewer');
    assert.equal(result.headers['Cache-Control'], 'no-store');
    const query = requests.findLast(({ url }) => url.pathname.endsWith('cms_page_revisions')).url.searchParams;
    assert.equal(query.get('limit'), '21');
    assert.equal(query.get('revision_number'), 'lt.31');
    assert.ok(!query.get('select').includes('content'));
  });
  await t.test('invalid cursors and revision identifiers fail explicitly', async () => {
    for (const before of ['0', '-1', '1e8', '1000000000', ['1', '2']]) {
      assert.equal((await request({ view: 'history', before })).status, 422);
    }
    assert.equal((await request({ revision: '-'.repeat(36) })).status, 422);
  });
  await t.test('revision content is scoped to the requested page, with missing rows returning 404', async () => {
    assert.equal((await request({ revision: revisionId })).body.revision.id, revisionId);
    missing = true;
    assert.equal((await request({ revision: revisionId })).status, 404);
    missing = false;
  });
  await t.test('an editor cannot save advanced settings through a crafted request', async () => {
    role = 'editor';
    requests.length = 0;
    const result = await request({}, { ...defaults, fields: { ...defaults.fields, 'meta:robots': 'noindex, nofollow' } });
    assert.equal(result.status, 422);
    assert.match(result.body.fields['meta:robots'], /reviewer/);
    assert.ok(!requests.some(({ url }) => url.pathname.includes('/rpc/')));
  });
  await t.test('reviewer changes and ordinary editor copy edits can still save', async () => {
    const body = { ...defaults, fields: { ...defaults.fields, 'meta:title': 'Updated about page' } };
    assert.equal((await request({}, body)).status, 201);
    role = 'reviewer';
    body.fields['meta:robots'] = 'noindex, follow';
    assert.equal((await request({}, body)).status, 201);
  });
});
