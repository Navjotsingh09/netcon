import { supabaseAdmin } from '../../../lib/cms/database.js';

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function slugFromRequest(request) {
  const value = request.query.slug;
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  const slug = slugFromRequest(request);
  if (!slug) return response.status(400).send('Missing blog slug.');
  try {
    const client = supabaseAdmin();
    const { data: post, error: postError } = await client.from('blog_posts').select('id, public_slug').eq('public_slug', slug).is('archived_at', null).maybeSingle();
    if (postError) throw postError;
    if (!post) return response.status(404).send('Blog post not found.');
    const isStaging = (request.headers.host || '').startsWith('netcon-ivory.');
    const visibleStatuses = isStaging ? ['published', 'in_review', 'approved', 'scheduled'] : ['published'];
    const { data: revisions, error: revisionError } = await client.from('blog_revisions').select('*').eq('post_id', post.id).in('status', visibleStatuses).order('revision_number', { ascending: false }).limit(1);
    if (revisionError) throw revisionError;
    const revision = revisions?.[0];
    if (!revision) return response.status(404).send('Blog post not found.');
    const canonical = `https://network-consultancy.com/resources/blogs/${post.public_slug}`;
    const date = revision.published_at ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(revision.published_at)) : '';
    const schemaMarkup = revision.schema_markup ? `<script type="application/ld+json">${JSON.stringify(revision.schema_markup).replace(/</g, '\\u003c')}</script>` : '';
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', isStaging ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300');
    const previewBanner = isStaging && revision.status !== 'published'
      ? '<p class="cms-public-note" role="status">Staging preview: this revision is not live.</p>'
      : '';
    response.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/png" sizes="32x32" href="/images/misc/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/images/misc/favicon-180.png">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="canonical" href="${canonical}">
${isStaging ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta property="og:type" content="article">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${escapeHtml(revision.seo_title)}">
<meta property="og:description" content="${escapeHtml(revision.seo_description)}">
<meta property="og:site_name" content="Network Consultancy">
<meta property="og:image" content="${escapeHtml(revision.featured_image_url)}">
<meta property="og:image:alt" content="${escapeHtml(revision.featured_image_alt || revision.seo_title)}">
${revision.published_at ? `<meta property="article:published_time" content="${new Date(revision.published_at).toISOString()}">` : ''}
${revision.updated_at ? `<meta property="article:modified_time" content="${new Date(revision.updated_at).toISOString()}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(revision.seo_title)}">
<meta name="twitter:description" content="${escapeHtml(revision.seo_description)}">
<meta name="twitter:image" content="${escapeHtml(revision.featured_image_url)}">
<title>${escapeHtml(revision.seo_title)}</title>
<meta name="description" content="${escapeHtml(revision.seo_description)}">
${schemaMarkup}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@8..144,100..1000&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/global.css">
<link rel="stylesheet" href="/css/blog-detail.css">
<script src="/js/schema.js" defer></script>
<link rel="stylesheet" href="/css/animations.css">
<link rel="stylesheet" href="/css/accessibility.css">
<style>${isStaging ? '.cms-public-note{padding:10px 20px;background:#fff2cf;color:#584200;text-align:center;font-weight:600;font-family:"Google Sans Flex",sans-serif}' : ''}.blog-main h4,.blog-main h5,.blog-main h6{font-size:20px;font-weight:600;color:var(--dark);margin:26px 0 12px;line-height:1.3}.blog-main a.article-cta{display:inline-flex;align-items:center;justify-content:center;margin:8px 0;padding:12px 20px;border-radius:4px;background:var(--blue);color:#fff;font-weight:700;text-decoration:none}</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
<div id="site-navbar"></div>
<script src="/js/navbar.js"></script>
<main id="main">
${previewBanner}
<section class="blog-detail" aria-label="Blog detail page">
  <div class="blog-detail__frame">
    <div class="blog-detail__grid">
      <article class="blog-main">
        <div class="blog-main__hero">
          <picture>
            <img src="${escapeHtml(revision.featured_image_url)}" alt="${escapeHtml(revision.featured_image_alt)}" loading="eager" data-image-fallback>
          </picture>
        </div>
        <p class="blog-main__meta"><span>${escapeHtml(date)}</span>${revision.category ? `<span>Category: ${escapeHtml(revision.category)}</span>` : ''}</p>
        <h1>${escapeHtml(revision.title)}</h1>
        ${revision.article_html}
      </article>
      <aside class="blog-side" aria-label="Sidebar">
        <div class="blog-side__card">
          <h3>Latest Blog</h3>
          <a class="blog-side__more" href="/resources/blogs/">See More</a>
        </div>
        <div class="blog-side__categories">
          <h3>Blog Category</h3>
          <nav class="cat-list" aria-label="Blog categories">
            <a href="/industries/">Industries</a>
            <a href="/services/">Services</a>
            <a href="/solutions/">Solutions</a>
          </nav>
        </div>
      </aside>
    </div>
  </div>
</section>
<div id="site-contact"></div>
<script src="/js/form-source-tracking.js"></script>
<script src="/js/contact.js"></script>
</main>
<div id="site-footer"></div>
<script src="/js/footer.js"></script>
<script src="/js/animations.js" defer></script>
<script src="/js/global.js" defer></script>
<script src="/js/accessibility.js" defer></script>
<script src="/js/search-index.js" defer></script>
<script src="/js/blog-cms.js" defer></script>
<script src="/js/search.js" defer></script>
<script>document.querySelectorAll('[data-image-fallback]').forEach((image) => image.addEventListener('error', () => { if (!image.dataset.fallbackApplied) { image.dataset.fallbackApplied = 'true'; image.src = '/images/pages/network-abstract.jpg'; } }));</script>
</body>
</html>`);
  } catch (error) {
    console.error('CMS public blog render failed', error);
    response.status(500).send('The article could not be loaded.');
  }
}