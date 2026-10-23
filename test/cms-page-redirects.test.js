import assert from 'node:assert/strict';
import test from 'node:test';
import { getCmsPageDefinition, normalizePagePath, validatePageContent } from '../lib/cms/pages.js';
import { resolvePageRedirect } from '../lib/cms/page-redirects.js';

const content = (destination = '', status = '308') => ({
  fields: { 'meta:redirect': destination, 'meta:redirectStatus': status },
  sectionOrder: []
});

function publishedClient(pages) {
  return {
    from(table) {
      const filters = {};
      return {
        select() { return this; },
        eq(key, value) { filters[key] = value; return this; },
        async maybeSingle() {
          if (table === 'cms_pages') {
            return { data: pages[filters.slug] ? { id: filters.slug, published_revision_id: filters.slug } : null };
          }
          return { data: { id: filters.id, content: pages[filters.id] } };
        }
      };
    }
  };
}

test('registered page URL aliases normalize consistently', () => {
  assert.equal(normalizePagePath('/about.html'), '/about');
  assert.equal(normalizePagePath('/about/'), '/about');
  assert.equal(normalizePagePath('/services/index.html'), '/services');
  assert.equal(normalizePagePath('/index.html'), '/');
  assert.equal(normalizePagePath('/contact/../about'), '/about');
});

test('self redirects are rejected through .html and trailing slash aliases', () => {
  const definition = getCmsPageDefinition('about');
  for (const target of ['/about', '/about.html', '/about/', '/contact/../about']) {
    assert.ok(validatePageContent(definition, content(target)).errors['meta:redirect'], target);
  }
});

test('disabled redirect does not query the database', async () => {
  assert.equal(await resolvePageRedirect(null, getCmsPageDefinition('about'), content()), null);
});

test('direct redirect preserves the selected status and path', async () => {
  for (const status of ['301', '302', '307', '308']) {
    assert.deepEqual(await resolvePageRedirect(publishedClient({}), getCmsPageDefinition('about'), content('/contact', status)), {
      destination: '/contact', status: Number(status)
    });
  }
});

test('known published redirect chains resolve to their final destination', async () => {
  const client = publishedClient({ contact: content('/services'), services: content('/solutions'), solutions: content() });
  assert.deepEqual(await resolvePageRedirect(client, getCmsPageDefinition('about'), content('/contact', '301')), {
    destination: '/solutions', status: 301
  });
});

test('published redirect chains reject loops and unsafe downstream content', async () => {
  await assert.rejects(resolvePageRedirect(publishedClient({ contact: content('/about.html') }), getCmsPageDefinition('about'), content('/contact')), /loop/);
  await assert.rejects(resolvePageRedirect(publishedClient({ contact: content('//external.example') }), getCmsPageDefinition('about'), content('/contact')), /Invalid redirect page content/);
  await assert.rejects(resolvePageRedirect(publishedClient({ contact: content('/services', '999') }), getCmsPageDefinition('about'), content('/contact')), /Invalid redirect page content/);
});
