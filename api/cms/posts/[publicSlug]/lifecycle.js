import { requireCmsUser } from '../../../../lib/cms/auth.js';
import { supabaseAdmin } from '../../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../../lib/cms/http.js';

function slugFromRequest(request) {
  const value = request.query.publicSlug;
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'POST') return errorResponse(request, response, 'Method not allowed.', 405);
  const access = await requireCmsUser(request, ['reviewer']);
  if (access.error) return errorResponse(request, response, access.error, access.status);
  const action = request.body?.action;
  const slug = slugFromRequest(request);
  if (!['archive', 'delete_draft'].includes(action) || !slug) return errorResponse(request, response, 'Unsupported article action.', 422);
  try {
    const client = supabaseAdmin();
    const { data: post, error: postError } = await client.from('blog_posts').select('id, published_revision_id').eq('public_slug', slug).maybeSingle();
    if (postError) throw postError;
    if (!post) return errorResponse(request, response, 'Blog post not found.', 404);
    if (action === 'archive') {
      const { error } = await client.from('blog_posts').update({ archived_at: new Date().toISOString() }).eq('id', post.id);
      if (error) throw error;
    } else {
      const { count, error: draftError } = await client.from('blog_revisions').delete({ count: 'exact' }).eq('post_id', post.id).neq('id', post.published_revision_id).in('status', ['draft', 'changes_requested']);
      if (draftError) throw draftError;
      if (!count) return errorResponse(request, response, 'There is no editable draft to delete.', 409);
    }
    await client.from('blog_audit_events').insert({ post_id: post.id, actor_id: access.user.id, action });
    return json(request, response, { action, publicSlug: slug });
  } catch (error) {
    console.error('CMS article lifecycle request failed', error);
    return errorResponse(request, response, 'The CMS could not complete that article action.');
  }
}