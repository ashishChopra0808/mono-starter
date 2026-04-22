import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.js';

/**
 * Sessions / refresh-token storage.
 *
 * Each row represents an active refresh token for a user.
 * When the auth module is implemented, it should:
 *   1. Create a session row on login.
 *   2. Delete the row on logout or token rotation.
 *   3. Periodically prune expired rows.
 */
export const sessions = pgTable('sessions', {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
