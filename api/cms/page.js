import { requireCmsUser } from '../../lib/cms/auth.js';
import { supabaseAdmin } from '../../lib/cms/database.js';
import { errorResponse, json, options } from '../../lib/cms/http.js';
import { pageFromSlug, validatePageContent } from '../../lib/cms/page-content.js';

async function findPage(client, slug) {
  const { data: page, error } = await client.from('cms_pages').select('*').eq('page_slug', slug).maybeSingle();
  if (error) throw error;
  if (page) return page;
  const { data: created, error: createError } = await client.from('cms_pages').insert({ page_slug: slug }).select('*').single();
  if (createError) throw createError;
  return created;
}

async function getPage(request, response, slug) {
  const client = supabaseAdmin();
  const page = await findPage(client, slug);
  const { data: revisions, error } = await client.from('cms_page_revisions').select('*').eq('page_id', page.id).order('revision_number', { ascending: false });
  if (error) throw error;
  const draft = revisions.find((revision) => ['draft', 'changes_requested', 'in_review', 'approved'].includes(revision.status));
  const published = revisions.find((revision) => revision.id === page.published_revision_id);
  return json(request, response, { page: { slug, label: pageFromSlug(slug).label, path: pageFromSlug(slug).path, status: draft?.status || (published ? 'published' : 'draft'), draft: draft || null, published: published || null } });
}

async function saveDraft(request, response, slug, user) {
  const validation = validatePageContent(request.body?.content);
  if (validation.error) return errorResponse(request, response, validation.error, 422);
  const client = supabaseAdmin();
  const page = await findPage(client, slug);
  const { data: latest, error: latestError } = await client.from('cms_page_revisions').select('revision_number').eq('page_id', page.id).order('revision_number', { ascending: false }).limit(1).maybeSingle();
  if (latestError) throw latestError;
  const { data: revision, error } = await client.from('cms_page_revisions').insert({ page_id: page.id, revision_number: (latest?.revision_number || 0) + 1, status: 'draft', content: validation.value, created_by: user.id }).select('*').single();
  if (error) throw error;
  return json(request, response, { revision }, 201);
}

async function publishPage(request, response, slug, user) {
  if (user.role !== 'reviewer') return errorResponse(request, response, 'Only a reviewer can publish pages.', 403);
  const client = supabaseAdmin();
  const page = await findPage(client, slug);
  const { data: revision, error: revisionError } = await client.from('cms_page_revisions').select('*').eq('page_id', page.id).in('status', ['draft', 'approved']).order('revision_number', { ascending: false }).limit(1).maybeSingle();
  if (revisionError) throw revisionError;
  if (!revision) return errorResponse(request, response, 'Save a page draft before publishing.', 422);
  const { error: archiveError } = await client.from('cms_page_revisions').update({ status: 'archived' }).eq('page_id', page.id).eq('status', 'published').neq('id', revision.id);
  if (archiveError) throw archiveError;
  const { data: published, error: publishError } = await client.from('cms_page_revisions').update({ status: 'published', reviewed_by: user.id, updated_at: new Date().toISOString() }).eq('id', revision.id).select('*').single();
  if (publishError) throw publishError;
  const { error: pageError } = await client.from('cms_pages').update({ published_revision_id: published.id, updated_at: new Date().toISOString() }).eq('id', page.id);
  if (pageError) throw pageError;
  return json(request, response, { revision: published });
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  const slug = request.query?.slug;
  if (!pageFromSlug(slug)) return errorResponse(request, response, 'Unknown pilot page.', 404);
  const access = await requireCmsUser(request, request.method === 'POST' ? ['editor'] : []);
  if (access.error) return errorResponse(request, response, access.error, access.status);
  try {
    if (request.method === 'GET') return await getPage(request, response, slug);
    if (request.method === 'POST' && request.body?.action === 'publish') return await publishPage(request, response, slug, access.user);
    if (request.method === 'POST') return await saveDraft(request, response, slug, access.user);
    return errorResponse(request, response, 'Method not allowed.', 405);
  } catch (error) {
    console.error('CMS flat page request failed', error);
    return errorResponse(request, response, 'The page could not be saved or loaded.');
  }
}
