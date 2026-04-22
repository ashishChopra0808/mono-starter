import { resolve } from 'node:path';

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Load .env from workspace root when running as a standalone script
config({ path: resolve(import.meta.dirname, '../../../.env') });

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

async function runMigrations(): Promise<void> {
  console.log('🔄 Running migrations…');

  // Use a dedicated connection for migrations (max 1)
  const client = postgres(getDatabaseUrl(), { max: 1 });
  const db = drizzle(client);

  try {
    await migrate(db, {
      migrationsFolder: resolve(import.meta.dirname, 'drizzle'),
    });
    console.log('✅ Migrations complete');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
