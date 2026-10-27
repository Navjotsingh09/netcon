import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDocument, DomUtils } from 'htmlparser2';
import { CMS_PAGE_DEFINITIONS, getCmsPageDefinition, validatePageContent } from '../lib/cms/pages.js';
import { describePageTemplate, readPageTemplate, renderPageContent, loadPublishedPage } from '../lib/cms/page-renderer.js';

const definition = getCmsPageDefinition('about');
const fixture = `<!doctype html><html lang="en"><head>
<title>Original</title><meta name="description" content="Original description">
<link rel="canonical" href="https://network-consultancy.com/about">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"Original"}</script>
<script src="/js/page-cms.js" defer></script><script src="/js/animations.js" defer></script>
</head><body><main><section><h2 class="section-title">Existing <strong>heading</strong></h2>
<p>Before <a href="/old">original link</a> after</p>
<picture><source type="image/webp" srcset="/old.webp"><img src="/old.jpg" alt="Old image"></picture>
<form action="/send"><input name="email"><button>Send</button></form>
</section></main></body></html>`;

function select(html, predicate) {
  return DomUtils.findAll(predicate, parseDocument(html).children);
}

test('published SEO, headings, text, links and pictures are in raw HTML', () => {
  const content = describePageTemplate(fixture, definition);
  Object.assign(content.fields, {
    'meta:title': 'Updated & reviewed',
    'meta:description': 'Updated description',
    'meta:canonical': 'https://network-consultancy.com/new-canonical',
    'meta:robots': 'noindex, follow',
    'meta:schema': '{"@context":"https://schema.org","@type":"WebPage","name":"Updated"}',
    't:section[1]/p[1]#0': 'Updated before ',
    'u:section[1]/p[1]/a[1]': '/contact',
    'heading:section[1]/h2[1]': 'h3',
    'src:section[1]/picture[1]/img[1]': '/new.jpg',
    'alt:section[1]/picture[1]/img[1]': 'New descriptive alternative'
  });
  const html = renderPageContent(fixture, definition, content);
  assert.equal(DomUtils.textContent(select(html, (node) => node.name === 'title')[0]), 'Updated & reviewed');
  assert.equal(select(html, (node) => node.name === 'meta' && node.attribs.name === 'description')[0].attribs.content, 'Updated description');
  assert.equal(select(html, (node) => node.name === 'link')[0].attribs.href, 'https://network-consultancy.com/new-canonical');
  assert.equal(select(html, (node) => node.name === 'h3')[0].attribs.class, 'section-title');
  assert.equal(select(html, (node) => node.name === 'strong').length, 1);
  assert.equal(select(html, (node) => node.name === 'a')[0].attribs.href, '/contact');
  assert.equal(select(html, (node) => node.name === 'img')[0].attribs.alt, 'New descriptive alternative');
  assert.equal(select(html, (node) => node.name === 'img')[0].attribs.src, '/new.jpg');
  assert.equal(select(html, (node) => node.name === 'source').length, 0);
  const schemas = select(html, (node) => node.name === 'script' && node.attribs.type === 'application/ld+json');
  assert.equal(schemas.length, 1);
  assert.equal(JSON.parse(DomUtils.textContent(schemas[0])).name, 'Updated');
  assert.ok(!html.includes('/js/page-cms.js'));
  assert.ok(html.includes('/js/animations.js'));
});

test('preview uses the same transformed content and disables scripts and submissions', () => {
  const content = describePageTemplate(fixture, definition);
  content.fields['meta:title'] = 'Preview title';
  const html = renderPageContent(fixture, definition, content, { preview: true });
  assert.equal(DomUtils.textContent(select(html, (node) => node.name === 'title')[0]), 'Preview title');
  assert.equal(select(html, (node) => node.name === 'script' && node.attribs.type !== 'application/ld+json').length, 0);
  assert.ok(!('action' in select(html, (node) => node.name === 'form')[0].attribs));
  assert.ok('disabled' in select(html, (node) => node.name === 'input')[0].attribs);
  assert.equal(select(html, (node) => node.name === 'base')[0].attribs.href, '/about.html');
});

