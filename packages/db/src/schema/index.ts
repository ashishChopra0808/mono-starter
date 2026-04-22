/**
 * Schema barrel export.
 *
 * Every schema file should be re-exported here so that:
 *   1. Drizzle Kit can discover all tables for migration generation.
 *   2. The Drizzle client receives the full schema for relational queries.
 *   3. Consumers can import types from `@mono/db/schema`.
 *
 * When adding a new table:
 *   1. Create `packages/db/src/schema/<table>.ts`
 *   2. Add `export * from './<table>.js';` below
 *   3. Run `pnpm db:generate` then `pnpm db:migrate`
 */

export * from './sessions.js';
export * from './users.js';

// ─── Inferred Types ─────────────────────────────────────────────────────────
// Re-export inferred insert/select types for convenience.
// Usage: import type { User, NewUser } from '@mono/db/schema';

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import type { sessions } from './sessions.js';
import type { users } from './users.js';

/** A user row as returned from the database. */
export type User = InferSelectModel<typeof users>;

/** The shape required to insert a new user. */
export type NewUser = InferInsertModel<typeof users>;

/** A session row as returned from the database. */
export type Session = InferSelectModel<typeof sessions>;

/** The shape required to insert a new session. */
export type NewSession = InferInsertModel<typeof sessions>;
