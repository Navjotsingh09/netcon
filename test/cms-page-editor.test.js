import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../admin/pages.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../admin/pages.html', import.meta.url), 'utf8');

function editor({ role = 'reviewer', creator = 'other-user', status = 'in_review', confirm = true, respond } = {}) {
  const nodes = new Map();
  const requests = [];
  const confirmations = [];
  const storage = new Map();
  let createdNodes = 0;
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {
      hidden: false,
      disabled: false,
      value: '',
      dataset: {},
      children: [],
      attributes: {},
      classList: { add() {}, remove() {} },
      closest() { return node('closest-parent'); },
      listeners: {},
      querySelectorAll() { return []; },
      querySelector() { return null; },
      setAttribute(key, value) { this.attributes[key] = value; },
      getAttribute(key) { return this.attributes[key]; },
      append(...children) { this.children.push(...children); },
      focus() { this.focused = true; },
      scrollIntoView() {},
      showModal() { this.open = true; },
      close() { this.open = false; },
      addEventListener(event, callback) { this.listeners[event] = callback; },
      replaceChildren() { this.children = []; this.textContent = ''; }
    });
    return nodes.get(id);
  }
  const context = vm.createContext({
    document: {
      getElementById: node,
      querySelector: node,
      createElement(tag) { const result = node(`created-${++createdNodes}`); result.tagName = tag.toUpperCase(); return result; }
    },
    window: {
      addEventListener() {},
      removeEventListener() {},
      CmsDialogs: { async confirm(options) { confirmations.push(options.message); return confirm; } }
    },
    console,
    structuredClone,
    URL,
    AbortSignal,
    setTimeout() { return 1; },
    clearTimeout() {},
    sessionStorage: {
      getItem(key) { return storage.get(key) ?? null; },
      setItem(key, value) { storage.set(key, value); },
      removeItem(key) { storage.delete(key); }
    },
    fetch: async (path, options) => {
      requests.push({ path, options });
      if (respond) return respond(path, options, requests.length);
      return {
        ok: true,
        status: 200,
        json: async () => path.endsWith('/workflow')
          ? { status: 'published' }
          : { user: { id: 'reviewer-user', role }, pages: [],
              definition: { slug: 'home', title: 'Home', path: '/', dynamic: true },
              templateDefaults: { fields: {}, fieldsSchema: [], sections: [], sectionOrder: [] }, revision: null }
      };
    }
  });
  const setup = source.indexOf('  try {\n    const configResponse');
  assert.notEqual(setup, -1);
  vm.runInContext(`${source.slice(0, setup)}
    user = ${JSON.stringify({ id: 'reviewer-user', role })};
    activeRevision = ${JSON.stringify({ id: 'revision-id', status, created_by: creator })};
    activeDefinition = { slug: 'home', title: 'Home page', fields: [], sections: [] };
    savedContent = { fields: {} };
    editing = ['draft', 'changes_requested'].includes(activeRevision.status);
    globalThis.editorTest = {
      lockSession, useSession, collectContent, markDirty, contentWarnings, setBusy, openPage,
      checkChangedLinks, confirmAdvancedChanges, loadHistory, compareRevisions, previewDraft,
      setFields(fields) { retainedFields = fields; },
      setPages(value) { pages = value; },
      setAuth(auth) { supabase = { auth }; },
      api,
      state() { return { dirty, busy, editing, sessionInvalid }; }
    };
    showWorkflowActions();
    bindEvents();
  }());`, context);
  return { node, requests, confirmations, storage, hooks: context.editorTest };
}

test('reviewers can approve their own saved pages but editors cannot', () => {
  const reviewer = editor();
  assert.equal(reviewer.node('page-approve').hidden, false);
  assert.match(reviewer.node('page-workflow-help').textContent, /Saving edits creates a new draft/);

  const author = editor({ creator: 'reviewer-user' });
  assert.equal(author.node('page-approve').hidden, false);

  const writer = editor({ role: 'editor' });
  assert.equal(writer.node('page-approve').hidden, true);
  assert.match(writer.node('page-workflow-help').textContent, /account with the reviewer role/);
  for (const status of ['draft', 'changes_requested', 'in_review']) {
    assert.equal(editor({ creator: 'reviewer-user', status }).node('page-approve').hidden, false);
    assert.equal(editor({ role: 'editor', status }).node('page-approve').hidden, true);
  }
  for (const status of ['approved', 'published']) {
    assert.equal(editor({ status }).node('page-approve').hidden, true);
  }
});

