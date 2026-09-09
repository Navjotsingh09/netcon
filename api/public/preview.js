import crypto from 'node:crypto';
import { supabaseAdmin } from '../../lib/cms/database.js';
import { errorResponse, json } from '../../lib/cms/http.js';
import { pageFromSlug } from '../../lib/cms/page-content.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return errorResponse(request, response, 'Method not allowed.', 405);
  const token = String(request.query?.token || '');
  if (!token) return errorResponse(request, response, 'Preview token is required.', 401);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  try {
    const { data: preview, error } = await supabaseAdmin().from('cms_preview_tokens').select('page_slug, revision_id, expires_at, revoked_at').eq('token_hash', tokenHash).maybeSingle();
    if (error) throw error;
    if (!preview || preview.revoked_at || new Date(preview.expires_at) <= new Date()) return errorResponse(request, response, 'This preview link has expired or been revoked.', 410);
    const { data: revision, error: revisionError } = await supabaseAdmin().from('cms_page_revisions').select('content, updated_at').eq('id', preview.revision_id).maybeSingle();
    if (revisionError) throw revisionError;
    return json(request, response, { page: { slug: preview.page_slug, label: pageFromSlug(preview.page_slug).label, content: revision?.content || {}, updatedAt: revision?.updated_at } }, 200, { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' });
  } catch (error) {
    console.error('Public CMS preview request failed', error);
    return errorResponse(request, response, 'The preview could not be loaded.');
  }
}
