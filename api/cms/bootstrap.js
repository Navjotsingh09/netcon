import { createClient } from '@supabase/supabase-js';
import { importBaselinePosts } from '../../lib/cms/bootstrap.js';
import { supabaseAdmin } from '../../lib/cms/database.js';
import { requiredEnv } from '../../lib/cms/env.js';
import { errorResponse, json, options } from '../../lib/cms/http.js';

function tokenFromRequest(request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.authorization || '');
  return match ? match[1] : null;
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'POST') return errorResponse(request, response, 'Method not allowed.', 405);
  const token = tokenFromRequest(request);
  if (!token) return errorResponse(request, response, 'Authentication is required.', 401);

  try {
    const authClient = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_PUBLISHABLE_KEY'), {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data: auth, error: authError } = await authClient.auth.getUser(token);
    if (authError || !auth.user?.email) return errorResponse(request, response, 'Your CMS session is invalid or has expired.', 401);

    const client = supabaseAdmin();
    const { count, error: countError } = await client.from('cms_users').select('*', { count: 'exact', head: true });
    if (countError) throw countError;
    if (count === 0) {
      const displayName = auth.user.user_metadata?.full_name || auth.user.email.split('@')[0];
      const { error: seedError } = await client.from('cms_users').insert({
        supabase_user_id: auth.user.id,
        email: auth.user.email,
        display_name: displayName,
        role: 'reviewer'
      });
      if (seedError) throw seedError;
    } else {
      const { data: existingUser, error: userError } = await client.from('cms_users').select('role').eq('supabase_user_id', auth.user.id).maybeSingle();
      if (userError) throw userError;
      if (!existingUser || existingUser.role !== 'reviewer') {
        return errorResponse(request, response, 'Only the initial reviewer can import the existing blog catalogue.', 403);
      }
    }
    const imported = await importBaselinePosts();
    return json(request, response, { reviewerEmail: auth.user.email, imported }, 201);
  } catch (error) {
    console.error('CMS bootstrap failed', error);
    return errorResponse(request, response, 'The CMS bootstrap could not complete.');
  }
}