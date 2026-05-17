# @mono/api-client

A small, typed HTTP client shared by `apps/web`, `apps/admin`, and `apps/mobile`. Built on `fetch`, with consistent error parsing, opt-in Zod response validation, request correlation, and a per-platform token-getter callback.

## When to use

- **You** are calling the in-house NestJS API from a frontend.
- You want typed responses, consistent errors, and a request-id on every call.

**Don't use** for: third-party APIs (they have their own SDKs and error shapes), streaming endpoints (build on `fetch` directly for those — v1 doesn't cover streaming), or server-only DB calls.

## Entry points

| Import path | Use it for |
|---|---|
| `@mono/api-client` | Core client, services, and error types. Platform-agnostic — no React dependency. |
| `@mono/api-client/react` | React hooks built on top of the services. Pulls React into the import graph; only import from React/RN code. |

Keeping React hooks behind a subpath means Node scripts, workers, and server actions can use the core client without dragging React along.

## Quick start

Each app owns one instance of the client, configured with its own base URL and token-getter:

```ts
// apps/web/src/lib/api-client.ts
import { createApiClient } from '@mono/api-client';
import { createBrowserLogger } from '@mono/logger';

export const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  getAccessToken: () =>
    typeof window === 'undefined' ? undefined : window.localStorage.getItem('access_token') ?? undefined,
  onUnauthorized: () => {
    // app-specific: clear session, redirect to /sign-in, etc.
  },
  timeoutMs: 10_000,
  logger: createBrowserLogger({ prefix: 'web:api' }),
});
```

Consume in a service (framework-agnostic) or hook (React/RN):

```ts
import { getCurrentUserProfile } from '@mono/api-client';
import { useCurrentUserProfile } from '@mono/api-client/react';
import { apiClient } from '@/lib/api-client';

// Plain function — usable in event handlers, server actions, scripts.
const profile = await getCurrentUserProfile(apiClient);

// React hook — usable in components. Aborts in-flight requests when the
// component unmounts or the `client` identity changes, so stale responses
// can never overwrite state.
const { data, error, loading, refetch } = useCurrentUserProfile(apiClient);
```

## Adding a new service

When you need to call a new endpoint, add a service file. Services are plain async functions that take an `ApiClient` and return parsed data.

```ts
// src/services/projects.service.ts
import { projectSchema, type Project } from '@mono/validation';
import { z } from 'zod';
import type { ApiClient } from '../client.js';

const listResponseSchema = z.object({ data: z.array(projectSchema) });

export async function listProjects(client: ApiClient): Promise<readonly Project[]> {
  const result = await client.request({
    method: 'GET',
    path: '/projects',
    responseSchema: listResponseSchema,
  });
  return result.data;
}
```

Conventions:

- One file per resource (`me.service.ts`, `projects.service.ts`, `bookings.service.ts`).
- Export each operation as a top-level async function. No classes.
- The first argument is always the `ApiClient` — explicit dependency, easy to swap in tests.
- Wrap the response with a Zod schema that mirrors the API's `{ data: ... }` envelope, then unwrap before returning. Callers should never see the envelope.
- Throw, don't return Result types. The client throws typed errors (`ApiError`, `UnauthorizedError`, `NetworkError`, `ResponseValidationError`).
- Re-export from `src/services/index.ts` and from `src/index.ts`.

## Adding a new React hook

Hooks are thin wrappers around a service: `useState` + `useEffect` for the fetch, `useCallback` for `refetch`. Pattern:

```ts
// src/hooks/use-projects.ts
export function useProjects(client: ApiClient) {
  const [data, setData] = useState<readonly Project[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try { setData(await listProjects(client)); setError(null); }
    catch (e) { if (e instanceof ApiError) setError(e); }
    finally { setLoading(false); }
  }, [client]);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, error, loading, refetch };
}
```

Conventions:

- One hook per resource view. Don't combine multiple endpoints in one hook — compose at the component.
- Name `useThing` (read) or `useThingMutation` (write). Mutations should not auto-fire on mount.
- Always handle the unmount race: use a `mountedRef` or `AbortController`. See `use-current-user-profile.ts` for the pattern.
- Don't add caching here. If apps need caching/dedup/stale-while-revalidate, wrap with React Query at the app level. The service is the seam.

## Error handling

The client throws typed errors. All extend `ApiError`:

```ts
import { ApiError, UnauthorizedError, NetworkError } from '@mono/api-client';

try {
  await getCurrentUserProfile(apiClient);
} catch (e) {
  if (e instanceof UnauthorizedError) { /* redirect to sign-in */ }
  else if (e instanceof NetworkError) { /* offline banner */ }
  else if (e instanceof ApiError) { /* show e.message; log e.requestId */ }
  else { throw e; }
}
```

`onUnauthorized` is called once per 401, before the error is thrown. Use it for app-wide reactions (clear session, redirect). Per-call recovery still belongs in the `try/catch`.

## Request correlation

Every request includes an `x-request-id` header. The id is generated client-side per call and logged (when a `logger` is supplied) so a request can be traced end-to-end. The server is expected to echo or use the same id in its own logs.

## Testing

`vitest` is the local test runner. Stub `fetch` via `fetchImpl` in the config:

```ts
import { vi } from 'vitest';
const fetchImpl = vi.fn().mockResolvedValue({
  ok: true, status: 200,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => ({ data: { ... } }),
  text: async () => '...',
});
const client = createApiClient({ baseUrl: 'http://x', fetchImpl: fetchImpl as typeof fetch });
```

See `src/client.spec.ts` for examples covering success, 401, generic non-2xx, network failure, schema mismatch, header assembly, and query encoding.

## Known limitations

- **Bodies are always `JSON.stringify`'d.** `FormData`, `Blob`, and `URLSearchParams` bodies are not supported in v1 — passing one will produce `"[object FormData]"` as the request body. If you need file upload, use `fetch` directly until v2 adds body-type negotiation.
- **CORS preflight.** The client sends a custom `x-request-id` header on every call. Browsers will issue a preflight `OPTIONS` request; the API must allow that header in its `Access-Control-Allow-Headers` response.
- **`getAccessToken` runs on every request.** If reading the token is expensive (e.g. `SecureStore` decryption), memoize at the app layer.
- **No request dedup or caching.** Two components calling the same hook will fetch twice. Wrap with React Query at the app layer if needed.

## What this package does NOT do (yet)

- Refresh-token rotation. `onUnauthorized` fires; the app handles refresh and retry.
- SSR / Next.js server-action helpers (cookie forwarding). Today the client works server-side but the auth pattern there is up to the caller.
- Caching, dedup, stale-while-revalidate. Use React Query at the app layer if needed.
- File uploads / multipart streaming.
- Hook-level unit tests (currently covered by manual UI verification + service-level tests). A `@testing-library/react` harness will add these.

These can each be added as additive layers without changing the v1 surface.
