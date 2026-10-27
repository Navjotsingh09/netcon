import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { getCmsPageDefinition } from '../lib/cms/pages.js';
import { describePageTemplate, readPageTemplate, renderPageContent } from '../lib/cms/page-renderer.js';

// Local, in-memory UI fixture: never connects to Supabase or publishes real content.
const root = process.cwd();
const definition = getCmsPageDefinition('about');
const template = await readPageTemplate(definition);
const defaults = describePageTemplate(template, definition);
const oldId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const newId = 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee';
let revisions = [{ id: oldId, revision_number: 1, status: 'published',
  content: defaults, created_by: 'fixture-user', updated_at: '2026-10-27T09:00:00Z' }];
let published = oldId;
const authScript = `
(() => {
  const session = () => ({ access_token: localStorage.getItem('test-role') === 'editor' ? 'editor-token' : 'reviewer-token',
    expires_at: Math.floor(Date.now()/1000)+3600, user: { id: 'fixture-auth' } });
  let current = session();
  let notify = () => {};
  const auth = {
    async getSession() { return { data: { session: current }, error: null }; },
    async refreshSession() { return { data: { session: current }, error: null }; },
    onAuthStateChange(callback) { notify = callback; return { data: { subscription: { unsubscribe() {} } } }; },
    async signInWithPassword() { current = session(); notify('SIGNED_IN', current); return { data: { session: current, user: current.user }, error: null }; },
    async signOut() { current = null; notify('SIGNED_OUT', null); return { error: null }; }
  };
  window.__cmsTestAuth = { expire() { current = null; notify('SIGNED_OUT', null); } };
  window.supabase = { createClient() { return { auth }; } };
})();
`;

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const path = url.pathname;
    const role = request.headers.authorization === 'Bearer editor-token' ? 'editor' : 'reviewer';
    const user = { id: 'fixture-user', supabase_user_id: 'fixture-auth', role, display_name: 'Local test user' };
    const json = (data, status = 200) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(data)); };
    if (path === '/__supabase.js') {
      response.writeHead(200, { 'Content-Type': 'text/javascript' }); response.end(authScript); return;
    }
    if (path === '/api/cms/config') return json({ configured: true, supabaseUrl: 'https://test.invalid', publishableKey: 'fixture' });
    if (path === '/api/cms/pages') return json({ user, pages: [
      { ...definition, status: revisions.at(-1).status },
      { slug: 'services', title: 'Services', path: '/services/index.html', status: 'draft' }
    ] });
    if (path.startsWith('/api/cms/pages/about')) {
      if (request.method === 'GET') {
        if (url.searchParams.get('view') === 'history') return json({ revisions, hasMore: false, publishedRevisionId: published });
        if (url.searchParams.has('revision')) return json({ revision: revisions.find((row) => row.id === url.searchParams.get('revision')) });
        return json({ user, definition, templateDefaults: defaults, revision: revisions.at(-1), publishedRevisionId: published });
      }
      let raw = '';
      for await (const chunk of request) raw += chunk;
      const body = JSON.parse(raw);
      if (path.endsWith('/preview')) {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(renderPageContent(template, definition, body, { preview: true })); return;
      }
      if (path.endsWith('/workflow')) {
        const revision = revisions.find((row) => row.id === body.revisionId);
        if (body.action === 'publish') { revision.status = 'published'; published = revision.id; return json({ status: 'published' }); }
        revision.status = { approve: 'approved', submit_for_review: 'in_review', request_changes: 'changes_requested' }[body.action];
        return json({ revision });
      }
      revisions.push({ id: newId, revision_number: revisions.length + 1, content: body, status: 'draft',
        created_by: user.id, updated_at: new Date().toISOString() });
      return json({ revision: revisions.at(-1) }, 201);
    }
    const filename = resolve(root, `.${path === '/' ? '/admin/pages.html' : path}`);
    const publicPath = filename.startsWith(`${root}${sep}`) &&
      (/^\/(?:admin|images|css|js)\//.test(path) || path === '/');
    if (!publicPath) { response.writeHead(404); response.end('Fixture route not found'); return; }
    let data = await readFile(filename);
    if (path === '/admin/pages.js') data = data.toString().replace('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.109.0', '/__supabase.js');
    const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
    response.writeHead(200, { 'Content-Type': types[extname(filename)] || 'application/octet-stream' });
    response.end(data);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 500);
    response.end(error.message);
  }
});
server.listen(0, '127.0.0.1', () => console.log(`CMS UI fixture: http://127.0.0.1:${server.address().port}/admin/pages.html`));
