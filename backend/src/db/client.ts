import { SQL } from 'bun';
import { drizzle, type BunSQLDatabase } from 'drizzle-orm/bun-sql';
import fs from 'node:fs';
import * as schema from './schema';

export type AppDb = BunSQLDatabase<typeof schema> & {
  $client: SQL;
};

let _client: SQL | null = null;
let _db: AppDb | null = null;

/**
 * Resolves the effective database URL.
 * If DATABASE_URL references a Cloud SQL unix socket (/cloudsql/...) that is not
 * accessible or mounted on the filesystem, it automatically falls back to
 * DATABASE_URL_DIRECT (direct public IP TCP connection) when available.
 */
function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || process.env.DATABASE_URL_DIRECT;
  if (!url) {
    throw new Error('DATABASE_URL is not set. Please set DATABASE_URL to access the database.');
  }

  const socketMatch = url.match(/[?&]host=(\/cloudsql\/[^&]+)/);
  if (socketMatch) {
    const socketDir = socketMatch[1];
    const exists = fs.existsSync(socketDir);
    if (!exists) {
      if (process.env.DATABASE_URL_DIRECT) {
        console.warn(
          `[realdha-backend] Cloud SQL socket ${socketDir} not found on filesystem. Falling back to DATABASE_URL_DIRECT.`
        );
        return process.env.DATABASE_URL_DIRECT;
      }
      console.warn(
        `[realdha-backend] Warning: Cloud SQL socket directory ${socketDir} not found on filesystem.`
      );
    }
  }

  return url;
}

/**
 * Returns the Drizzle ORM client connected to Bun SQL.
 * Lazy-initialized so importing this module does NOT attempt a database connection.
 * Throws if DATABASE_URL is not provided when getDb() is actually invoked.
 */
export function getDb(): AppDb {
  const url = resolveDatabaseUrl();

  if (!_db) {
    _client = new SQL(url);
    _db = drizzle(_client, { schema });
  }

  return _db;
}

/**
 * Tests database connectivity and returns a status object.
 */
export async function testDbConnection(): Promise<{
  status: 'connected' | 'error' | 'unconfigured';
  connected: boolean;
  error?: string;
}> {
  if (!process.env.DATABASE_URL && !process.env.DATABASE_URL_DIRECT) {
    return { status: 'unconfigured', connected: false };
  }

  try {
    const db = getDb();
    await db.$client.unsafe('SELECT 1');
    return { status: 'connected', connected: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[realdha-backend] Database connection check failed:', message);
    return { status: 'error', connected: false, error: message };
  }
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
