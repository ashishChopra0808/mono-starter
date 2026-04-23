// ─── Database Package ───────────────────────────────────────────────────────
// Re-exports the database client, schema, and types.
//
// Consumers should import from:
//   '@mono/db'        — client + schema (most common)
//   '@mono/db/schema' — schema + types only (no client instantiation)
//   '@mono/db/client' — client only

export * from './client.js';
export * from './schema/index.js';

// Re-export commonly used drizzle-orm operators so consuming apps
// don't need drizzle-orm as a direct dependency.
export { eq, ne, gt, gte, lt, lte, and, or, sql } from 'drizzle-orm';
