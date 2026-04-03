import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { nodeEnvSchema } from './shared.js';
import { sharedServerSchemas } from './server.js';

/**
 * Typed environment for the **admin** app (Next.js).
 *
 * Same server/client split as web, with an additional
 * `NEXT_PUBLIC_ADMIN_ROLE` variable for role-based UI gating.
 */
export const adminEnv = createEnv({
  // ── Server-side ───────────────────────────────────────────────────────
  server: {
    ...sharedServerSchemas,
  },

  // ── Client-side ───────────────────────────────────────────────────────
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_API_URL: z.url(),
    NEXT_PUBLIC_ADMIN_ROLE: z.string().default('admin'),
  },

  // ── Shared ────────────────────────────────────────────────────────────
  shared: {
    NODE_ENV: nodeEnvSchema,
  },

  experimental__runtimeEnv: {
    NODE_ENV: process.env['NODE_ENV'],
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],
    NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'],
    NEXT_PUBLIC_ADMIN_ROLE: process.env['NEXT_PUBLIC_ADMIN_ROLE'],
  },

  emptyStringAsUndefined: true,
});
