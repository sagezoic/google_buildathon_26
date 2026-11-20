import { migrate } from 'drizzle-orm/bun-sql/migrator';
import { getDb, closeDb } from './client';
import path from 'path';

async function runMigrations() {
  console.log('[db:migrate] Starting database migration...');
  const db = getDb();
  const migrationsFolder = path.resolve(__dirname, '../../drizzle');

  try {
    await migrate(db, { migrationsFolder });
    console.log('[db:migrate] Migrations completed successfully.');
  } catch (err) {
    console.error('[db:migrate] Migration failed:', err);
    process.exit(1);
  } finally {
    await closeDb();
  }
}

if (import.meta.main) {
  runMigrations();
}
