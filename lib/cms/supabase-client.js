import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const serverClientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws }
};

export function createServerSupabaseClient(url, key) {
  return createClient(url, key, serverClientOptions);
}