test('only approved revisions expose the reviewer publish action', () => {
  for (const status of ['draft', 'in_review', 'published']) {
    assert.equal(editor({ status }).node('page-publish').hidden, true);
  }
  assert.equal(editor({ status: 'approved' }).node('page-publish').hidden, false);
  const writer = editor({ role: 'editor', status: 'approved' });
  assert.equal(writer.node('page-publish').hidden, true);
  assert.match(writer.node('page-workflow-help').textContent, /reviewer must publish/);
});

test('cancelling the shared-database publication warning performs no request', async () => {
  const app = editor({ status: 'approved', confirm: false });
  await app.node('page-publish').listeners.click();
  assert.equal(app.requests.length, 0);
  assert.match(app.confirmations[0], /Home page/);
  assert.match(app.confirmations[0], /live website and staging/);
});

test('confirmed publication sends the saved revision and reports the actual database scope', async () => {
  const app = editor({ status: 'approved' });
  await app.node('page-publish').listeners.click();
  const publication = app.requests.filter(({ path }) => path.endsWith('/workflow'));
  assert.equal(publication.length, 1);
  assert.deepEqual(JSON.parse(publication[0].options.body), {
    action: 'publish', revisionId: 'revision-id', reviewerNotes: ''
  });
  assert.match(app.node('page-save-status').textContent, /websites using this CMS database/);
  assert.equal(app.node('page-publish').hidden, true);
});

test('page editor never infers publication isolation from the deployment environment', () => {
  assert.doesNotMatch(source, /isProductionDeployment|Publish to staging|staging only/);
  assert.doesNotMatch(html, /Publish to staging/);
  assert.match(html, /id="page-publish"[^>]*>Publish approved page/);
  assert.match(html, /id="page-workflow-help"/);
});

test('published revisions are read-only until the explicit new-draft action, without an API write', () => {
  const app = editor({ status: 'published' });
  assert.equal(app.node('page-editable-fields').disabled, true);
  assert.equal(app.node('page-new-draft').hidden, false);
  assert.equal(app.node('#page-form button[type="submit"]').hidden, true);
  app.node('page-new-draft').listeners.click();
  assert.equal(app.node('page-editable-fields').disabled, false);
  assert.equal(app.node('page-new-draft').hidden, true);
  assert.equal(app.node('#page-form button[type="submit"]').hidden, false);
  assert.equal(app.requests.length, 0);
});

test('decorative and non-rendered values survive content collection', () => {
  const app = editor({ status: 'draft' });
  app.hooks.setFields({ 't:button[1]#0': '+', 'meta:schema': '{"@type":"WebPage"}' });
  assert.equal(app.hooks.collectContent().fields['t:button[1]#0'], '+');
  assert.equal(app.hooks.collectContent().fields['meta:schema'], '{"@type":"WebPage"}');
});

test('expiry preserves a user-scoped draft and blocks actions until sign-in', async () => {
  const app = editor({ status: 'draft' });
  app.hooks.setFields({ 'meta:title': 'Unsaved title' });
  app.hooks.markDirty();
  app.hooks.lockSession();
  assert.equal(app.node('pages-auth').hidden, false);
  assert.equal(app.node('pages-sign-out').hidden, true);
  assert.equal(app.node('page-editable-fields').disabled, true);
  assert.equal(app.node('page-approve').disabled, true);
  const recovery = JSON.parse(app.storage.get('netcon-page-draft:reviewer-user:home'));
  assert.equal(recovery.content.fields['meta:title'], 'Unsaved title');
  await assert.rejects(app.hooks.api('/api/cms/pages'), /Sign in again/);
  assert.equal(app.requests.length, 0);
  app.hooks.useSession({ access_token: 'fresh-session' });
  assert.equal(app.node('page-editable-fields').disabled, false);
  assert.equal(app.hooks.state().dirty, true);
});

test('a session check during an in-flight API action does not re-enable busy controls', async () => {
  const app = editor({ status: 'draft' });
  app.hooks.setAuth({ getSession: async () => ({ data: { session: { access_token: 'fresh-session' } } }) });
  app.hooks.setBusy(true);
  await app.hooks.api('/api/cms/pages');
  assert.equal(app.node('page-editable-fields').disabled, true);
  assert.equal(app.hooks.state().busy, true);
});

test('opening a page releases busy state and enables draft controls', async () => {
  const app = editor({ status: 'draft' });
  await app.hooks.openPage('home');
  assert.equal(app.hooks.state().busy, false);
  assert.equal(app.node('page-editable-fields').disabled, false);
  assert.equal(app.node('page-preview').disabled, false);
  assert.equal(app.node('pages-notice').hidden, true);
  assert.equal(app.requests.length, 1);
});

