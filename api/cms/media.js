import { requireCmsUser } from '../../lib/cms/auth.js';
import { supabaseAdmin } from '../../lib/cms/database.js';
import { errorResponse, json, options } from '../../lib/cms/http.js';

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/avif', 'image/jpeg', 'image/png', 'image/webp']);

function safeFilename(filename) {
  const base = String(filename || 'blog-image')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'blog-image';
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'POST') return errorResponse(request, response, 'Method not allowed.', 405);
  const access = await requireCmsUser(request, ['editor']);
  if (access.error) return errorResponse(request, response, access.error, access.status);

  const { filename, contentType, data, altText = '' } = request.body || {};
  if (!allowedMimeTypes.has(contentType)) {
    return errorResponse(request, response, 'Upload a JPEG, PNG, WebP, or AVIF image.', 422);
  }
  if (typeof data !== 'string' || !data) {
    return errorResponse(request, response, 'Image data is required.', 422);
  }

  const buffer = Buffer.from(data, 'base64');
  if (!buffer.length || buffer.length > MAX_UPLOAD_BYTES) {
    return errorResponse(request, response, 'Image uploads must be no larger than 3 MB.', 422);
  }

  try {
    const client = supabaseAdmin();
    const key = `cms/blog/${Date.now()}-${safeFilename(filename)}`;
    const { error: uploadError } = await client.storage.from('blog-media').upload(key, buffer, { contentType, upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicUrl } = client.storage.from('blog-media').getPublicUrl(key);
    const { data: media, error: mediaError } = await client.from('blog_media').insert({ blob_url: publicUrl.publicUrl, blob_key: key, mime_type: contentType, alt_text: String(altText).trim(), uploaded_by: access.user.id }).select('id, blob_url, blob_key, mime_type, alt_text').single();
    if (mediaError) throw mediaError;
    return json(request, response, { media: { id: media.id, blobUrl: media.blob_url, blobKey: media.blob_key, mimeType: media.mime_type, altText: media.alt_text } }, 201);
  } catch (error) {
    console.error('CMS media upload failed', error);
    return errorResponse(request, response, 'The image could not be uploaded.');
  }
}