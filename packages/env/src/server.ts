import { z } from 'zod';

// ─── Shared Server-Only Schemas ─────────────────────────────────────────────
// These are reusable schema fragments for server-side env vars that are common
// across multiple apps (web, admin, api). Import and spread into your app's
// `server` config.

export const sharedServerSchemas = {
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.url().optional(),
} as const;
