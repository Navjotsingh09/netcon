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
import { collectCmsRedirects } from '../lib/cms/redirects.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vercelConfigPath = resolve(projectRoot, 'vercel.json');
const generatedPath = resolve(projectRoot, 'db', 'cms-redirects.generated.json');
const shouldWrite = process.argv.includes('--write');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}. Run \`vercel env pull .env.local\` first.`);
  return value;
}

async function fetchCmsRedirects() {
  const client = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const { rules, malformed, duplicates } = await collectCmsRedirects(client);
  malformed.forEach(({ pageSlug, line, reason }) => console.warn(`Skipping malformed redirect on page "${pageSlug}": "${line}" (${reason})`));
  duplicates.forEach(({ source, keptOn, ignoredOn }) => console.warn(`Duplicate redirect source "${source}" on "${ignoredOn}" (already defined on "${keptOn}") -- keeping the first one.`));
  return rules.map(({ source, destination, permanent }) => ({ source, destination, permanent }));
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
