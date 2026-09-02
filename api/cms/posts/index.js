import { requireCmsUser } from '../../../lib/cms/auth.js';
import { validateRevisionInput } from '../../../lib/cms/content.js';
import { supabaseAdmin } from '../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../lib/cms/http.js';

async function listPosts(request, response, user) {
  const client = supabaseAdmin();
  const { data: rawPosts, error: postError } = await client.from('blog_posts').select('id, public_slug, first_published_at, published_revision_id, created_at').order('created_at', { ascending: false });
  if (postError) throw postError;
  const { data: revisions, error: revisionError } = await client.from('blog_revisions').select('id, post_id, revision_number, status, title, category, updated_at, created_by').order('revision_number', { ascending: false });
  if (revisionError) throw revisionError;
  const posts = rawPosts.map((post) => {
    const latest = revisions.find((revision) => revision.post_id === post.id);
    return { id: post.id, publicSlug: post.public_slug, firstPublishedAt: post.first_published_at, publishedRevisionId: post.published_revision_id, latestRevisionId: latest?.id || null, revisionNumber: latest?.revision_number || 0, status: latest?.status || 'draft', title: latest?.title || '', category: latest?.category || '', updatedAt: latest?.updated_at || post.created_at, createdBy: latest?.created_by || null };
  });
  return json(request, response, { user, posts });
}

async function createDraft(request, response, user) {
  const { errors, revision } = validateRevisionInput(request.body || {}, { allowSlug: true });
  if (Object.keys(errors).length) {
    return json(request, response, { error: 'Please correct the highlighted fields.', fields: errors }, 422);
  }

  const canonicalUrl = `https://network-consultancy.com/resources/blogs/${revision.publicSlug}`;
  try {
    const client = supabaseAdmin();
    const { data: post, error: postError } = await client.from('blog_posts').insert({ public_slug: revision.publicSlug }).select('id').single();
    if (postError) throw postError;
    const { data: createdRevision, error: revisionError } = await client.from('blog_revisions').insert({ post_id: post.id, revision_number: 1, status: 'draft', title: revision.title, excerpt: revision.excerpt, category: revision.category, article_html: revision.articleHtml, featured_image_url: revision.featuredImageUrl, featured_image_alt: revision.featuredImageAlt, seo_title: revision.seoTitle, seo_description: revision.seoDescription, schema_markup: revision.schemaMarkup, canonical_url: canonicalUrl, created_by: user.id }).select('id, post_id, revision_number, status').single();
    if (revisionError) throw revisionError;
    await client.from('blog_audit_events').insert({ post_id: post.id, revision_id: createdRevision.id, actor_id: user.id, action: 'draft_created' });
    return json(request, response, { revision: createdRevision }, 201);
  } catch (error) {
    if (error.code === '23505') {
      return errorResponse(request, response, 'That public URL slug is already in use.', 409);
    }
    throw error;
  }
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  const access = await requireCmsUser(request, request.method === 'POST' ? ['editor'] : []);
  if (access.error) return errorResponse(request, response, access.error, access.status);

  try {
    if (request.method === 'GET') return await listPosts(request, response, access.user);
    if (request.method === 'POST') return await createDraft(request, response, access.user);
    return errorResponse(request, response, 'Method not allowed.', 405);
  } catch (error) {
    console.error('CMS post collection request failed', error);
    return errorResponse(request, response, 'The CMS could not complete that request.');
  }
}