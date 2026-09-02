import { publishRevision } from '../../../lib/cms/publication.js';
import { supabaseAdmin } from '../../../lib/cms/database.js';
import { requiredEnv } from '../../../lib/cms/env.js';
import { errorResponse, json } from '../../../lib/cms/http.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') return errorResponse(request, response, 'Method not allowed.', 405);
  if (process.env.CRON_SECRET && request.headers.authorization !== `Bearer ${requiredEnv('CRON_SECRET')}`) {
    return errorResponse(request, response, 'Unauthorized.', 401);
  }
  try {
    const { data: dueRevisions, error } = await supabaseAdmin().from('blog_revisions').select('id').eq('status', 'scheduled').lte('scheduled_for', new Date().toISOString()).order('scheduled_for', { ascending: true }).limit(25);
    if (error) throw error;
    const published = [];
    for (const revision of dueRevisions) {
      const result = await publishRevision(revision.id, null, 'scheduled_published', true);
      if (result) published.push(result.revisionId);
    }
    return json(request, response, { publishedRevisionIds: published });
  } catch (error) {
    console.error('CMS scheduled publishing failed', error);
    return errorResponse(request, response, 'Scheduled publishing failed.');
  }
}