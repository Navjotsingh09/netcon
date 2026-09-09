import crypto from 'node:crypto';
import { requireCmsUser } from '../../lib/cms/auth.js';
import { supabaseAdmin } from '../../lib/cms/database.js';
import { errorResponse, json, options } from '../../lib/cms/http.js';
import { pageFromSlug } from '../../lib/cms/page-content.js';

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  const access = await requireCmsUser(request, ['editor']);
  if (access.error) return errorResponse(request, response, access.error, access.status);
  if (request.method !== 'POST') return errorResponse(request, response, 'Method not allowed.', 405);
  const slug = request.body?.slug;
  if (!pageFromSlug(slug)) return errorResponse(request, response, 'Unknown pilot page.', 404);
  try {
    const client = supabaseAdmin();
    const { data: page, error: pageError } = await client.from('cms_pages').select('id').eq('page_slug', slug).single();
    if (pageError) throw pageError;
    const { data: revision, error: revisionError } = await client.from('cms_page_revisions').select('id').eq('page_id', page.id).in('status', ['draft', 'in_review', 'approved']).order('revision_number', { ascending: false }).limit(1).maybeSingle();
    if (revisionError) throw revisionError;
    if (!revision) return errorResponse(request, response, 'Save a draft before generating a preview link.', 422);
    const origin = request.headers.origin || 'https://netcon-ivory.vercel.app';
    // Reuse an existing valid link for this page so editors always get the same reusable URL back, and it always reflects the latest saved draft.
    const { data: existing, error: existingError } = await client.from('cms_preview_tokens').select('token, expires_at').eq('page_slug', slug).is('revoked_at', null).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (existingError) throw existingError;
    if (existing?.token) {
      return json(request, response, { previewUrl: `${origin}/preview.html?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(existing.token)}`, expiresInDays: Math.max(1, Math.ceil((new Date(existing.expires_at) - new Date()) / 86400000)) });
    }
    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { error } = await client.from('cms_preview_tokens').insert({ page_slug: slug, revision_id: revision.id, token_hash: tokenHash, token, created_by: access.user.id });
    if (error) throw error;
    return json(request, response, { previewUrl: `${origin}/preview.html?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`, expiresInDays: 30 });
  } catch (error) {
    console.error('CMS preview link request failed', error);
    return errorResponse(request, response, 'The preview link could not be created.');
  }
}
