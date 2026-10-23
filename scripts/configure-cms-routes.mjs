import { readFile, writeFile } from 'node:fs/promises';
import { CMS_PAGE_DEFINITIONS, pageRoutePaths } from '../lib/cms/pages.js';

const filename = new URL('../vercel.json', import.meta.url);
const original = await readFile(filename, 'utf8');
const config = JSON.parse(original);
const includeFiles = '{*.html,services/*.html,solutions/*.html,industries/*.html,resources/*.html,case-studies/*.html}';
for (const path of ['api/public/site.js', 'api/cms/pages/[slug].js', 'api/cms/pages/[slug]/preview.js', 'api/cms/pages/[slug]/workflow.js']) {
  config.functions[path] = { ...config.functions[path], regions: ['lhr1'], includeFiles };
}
const paths = CMS_PAGE_DEFINITIONS.flatMap(pageRoutePaths);
config.rewrites = (config.rewrites || []).filter((rule) => !rule.destination.startsWith('/api/public/site?'));
config.proxy = { entrypoint: 'middleware.js', matcher: paths };
const output = `${JSON.stringify(config, null, 2)}\n`;
if (process.argv.includes('--write')) {
  await writeFile(filename, output);
  console.log(`Configured ${paths.length} CMS middleware paths.`);
} else if (original !== output) {
  console.error('CMS routes are out of date. Run node scripts/configure-cms-routes.mjs --write.');
  process.exitCode = 1;
} else {
  console.log(`Verified ${paths.length} CMS middleware paths.`);
}
