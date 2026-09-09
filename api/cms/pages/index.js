import { requireCmsUser } from '../../../lib/cms/auth.js';
import { supabaseAdmin } from '../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../lib/cms/http.js';
import { pilotPages } from '../../../lib/cms/page-content.js';

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  const access = await requireCmsUser(request);
  if (access.error) return errorResponse(request, response, access.error, access.status);
  if (request.method !== 'GET') return errorResponse(request, response, 'Method not allowed.', 405);

  try {
    const { data: pages, error } = await supabaseAdmin()
      .from('cms_pages')
      .select('id, page_slug, published_revision_id, updated_at')
      .order('page_slug');
    if (error) throw error;
    return json(request, response, {
      user: access.user,
      pages: Object.entries(pilotPages).map(([slug, details]) => ({
        slug,
        ...details,
        ...(pages?.find((page) => page.page_slug === slug) || {}),
        status: pages?.find((page) => page.page_slug === slug)?.published_revision_id ? 'published' : 'draft'
      }))
    });
  } catch (error) {
    console.error('CMS page list request failed', error);
    return errorResponse(request, response, 'The page list could not be loaded.');
  }
}