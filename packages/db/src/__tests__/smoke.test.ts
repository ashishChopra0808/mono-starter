/**
 * Smoke test for the database package.
 *
 * Requires a running Postgres instance (pnpm db:up).
 * Run with: cd packages/db && npx tsx src/__tests__/smoke.test.ts
 *
 * This is an integration test — it connects to a real database,
 * verifies tables exist, performs a basic CRUD cycle, and cleans up.
 */
import { resolve } from 'node:path';

import { config } from 'dotenv';
import { eq } from 'drizzle-orm';

config({ path: resolve(import.meta.dirname, '../../../../.env') });

async function smokeTest(): Promise<void> {
  const { closeDb, getDb } = await import('../client.js');
  const { users } = await import('../schema/index.js');

  const db = getDb();
  const testEmail = `smoke-test-${Date.now()}@test.local`;

  try {
    // 1. Insert
    const [created] = await db
      .insert(users)
      .values({ email: testEmail, name: 'Smoke Test', role: 'user' })
      .returning();

    assert(created, 'Insert should return the created row');
    assert(created.id, 'Created row should have an id');
    assert(created.email === testEmail, `Email should be ${testEmail}`);
    console.log('✅ INSERT works');

    // 2. Select
    const [found] = await db.select().from(users).where(eq(users.email, testEmail));
    assert(found, 'Should find the inserted user');
    assert(found.id === created.id, 'IDs should match');
    console.log('✅ SELECT works');

    // 3. Update
    const [updated] = await db
      .update(users)
      .set({ name: 'Updated Name' })
      .where(eq(users.id, created.id))
      .returning();
    assert(updated.name === 'Updated Name', 'Name should be updated');
    console.log('✅ UPDATE works');

    // 4. Delete
    const [deleted] = await db.delete(users).where(eq(users.id, created.id)).returning();
    assert(deleted.id === created.id, 'Deleted row should match');
    const [gone] = await db.select().from(users).where(eq(users.id, created.id));
    assert(!gone, 'Row should be gone after delete');
    console.log('✅ DELETE works');

    console.log('\n🎉 All smoke tests passed!');
  } finally {
    // Clean up test data if the test failed mid-way
    await db.delete(users).where(eq(users.email, testEmail));
    await closeDb();
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
}

smokeTest().catch((error) => {
  console.error('❌ Smoke test failed:', error);
  process.exit(1);
});
