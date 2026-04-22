/**
 * Seed data for local development.
 *
 * This script is idempotent — it uses `onConflictDoNothing()` so
 * re-running it won't fail or create duplicates.
 *
 * Usage: pnpm db:seed
 */
import { resolve } from 'node:path';

import { config } from 'dotenv';

// Load .env from workspace root BEFORE any module that reads env vars.
// Because ESM hoists static imports, we use dynamic import() below
// to ensure dotenv runs first.
config({ path: resolve(import.meta.dirname, '../../../.env') });

async function seed(): Promise<void> {
  // Dynamic import ensures dotenv.config() above runs before
  // these modules are evaluated (ESM hoists static imports).
  const { closeDb, getDb } = await import('./client.js');
  const { users } = await import('./schema/index.js');

  console.log('🌱 Seeding database…');
  const db = getDb();

  const seedUsers = [
    { email: 'admin@example.com', name: 'Admin User', role: 'admin' },
    { email: 'user@example.com', name: 'Test User', role: 'user' },
    { email: 'editor@example.com', name: 'Editor User', role: 'editor' },
  ];

  const inserted = await db.insert(users).values(seedUsers).onConflictDoNothing().returning();

  console.log(
    `✅ Seeded ${inserted.length} user(s) (${seedUsers.length - inserted.length} already existed)`,
  );

  await closeDb();
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
