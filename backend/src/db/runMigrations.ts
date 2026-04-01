import fs from 'node:fs';
import path from 'node:path';
import { paths } from '../config/env';
import { pool } from './pool';

export async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const files = fs.readdirSync(paths.migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const existing = await pool.query('SELECT id FROM schema_migrations WHERE id = $1', [file]);
    if (existing.rowCount) continue;

    const sql = fs.readFileSync(path.join(paths.migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      await pool.end();
      console.log('Migrations complete.');
    })
    .catch(async error => {
      console.error(error);
      await pool.end();
      process.exit(1);
    });
}
