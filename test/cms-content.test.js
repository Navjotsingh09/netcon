import assert from 'node:assert/strict';
import test from 'node:test';
import { DomUtils, parseDocument } from 'htmlparser2';
import { cleanMalformedEmptyLinks, sanitizeArticleHtml, validateRevisionInput } from '../lib/cms/content.js';

test('loose article text and inline links form a single paragraph between headings', () => {
  assert.equal(
    sanitizeArticleHtml('<h2>Connectivity</h2>Calls break up. <a href="https://example.com">Check coverage</a> first.<h3>Equipment</h3>Check the router.'),
    '<h2>Connectivity</h2><p>Calls break up. <a href="https://example.com" rel="noopener noreferrer">Check coverage</a> first.</p><h3>Equipment</h3><p>Check the router.</p>'
  );
});

test('editor divs retain separate paragraph boundaries, including nested containers', () => {
  assert.equal(
    sanitizeArticleHtml('Introduction<div>First <strong>paragraph</strong>.</div><div><h2>Heading</h2>Second<div>Third<br>line.</div></div>Conclusion'),
    '<p>Introduction</p><p>First <strong>paragraph</strong>.</p><h2>Heading</h2><p>Second</p><p>Third<br>line.</p><p>Conclusion</p>'
  );
});

test('existing blocks, inline formatting, lists, quotes, images and CTAs are preserved', () => {
  const html = '<p>Existing &amp; <em>formatted</em> text.</p><p><br></p><blockquote>Quotation</blockquote><ul><li>One</li><li><div>Two</div></li></ul><ol><li>Three</li></ol><img src="/image.jpg" alt="Example"><a class="article-cta" href="/contact.html">Contact us</a>';
  const result = sanitizeArticleHtml(html);
  assert.equal(result, '<p>Existing &amp; <em>formatted</em> text.</p><p><br></p><blockquote>Quotation</blockquote><ul><li>One</li><li><p>Two</p></li></ul><ol><li>Three</li></ol><img src="/image.jpg" alt="Example"><p><a class="article-cta" href="/contact.html" rel="noopener noreferrer">Contact us</a></p>');
  assert.equal(sanitizeArticleHtml(result), result);
});

test('paragraph normalisation does not reintroduce unsafe tags or attributes', () => {
  const result = sanitizeArticleHtml('<div onclick="alert(1)">Safe<script>alert(1)</script><a href="javascript:alert(1)" style="color:red"> link</a></div>');
  assert.equal(result, '<p>Safe<a rel="noopener noreferrer"> link</a></p>');
  assert.equal(sanitizeArticleHtml(' \n<script>alert(1)</script>'), '');
});

test('revision validation stores paragraphs and still rejects empty content', () => {
  const input = { title: 'Title', excerpt: 'Excerpt', category: 'Networks', articleHtml: '<div>First.</div><div>Second.</div>' };
  const result = validateRevisionInput(input);
  assert.deepEqual(result.errors, {});
  assert.equal(result.revision.articleHtml, '<p>First.</p><p>Second.</p>');
  assert.ok(validateRevisionInput({ ...input, articleHtml: '<script>alert(1)</script>' }).errors.articleHtml);
});

test('legacy malformed-link cleanup remains compatible with paragraphs', () => {
  assert.equal(
    sanitizeArticleHtml(cleanMalformedEmptyLinks('Text [](https://example.com)<a href="https://example.com">link</a>.')),
    '<p>Text <a href="https://example.com" rel="noopener noreferrer">link</a>.</p>'
  );
});

test('public article response wraps legacy saved text without a database rewrite', async (t) => {
  const originalEnv = { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY };
  process.env.SUPABASE_URL = 'https://cms-test.example';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  t.after(() => {
    for (const [name, value] of [['SUPABASE_URL', originalEnv.url], ['SUPABASE_SERVICE_ROLE_KEY', originalEnv.key]]) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
  const legacyHtml = '<h2>Connectivity</h2>First <a href="https://example.com">link</a>.<div>Second paragraph.</div>';
  t.mock.method(globalThis, 'fetch', async (url) => {
    const path = new URL(url).pathname;
    if (path === '/rest/v1/blog_posts') return Response.json({ id: 'test-post', public_slug: 'test-post' });
    assert.equal(path, '/rest/v1/blog_revisions');
    return Response.json([{
      title: 'Test post', seo_title: 'Test post', seo_description: 'Description',
      featured_image_url: '/image.jpg', featured_image_alt: 'Example',
      status: 'published', article_html: legacyHtml
    }]);
  });
  const { default: handler } = await import('../api/public/blog/[slug].js');
  let status;
  let html;
  const response = {
    setHeader() {},
    status(value) { status = value; return this; },
    send(value) { html = value; return this; }
  };
  await handler({ query: { slug: 'test-post' }, headers: { host: 'netcon-ivory.vercel.app' } }, response);
  assert.equal(status, 200);
  const article = DomUtils.findOne((node) => node.name === 'article', parseDocument(html).children);
  assert.ok(article);
  assert.equal(article.children.some((node) => node.type === 'text' && node.data.trim()), false);
  assert.ok(DomUtils.getOuterHTML(article).includes(sanitizeArticleHtml(legacyHtml)));
});
