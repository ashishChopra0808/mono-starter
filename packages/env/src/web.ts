import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { nodeEnvSchema } from './shared.js';
import { sharedServerSchemas } from './server.js';

/**
 * Typed environment for the **web** app (Next.js).
 *
 * - Server variables: accessed only in server components, API routes, etc.
 * - Client variables: must be prefixed with `NEXT_PUBLIC_` and are safe to
 *   expose in the browser bundle.
 *
 * Validation runs at import time — if any required variable is missing the
 * app will fail to start with a descriptive error.
 */
export const webEnv = createEnv({
  // ── Server-side ───────────────────────────────────────────────────────
  server: {
    ...sharedServerSchemas,
  },

  // ── Client-side ───────────────────────────────────────────────────────
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_API_URL: z.url(),
  },

  // ── Shared (available on both sides) ──────────────────────────────────
  shared: {
    NODE_ENV: nodeEnvSchema,
  },

  // Next.js ≥13.4.4 — only client env needs manual destructuring
  experimental__runtimeEnv: {
    NODE_ENV: process.env['NODE_ENV'],
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],
    NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'],
  },

  // Treat "" as undefined so missing vars trigger defaults/errors
  emptyStringAsUndefined: true,
});
