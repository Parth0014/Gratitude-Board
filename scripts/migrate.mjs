import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import pg from 'pg';

if (!process.env.DATABASE_URL)
  throw new Error(
    'DATABASE_URL is required. Copy .env.example to .env for local development.',
  );

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
});
await client.connect();
try {
  // Session lock serializes migrations across deploy processes.
  await client.query('SELECT pg_advisory_lock(718254031)');
  await client.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())',
  );
  const directory = new URL('../db/migrations/', import.meta.url);
  const files = (await readdir(directory))
    .filter((name) => /^\d+_.+\.sql$/.test(name))
    .sort();
  for (const name of files) {
    const sql = await readFile(new URL(name, directory), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const existing = await client.query(
      'SELECT checksum FROM schema_migrations WHERE name = $1',
      [name],
    );
    if (existing.rowCount) {
      if (existing.rows[0].checksum !== checksum)
        throw new Error(
          `Applied migration changed: ${name}. Add a new migration instead.`,
        );
      continue;
    }
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)',
        [name, checksum],
      );
      await client.query('COMMIT');
      console.log(`Applied ${name}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
  console.log('Database migrations are up to date.');
} finally {
  // Closing the session also releases the advisory lock after any failure.
  await client.end();
}
