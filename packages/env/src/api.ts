import { config } from 'dotenv';
import { resolve } from 'node:path';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

import { nodeEnvSchema, portSchema } from './shared.js';
import { sharedServerSchemas } from './server.js';

// Load .env from the workspace root for non-Next.js apps (Next.js handles this automatically)
config({ path: resolve(process.cwd(), '.env') });

/**
 * Typed environment for the **api** app (NestJS).
 *
 * All variables are server-side — there is no client bundle.
 * Validation runs at import time so the NestJS bootstrap will
 * fail fast if the environment is misconfigured.
 */
export const apiEnv = createEnv({
  // No client/server split needed for a pure Node.js app
  clientPrefix: undefined,

  server: {
    ...sharedServerSchemas,
    PORT: portSchema.default(3000),
    CORS_ORIGINS: z.string().default('*'),
  },

  shared: {
    NODE_ENV: nodeEnvSchema,
  },

  // In a pure Node.js context, process.env is always available
  runtimeEnv: process.env,

  emptyStringAsUndefined: true,
});
