// Regenerates vercel.json's `redirects` array from each published page's CMS "URL redirects" field.
// The CMS field alone never redirects anyone (no server reads it) -- Vercel's static redirects,
// evaluated at the edge from vercel.json, are the only real redirect mechanism this site has.
// This script bridges the two: run it, then commit + deploy for the redirects to take effect.
//
// Usage: node --env-file=.env.local scripts/sync-cms-redirects.mjs [--write]
//   (no flag)  Print what would change.
//   --write    Update vercel.json and db/cms-redirects.generated.json on disk.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vercelConfigPath = resolve(projectRoot, 'vercel.json');
const generatedPath = resolve(projectRoot, 'db', 'cms-redirects.generated.json');
const shouldWrite = process.argv.includes('--write');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}. Run \`vercel env pull .env.local\` first.`);
  return value;
}

// Per-page free text like "/old-page -> /new-page", one rule per line. Blank lines and bad lines are skipped.
function parseRedirectsField(text, pageSlug) {
  const rules = [];
  for (const rawLine of String(text || '').split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(/^(\/\S*)\s*->\s*(\/\S*)$/);
    if (!match) {
      console.warn(`Skipping malformed redirect on page "${pageSlug}": "${line}" (expected "/old -> /new")`);
      continue;
    }
    const [, source, destination] = match;
    if (source === destination) {
      console.warn(`Skipping no-op redirect on page "${pageSlug}": "${line}"`);
      continue;
    }
    rules.push({ source, destination, permanent: false });
  }
  return rules;
}

async function fetchCmsRedirects() {
  const client = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { data: pages, error: pagesError } = await client
    .from('cms_pages')
    .select('page_slug, published_revision_id')
    .not('published_revision_id', 'is', null);
  if (pagesError) throw pagesError;

  const rules = [];
  const seenSources = new Map();
  for (const page of pages) {
    const { data: revision, error: revisionError } = await client
      .from('cms_page_revisions')
      .select('content')
      .eq('id', page.published_revision_id)
      .eq('status', 'published')
      .maybeSingle();
    if (revisionError) throw revisionError;
    const pageRules = parseRedirectsField(revision?.content?.redirects, page.page_slug);
    for (const rule of pageRules) {
      const owner = seenSources.get(rule.source);
      if (owner && owner !== page.page_slug) {
        console.warn(`Duplicate redirect source "${rule.source}" on "${page.page_slug}" (already defined on "${owner}") -- keeping the first one.`);
        continue;
      }
      seenSources.set(rule.source, page.page_slug);
      rules.push(rule);
    }
  }
  return rules;
}

async function main() {
  const vercelConfig = JSON.parse(await readFile(vercelConfigPath, 'utf8'));
  let previousGenerated = [];
  try {
    previousGenerated = JSON.parse(await readFile(generatedPath, 'utf8'));
  } catch {
    // No prior run yet; nothing to remove.
  }
  const previousCmsSources = new Set(previousGenerated.map((rule) => rule.source));

  const newCmsRedirects = await fetchCmsRedirects();
  const handWritten = (vercelConfig.redirects || []).filter((rule) => !previousCmsSources.has(rule.source));
  const merged = [...handWritten, ...newCmsRedirects];

  const added = newCmsRedirects.filter((rule) => !previousCmsSources.has(rule.source));
  const removed = previousGenerated.filter((rule) => !newCmsRedirects.some((r) => r.source === rule.source));
  console.log(`CMS-managed redirects: ${newCmsRedirects.length} total, ${added.length} added, ${removed.length} removed since last sync.`);
  added.forEach((rule) => console.log(`  + ${rule.source} -> ${rule.destination}`));
  removed.forEach((rule) => console.log(`  - ${rule.source} -> ${rule.destination}`));

  if (!shouldWrite) {
    console.log('\nDry run only. Re-run with --write to update vercel.json.');
    return;
  }

  vercelConfig.redirects = merged;
  await writeFile(vercelConfigPath, `${JSON.stringify(vercelConfig, null, 2)}\n`);
  await writeFile(generatedPath, `${JSON.stringify(newCmsRedirects, null, 2)}\n`);
  console.log('\nUpdated vercel.json and db/cms-redirects.generated.json. Commit both and deploy for the redirects to take effect.');
}

main().catch((error) => {
  console.error('Failed to sync CMS redirects:', error);
  process.exitCode = 1;
});
