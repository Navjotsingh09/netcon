import { requireCmsUser } from '../../../../lib/cms/auth.js';
import { publishRevision } from '../../../../lib/cms/publication.js';
import { errorResponse, json, options } from '../../../../lib/cms/http.js';

function revisionId(request) {
  const value = request.query.revisionId;
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'POST') return errorResponse(request, response, 'Method not allowed.', 405);
  const access = await requireCmsUser(request, ['reviewer']);
  if (access.error) return errorResponse(request, response, access.error, access.status);

  try {
    const revision = await publishRevision(revisionId(request), access.user.id);
    if (!revision) return errorResponse(request, response, 'That approved revision cannot be published.', 409);
    return json(request, response, { revision });
  } catch (error) {
    console.error('CMS publish request failed', error);
    return errorResponse(request, response, 'The CMS could not publish that revision.');
  }
}