test('heading checks distinguish invalid and valid heading outlines', () => {
  const app = editor({ status: 'draft' });
  app.hooks.setFields({ 'heading:a': 'h1', 'heading:b': 'h1', 'heading:c': 'h4' });
  assert.equal(app.hooks.contentWarnings().length, 2);
  app.hooks.setFields({ 'heading:a': 'h1', 'heading:b': 'h2', 'heading:c': 'h3' });
  assert.equal(app.hooks.contentWarnings().length, 0);
});

test('link picker validation normalizes registered paths and checks unknown internal links', async () => {
  const app = editor({ status: 'draft' });
  app.hooks.setPages([{ path: '/about.html' }, { path: '/services/index.html' }]);
  app.hooks.setFields({ 'u:a': '/about', 'u:b': '/services/', 'u:c': 'https://network-consultancy.com/resources/blogs', 'u:d': 'https://external.example/blog' });
  await app.hooks.checkChangedLinks();
  assert.equal(app.requests.length, 1);
  assert.equal(app.requests[0].path, '/resources/blogs');
  assert.equal(app.requests[0].options.method, 'HEAD');
});

test('broken internal links require confirmation and cancelling prevents a save', async () => {
  const app = editor({ status: 'draft', confirm: false, respond: async () => ({ ok: false, status: 404 }) });
  app.hooks.setFields({ 'u:a': '/missing-page' });
  await assert.rejects(app.hooks.checkChangedLinks(), /Check the internal links/);
  assert.match(app.confirmations[0], /HTTP 404/);
});

test('advanced changes cannot proceed when their confirmation is declined', async () => {
  const app = editor({ status: 'draft', confirm: false });
  app.hooks.setFields({ 'meta:robots': 'noindex, nofollow' });
  await assert.rejects(app.hooks.confirmAdvancedChanges(), /not confirmed/);
  assert.match(app.confirmations[0], /search engines to hide this page/);
  assert.equal(app.requests.length, 0);
});

test('expired API token refreshes once, then retries with the new token', async () => {
  const app = editor({ status: 'draft', respond: async (path, options, call) => ({
    ok: call > 1, status: call > 1 ? 200 : 401, json: async () => ({ success: true })
  }) });
  let refreshes = 0;
  app.hooks.setAuth({
    getSession: async () => ({ data: { session: { access_token: 'old-token' } } }),
    refreshSession: async () => { refreshes++; return { data: { session: { access_token: 'new-token' } } }; }
  });
  await app.hooks.api('/api/cms/pages');
  assert.equal(refreshes, 1);
  assert.equal(app.requests.length, 2);
  assert.equal(app.requests[0].options.headers.Authorization, 'Bearer old-token');
  assert.equal(app.requests[1].options.headers.Authorization, 'Bearer new-token');
});

test('history and diff read revisions without replacing unsaved editor values', async () => {
  const app = editor({ status: 'draft', respond: async (path) => ({
    ok: true, status: 200, json: async () => path.includes('view=history')
      ? { revisions: [{ id: 'old-id', revision_number: 1, status: 'published', created_by: 'reviewer-user', updated_at: '2026-10-27T09:00:00Z' }], publishedRevisionId: 'old-id', hasMore: false }
      : { revision: { content: { fields: { 'meta:title': 'Saved title' }, sectionOrder: [] } } }
  }) });
  app.hooks.setFields({ 'meta:title': 'Unsaved title' });
  app.hooks.markDirty();
  await app.hooks.loadHistory();
  assert.equal(app.node('page-history-dialog').open, true);
  assert.match(app.node('page-history-list').children[0].textContent, /CURRENTLY LIVE/);
  await app.hooks.compareRevisions();
  const diff = app.node('page-diff').children[0];
  assert.equal(diff.children[1].textContent, 'Before:\nSaved title');
  assert.equal(diff.children[2].textContent, 'After:\nUnsaved title');
  assert.equal(app.hooks.collectContent().fields['meta:title'], 'Unsaved title');
  assert.equal(app.hooks.state().dirty, true);
});

test('a late preview response cannot overwrite a newer preview', async () => {
  let resolveFirst;
  const app = editor({ respond: (path, options, call) => call === 1
    ? new Promise((resolve) => { resolveFirst = resolve; })
    : Promise.resolve({ ok: true, text: async () => '<h1>Newer preview</h1>' }) });
  const first = app.hooks.previewDraft();
  await app.hooks.previewDraft();
  resolveFirst({ ok: true, text: async () => '<h1>Stale preview</h1>' });
  await first;
  assert.equal(app.node('page-preview-frame').srcdoc, '<h1>Newer preview</h1>');
});
