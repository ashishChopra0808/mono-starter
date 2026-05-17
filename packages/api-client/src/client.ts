import type { Logger } from '@mono/logger';
import type { z } from 'zod';

import { generateRequestId } from './correlation.js';
import {
  ApiError,
  NetworkError,
  ResponseValidationError,
  UnauthorizedError,
  parseErrorBody,
} from './errors.js';

// ─── Public types ────────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export interface ApiClientConfig {
  /** Absolute base URL (e.g. `https://api.example.com/api/v1`). No trailing slash needed. */
  baseUrl: string;
  /**
   * Returns the current access token, or `undefined` if unauthenticated.
   * May be sync or async — async covers reading from `SecureStore` on mobile.
   */
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
  /**
   * Called once per request that fails with 401. Apps typically use this to
   * sign out, redirect to login, or trigger a refresh-then-retry wrapper.
   */
  onUnauthorized?: () => void;
  /** Optional logger. If omitted, requests are silent. */
  logger?: Logger;
  /** Extra headers added to every request (e.g. an app identifier). */
  defaultHeaders?: Record<string, string>;
  /**
   * Default per-request timeout in milliseconds. Per-call `timeoutMs` overrides.
   * Omit (or pass `0`) to disable timeouts globally. Times out → `NetworkError`.
   */
  timeoutMs?: number;
  /** Override the `fetch` implementation — primarily for tests. */
  fetchImpl?: typeof fetch;
}

export interface RequestOptions<TResponse> {
  method: HttpMethod;
  path: string;
  query?: QueryParams;
  body?: unknown;
  /** If provided, the response body is parsed with this Zod schema. */
  responseSchema?: z.ZodType<TResponse>;
  /** Additional per-request headers (merged over `defaultHeaders`). */
  headers?: Record<string, string>;
  /** Aborts the request when triggered. Composes with `timeoutMs`. */
  signal?: AbortSignal;
  /** Overrides `config.timeoutMs` for this call. `0` disables timeout. */
  timeoutMs?: number;
}

export interface ApiClient {
  request<TResponse = unknown>(opts: RequestOptions<TResponse>): Promise<TResponse>;
  readonly baseUrl: string;
}

// ─── Implementation ──────────────────────────────────────────────────────────

export function createApiClient(config: ApiClientConfig): ApiClient {
  const baseUrl = config.baseUrl.replace(/\/+$/, '');

  async function request<TResponse>(opts: RequestOptions<TResponse>): Promise<TResponse> {
    const requestId = generateRequestId();
    const url = buildUrl(baseUrl, opts.path, opts.query);

    // Resolved at call time so runtime polyfills (e.g. test MSW) are picked up.
    const fetchImpl = config.fetchImpl ?? globalThis.fetch;
    if (typeof fetchImpl !== 'function') {
      throw new NetworkError('No fetch implementation available', undefined, requestId);
    }

    const headers = buildHeaders({
      requestId,
      hasBody: opts.body !== undefined && opts.body !== null,
      defaultHeaders: config.defaultHeaders,
      requestHeaders: opts.headers,
    });

    const token = config.getAccessToken ? await config.getAccessToken() : undefined;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const effectiveTimeoutMs = opts.timeoutMs ?? config.timeoutMs ?? 0;
    const { signal: timedSignal, cancel: cancelTimeout } = composeSignal(
      opts.signal,
      effectiveTimeoutMs,
    );

    config.logger?.debug({ requestId, method: opts.method, url }, 'api request');

    let response: Response;
    try {
      response = await fetchImpl(url, {
        method: opts.method,
        headers,
        body:
          opts.body === undefined || opts.body === null
            ? undefined
            : JSON.stringify(opts.body),
        signal: timedSignal,
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Network request failed';
      config.logger?.warn({ requestId, url, error: message }, 'api network error');
      throw new NetworkError(message, cause, requestId);
    } finally {
      cancelTimeout();
    }

    const rawBody = await readBody(response);

    if (!response.ok) {
      const parsed = parseErrorBody(rawBody, response.status);
      config.logger?.warn(
        { requestId, status: response.status, code: parsed.code },
        'api error response',
      );
      if (response.status === 401) {
        try {
          config.onUnauthorized?.();
        } catch (cbError) {
          config.logger?.error(
            { requestId, error: cbError },
            'onUnauthorized callback threw',
          );
        }
        throw new UnauthorizedError({
          code: parsed.code,
          message: parsed.message,
          details: parsed.details,
          requestId,
        });
      }
      throw new ApiError({
        kind: 'http',
        status: response.status,
        code: parsed.code,
        message: parsed.message,
        details: parsed.details,
        requestId,
      });
    }

    if (!opts.responseSchema) {
      return rawBody as TResponse;
    }

    const parsed = opts.responseSchema.safeParse(rawBody);
    if (!parsed.success) {
      config.logger?.error(
        { requestId, issues: parsed.error.issues },
        'api response schema mismatch',
      );
      throw new ResponseValidationError(
        'Response did not match expected schema',
        rawBody,
        parsed.error.issues,
        requestId,
      );
    }
    return parsed.data;
  }

  return { request, baseUrl };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildHeaders(args: {
  requestId: string;
  hasBody: boolean;
  defaultHeaders?: Record<string, string>;
  requestHeaders?: Record<string, string>;
}): Record<string, string> {
  // Use `Headers` to normalize casing across default/per-request inputs, then
  // unpack back to a plain record (some `fetch` impls dislike Headers objects
  // in RN). After this pass, header names are lowercased and we can compare
  // safely.
  const h = new Headers();
  h.set('accept', 'application/json');
  h.set('x-request-id', args.requestId);
  for (const [k, v] of Object.entries(args.defaultHeaders ?? {})) h.set(k, v);
  for (const [k, v] of Object.entries(args.requestHeaders ?? {})) h.set(k, v);
  if (args.hasBody && !h.has('content-type')) {
    h.set('content-type', 'application/json');
  }
  const out: Record<string, string> = {};
  h.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const qs = query ? encodeQuery(query) : '';
  return `${baseUrl}${normalizedPath}${qs}`;
}

function encodeQuery(query: QueryParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null) continue;
        params.append(key, String(item));
      }
    } else {
      params.append(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

async function readBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await response.text();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

/**
 * Compose a user-supplied `AbortSignal` with an optional timeout. Returns a
 * single signal that fires when either source fires, plus a `cancel` that
 * clears the timeout (call in `finally` to avoid leaking timers when the
 * request settles first).
 */
function composeSignal(
  userSignal: AbortSignal | undefined,
  timeoutMs: number,
): { signal: AbortSignal | undefined; cancel: () => void } {
  if (timeoutMs <= 0) {
    return { signal: userSignal, cancel: () => {} };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);

  if (userSignal) {
    if (userSignal.aborted) {
      clearTimeout(timer);
      controller.abort(userSignal.reason);
    } else {
      userSignal.addEventListener('abort', () => controller.abort(userSignal.reason), {
        once: true,
      });
    }
  }

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
}
