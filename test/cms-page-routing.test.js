import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import middleware from '../middleware.js';
import { CMS_PAGE_DEFINITIONS, pageRoutePaths } from '../lib/cms/pages.js';

test('every managed path rewrites to its server renderer before filesystem lookup', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.proxy.entrypoint, 'middleware.js');
  const paths = CMS_PAGE_DEFINITIONS.flatMap(pageRoutePaths);
  assert.equal(new Set(paths).size, paths.length);
  assert.deepEqual(config.proxy.matcher, paths);
  for (const page of CMS_PAGE_DEFINITIONS) {
    for (const path of pageRoutePaths(page)) {
      const result = middleware(new Request(`https://netcon-ivory.vercel.app${path}?utm_source=test&page=wrong`));
      const destination = new URL(result.headers.get('x-middleware-rewrite'));
      assert.equal(destination.origin, 'https://netcon-ivory.vercel.app');
      assert.equal(destination.pathname, '/api/public/site');
      assert.equal(destination.searchParams.get('page'), page.slug);
      assert.equal(destination.searchParams.get('utm_source'), 'test');
    }
  }
});

test('assets, CMS endpoints and blogs never enter the page renderer', () => {
  for (const path of ['/css/global.css', '/js/animations.js', '/api/public/site', '/api/cms/pages', '/admin/pages.html', '/resources/blogs', '/resources/blogs/article', '/missing-page']) {
    const result = middleware(new Request(`https://network-consultancy.com${path}`));
    assert.equal(result.headers.get('x-middleware-next'), '1', path);
    assert.equal(result.headers.has('x-middleware-rewrite'), false, path);
  }
});
