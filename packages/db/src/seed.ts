/**
 * Seed data for local development.
 *
 * This script is idempotent — it uses `onConflictDoNothing()` so
 * re-running it won't fail or create duplicates.
 *
 * Default password for all seed users: "password123"
 *
 * Usage: pnpm db:seed
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';

// Load .env from workspace root BEFORE any module that reads env vars.
// Because ESM hoists static imports, we use dynamic import() below
// to ensure dotenv runs first.
config({ path: resolve(import.meta.dirname, '../../../.env') });

async function seed(): Promise<void> {
  const { closeDb, getDb } = await import('./client.js');
  const { users } = await import('./schema/index.js');

  // bcrypt is a devDependency of packages/db (for seeding only).
  const { hash } = await import('bcrypt');

  console.log('🌱 Seeding database…');
  const db = getDb();

  // Hash the default password once (bcrypt, 10 rounds)
  const defaultPasswordHash = await hash('password123', 10);

  const seedUsers = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'user@example.com',
      name: 'Test User',
      role: 'user',
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'editor@example.com',
      name: 'Editor User',
      role: 'editor',
      passwordHash: defaultPasswordHash,
    },
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
