// ─── @mono/api-client ────────────────────────────────────────────────────────
// Reusable, typed API client for all frontends.
//
// The default entry is platform-agnostic (no React). React hooks live under
// `@mono/api-client/react`. See `README.md` for usage conventions.

export { createApiClient } from './client.js';
export type {
  ApiClient,
  ApiClientConfig,
  HttpMethod,
  QueryParams,
  QueryValue,
  RequestOptions,
} from './client.js';

export {
  ApiError,
  NetworkError,
  ResponseValidationError,
  UnauthorizedError,
  parseErrorBody,
} from './errors.js';
export type { ApiErrorBody, ApiErrorKind } from './errors.js';

export { generateRequestId } from './correlation.js';

export { getCurrentUserProfile } from './services/index.js';

export {
  categorizeError,
  getFieldErrors,
  getUserMessage,
  logError,
  type ErrorCategory,
  type UserMessageOptions,
} from './format.js';
