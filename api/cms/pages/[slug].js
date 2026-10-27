import { requireCmsUser } from '../../../lib/cms/auth.js';
import { supabaseAdmin } from '../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../lib/cms/http.js';
import { getCmsPageDefinition, validatePageContent } from '../../../lib/cms/pages.js';
import { describePageTemplate, readPageTemplate, renderPageContent, PageContentError } from '../../../lib/cms/page-renderer.js';
import { restrictPageSettings } from '../../../lib/cms/page-editing.js';

function slugFromRequest(request) {
  const value = request.query.slug;
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (!['GET', 'POST'].includes(request.method)) return errorResponse(request, response, 'Method not allowed.', 405);

  const definition = getCmsPageDefinition(slugFromRequest(request));
  if (!definition) return errorResponse(request, response, 'That page is not available in the CMS.', 404);

  const access = await requireCmsUser(request, request.method === 'POST' ? ['editor'] : []);
  if (access.error) return errorResponse(request, response, access.error, access.status);

  try {
    response.setHeader('Cache-Control', 'no-store');
    const client = supabaseAdmin();
    const template = await readPageTemplate(definition);
    const templateDefaults = describePageTemplate(template, definition);
    const { data: page, error: pageError } = await client
      .from('cms_pages').select('id, slug, published_revision_id')
      .eq('slug', definition.slug).maybeSingle();
    if (pageError) throw pageError;
    if (request.method === 'GET') {
      if (request.query.view === 'history') {
        const before = request.query.before;
        if (before !== undefined && (typeof before !== 'string' || !/^[1-9]\d{0,8}$/.test(before))) {
          return errorResponse(request, response, 'Choose a valid history cursor.', 422);
        }
        if (!page) return json(request, response, { revisions: [], hasMore: false });
        let query = client.from('cms_page_revisions')
          .select('id, revision_number, status, created_by, reviewed_by, created_at, updated_at, reviewer_notes')
          .eq('page_id', page.id).order('revision_number', { ascending: false }).limit(21);
        if (before) query = query.lt('revision_number', Number(before));
        const { data: revisions, error } = await query;
        if (error) throw error;
        const visible = revisions.slice(0, 20);
        const actorIds = [...new Set(visible.flatMap((revision) => [revision.created_by, revision.reviewed_by]).filter(Boolean))];
        const names = new Map();
        if (actorIds.length) {
          const { data: actors, error: actorError } = await client.from('cms_users').select('id, display_name').in('id', actorIds);
          if (actorError) throw actorError;
          for (const actor of actors) names.set(actor.id, actor.display_name);
        }
        return json(request, response, {
          revisions: visible.map((revision) => ({
            ...revision, createdByName: names.get(revision.created_by), reviewedByName: names.get(revision.reviewed_by)
          })), hasMore: revisions.length > 20,
          publishedRevisionId: page.published_revision_id
        });
      }
      if (request.query.revision) {
        if (typeof request.query.revision !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(request.query.revision)) {
          return errorResponse(request, response, 'Choose a valid revision.', 422);
        }
        if (!page) return errorResponse(request, response, 'Page revision not found.', 404);
        const { data: revision, error } = await client.from('cms_page_revisions')
          .select('id, revision_number, status, content, created_by, reviewed_by, updated_at, reviewer_notes')
          .eq('id', request.query.revision).eq('page_id', page.id).maybeSingle();
        if (error) throw error;
        if (!revision) return errorResponse(request, response, 'Page revision not found.', 404);
        return json(request, response, { revision });
      }
      if (!page) return json(request, response, { user: access.user, definition, revision: null, templateDefaults });

      const { data: revision, error: revisionError } = await client
        .from('cms_page_revisions')
        .select('id, revision_number, status, content, created_by, updated_at, reviewer_notes')
        .eq('page_id', page.id)
        .order('revision_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (revisionError) throw revisionError;
      return json(request, response, {
        user: access.user,
        definition,
        revision: revision || null,
        templateDefaults,
        publishedRevisionId: page.published_revision_id
      });
    }

    const { errors, content: validated } = validatePageContent(definition, request.body || {});
    if (Object.keys(errors).length) {
      return json(request, response, { error: 'Please correct the highlighted fields.', fields: errors }, 422);
    }
    let baseline = templateDefaults;
    if (page) {
      const { data: latest, error } = await client.from('cms_page_revisions').select('content')
        .eq('page_id', page.id).order('revision_number', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      if (latest) baseline = { fields: { ...templateDefaults.fields, ...latest.content.fields } };
    }
    const content = restrictPageSettings(access.user, validated, baseline);
    renderPageContent(template, definition, content);

    const { data: revision, error: saveError } = await client.rpc('cms_save_page_draft', {
      p_slug: definition.slug,
      p_path: definition.path,
      p_title: definition.title,
      p_content: content,
      p_actor_id: access.user.id
    });
    if (saveError) throw saveError;
    return json(request, response, { revision }, 201);
  } catch (error) {
    if (error instanceof PageContentError) {
      return json(request, response, { error: error.message, fields: error.fields }, 422);
    }
    if (error.code === '23505' || error.code === '40001') {
      return errorResponse(request, response, 'This page changed at the same time. Reload it and try again.', 409);
    }
    console.error('CMS page request failed', error);
    return errorResponse(request, response, 'The CMS could not load or save that page.');
  }
}
