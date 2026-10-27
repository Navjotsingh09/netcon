import test from 'node:test';
import assert from 'node:assert/strict';

test('blog review and scheduling allow reviewer-owned revisions but reject editor accounts', async (t) => {
  const names = ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const original = names.map((name) => process.env[name]);
  process.env.SUPABASE_URL = 'https://review-workflow-test.example';
  process.env.SUPABASE_PUBLISHABLE_KEY = 'test-publishable';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service';
  t.after(() => names.forEach((name, index) => {
    if (original[index] === undefined) delete process.env[name];
    else process.env[name] = original[index];
  }));
  let role = 'reviewer';
  let eligible = true;
  const writes = [];
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const url = new URL(input);
    if (url.pathname === '/auth/v1/user') {
      return Response.json({ id: 'auth-user', aud: 'authenticated', role: 'authenticated' });
    }
    if (url.pathname === '/rest/v1/cms_users') {
      return Response.json({ id: 'cms-user', role });
    }
    assert.ok(options?.method === 'PATCH' || options?.method === 'POST');
    const body = JSON.parse(options.body);
    writes.push({ path: url.pathname, url, body });
    if (url.pathname === '/rest/v1/blog_audit_events') return new Response(null, { status: 201 });
    assert.equal(url.pathname, '/rest/v1/blog_revisions');
    assert.equal(url.searchParams.get('id'), 'eq.revision-id');
    assert.equal(url.searchParams.has('created_by'), false);
    return Response.json(eligible
      ? { id: 'revision-id', post_id: 'post-id', status: body.status, created_by: 'cms-user', scheduled_for: body.scheduled_for }
      : null);
  });
  const { default: workflow } = await import('../api/cms/revisions/[revisionId]/workflow.js');
  const { default: schedule } = await import('../api/cms/revisions/[revisionId]/schedule.js');
  async function request(handler, body) {
    const result = {};
    await handler({
      method: 'POST', headers: { authorization: 'Bearer test-token' },
      query: { revisionId: 'revision-id' }, body
    }, {
      setHeader() {},
      status(value) { result.status = value; return this; },
      json(body) { result.body = body; return this; }
    });
    return result;
  }
  await t.test('reviewer self approval records reviewer identity and audit', async () => {
    const result = await request(workflow, { action: 'approve', reviewerNotes: 'Reviewed own draft' });
    assert.equal(result.status, 200);
    assert.equal(result.body.revision.createdBy, 'cms-user');
    const update = writes.find(({ path }) => path.endsWith('blog_revisions'));
    assert.equal(update.url.searchParams.get('status'), 'in.(draft,changes_requested,in_review)');
    assert.equal(update.body.reviewed_by, 'cms-user');
    assert.ok(writes.some(({ body }) => body.action === 'approved' && body.actor_id === 'cms-user'));
  });
  await t.test('reviewer can request changes on their own in-review revision', async () => {
    writes.length = 0;
    assert.equal((await request(workflow, { action: 'request_changes' })).status, 200);
    assert.equal(writes[0].url.searchParams.get('status'), 'in.(in_review)');
  });
  await t.test('reviewer can schedule their own approved revision', async () => {
    writes.length = 0;
    assert.equal((await request(schedule, { scheduledFor: '2099-01-01T12:00:00Z' })).status, 200);
    assert.equal(writes[0].url.searchParams.get('status'), 'eq.approved');
    assert.equal(writes[0].body.reviewed_by, 'cms-user');
  });
  await t.test('editors cannot approve or schedule', async () => {
    role = 'editor';
    writes.length = 0;
    assert.equal((await request(workflow, { action: 'approve' })).status, 403);
    assert.equal((await request(schedule, { scheduledFor: '2099-01-01T12:00:00Z' })).status, 403);
    assert.equal(writes.length, 0);
  });
  await t.test('ineligible revisions return a conflict without recording success', async () => {
    role = 'reviewer';
    eligible = false;
    writes.length = 0;
    assert.equal((await request(workflow, { action: 'approve' })).status, 409);
    assert.equal((await request(schedule, { scheduledFor: '2099-01-01T12:00:00Z' })).status, 409);
    assert.ok(writes.every(({ path }) => path === '/rest/v1/blog_revisions'));
  });
});
