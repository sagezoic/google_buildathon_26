import { SQL } from 'bun';
import { drizzle, type BunSQLDatabase } from 'drizzle-orm/bun-sql';
import * as schema from './schema';

export type AppDb = BunSQLDatabase<typeof schema> & {
  $client: SQL;
};

let _client: SQL | null = null;
let _db: AppDb | null = null;

/**
 * Returns the Drizzle ORM client connected to Bun SQL.
 * Lazy-initialized so importing this module does NOT attempt a database connection.
 * Throws if DATABASE_URL is not provided when getDb() is actually invoked.
 */
export function getDb(): AppDb {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Please set DATABASE_URL to access the database.');
  }

  if (!_db) {
    _client = new SQL(url);
    _db = drizzle(_client, { schema });
  }

  return _db;
}

/**
 * Close database connection pool if active.
 */
export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.close();
    _client = null;
    _db = null;
  }
}