test('preview block markers survive heading changes and never leak into public rendering', () => {
  const content = describePageTemplate(fixture, definition);
  content.fields['heading:section[1]/h2[1]'] = 'h1';
  const preview = renderPageContent(fixture, definition, content, { preview: true });
  const heading = select(preview, (node) => node.name === 'h1')[0];
  assert.deepEqual(JSON.parse(heading.attribs['data-page-editor-fields']),
    ['t:section[1]/h2[1]#0', 'heading:section[1]/h2[1]']);
  const image = select(preview, (node) => node.name === 'img')[0];
  assert.ok(JSON.parse(image.attribs['data-page-editor-fields']).includes('src:section[1]/picture[1]/img[1]'));
  assert.ok(!renderPageContent(fixture, definition, content).includes('data-page-editor-fields'));
});

test('same-origin preview still removes embedded browsing contexts, refresh and event handlers', () => {
  const unsafe = fixture.replace('<p>Before', '<iframe src="/admin"></iframe><object data="/admin"></object><embed src="/admin"><p onmouseover="alert(1)">Before')
    .replace('<title>', '<meta http-equiv="refresh" content="0;url=/admin"><title>');
  const preview = renderPageContent(unsafe, definition, describePageTemplate(unsafe, definition), { preview: true });
  assert.equal(select(preview, (node) => ['iframe', 'object', 'embed'].includes(node.name)).length, 0);
  assert.ok(!preview.includes('onmouseover'));
  assert.equal(select(preview, (node) => node.name === 'meta' && node.attribs['http-equiv'] === 'refresh').length, 0);
  assert.match(select(preview, (node) => node.name === 'meta' && node.attribs['http-equiv'] === 'Content-Security-Policy')[0].attribs.content, /script-src 'none'/);
});

test('glyph-only copy remains in the content contract but is marked decorative for editor presentation', () => {
  const html = fixture.replace('<p>Before', '<button>‹</button><button>+</button><p>Before');
  const content = describePageTemplate(html, definition);
  const decorative = content.fieldsSchema.filter((field) => field.decorative);
  assert.equal(decorative.length, 2);
  assert.deepEqual(decorative.map((field) => content.fields[field.key]), ['‹', '+']);
  assert.ok(content.fieldsSchema.filter((field) => field.key.startsWith('t:') && field.label.startsWith('Heading:')).every((field) => field.type === 'text'));
  assert.deepEqual(select(renderPageContent(html, definition, content), (node) => node.name === 'button')
    .slice(0, 2).map((node) => DomUtils.textContent(node)), ['‹', '+']);
});

test('all registered pages expose valid defaults and can be server-rendered', async () => {
  assert.equal(CMS_PAGE_DEFINITIONS.length, 42);
  for (const page of CMS_PAGE_DEFINITIONS) {
    const template = await readPageTemplate(page);
    const content = describePageTemplate(template, page);
    assert.deepEqual(validatePageContent(page, content).errors, {}, page.slug);
    const rendered = renderPageContent(template, page, content);
    assert.ok(rendered.includes('<main'), page.slug);
    assert.ok(rendered.includes('/js/animations.js'), page.slug);
    assert.ok(content.fieldsSchema.some((field) => field.key === 'meta:canonical'), page.slug);
    assert.ok(content.fieldsSchema.some((field) => field.key === 'meta:schema'), page.slug);
  }
});

test('changing one heading does not invalidate paths to another heading', () => {
  const html = fixture.replace('<p>Before', '<h2>Second heading</h2><p>Before');
  const content = describePageTemplate(html, definition);
  content.fields['heading:section[1]/h2[1]'] = 'h1';
  content.fields['t:section[1]/h2[2]#0'] = 'Second updated';
  const rendered = renderPageContent(html, definition, content);
  assert.match(rendered, /<h2>Second updated<\/h2>/);
  assert.match(rendered, /<h1 class="section-title">/);
});

