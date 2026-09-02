import { createClient } from '@supabase/supabase-js';
import { requiredEnv } from './env.js';

let serviceClient;

export function supabaseAdmin() {
  if (!serviceClient) {
    serviceClient = createClient(
      requiredEnv('SUPABASE_URL'),
      requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return serviceClient;
}