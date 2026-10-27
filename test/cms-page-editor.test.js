import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../admin/pages.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../admin/pages.html', import.meta.url), 'utf8');

function editor({ role = 'reviewer', creator = 'other-user', status = 'in_review', confirm = true } = {}) {
  const nodes = new Map();
  const requests = [];
  const confirmations = [];
  function node(id) {
    if (!nodes.has(id)) nodes.set(id, {
      hidden: false,
      disabled: false,
      value: '',
      dataset: {},
      listeners: {},
      addEventListener(event, callback) { this.listeners[event] = callback; },
      replaceChildren() {}
    });
    return nodes.get(id);
  }
  const context = vm.createContext({
    document: {
      getElementById: node,
      querySelector: node
    },
    window: {
      addEventListener() {},
      removeEventListener() {},
      confirm(message) { confirmations.push(message); return confirm; }
    },
    fetch: async (path, options) => {
      requests.push({ path, options });
      return {
        ok: true,
        status: 200,
        json: async () => path.endsWith('/workflow')
          ? { status: 'published' }
          : { user: { id: 'reviewer-user', role }, pages: [] }
      };
    }
  });
  const setup = source.indexOf('  try {\n    const configResponse');
  assert.notEqual(setup, -1);
  vm.runInContext(`${source.slice(0, setup)}
    user = ${JSON.stringify({ id: 'reviewer-user', role })};
    activeRevision = ${JSON.stringify({ id: 'revision-id', status, created_by: creator })};
    activeDefinition = { slug: 'home', title: 'Home page' };
    showWorkflowActions();
    bindEvents();
  }());`, context);
  return { node, requests, confirmations };
}

test('only a different reviewer can approve an in-review page', () => {
  const reviewer = editor();
  assert.equal(reviewer.node('page-approve').hidden, false);
  assert.match(reviewer.node('page-workflow-help').textContent, /Saving edits creates a new draft/);

  const author = editor({ creator: 'reviewer-user' });
  assert.equal(author.node('page-approve').hidden, true);
  assert.match(author.node('page-workflow-help').textContent, /cannot approve your own/);

  const writer = editor({ role: 'editor' });
  assert.equal(writer.node('page-approve').hidden, true);
  assert.match(writer.node('page-workflow-help').textContent, /separate account with the reviewer role/);
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
  assert.match(app.confirmations[0], /BOTH will change/);
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
