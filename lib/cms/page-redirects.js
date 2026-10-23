import { CMS_PAGE_DEFINITIONS, normalizePagePath, publicPagePath, validatePageContent } from './pages.js';
import { loadPublishedPage } from './page-renderer.js';

export async function resolvePageRedirect(client, definition, content) {
  const visited = new Set([publicPagePath(definition)]);
  let currentDefinition = definition;
  let currentContent = content;
  let destination = '';
  const status = Number(content.fields?.['meta:redirectStatus'] || '308');
  while (true) {
    const { errors, content: validated } = validatePageContent(currentDefinition, currentContent);
    if (Object.keys(errors).length) throw new Error(`Invalid redirect page content: ${JSON.stringify(errors)}`);
    const target = validated.fields['meta:redirect'];
    if (!target) break;
    const path = normalizePagePath(target);
    if (visited.has(path)) throw new Error('The page redirect contains a loop.');
    visited.add(path);
    if (visited.size > 10) throw new Error('The page redirect chain is too long.');
    destination = target;
    currentDefinition = CMS_PAGE_DEFINITIONS.find((page) => publicPagePath(page) === path);
    if (!currentDefinition) break;
    const revision = await loadPublishedPage(client, currentDefinition.slug);
    if (!revision) break;
    currentContent = revision.content;
  }
  return destination ? { destination, status } : null;
}
