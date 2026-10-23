import { requireCmsUser } from '../../../lib/cms/auth.js';
import { supabaseAdmin } from '../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../lib/cms/http.js';
import { getCmsPageDefinition, validatePageContent } from '../../../lib/cms/pages.js';
import { describePageTemplate, readPageTemplate, renderPageContent, PageContentError } from '../../../lib/cms/page-renderer.js';

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
    const client = supabaseAdmin();
    if (request.method === 'GET') {
      const templateDefaults = describePageTemplate(await readPageTemplate(definition), definition);
      const { data: page, error: pageError } = await client
        .from('cms_pages')
        .select('id, slug, published_revision_id')
        .eq('slug', definition.slug)
        .maybeSingle();
      if (pageError) throw pageError;
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

    const { errors, content } = validatePageContent(definition, request.body || {});
    if (Object.keys(errors).length) {
      return json(request, response, { error: 'Please correct the highlighted fields.', fields: errors }, 422);
    }
    renderPageContent(await readPageTemplate(definition), definition, content);

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
