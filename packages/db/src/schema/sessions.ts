import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.js';

/**
 * Sessions / refresh-token storage.
 *
 * Each row represents an active refresh token for a user.
 * The refreshToken column stores a SHA-256 hash (not plaintext).
 */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    refreshToken: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Index for token lookup during refresh and sign-out operations
    index('sessions_refresh_token_idx').on(table.refreshToken),
    // Index for session pruning cron job (DELETE WHERE expires_at < NOW())
    index('sessions_expires_at_idx').on(table.expiresAt),
  ],
);
