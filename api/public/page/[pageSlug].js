import { supabaseAdmin } from '../../../lib/cms/database.js';
import { errorResponse, json } from '../../../lib/cms/http.js';
import { pageFromSlug } from '../../../lib/cms/page-content.js';

export default async function handler(request, response) {
  const slug = request.query?.pageSlug;
  if (request.method !== 'GET') return errorResponse(request, response, 'Method not allowed.', 405);
  if (!pageFromSlug(slug)) return errorResponse(request, response, 'Page not found.', 404);
  try {
    const { data: page, error: pageError } = await supabaseAdmin().from('cms_pages').select('published_revision_id').eq('page_slug', slug).maybeSingle();
    if (pageError) throw pageError;
    if (!page?.published_revision_id) return json(request, response, { page: null }, 200, { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' });
    const { data: revision, error: revisionError } = await supabaseAdmin().from('cms_page_revisions').select('content, updated_at').eq('id', page.published_revision_id).eq('status', 'published').maybeSingle();
    if (revisionError) throw revisionError;
    return json(request, response, { page: revision || null }, 200, { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' });
  } catch (error) {
    console.error('Public CMS page request failed', error);
    return errorResponse(request, response, 'The page could not be loaded.');
  }
}