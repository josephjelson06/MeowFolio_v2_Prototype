import { createApp } from './app';
import { env } from './config/env';
import { pool } from './db/pool';
import { runMigrations } from './db/runMigrations';
import { seedDemoData } from './db/seedDemoData';

async function start() {
  await runMigrations();
  await seedDemoData();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`resumeai backend listening on http://localhost:${env.port}`);
  });
}

start().catch(async error => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
