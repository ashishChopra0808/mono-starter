import type { Role } from './roles.js';

// ─── Authentication Types ───────────────────────────────────────────────────
// These types are shared across all platforms (web, admin, mobile, API).
// They define the shape of auth-related data, NOT the transport mechanism.

/**
 * The authenticated user attached to a request.
 *
 * This is the common shape used by guards, decorators, and service code.
 * It does NOT include sensitive fields like passwordHash.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

/**
 * The response shape for a successful authentication.
 *
 * Web clients use the cookie (set by the server), mobile clients
 * use the tokens from the response body.
 */
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 datetime
}

/**
 * JWT access token payload.
 *
 * Kept minimal — only what's needed for authorization decisions.
 * Full user data should be fetched from the DB when needed.
 */
export interface TokenPayload {
  /** User ID (subject) */
  sub: string;
  /** User role for authorization */
  role: Role;
  /** Issued at (Unix timestamp) */
  iat: number;
  /** Expiration (Unix timestamp) */
  exp: number;
}

// ─── Request Types ──────────────────────────────────────────────────────────

/** Sign-in request body. */
export interface SignInRequest {
  email: string;
  password: string;
}

/** Refresh token request body. */
export interface RefreshRequest {
  refreshToken: string;
}
