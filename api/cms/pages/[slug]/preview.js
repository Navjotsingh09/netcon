import { requireCmsUser } from '../../../../lib/cms/auth.js';
import { errorResponse, json } from '../../../../lib/cms/http.js';
import { getCmsPageDefinition, validatePageContent } from '../../../../lib/cms/pages.js';
import { readPageTemplate, renderPageContent, PageContentError } from '../../../../lib/cms/page-renderer.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') return errorResponse(request, response, 'Method not allowed.', 405);
  const access = await requireCmsUser(request);
  if (access.error) return errorResponse(request, response, access.error, access.status);
  const definition = getCmsPageDefinition(request.query.slug);
  if (!definition) return errorResponse(request, response, 'Page not found.', 404);
  const { errors } = validatePageContent(definition, request.body);
  if (Object.keys(errors).length) return response.status(422).json({ error: 'Please correct the highlighted fields.', fields: errors });
  try {
    const template = await readPageTemplate(definition);
    const html = renderPageContent(template, definition, request.body, { preview: true });
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    return response.status(200).send(html);
  } catch (error) {
    if (error instanceof PageContentError) {
      return json(request, response, { error: error.message, fields: error.fields }, 422);
    }
    console.error('CMS page preview failed', error);
    return errorResponse(request, response, 'The page preview could not be generated.');
  }
}
