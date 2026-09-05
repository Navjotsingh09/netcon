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
  if (!['delete_post'].includes(action) || !slug) return errorResponse(request, response, 'Unsupported article action.', 422);
  try {
    const client = supabaseAdmin();
    const { data: post, error: postError } = await client.from('blog_posts').select('id, published_revision_id').eq('public_slug', slug).maybeSingle();
    if (postError) throw postError;
    if (!post) return errorResponse(request, response, 'Blog post not found.', 404);
    const { error: unlinkError } = await client.from('blog_posts').update({ published_revision_id: null }).eq('id', post.id);
    if (unlinkError) throw unlinkError;
    const { error: revisionError } = await client.from('blog_revisions').delete().eq('post_id', post.id);
    if (revisionError) throw revisionError;
    await client.from('blog_audit_events').insert({ post_id: post.id, actor_id: access.user.id, action });
    const { error: deleteError } = await client.from('blog_posts').delete().eq('id', post.id);
    if (deleteError) throw deleteError;
    return json(request, response, { action, publicSlug: slug });
  } catch (error) {
    console.error('CMS article lifecycle request failed', error);
    return errorResponse(request, response, 'The CMS could not complete that article action.');
  }
}