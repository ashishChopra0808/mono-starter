// ─── Database Package ───────────────────────────────────────────────────────
// Re-exports the database client, schema, and types.
//
// Consumers should import from:
//   '@mono/db'        — client + schema (most common)
//   '@mono/db/schema' — schema + types only (no client instantiation)
//   '@mono/db/client' — client only

export * from './client.js';
export * from './schema/index.js';