test('unsafe URLs, invalid schema, headings and self redirects fail explicitly', () => {
  for (const [key, value] of [
    ['meta:canonical', 'javascript:alert(1)'],
    ['meta:canonical', 'https://example.com/#fragment'],
    ['meta:redirect', '//external.example/path'],
    ['meta:redirect', '/about'],
    ['meta:redirectStatus', '200'],
    ['meta:schema', '{"broken":'],
    ['meta:schema', 'null'],
    ['src:section[1]/picture[1]/img[1]', 'data:text/html,bad'],
    ['heading:section[1]/h2[1]', 'script']
  ]) {
    const content = describePageTemplate(fixture, definition);
    content.fields[key] = value;
    assert.ok(validatePageContent(definition, content).errors[key], key);
    assert.throws(() => renderPageContent(fixture, definition, content), /Invalid page content/, key);
  }
});

test('JSON-LD cannot close its script element and inject active markup', () => {
  const content = describePageTemplate(fixture, definition);
  content.fields['meta:schema'] = JSON.stringify({ '@type': 'WebPage', name: '</script><script>alert(1)</script>' });
  const html = renderPageContent(fixture, definition, content);
  assert.ok(!html.includes('</script><script>alert(1)'));
  const schema = select(html, (node) => node.name === 'script' && node.attribs.type === 'application/ld+json')[0];
  assert.equal(JSON.parse(DomUtils.textContent(schema)).name, '</script><script>alert(1)</script>');
});

test('stale page fields are rejected instead of reporting a successful no-op', () => {
  const content = describePageTemplate(fixture, definition);
  content.fields['t:section[1]/p[99]#0'] = 'Missing target';
  assert.throws(() => renderPageContent(fixture, definition, content), /template changed/);
});

test('blank schema removes old page schema and unchanged image preserves picture sources', () => {
  const content = describePageTemplate(fixture, definition);
  content.fields['meta:schema'] = '';
  const html = renderPageContent(fixture, definition, content);
  assert.equal(select(html, (node) => node.name === 'script' && node.attribs.type === 'application/ld+json').length, 0);
  assert.equal(select(html, (node) => node.name === 'source').length, 1);
});

test('published loader follows only the approved published pointer, never latest draft', async () => {
  const calls = [];
  const client = {
    from(table) {
      calls.push(table);
      return {
        select() { return this; },
        eq(key, value) { calls.push([key, value]); return this; },
        async maybeSingle() {
          return table === 'cms_pages'
            ? { data: { id: 'page-id', published_revision_id: 'published-id' }, error: null }
            : { data: { id: 'published-id', content: {} }, error: null };
        }
      };
    }
  };
  assert.equal((await loadPublishedPage(client, 'about')).id, 'published-id');
  assert.ok(calls.some((call) => Array.isArray(call) && call[0] === 'id' && call[1] === 'published-id'));
  assert.ok(calls.some((call) => Array.isArray(call) && call[0] === 'status' && call[1] === 'published'));
});

test('live homepage text edits preserve existing markup and section order', async () => {
  const home = getCmsPageDefinition('home');
  const template = await readPageTemplate(home);
  const content = describePageTemplate(template, home);
  const originalBreaks = select(template, (node) => node.name === 'br').length;
  const key = content.fieldsSchema.find((field) => field.key.startsWith('t:') && field.key.includes('/h1[')).key;
  content.fields[key] = 'Reviewed homepage heading';
  const html = renderPageContent(template, home, content);
  assert.equal(select(html, (node) => node.name === 'br').length, originalBreaks);
  assert.ok(html.includes('Reviewed homepage heading'));
  assert.deepEqual(content.sectionOrder, []);
  assert.equal(select(html, (node) => node.name === 'section').length, select(template, (node) => node.name === 'section').length);
});

test('templates without editable main content explicitly warn the editor', async () => {
  const page = getCmsPageDefinition('contact-form');
  const defaults = describePageTemplate(await readPageTemplate(page), page);
  assert.ok(defaults.warnings.some((warning) => warning.includes('no editable main-page content')));
});

test('normalizing a relative image URL does not discard its unchanged responsive sources', () => {
  const template = fixture.replace('src="/old.jpg"', 'src="images/old photo.jpg"');
  const content = describePageTemplate(template, definition);
  assert.equal(content.fields['src:section[1]/picture[1]/img[1]'], '/images/old%20photo.jpg');
  const html = renderPageContent(template, definition, content);
  assert.equal(select(html, (node) => node.name === 'source').length, 1);
});
