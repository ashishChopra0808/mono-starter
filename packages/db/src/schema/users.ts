import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * Core users table.
 *
 * Extend this table by adding columns here. After changes, run:
 *   pnpm db:generate   — generates a migration SQL file
 *   pnpm db:migrate    — applies the migration
 */
export const users = pgTable('users', {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }),
  role: varchar({ length: 50 }).notNull().default('user'),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
