import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const migrationDirectory = join(projectRoot, 'db', 'migrations');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Run `vercel env pull .env.local` before migrations.');
}

const sql = neon(databaseUrl);
await sql.query(`
  CREATE TABLE IF NOT EXISTS cms_schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

const migrationFiles = (await readdir(migrationDirectory))
  .filter((filename) => filename.endsWith('.sql'))
  .sort();
const appliedRows = await sql.query('SELECT filename FROM cms_schema_migrations');
const appliedFiles = new Set(appliedRows.map((row) => row.filename));

for (const filename of migrationFiles) {
  if (appliedFiles.has(filename)) continue;
  const source = await readFile(join(migrationDirectory, filename), 'utf8');
  await sql.transaction([
    sql.query(source),
    sql`INSERT INTO cms_schema_migrations (filename) VALUES (${filename})`
  ]);
  console.log(`Applied ${filename}`);
}