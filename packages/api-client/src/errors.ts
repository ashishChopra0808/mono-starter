// ─── API client errors ───────────────────────────────────────────────────────
// All error subclasses extend `ApiError` so callers can `catch (e)` once and
// branch on `instanceof` or on `error.kind`.

export type ApiErrorKind =
  | 'http'
  | 'unauthorized'
  | 'network'
  | 'response-validation';

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Base error thrown by the API client. Carries the HTTP status (or 0 for
 * non-HTTP errors), an application-level `code`, and optional `details`.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(args: {
    kind: ApiErrorKind;
    status: number;
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  }) {
    super(args.message);
    this.name = 'ApiError';
    this.kind = args.kind;
    this.status = args.status;
    this.code = args.code;
    this.details = args.details;
    this.requestId = args.requestId;
  }
}

/** Thrown on 401 responses. Apps can `instanceof`-check this for sign-out flows. */
export class UnauthorizedError extends ApiError {
  constructor(args: Omit<ConstructorParameters<typeof ApiError>[0], 'kind' | 'status'>) {
    super({ ...args, kind: 'unauthorized', status: 401 });
    this.name = 'UnauthorizedError';
  }
}

/** Thrown when `fetch` itself rejects (DNS failure, offline, CORS, etc.). */
export class NetworkError extends ApiError {
  constructor(message: string, cause?: unknown, requestId?: string) {
    super({
      kind: 'network',
      status: 0,
      code: 'NETWORK_ERROR',
      message,
      details: cause,
      requestId,
    });
    this.name = 'NetworkError';
  }
}

/**
 * Thrown when the response status is 2xx but the body doesn't match the
 * provided Zod schema. Carries the raw body so callers can log it for debugging.
 */
export class ResponseValidationError extends ApiError {
  readonly rawBody: unknown;
  constructor(message: string, rawBody: unknown, details: unknown, requestId?: string) {
    super({
      kind: 'response-validation',
      status: 0,
      code: 'RESPONSE_VALIDATION_FAILED',
      message,
      details,
      requestId,
    });
    this.name = 'ResponseValidationError';
    this.rawBody = rawBody;
  }
}

/**
 * Best-effort parse of the standard `{ error: { code, message, details? } }`
 * shape. Falls back to a generic shape so non-conforming bodies don't crash
 * the client.
 */
export function parseErrorBody(body: unknown, status: number): ApiErrorBody {
  if (
    body &&
    typeof body === 'object' &&
    'error' in body &&
    body.error &&
    typeof body.error === 'object'
  ) {
    const e = body.error as Record<string, unknown>;
    return {
      code: typeof e['code'] === 'string' ? (e['code'] as string) : `HTTP_${status}`,
      message:
        typeof e['message'] === 'string'
          ? (e['message'] as string)
          : `Request failed with status ${status}`,
      details: e['details'],
    };
  }
  return {
    code: `HTTP_${status}`,
    message: `Request failed with status ${status}`,
    details: body,
  };
}
