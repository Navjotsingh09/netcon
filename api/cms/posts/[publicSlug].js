import { requireCmsUser } from '../../../lib/cms/auth.js';
import { validateRevisionInput } from '../../../lib/cms/content.js';
import { supabaseAdmin } from '../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../lib/cms/http.js';

function publicSlug(request) {
  const value = request.query.publicSlug;
  return Array.isArray(value) ? value[0] : value;
}

function dashboardRevision(revision, post) {
  return { postId: post.id, publicSlug: post.public_slug, publishedRevisionId: post.published_revision_id, isFeatured: post.is_featured, featuredRank: post.featured_rank, archivedAt: post.archived_at, revisionId: revision.id, revisionNumber: revision.revision_number, status: revision.status, title: revision.title, excerpt: revision.excerpt, category: revision.category, articleHtml: revision.article_html, featuredImageUrl: revision.featured_image_url, featuredImageAlt: revision.featured_image_alt, seoTitle: revision.seo_title, seoDescription: revision.seo_description, schemaMarkup: revision.schema_markup ? JSON.stringify(revision.schema_markup, null, 2) : '', canonicalUrl: revision.canonical_url, publishedAt: revision.published_at, scheduledFor: revision.scheduled_for, createdBy: revision.created_by, reviewedBy: revision.reviewed_by, reviewerNotes: revision.reviewer_notes, updatedAt: revision.updated_at };
}

async function getPost(request, response, slug) {
  const client = supabaseAdmin();
  const { data: post, error: postError } = await client.from('blog_posts').select('id, public_slug, published_revision_id, is_featured, featured_rank, archived_at').eq('public_slug', slug).maybeSingle();
  if (postError) throw postError;
  if (!post) return errorResponse(request, response, 'Blog post not found.', 404);
  const { data: rows, error } = await client.from('blog_revisions').select('*').eq('post_id', post.id).order('revision_number', { ascending: false });
  if (error) throw error;
  if (!rows.length) return errorResponse(request, response, 'Blog post not found.', 404);
  return json(request, response, { post: dashboardRevision(rows[0], post), revisions: rows.map((revision) => dashboardRevision(revision, post)) });
}

async function createRevision(request, response, user, slug) {
  const client = supabaseAdmin();
  const { data: post } = await client.from('blog_posts').select('id').eq('public_slug', slug).maybeSingle();
  if (!post) return errorResponse(request, response, 'Blog post not found.', 404);
  const { data: latest } = await client.from('blog_revisions').select('*').eq('post_id', post.id).order('revision_number', { ascending: false }).limit(1).maybeSingle();
  if (!latest) return errorResponse(request, response, 'Blog post has no existing revision.', 409);
  const { data: created, error } = await client.from('blog_revisions').insert({ ...latest, id: undefined, revision_number: latest.revision_number + 1, status: 'draft', created_by: user.id, reviewed_by: null, reviewer_notes: null, published_at: null, scheduled_for: null, created_at: undefined, updated_at: undefined }).select('id, post_id, revision_number, status').single();
  if (error) throw error;
  const createdRevision = created;
  const revision = createdRevision;
  await client.from('blog_audit_events').insert({ post_id: revision.post_id, revision_id: revision.id, actor_id: user.id, action: 'revision_created' });
  return json(request, response, { revision }, 201);
}

async function updateDraft(request, response, user, slug) {
  const revisionId = request.body?.revisionId;
  const { errors, revision } = validateRevisionInput(request.body || {});
  if (!revisionId) errors.revisionId = 'A draft revision is required.';
  if (Object.keys(errors).length) {
    return json(request, response, { error: 'Please correct the highlighted fields.', fields: errors }, 422);
  }
  const client = supabaseAdmin();
  const { data: updated, error } = await client.from('blog_revisions').update({ title: revision.title, excerpt: revision.excerpt, category: revision.category, article_html: revision.articleHtml, featured_image_url: revision.featuredImageUrl, featured_image_alt: revision.featuredImageAlt, seo_title: revision.seoTitle, seo_description: revision.seoDescription, schema_markup: revision.schemaMarkup, published_at: request.body?.publishedAt || null, updated_at: new Date().toISOString() }).eq('id', revisionId).eq('created_by', user.id).in('status', ['draft', 'changes_requested']).select('id, post_id, revision_number, status, updated_at').maybeSingle();
  if (error) throw error;
  if (!updated) return errorResponse(request, response, 'Only your editable draft revisions can be updated.', 409);
  const featuredRank = request.body?.featuredRank ? Number(request.body.featuredRank) : null;
  const { error: postError } = await client.from('blog_posts').update({ is_featured: Boolean(request.body?.isFeatured), featured_rank: request.body?.isFeatured ? featuredRank : null, updated_at: new Date().toISOString() }).eq('id', updated.post_id);
  if (postError) throw postError;
  return json(request, response, { revision: updated });
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  const access = await requireCmsUser(request, request.method === 'GET' ? [] : ['editor']);
  if (access.error) return errorResponse(request, response, access.error, access.status);
  const slug = publicSlug(request);
  if (!slug) return errorResponse(request, response, 'A public URL slug is required.', 400);

  try {
    if (request.method === 'GET') return await getPost(request, response, slug);
    if (request.method === 'POST') return await createRevision(request, response, access.user, slug);
    if (request.method === 'PATCH') return await updateDraft(request, response, access.user, slug);
    return errorResponse(request, response, 'Method not allowed.', 405);
  } catch (error) {
    console.error('CMS post request failed', error);
    return errorResponse(request, response, 'The CMS could not complete that request.');
  }
}