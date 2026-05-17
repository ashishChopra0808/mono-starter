import type {
  AuthSession,
  RefreshRequest,
  SignInRequest,
} from '@mono/auth';
import type { UserProfile } from '@mono/validation';

import { successResponseSchema } from './common.js';

// ─── Auth Contract ──────────────────────────────────────────────────────────
// Typed API contract for authentication endpoints.
// Shared between frontend apps and the backend to prevent drift.

export interface AuthContract {
  /** POST /auth/sign-in — Authenticate with email + password. */
  signIn: {
    method: 'POST';
    path: '/auth/sign-in';
    body: SignInRequest;
    response: { data: AuthSession };
  };

  /** POST /auth/refresh — Rotate refresh token. */
  refresh: {
    method: 'POST';
    path: '/auth/refresh';
    body: RefreshRequest;
    response: { data: AuthSession };
  };

  /** POST /auth/sign-out — Invalidate a refresh token. Requires Bearer token. */
  signOut: {
    method: 'POST';
    path: '/auth/sign-out';
    body: RefreshRequest;
    response: void;
  };

  /**
   * GET /auth/me — Get current user's enriched profile. Requires Bearer token.
   *
   * For the runtime-validated Zod contract, see `userProfileContract.me` in
   * `./user-profile.contract.ts`. This interface entry is the static-type view.
   */
  me: {
    method: 'GET';
    path: '/auth/me';
    response: { data: UserProfile };
  };
}

/** Auth response schemas (for runtime validation on the client). */
export const authResponseSchemas = {
  signIn: successResponseSchema,
  refresh: successResponseSchema,
} as const;
