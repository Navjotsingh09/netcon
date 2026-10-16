import { supabaseAdmin } from '../../../lib/cms/database.js';
import { errorResponse, json } from '../../../lib/cms/http.js';
import { getCmsPageDefinition } from '../../../lib/cms/pages.js';

function slugFromRequest(request) {
  const value = request.query.slug;
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  if (request.method !== 'GET') return errorResponse(request, response, 'Method not allowed.', 405);

  const definition = getCmsPageDefinition(slugFromRequest(request));
  if (!definition) return errorResponse(request, response, 'Page not found.', 404);
  try {
    const client = supabaseAdmin();
    const { data: page, error: pageError } = await client
      .from('cms_pages')
      .select('id, published_revision_id')
      .eq('slug', definition.slug)
      .maybeSingle();
    if (pageError) throw pageError;
    if (!page?.published_revision_id) {
      response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return response.status(204).end();
    }

    const { data: revision, error: revisionError } = await client
      .from('cms_page_revisions')
      .select('id, content, status, published_at')
      .eq('id', page.published_revision_id)
      .eq('page_id', page.id)
      .eq('status', 'published')
      .maybeSingle();
    if (revisionError) throw revisionError;
    response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    if (!revision) return response.status(204).end();
    return json(request, response, { slug: definition.slug, revision });
  } catch (error) {
    console.error('Public CMS page request failed', error);
    return errorResponse(request, response, 'The page content could not be loaded.');
  }
}
