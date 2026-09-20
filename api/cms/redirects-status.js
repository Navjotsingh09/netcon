// Read-only "self-serve" visibility for the CMS "URL redirects" page field: lets a reviewer see, from inside
// the admin UI, what redirects every published page currently defines and whether they've drifted from the
// last time scripts/sync-cms-redirects.mjs --write was run -- without needing terminal/CLI access to check.
//
// This deliberately does NOT write vercel.json or trigger a deployment: Vercel only applies `redirects` rules
// from a fresh build, so making a rule "live" always requires a real deploy. Actually shipping a redirect still
// needs a developer to run `node scripts/sync-cms-redirects.mjs --write`, commit, and deploy (see docs/cms-setup.md).
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { requireCmsUser } from '../../lib/cms/auth.js';
import { supabaseAdmin } from '../../lib/cms/database.js';
import { collectCmsRedirects } from '../../lib/cms/redirects.js';
import { errorResponse, json, options } from '../../lib/cms/http.js';

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') return options(request, response);
  if (request.method !== 'GET') return errorResponse(request, response, 'Method not allowed.', 405);
  const access = await requireCmsUser(request, ['reviewer']);
  if (access.error) return errorResponse(request, response, access.error, access.status);
  try {
    const client = supabaseAdmin();
    const { rules, malformed, duplicates } = await collectCmsRedirects(client);

    let lastSynced = [];
    try {
      lastSynced = JSON.parse(await readFile(resolve(process.cwd(), 'db', 'cms-redirects.generated.json'), 'utf8'));
    } catch {
      // No prior sync run yet -- everything currently defined counts as "added".
    }
    const lastSyncedSources = new Set(lastSynced.map((rule) => rule.source));
    const currentSources = new Set(rules.map((rule) => rule.source));
    const added = rules.filter((rule) => !lastSyncedSources.has(rule.source));
    const removed = lastSynced.filter((rule) => !currentSources.has(rule.source));

    return json(request, response, {
      current: rules,
      inSync: added.length === 0 && removed.length === 0,
      added,
      removed,
      malformed,
      duplicates,
      instructions: added.length || removed.length
        ? 'Redirects have changed since the last sync. Ask a developer to run `node scripts/sync-cms-redirects.mjs --write`, then commit and deploy for these to take effect live.'
        : 'Live redirects match every published page\'s current "URL redirects" field.'
    });
  } catch (error) {
    console.error('CMS redirects status request failed', error);
    return errorResponse(request, response, 'Could not check redirect sync status.');
  }
}
