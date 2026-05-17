// ─── Error code registry ─────────────────────────────────────────────────────
// Single source of truth for error codes shared by the backend and all
// clients. Backend throws these (via BusinessException or by mapping HTTP
// statuses); clients categorize / translate by them.
//
// Naming:
//   - SCREAMING_SNAKE_CASE.
//   - Generic codes are bare (e.g. `UNAUTHORIZED`).
//   - Domain codes use a resource prefix (e.g. `PROFILE_NOT_FOUND`,
//     `BOOKING_PAYMENT_FAILED`).
//
// Adding a code:
//   1. Add it here with the appropriate HTTP status in HTTP_STATUS_BY_CODE.
//   2. Throw a `BusinessException` from the backend (or map an HttpException
//      to it in the global filter).
//   3. Optionally add a translation in each app's `errors.*` i18n namespace.

export const ERROR_CODES = {
  // ── Generic / cross-cutting ────────────────────────────────────────────────
  /** No credentials, expired or invalid token. */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** Authenticated but not permitted to perform this action. */
  FORBIDDEN: 'FORBIDDEN',
  /** Resource does not exist. */
  NOT_FOUND: 'NOT_FOUND',
  /** Request would create a conflict (duplicate key, stale write, …). */
  CONFLICT: 'CONFLICT',
  /** Request payload failed schema validation. `details` is a `ValidationErrorDetail[]`. */
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  /** Too many requests — rate limited. */
  RATE_LIMITED: 'RATE_LIMITED',
  /** Catch-all for bad-but-not-validation 4xx (e.g. malformed JSON). */
  BAD_REQUEST: 'BAD_REQUEST',
  /** Caller posted to a route with the wrong HTTP method. */
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  /** Server reached but cannot serve this content type. */
  UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',
  /** Generic unexpected error — never carries a user-facing message in prod. */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  /** Server is up but a dependency is down (DB, upstream API, …). */
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Maps an `ERROR_CODES` value to the HTTP status the API returns for it.
 * Codes not listed here are server-defined (the throwing code chooses).
 */
export const HTTP_STATUS_BY_CODE: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNSUPPORTED_MEDIA_TYPE: 415,
  VALIDATION_FAILED: 422,
  RATE_LIMITED: 429,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/** Reverse map used by the server filter when only a status is known. */
export const CODE_BY_HTTP_STATUS: Record<number, ErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  405: 'METHOD_NOT_ALLOWED',
  409: 'CONFLICT',
  415: 'UNSUPPORTED_MEDIA_TYPE',
  422: 'VALIDATION_FAILED',
  429: 'RATE_LIMITED',
  500: 'INTERNAL_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

/** True if `code` is a known registered code (vs a free-form string). */
export function isKnownErrorCode(code: string): code is ErrorCode {
  return code in HTTP_STATUS_BY_CODE;
}
