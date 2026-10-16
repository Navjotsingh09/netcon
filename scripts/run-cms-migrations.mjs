import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const migrationDirectory = join(projectRoot, 'db', 'migrations');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Run `vercel env pull .env.local` before migrations.');
}

const client = new pg.Client({ connectionString: databaseUrl, connectionTimeoutMillis: 10000 });
await client.connect();

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS cms_schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationFiles = (await readdir(migrationDirectory))
    .filter((filename) => filename.endsWith('.sql'))
    .sort();
  const { rows: appliedRows } = await client.query('SELECT filename FROM cms_schema_migrations');
  const appliedFiles = new Set(appliedRows.map((row) => row.filename));

  for (const filename of migrationFiles) {
    if (appliedFiles.has(filename)) continue;
    const source = await readFile(join(migrationDirectory, filename), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(source);
      await client.query('INSERT INTO cms_schema_migrations (filename) VALUES ($1)', [filename]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    console.log(`Applied ${filename}`);
  }
} finally {
  await client.end();
}