import { requireCmsUser } from '../../../../lib/cms/auth.js';
import { supabaseAdmin } from '../../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../../lib/cms/http.js';

function revisionId(request) {
  const value = request.query.revisionId;
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'POST') return errorResponse(request, response, 'Method not allowed.', 405);
  const access = await requireCmsUser(request, ['reviewer']);
  if (access.error) return errorResponse(request, response, access.error, access.status);

  const scheduledFor = new Date(request.body?.scheduledFor);
  if (Number.isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) {
    return errorResponse(request, response, 'Choose a future publishing time.', 422);
  }
  try {
    const client = supabaseAdmin();
    const { data: scheduled, error } = await client.from('blog_revisions').update({ status: 'scheduled', scheduled_for: scheduledFor.toISOString(), reviewed_by: access.user.id, updated_at: new Date().toISOString() }).eq('id', revisionId(request)).eq('status', 'approved').neq('created_by', access.user.id).select('id, post_id, status, scheduled_for').maybeSingle();
    if (error) throw error;
    if (!scheduled) return errorResponse(request, response, 'That approved revision cannot be scheduled.', 409);
    await client.from('blog_audit_events').insert({ post_id: scheduled.post_id, revision_id: scheduled.id, actor_id: access.user.id, action: 'scheduled', detail: { scheduledFor: scheduled.scheduled_for } });
    return json(request, response, { revision: { revisionId: scheduled.id, postId: scheduled.post_id, status: scheduled.status, scheduledFor: scheduled.scheduled_for } });
  } catch (error) {
    console.error('CMS schedule request failed', error);
    return errorResponse(request, response, 'The CMS could not schedule that revision.');
  }
}