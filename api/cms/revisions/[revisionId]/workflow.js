import { requireCmsUser } from '../../../../lib/cms/auth.js';
import { supabaseAdmin } from '../../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../../lib/cms/http.js';

const transitionRules = {
  publish_live: { from: ['draft', 'changes_requested'], to: 'approved', roles: ['reviewer'], audit: 'published_to_live_requested' },
  request_changes: { from: ['in_review'], to: 'changes_requested', roles: ['reviewer'], audit: 'changes_requested' },
  approve: { from: ['in_review'], to: 'approved', roles: ['reviewer'], audit: 'approved' }
};

function revisionId(request) {
  const value = request.query.revisionId;
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'POST') return errorResponse(request, response, 'Method not allowed.', 405);

  const action = request.body?.action;
  const rule = transitionRules[action];
  if (!rule) return errorResponse(request, response, 'Unsupported review action.', 422);
  const access = await requireCmsUser(request, rule.roles);
  if (access.error) return errorResponse(request, response, access.error, access.status);

  try {
    const notes = typeof request.body?.reviewerNotes === 'string' ? request.body.reviewerNotes.trim() : null;
    const client = supabaseAdmin();
    let update = client.from('blog_revisions').update({ status: rule.to, reviewer_notes: notes, reviewed_by: rule.roles.includes('reviewer') ? access.user.id : null, updated_at: new Date().toISOString() }).eq('id', revisionId(request)).in('status', rule.from);
    if (['approve', 'request_changes'].includes(action)) update = update.neq('created_by', access.user.id);
    const { data: updated, error } = await update.select('id, post_id, status, created_by').maybeSingle();
    if (error) throw error;
    if (!updated) {
      return errorResponse(request, response, 'That revision is not eligible for this action.', 409);
    }
    await client.from('blog_audit_events').insert({ post_id: updated.post_id, revision_id: updated.id, actor_id: access.user.id, action: rule.audit, detail: { reviewerNotes: notes } });
    return json(request, response, { revision: { revisionId: updated.id, postId: updated.post_id, status: updated.status, createdBy: updated.created_by } });
  } catch (error) {
    console.error('CMS workflow request failed', error);
    return errorResponse(request, response, 'The CMS could not complete that workflow action.');
  }
}