import { requireCmsUser } from '../../lib/cms/auth.js';
import { supabaseAdmin } from '../../lib/cms/database.js';
import { errorResponse, json, options } from '../../lib/cms/http.js';

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  const access = await requireCmsUser(request, ['reviewer']);
  if (access.error) return errorResponse(request, response, access.error, access.status);

  const client = supabaseAdmin();

  try {
    if (request.method === 'GET') {
      const { data, error } = await client.from('cms_users').select('id, email, display_name, role, is_active, created_at').order('created_at', { ascending: true });
      if (error) throw error;
      return json(request, response, { users: data });
    }

    if (request.method === 'PATCH') {
      const { id, isActive } = request.body || {};
      if (!id || typeof isActive !== 'boolean') return errorResponse(request, response, 'A user id and isActive flag are required.', 422);
      if (id === access.user.id) return errorResponse(request, response, 'You cannot change your own access.', 422);
      const { error } = await client.from('cms_users').update({ is_active: isActive }).eq('id', id);
      if (error) throw error;
      return json(request, response, { ok: true });
    }

    return errorResponse(request, response, 'Method not allowed.', 405);
  } catch (error) {
    console.error('CMS user management request failed', error);
    return errorResponse(request, response, 'The CMS could not complete that request.');
  }
}

