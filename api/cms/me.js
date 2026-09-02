import { requireCmsUser } from '../../lib/cms/auth.js';
import { errorResponse, json, options } from '../../lib/cms/http.js';

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'GET') return errorResponse(request, response, 'Method not allowed.', 405);

  const access = await requireCmsUser(request);
  if (access.error) return errorResponse(request, response, access.error, access.status);
  return json(request, response, { user: access.user });
}