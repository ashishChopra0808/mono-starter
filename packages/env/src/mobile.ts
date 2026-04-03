import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

/**
 * Typed environment for the **mobile** app (Expo / React Native).
 *
 * Expo uses the `EXPO_PUBLIC_` prefix for variables that should be
 * embedded in the JS bundle and accessible at runtime.
 *
 * Note: Expo bakes env vars into the bundle at build time — they
 * are NOT truly "secret" on the client. Only put public-safe values here.
 */
export const mobileEnv = createEnv({
  clientPrefix: 'EXPO_PUBLIC_',

  client: {
    EXPO_PUBLIC_API_URL: z.url(),
    EXPO_PUBLIC_APP_NAME: z.string().default('MonoStarter'),
  },

  // No server-side variables for mobile
  server: {},

  runtimeEnv: {
    EXPO_PUBLIC_API_URL: process.env['EXPO_PUBLIC_API_URL'],
    EXPO_PUBLIC_APP_NAME: process.env['EXPO_PUBLIC_APP_NAME'],
  },

  emptyStringAsUndefined: true,
});
