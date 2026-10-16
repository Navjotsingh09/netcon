import { json } from '../../lib/cms/http.js';

export default function handler(request, response) {
  if (request.method !== 'GET') {
    return json(request, response, { error: 'Method not allowed.' }, 405);
  }
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  if (!publishableKey || !supabaseUrl) {
    return json(request, response, {
      configured: false,
      message: 'Supabase has not been connected to this deployment yet.'
    });
  }
  response.setHeader('Cache-Control', 'no-store');
  return json(request, response, {
    configured: true,
    environment: process.env.VERCEL_ENV || 'development',
    publishableKey,
    supabaseUrl
  });
}