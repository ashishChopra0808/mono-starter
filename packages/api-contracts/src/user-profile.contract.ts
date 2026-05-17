import { z } from 'zod';

import { userProfileSchema } from '@mono/validation';

import { successResponseSchema } from './common.js';

// ─── User Profile Contract ──────────────────────────────────────────────────
// Typed API contract for the current-user profile endpoint.
// Shared between frontend apps and the backend to prevent drift.

export const userProfileContract = {
  /**
   * GET /auth/me — Returns the currently authenticated user's profile.
   *
   * The response includes computed `permissions` (derived from the user's
   * role via @mono/auth) and `createdAt` from the database.
   */
  me: {
    method: 'GET' as const,
    path: '/auth/me',
    response: successResponseSchema(userProfileSchema),
  },
} as const;

export type UserProfileResponse = z.infer<
  typeof userProfileContract.me.response
>;
