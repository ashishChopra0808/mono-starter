import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import {
  ApiError,
  NetworkError,
  ResponseValidationError,
  UnauthorizedError,
  createApiClient,
} from './index.js';

interface FakeResponse {
  status?: number;
  ok?: boolean;
  headers?: HeadersInit;
  body?: unknown;
}

function makeFetch(response: FakeResponse) {
  const headers = new Headers(response.headers ?? { 'content-type': 'application/json' });
  const status = response.status ?? 200;
  const ok = response.ok ?? (status >= 200 && status < 300);
  return vi.fn().mockResolvedValue({
    ok,
    status,
    headers,
    json: async () => response.body,
    text: async () =>
      typeof response.body === 'string' ? response.body : JSON.stringify(response.body),
  });
}

describe('createApiClient', () => {
  const baseUrl = 'https://api.example.com/api/v1';

  it('returns parsed body on success and validates with schema', async () => {
    const fetchImpl = makeFetch({ body: { data: { value: 42 } } });
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    const schema = z.object({ data: z.object({ value: z.number() }) });
    const result = await client.request({
      method: 'GET',
      path: '/thing',
      responseSchema: schema,
    });
    expect(result).toEqual({ data: { value: 42 } });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://api.example.com/api/v1/thing');
    expect((init as RequestInit).method).toBe('GET');
  });

  it('sends a fresh x-request-id header per request', async () => {
    const fetchImpl = makeFetch({ body: {} });
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    await client.request({ method: 'GET', path: '/a' });
    await client.request({ method: 'GET', path: '/b' });
    const ids = fetchImpl.mock.calls.map(([, init]) => {
      const headers = new Headers((init as RequestInit).headers);
      return headers.get('x-request-id');
    });
    expect(ids[0]).toBeTruthy();
    expect(ids[1]).toBeTruthy();
    expect(ids[0]).not.toEqual(ids[1]);
  });

  it('adds Authorization header when getAccessToken returns a token', async () => {
    const fetchImpl = makeFetch({ body: {} });
    const client = createApiClient({
      baseUrl,
      fetchImpl: fetchImpl as typeof fetch,
      getAccessToken: () => 'tok-123',
    });
    await client.request({ method: 'GET', path: '/me' });
    const headers = new Headers((fetchImpl.mock.calls[0]![1] as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer tok-123');
  });

  it('omits Authorization header when getAccessToken returns undefined', async () => {
    const fetchImpl = makeFetch({ body: {} });
    const client = createApiClient({
      baseUrl,
      fetchImpl: fetchImpl as typeof fetch,
      getAccessToken: () => undefined,
    });
    await client.request({ method: 'GET', path: '/me' });
    const headers = new Headers((fetchImpl.mock.calls[0]![1] as RequestInit).headers);
    expect(headers.has('Authorization')).toBe(false);
  });

  it('throws UnauthorizedError and fires onUnauthorized on 401', async () => {
    const fetchImpl = makeFetch({
      status: 401,
      body: { error: { code: 'INVALID_TOKEN', message: 'nope' } },
    });
    const onUnauthorized = vi.fn();
    const client = createApiClient({
      baseUrl,
      fetchImpl: fetchImpl as typeof fetch,
      onUnauthorized,
    });
    await expect(
      client.request({ method: 'GET', path: '/me' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('throws ApiError for other non-2xx responses with parsed code/message', async () => {
    const fetchImpl = makeFetch({
      status: 422,
      body: { error: { code: 'VALIDATION_FAILED', message: 'bad input', details: [1] } },
    });
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    try {
      await client.request({ method: 'POST', path: '/x', body: {} });
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(422);
      expect(apiErr.code).toBe('VALIDATION_FAILED');
      expect(apiErr.message).toBe('bad input');
      expect(apiErr.details).toEqual([1]);
    }
  });

  it('throws NetworkError when fetch rejects', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    await expect(
      client.request({ method: 'GET', path: '/x' }),
    ).rejects.toBeInstanceOf(NetworkError);
  });

  it('throws ResponseValidationError when body fails schema', async () => {
    const fetchImpl = makeFetch({ body: { data: { value: 'not-a-number' } } });
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    const schema = z.object({ data: z.object({ value: z.number() }) });
    await expect(
      client.request({ method: 'GET', path: '/x', responseSchema: schema }),
    ).rejects.toBeInstanceOf(ResponseValidationError);
  });

  it('encodes query params (arrays repeat the key)', async () => {
    const fetchImpl = makeFetch({ body: {} });
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    await client.request({
      method: 'GET',
      path: '/search',
      query: { q: 'hi', tag: ['a', 'b'], page: 2, skip: undefined },
    });
    const [url] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('https://api.example.com/api/v1/search?q=hi&tag=a&tag=b&page=2');
  });

  it('strips trailing slashes from baseUrl', async () => {
    const fetchImpl = makeFetch({ body: {} });
    const client = createApiClient({
      baseUrl: 'https://api.example.com/api/v1///',
      fetchImpl: fetchImpl as typeof fetch,
    });
    await client.request({ method: 'GET', path: '/x' });
    expect(fetchImpl.mock.calls[0]![0]).toBe('https://api.example.com/api/v1/x');
  });

  it('awaits an async getAccessToken', async () => {
    const fetchImpl = makeFetch({ body: {} });
    const client = createApiClient({
      baseUrl,
      fetchImpl: fetchImpl as typeof fetch,
      getAccessToken: async () => 'async-tok',
    });
    await client.request({ method: 'GET', path: '/me' });
    const headers = new Headers((fetchImpl.mock.calls[0]![1] as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer async-tok');
  });

  it('serializes a POST body as JSON and sets Content-Type', async () => {
    const fetchImpl = makeFetch({ body: {} });
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    await client.request({ method: 'POST', path: '/x', body: { hello: 'world' } });
    const init = fetchImpl.mock.calls[0]![1] as RequestInit;
    expect(init.body).toBe(JSON.stringify({ hello: 'world' }));
    const headers = new Headers(init.headers);
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('respects a caller-supplied content-type (case-insensitive)', async () => {
    const fetchImpl = makeFetch({ body: {} });
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    await client.request({
      method: 'POST',
      path: '/x',
      body: 'raw',
      headers: { 'content-type': 'text/plain' },
    });
    const headers = new Headers((fetchImpl.mock.calls[0]![1] as RequestInit).headers);
    expect(headers.get('content-type')).toBe('text/plain');
  });

  it('returns raw body when no responseSchema is provided', async () => {
    const fetchImpl = makeFetch({ body: { whatever: true } });
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    const result = await client.request({ method: 'GET', path: '/x' });
    expect(result).toEqual({ whatever: true });
  });

  it('returns null body for 204 No Content', async () => {
    const fetchImpl = makeFetch({
      status: 204,
      body: null,
      headers: { 'content-length': '0' },
    });
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    const result = await client.request({ method: 'DELETE', path: '/x' });
    expect(result).toBeNull();
  });

  it('aborts the underlying fetch when the user signal aborts', async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn().mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        }),
    );
    const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
    const promise = client.request({ method: 'GET', path: '/x', signal: controller.signal });
    controller.abort();
    await expect(promise).rejects.toBeInstanceOf(NetworkError);
  });

  it('times out a slow request via timeoutMs and reports as NetworkError', async () => {
    vi.useFakeTimers();
    try {
      const fetchImpl = vi.fn().mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('timed out', 'AbortError')),
            );
          }),
      );
      const client = createApiClient({ baseUrl, fetchImpl: fetchImpl as typeof fetch });
      const promise = client.request({ method: 'GET', path: '/x', timeoutMs: 50 });
      // Attach the rejection handler BEFORE advancing time so the rejection
      // isn't flagged as unhandled.
      const assertion = expect(promise).rejects.toBeInstanceOf(NetworkError);
      await vi.advanceTimersByTimeAsync(60);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('captures fetch at call time (lazy), allowing later globalThis.fetch replacement', async () => {
    const original = globalThis.fetch;
    const replacement = makeFetch({ body: { ok: true } }) as unknown as typeof fetch;
    const client = createApiClient({ baseUrl });
    (globalThis as { fetch: typeof fetch }).fetch = replacement;
    try {
      const result = await client.request({ method: 'GET', path: '/x' });
      expect(result).toEqual({ ok: true });
    } finally {
      (globalThis as { fetch: typeof fetch }).fetch = original;
    }
  });
});
