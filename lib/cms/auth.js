import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './database.js';
import { requiredEnv } from './env.js';

function bearerToken(request) {
  const header = request.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : null;
}

export async function requireCmsUser(request, permittedRoles = []) {
  const token = bearerToken(request);
  if (!token) {
    return { error: 'Authentication is required.', status: 401 };
  }

  try {
    const authClient = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_PUBLISHABLE_KEY'), {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const { data: auth, error: authError } = await authClient.auth.getUser(token);
    if (authError || !auth.user) return { error: 'Your CMS session is invalid or has expired.', status: 401 };
    const { data: user, error: userError } = await supabaseAdmin()
      .from('cms_users')
      .select('id, supabase_user_id, email, display_name, role')
      .eq('supabase_user_id', auth.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return { error: 'This account has not been granted CMS access.', status: 403 };
    }
    const reviewerCanEdit = user.role === 'reviewer' && permittedRoles.includes('editor');
    if (permittedRoles.length && !permittedRoles.includes(user.role) && !reviewerCanEdit) {
      return { error: 'You do not have permission for this CMS action.', status: 403 };
    }
    return { user };
  } catch (error) {
    console.error('CMS authentication failed', error);
    return { error: 'Your CMS session is invalid or has expired.', status: 401 };
  }
}