import { supabaseAdmin } from '../../lib/cms/database.js';
import { getCmsPageDefinition } from '../../lib/cms/pages.js';
import { loadPublishedPage, readPageTemplate, renderPageContent } from '../../lib/cms/page-renderer.js';
import { resolvePageRedirect } from '../../lib/cms/page-redirects.js';

export default async function handler(request, response) {
  if (!['GET', 'HEAD'].includes(request.method)) return response.status(405).send('Method not allowed.');
  const definition = getCmsPageDefinition(request.query.page);
  if (!definition) return response.status(404).send('Page not found.');
  let template;
  try {
    template = await readPageTemplate(definition);
  } catch (error) {
    console.error('CMS page template could not be read', error);
    return response.status(500).send('The page template could not be loaded.');
  }
  try {
    const client = supabaseAdmin();
    const revision = await loadPublishedPage(client, definition.slug);
    const redirect = revision ? await resolvePageRedirect(client, definition, revision.content) : null;
    if (redirect) {
      response.setHeader('Location', redirect.destination);
      response.setHeader('Cache-Control', 'no-store');
      return response.status(redirect.status).end();
    }
    const html = revision ? renderPageContent(template, definition, revision.content) : template;
    response.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('X-CMS-Status', revision ? 'published' : 'static');
    return request.method === 'HEAD' ? response.status(200).end() : response.status(200).send(html);
  } catch (error) {
    console.error(`Published page render failed (${definition.slug}); serving the static template`, error);
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-CMS-Status', 'unavailable');
    response.setHeader('Warning', '199 - "CMS unavailable; static content served"');
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    return request.method === 'HEAD' ? response.status(200).end() : response.status(200).send(template);
  }
}
