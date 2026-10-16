import { requiredEnv } from './env.js';
import { createServerSupabaseClient } from './supabase-client.js';

let serviceClient;

export function supabaseAdmin() {
  if (!serviceClient) {
    serviceClient = createServerSupabaseClient(
      requiredEnv('SUPABASE_URL'),
      requiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    );
  }
  return serviceClient;
}