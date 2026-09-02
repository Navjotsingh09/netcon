import { json } from '../../lib/cms/http.js';

export default function handler(request, response) {
  if (request.method !== 'GET') {
    return json(request, response, { error: 'Method not allowed.' }, 405);
  }
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!publishableKey || !supabaseUrl) {
    return json(request, response, {
      configured: false,
      message: 'Supabase has not been connected to this deployment yet.'
    });
  }
  return json(request, response, { configured: true, publishableKey, supabaseUrl });
}