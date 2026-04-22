import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

// ─── Types ──────────────────────────────────────────────────────────────────

/** The Drizzle client type with full schema awareness. */
export type Database = ReturnType<typeof drizzle<typeof schema>>;

// ─── Singleton ──────────────────────────────────────────────────────────────

let _db: Database | undefined;
let _client: postgres.Sql | undefined;

/**
 * Returns the shared Drizzle database client (lazy singleton).
 *
 * The connection string is read from `DATABASE_URL` in the environment.
 * In a NestJS app this is already validated by `@mono/env/api`.
 *
 * @example
 * ```ts
 * import { getDb } from '@mono/db';
 *
 * const db = getDb();
 * const allUsers = await db.select().from(schema.users);
 * ```
 */
export function getDb(): Database {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL is not set. Set it in the environment before calling getDb().',
      );
    }

    _client = postgres(url, {
      // Limit connections for serverless-friendly defaults.
      // Increase in production or use an external pooler (PgBouncer).
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    _db = drizzle(_client, { schema, casing: 'snake_case' });
  }
  return _db;
}

/**
 * Gracefully closes the database connection.
 * Call this during application shutdown.
 */
export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.end();
    _client = undefined;
    _db = undefined;
  }
}
