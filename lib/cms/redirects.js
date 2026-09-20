// Shared by scripts/sync-cms-redirects.mjs and api/cms/redirects-status.js so both use identical parsing rules.
// Per-page free text like "/old-page -> /new-page", one rule per line. Blank lines are skipped; bad lines are reported.
export function parseRedirectsField(text, pageSlug) {
  const rules = [];
  const malformed = [];
  for (const rawLine of String(text || '').split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^(\/\S*)\s*->\s*(\/\S*)$/);
    if (!match) {
      malformed.push({ pageSlug, line, reason: 'Expected format "/old -> /new"' });
      continue;
    }
    const [, source, destination] = match;
    if (source === destination) {
      malformed.push({ pageSlug, line, reason: 'Source and destination are the same' });
      continue;
    }
    rules.push({ source, destination, permanent: false, pageSlug });
  }
  return { rules, malformed };
}

// Fetches every published page's redirects field from Supabase and returns a flattened, de-duplicated rule set
// plus any malformed lines and any sources claimed by more than one page (first page to define a source wins).
export async function collectCmsRedirects(client) {
  const { data: pages, error: pagesError } = await client
    .from('cms_pages')
    .select('page_slug, published_revision_id')
    .not('published_revision_id', 'is', null);
  if (pagesError) throw pagesError;

  const rules = [];
  const malformed = [];
  const duplicates = [];
  const seenSources = new Map();
  for (const page of pages) {
    const { data: revision, error: revisionError } = await client
      .from('cms_page_revisions')
      .select('content')
      .eq('id', page.published_revision_id)
      .eq('status', 'published')
      .maybeSingle();
    if (revisionError) throw revisionError;
    const { rules: pageRules, malformed: pageMalformed } = parseRedirectsField(revision?.content?.redirects, page.page_slug);
    malformed.push(...pageMalformed);
    for (const rule of pageRules) {
      const owner = seenSources.get(rule.source);
      if (owner && owner !== page.page_slug) {
        duplicates.push({ source: rule.source, keptOn: owner, ignoredOn: page.page_slug });
        continue;
      }
      seenSources.set(rule.source, page.page_slug);
      rules.push(rule);
    }
  }
  return { rules, malformed, duplicates };
}
