import { supabaseAdmin } from '../../lib/cms/database.js';

function dateLabel(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  try {
    const client = supabaseAdmin();
    const { data: posts, error: postError } = await client
      .from('blog_posts')
      .select('id, public_slug, published_revision_id, is_featured, featured_rank')
      .is('archived_at', null)
      .not('published_revision_id', 'is', null);
    if (postError) throw postError;
    const revisionIds = posts.map((post) => post.published_revision_id);
    if (!revisionIds.length) return response.status(200).json({ posts: [] });
    const { data: revisions, error: revisionError } = await client
      .from('blog_revisions')
      .select('id, title, excerpt, category, featured_image_url, featured_image_alt, published_at')
      .in('id', revisionIds)
      .eq('status', 'published');
    if (revisionError) throw revisionError;
    const revisionsById = new Map(revisions.map((revision) => [revision.id, revision]));
    const publishedPosts = posts.map((post) => {
      const revision = revisionsById.get(post.published_revision_id);
      if (!revision) return null;
      return {
        slug: post.id,
        urlSlug: post.public_slug,
        title: revision.title,
        excerpt: revision.excerpt,
        dateLabel: dateLabel(revision.published_at),
        category: revision.category,
        image: revision.featured_image_url,
        imageAlt: revision.featured_image_alt,
        isFeatured: post.is_featured,
        featuredRank: post.featured_rank
      };
    }).filter(Boolean);
    response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response.status(200).json({ posts: publishedPosts });
  } catch (error) {
    console.error('Public blog listing failed', error);
    return response.status(500).json({ error: 'The blog listing could not be loaded.' });
  }
}