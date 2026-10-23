import { CMS_PAGE_DEFINITIONS, pageRoutePaths } from './lib/cms/pages.js';

const pagesByPath = new Map(CMS_PAGE_DEFINITIONS.flatMap((page) => pageRoutePaths(page).map((path) => [path, page.slug])));

export default function middleware(request) {
  const url = new URL(request.url);
  const slug = pagesByPath.get(url.pathname);
  if (!slug) return new Response(null, { headers: { 'x-middleware-next': '1' } });
  url.pathname = '/api/public/site';
  url.searchParams.set('page', slug);
  // Vercel's routing response protocol runs before static-file lookup.
  return new Response(null, { headers: { 'x-middleware-rewrite': url.href } });
}
