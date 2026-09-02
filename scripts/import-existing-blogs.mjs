import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const blogDirectory = join(projectRoot, 'resources', 'blogs');
const registryPath = join(projectRoot, 'js', 'blog-cms.js');
const outputPath = join(projectRoot, 'reports', 'cms-blog-import-baseline.json');
const isWriteMode = process.argv.includes('--write');
const isSupabaseImportMode = process.argv.includes('--supabase-import');
const knownEditorialReviewSlugs = new Set([
  'resilient-network-design',
  'secure-hybrid-workspace',
  'sme-network-consultancy',
  'network-upgrade-benefits'
]);

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractAttribute(html, selector) {
  const match = html.match(selector);
  return match ? decodeHtml(match[1].trim()) : '';
}

function extractArticleHtml(html) {
  const match = html.match(/<article\b[^>]*class=["'][^"']*\bblog-main\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/i);
  if (!match) {
    throw new Error('Missing .blog-main article element');
  }
  // The template (hero image, date/category meta, H1 title) is rendered
  // separately by the public page; only the body content is stored.
  return match[1].trim()
    .replace(/^\s*<div class="blog-main__hero">[\s\S]*?<\/div>\s*/i, '')
    .replace(/^\s*<p class="blog-main__meta">[\s\S]*?<\/p>\s*/i, '')
    .replace(/^\s*<h1>[\s\S]*?<\/h1>\s*/i, '')
    .trim();
}

function dateToIso(dateLabel) {
  const match = /^([0-3]\d)\/([01]\d)\/(\d{4})$/.exec(dateLabel);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}T12:00:00.000Z`;
}

async function loadRegistry() {
  const source = await readFile(registryPath, 'utf8');
  const match = source.match(/var BLOG_POSTS = (\[[\s\S]*?\n  \]);\n\n  function parseDateLabel/);
  if (!match) {
    throw new Error('Could not locate BLOG_POSTS in js/blog-cms.js');
  }
  return Function(`"use strict"; return (${match[1]});`)();
}

async function importPost(post) {
  const sourcePath = join(blogDirectory, `${post.urlSlug}.html`);
  const html = await readFile(sourcePath, 'utf8');
  const canonicalUrl = extractAttribute(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const seoTitle = extractAttribute(html, /<title>([\s\S]*?)<\/title>/i);
  const seoDescription = extractAttribute(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  const ogImage = extractAttribute(html, /<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i);
  const articleHtml = extractArticleHtml(html);
  // The per-page meta line is the true published date/category; the
  // js/blog-cms.js registry has drifted out of sync for some posts.
  const metaMatch = html.match(/<p class="blog-main__meta"><span>([0-3]\d\/[01]\d\/\d{4})<\/span><span>Category: ([^<]+)<\/span><\/p>/);
  const pageDateLabel = metaMatch ? metaMatch[1] : post.dateLabel;
  const pageCategory = metaMatch ? decodeHtml(metaMatch[2]) : post.category;
  const missing = [
    ['canonicalUrl', canonicalUrl],
    ['seoTitle', seoTitle],
    ['seoDescription', seoDescription],
    ['ogImage', ogImage],
    ['articleHtml', articleHtml]
  ].filter(([, value]) => !value).map(([field]) => field);

  return {
    publicSlug: post.urlSlug,
    sourceFile: `resources/blogs/${post.urlSlug}.html`,
    publicPath: `/resources/blogs/${post.urlSlug}`,
    status: 'published',
    publishedAt: dateToIso(pageDateLabel),
    title: post.title,
    excerpt: post.excerpt,
    category: pageCategory,
    featuredImageUrl: post.image,
    canonicalUrl,
    seoTitle,
    seoDescription,
    ogImage,
    articleHtml,
    requiresEditorialReview: knownEditorialReviewSlugs.has(post.urlSlug),
    missingFields: missing
  };
}

async function importToSupabase(posts) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for --supabase-import.');
  }
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  let inserted = 0;
  let skipped = 0;

  for (const post of posts) {
    const { data: existing, error: lookupError } = await client
      .from('blog_posts')
      .select('id')
      .eq('public_slug', post.publicSlug)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
      skipped += 1;
      continue;
    }
    const { data: createdPost, error: postError } = await client
      .from('blog_posts')
      .insert({ public_slug: post.publicSlug, first_published_at: post.publishedAt })
      .select('id')
      .single();
    if (postError) throw postError;
    const { data: revision, error: revisionError } = await client
      .from('blog_revisions')
      .insert({
        post_id: createdPost.id,
        revision_number: 1,
        status: 'published',
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        article_html: post.articleHtml,
        featured_image_url: post.featuredImageUrl,
        featured_image_alt: '',
        seo_title: post.seoTitle,
        seo_description: post.seoDescription,
        canonical_url: post.canonicalUrl,
        published_at: post.publishedAt
      })
      .select('id')
      .single();
    if (revisionError) throw revisionError;
    const { error: publishLinkError } = await client
      .from('blog_posts')
      .update({ published_revision_id: revision.id })
      .eq('id', createdPost.id);
    if (publishLinkError) throw publishLinkError;
    inserted += 1;
  }

  const { count, error: countError } = await client
    .from('blog_posts')
    .select('*', { count: 'exact', head: true });
  if (countError) throw countError;
  console.log(`Supabase import complete: ${inserted} inserted, ${skipped} already present, ${count} total posts.`);
}

const registry = await loadRegistry();
const importedPosts = await Promise.all(registry.map(importPost));
const duplicateSlugs = importedPosts
  .map((post) => post.publicSlug)
  .filter((slug, index, slugs) => slugs.indexOf(slug) !== index);
const postsWithMissingFields = importedPosts.filter((post) => post.missingFields.length > 0);
const report = {
  generatedAt: new Date().toISOString(),
  source: {
    registry: 'js/blog-cms.js',
    articleDirectory: 'resources/blogs'
  },
  postCount: importedPosts.length,
  duplicateSlugs,
  postsWithMissingFields: postsWithMissingFields.map((post) => ({
    publicSlug: post.publicSlug,
    missingFields: post.missingFields
  })),
  editorialReviewRequired: importedPosts
    .filter((post) => post.requiresEditorialReview)
    .map((post) => post.publicSlug),
  posts: importedPosts
};

if (duplicateSlugs.length || postsWithMissingFields.length) {
  console.error(JSON.stringify({
    postCount: report.postCount,
    duplicateSlugs,
    postsWithMissingFields: report.postsWithMissingFields
  }, null, 2));
  process.exitCode = 1;
} else if (isWriteMode) {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${report.postCount} imported posts to reports/cms-blog-import-baseline.json`);
} else if (isSupabaseImportMode) {
  await importToSupabase(importedPosts);
} else {
  console.log(`Validated ${report.postCount} importable published posts with no missing required fields.`);
  console.log(`Editorial review required: ${report.editorialReviewRequired.join(', ')}`);
}