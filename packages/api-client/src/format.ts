import type { ErrorCode, ValidationErrorDetail } from '@mono/api-contracts';
import type { Logger } from '@mono/logger';

import {
  ApiError,
  NetworkError,
  ResponseValidationError,
  UnauthorizedError,
} from './errors.js';

// ─── Categorization ──────────────────────────────────────────────────────────

export type ErrorCategory =
  | 'auth' // 401 — please sign in again
  | 'permission' // 403 — you don't have access
  | 'not-found' // 404 — gone or never existed
  | 'validation' // 422 — fix the form
  | 'rate-limit' // 429 — slow down
  | 'conflict' // 409 — stale write / duplicate
  | 'network' // transport failure on the client
  | 'response-validation' // shape mismatch on the wire (likely backend bug)
  | 'unexpected'; // 5xx or anything else

/**
 * Bucket an `ApiError` (or subclass) into a category that maps cleanly to UI
 * decisions: redirect, show form errors, retry, generic banner, etc.
 */
export function categorizeError(error: ApiError): ErrorCategory {
  if (error instanceof UnauthorizedError) return 'auth';
  if (error instanceof NetworkError) return 'network';
  if (error instanceof ResponseValidationError) return 'response-validation';

  // Code wins over status (services may use a non-standard status).
  switch (error.code) {
    case 'UNAUTHORIZED':
      return 'auth';
    case 'FORBIDDEN':
      return 'permission';
    case 'NOT_FOUND':
      return 'not-found';
    case 'VALIDATION_FAILED':
      return 'validation';
    case 'RATE_LIMITED':
      return 'rate-limit';
    case 'CONFLICT':
      return 'conflict';
  }

  if (error.status === 403) return 'permission';
  if (error.status === 404) return 'not-found';
  if (error.status === 422) return 'validation';
  if (error.status === 429) return 'rate-limit';
  if (error.status === 409) return 'conflict';
  if (error.status >= 500) return 'unexpected';
  return 'unexpected';
}

// ─── Field-level errors ──────────────────────────────────────────────────────

/**
 * Extract `{ fieldName: message }` from a validation error.
 *
 * Returns `{}` when the error isn't a validation error or `details` is not in
 * the expected shape — UIs can safely spread the result without branching.
 *
 * Field paths use the dotted notation set by the backend
 * (`address.street`, `items.0.qty`).
 */
export function getFieldErrors(error: ApiError): Record<string, string> {
  if (categorizeError(error) !== 'validation') return {};
  const details = error.details;
  if (!Array.isArray(details)) return {};

  const out: Record<string, string> = {};
  for (const item of details as ValidationErrorDetail[]) {
    if (
      item &&
      typeof item === 'object' &&
      typeof item.path === 'string' &&
      typeof item.message === 'string' &&
      out[item.path] === undefined
    ) {
      out[item.path] = item.message;
    }
  }
  return out;
}

// ─── User-facing message ─────────────────────────────────────────────────────

export interface UserMessageOptions {
  /**
   * Map of `ErrorCode` → translated string. Apps usually pass strings from
   * their i18n layer here. Unknown codes fall back to category defaults, then
   * to the server-supplied `error.message`.
   */
  codeMessages?: Partial<Record<ErrorCode | string, string>>;
  /** Per-category fallbacks. */
  categoryMessages?: Partial<Record<ErrorCategory, string>>;
}

const DEFAULT_CATEGORY_MESSAGES: Record<ErrorCategory, string> = {
  auth: 'Your session has expired. Please sign in again.',
  permission: "You don't have permission to do that.",
  'not-found': 'We couldn’t find what you were looking for.',
  validation: 'Please check the highlighted fields and try again.',
  'rate-limit': 'Too many requests. Please wait a moment and retry.',
  conflict: 'That action conflicts with a recent change. Refresh and try again.',
  network: 'Connection issue. Check your network and retry.',
  'response-validation':
    'The server returned an unexpected response. Please try again.',
  unexpected: 'Something went wrong on our side. Please try again.',
};

/**
 * Produce a user-facing string. Priority:
 *   1. `codeMessages[error.code]`
 *   2. `error.message` from the server (already curated for `BusinessException`)
 *   3. `categoryMessages[category]`
 *   4. The built-in default per category
 *
 * Always returns a non-empty string.
 */
export function getUserMessage(
  error: ApiError,
  options: UserMessageOptions = {},
): string {
  const codeMessage = options.codeMessages?.[error.code];
  if (codeMessage) return codeMessage;

  if (error.message && error.message.trim().length > 0) {
    return error.message;
  }

  const category = categorizeError(error);
  return (
    options.categoryMessages?.[category] ?? DEFAULT_CATEGORY_MESSAGES[category]
  );
}

// ─── Logging helper ──────────────────────────────────────────────────────────

/**
 * Emit a structured log line for an `ApiError`. Severity matches the
 * category — auth/permission/network are `warn`; everything else from the
 * server is `error`. Validation errors are `info` since they reflect user
 * input. Never logs `details` (could be large; may carry sensitive input).
 */
export function logError(logger: Logger, error: ApiError, context: Record<string, unknown> = {}): void {
  const category = categorizeError(error);
  const payload = {
    ...context,
    code: error.code,
    status: error.status,
    requestId: error.requestId,
    kind: error.kind,
    category,
  };

  if (category === 'validation') {
    logger.info(payload, error.message);
    return;
  }
  if (category === 'unexpected' || category === 'response-validation') {
    logger.error(payload, error.message);
    return;
  }
  logger.warn(payload, error.message);
}
