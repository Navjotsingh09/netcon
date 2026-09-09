import handler from './page/[pageSlug]/index.js';

export default function publicPageHandler(request, response) {
  request.query = { ...(request.query || {}), pageSlug: request.query?.slug };
  return handler(request, response);
}
