import { requireCmsUser } from '../../../../lib/cms/auth.js';
import { supabaseAdmin } from '../../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../../lib/cms/http.js';
import { getCmsPageDefinition } from '../../../../lib/cms/pages.js';
import { readPageTemplate, renderPageContent } from '../../../../lib/cms/page-renderer.js';
import { resolvePageRedirect } from '../../../../lib/cms/page-redirects.js';

const actions = {
  submit_for_review: { roles: ['editor'] },
  request_changes: { roles: ['reviewer'] },
  approve: { roles: ['reviewer'] },
  publish_live: { roles: ['reviewer'] }
};

function slugFromRequest(request) {
  const value = request.query.slug;
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'POST') return errorResponse(request, response, 'Method not allowed.', 405);

  const definition = getCmsPageDefinition(slugFromRequest(request));
  if (!definition) return errorResponse(request, response, 'That page is not available in the CMS.', 404);
  const action = request.body?.action;
  const rule = actions[action];
  const permittedRoles = action === 'publish' ? ['reviewer'] : rule?.roles || [];
  if (!rule && action !== 'publish') return errorResponse(request, response, 'Unsupported page workflow action.', 422);

  const access = await requireCmsUser(request, permittedRoles);
  if (access.error) return errorResponse(request, response, access.error, access.status);

  const revisionId = request.body?.revisionId;
  if (typeof revisionId !== 'string' || !revisionId) {
    return errorResponse(request, response, 'A page revision is required.', 422);
  }

  try {
    const client = supabaseAdmin();
    if (['approve', 'publish', 'publish_live'].includes(action)) {
      const { data: page, error: pageError } = await client.from('cms_pages').select('id').eq('slug', definition.slug).maybeSingle();
      if (pageError) throw pageError;
      if (!page) return errorResponse(request, response, 'That page could not be found.', 404);
      const { data: revision, error: revisionError } = await client.from('cms_page_revisions')
        .select('content').eq('id', revisionId).eq('page_id', page.id).maybeSingle();
      if (revisionError) throw revisionError;
      if (!revision) return errorResponse(request, response, 'That page revision could not be found.', 404);
      try {
        renderPageContent(await readPageTemplate(definition), definition, revision.content);
        await resolvePageRedirect(client, definition, revision.content);
      } catch (error) {
        console.error('CMS page publication validation failed', error);
        return errorResponse(request, response, `The page cannot be approved or published: ${error.message}`, 422);
      }
    }
    if (action === 'publish') {
      const { data: publishedId, error: publishError } = await client.rpc('cms_publish_page_revision', {
        p_slug: definition.slug,
        p_revision_id: revisionId,
        p_actor_id: access.user.id
      });
      if (publishError) throw publishError;
      return json(request, response, { revisionId: publishedId, status: 'published' });
    }

    const reviewerNotes = typeof request.body?.reviewerNotes === 'string' ? request.body.reviewerNotes.trim().slice(0, 2000) : null;
    const { data: updated, error: transitionError } = await client.rpc('cms_transition_page_revision', {
      p_slug: definition.slug,
      p_revision_id: revisionId,
      p_actor_id: access.user.id,
      p_action: action,
      p_reviewer_notes: reviewerNotes
    });
    if (transitionError) throw transitionError;
    return json(request, response, { revision: updated });
  } catch (error) {
    if (error.code === '22023') {
      return errorResponse(request, response, error.message || 'That revision is not eligible for this action.', 409);
    }
    if (error.code === 'P0002') {
      return errorResponse(request, response, 'That page or revision could not be found.', 404);
    }
    console.error('CMS page workflow request failed', error);
    return errorResponse(request, response, 'The CMS could not complete that page workflow action.');
  }
}
