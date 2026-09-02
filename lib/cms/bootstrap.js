import baseline from '../../reports/cms-blog-import-baseline.json' with { type: 'json' };
import { supabaseAdmin } from './database.js';

export async function importBaselinePosts() {
  const client = supabaseAdmin();
  let inserted = 0;
  let skipped = 0;

  for (const post of baseline.posts) {
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
    const { error: linkError } = await client
      .from('blog_posts')
      .update({ published_revision_id: revision.id })
      .eq('id', createdPost.id);
    if (linkError) throw linkError;
    inserted += 1;
  }
  return { inserted, skipped, total: baseline.postCount };
}