import { requireCmsUser } from '../../../lib/cms/auth.js';
import { supabaseAdmin } from '../../../lib/cms/database.js';
import { errorResponse, json, options } from '../../../lib/cms/http.js';
import { CMS_PAGE_DEFINITIONS } from '../../../lib/cms/pages.js';

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'GET') return errorResponse(request, response, 'Method not allowed.', 405);

  const access = await requireCmsUser(request);
  if (access.error) return errorResponse(request, response, access.error, access.status);

  try {
    const client = supabaseAdmin();
    const { data: pages, error: pageError } = await client
      .from('cms_pages')
      .select('id, slug, published_revision_id, updated_at');
    if (pageError) throw pageError;
    const pageRows = pages || [];
    const pageIds = pageRows.map((page) => page.id);
    const revisions = pageIds.length
      ? await client.from('cms_page_revisions')
        .select('id, page_id, revision_number, status, created_at, updated_at, created_by')
        .in('page_id', pageIds)
        .order('revision_number', { ascending: false })
      : { data: [], error: null };
    if (revisions.error) throw revisions.error;

    const pagesBySlug = new Map(pageRows.map((page) => [page.slug, page]));
    const latestByPageId = new Map();
    for (const revision of revisions.data || []) {
      if (!latestByPageId.has(revision.page_id)) latestByPageId.set(revision.page_id, revision);
    }

    return json(request, response, {
      user: access.user,
      pages: CMS_PAGE_DEFINITIONS.map((definition) => {
        const page = pagesBySlug.get(definition.slug);
        const latest = page ? latestByPageId.get(page.id) : null;
        return {
          slug: definition.slug,
          title: definition.title,
          path: definition.path,
          status: latest?.status || 'not_started',
          revisionNumber: latest?.revision_number || 0,
          updatedAt: latest?.updated_at || page?.updated_at || null,
          published: Boolean(page?.published_revision_id)
        };
      })
    });
  } catch (error) {
    console.error('CMS page collection request failed', error);
    return errorResponse(request, response, 'The page library could not be loaded.');
  }
}
