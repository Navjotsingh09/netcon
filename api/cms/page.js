import handler from './pages/[pageSlug]/index.js';

export default function pageHandler(request, response) {
  request.query = { ...(request.query || {}), pageSlug: request.query?.slug };
  return handler(request, response);
}
