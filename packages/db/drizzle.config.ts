import { resolve } from 'node:path';

import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env from workspace root (two levels up from packages/db).
// Note: __dirname is used here intentionally — Drizzle Kit processes this
// config through its own bundler which provides CommonJS globals.
config({ path: resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Ensure .env exists at the workspace root.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './src/drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Use snake_case for DB column names by convention
  casing: 'snake_case',
  verbose: true,
  strict: true,
});
