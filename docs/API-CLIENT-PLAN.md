# API Client Strategy — Design Plan

Reusable, typed API client for `apps/web`, `apps/admin`, and `apps/mobile`. Status: **proposed, not yet implemented.**

---

## 1. Design decisions

### Package scope and surface area
- New `packages/api-client/` exports `createApiClient(config)` returning a small typed client with one core method: `request<T>({ method, path, body?, query?, responseSchema? })`. That's it — no middleware chains, no codegen, no DI.
- Built on `fetch` (universal: Next.js, Expo, Node). No axios, no SWR, no React Query in v1.
- Apps each instantiate the client once (`apps/{web,admin,mobile}/src/lib/api-client.ts`) with their own base URL + token-getter. The package itself stays platform-agnostic.

### Auth
- Config takes `getAccessToken: () => string | undefined | Promise<string | undefined>` — apps decide where the token lives (cookie / `localStorage` / Expo `SecureStore`). The client adds `Authorization: Bearer <token>` when one is returned.
- Optional `onUnauthorized()` callback fires on 401. Apps can sign-out, refresh, or ignore. No built-in refresh-and-retry in v1 (deliberate — it's app-specific and easy to add later).

### Error model
- Non-2xx → throw a typed `ApiError` (with `status`, `code`, `message`, `details`). `401 → UnauthorizedError` subclass; network failures → `NetworkError`; response schema mismatch → `ResponseValidationError`.
- Parses the backend's standard `{ error: { code, message, details? } }` shape (already in `apiErrorSchema` in `@mono/api-contracts`). Falls back gracefully when the body isn't that shape.

### Correlation
- Client generates a request id (`crypto.randomUUID()` with a small fallback) and sends `x-request-id`. Logged on every call via `@mono/logger`. Matches the correlation strategy introduced in PR-9.

### Contract / schema integration
- `responseSchema` (Zod) is optional on each call. When provided, the client runtime-validates the response — opt-in cost. The shared `UserProfile` service uses it; lighter calls can skip.
- The contracts in `@mono/api-contracts` stay the source of truth for types; the client consumes those types but doesn't depend on contracts at runtime (keeps the package small).

### Example feature
- `services/me.service.ts` exports `getCurrentUserProfile(client): Promise<UserProfile>` using `userProfileSchema`.
- `hooks/use-current-user-profile.ts` is a thin React hook (`useState` + `useEffect` + `useCallback` for `refetch`). Works in React-DOM and React Native — same API.
- Each app's profile page gets a "Load from API" button that calls the hook and renders the result / error. Keeps the existing mock-auth flow intact; demonstrates the real-API path side-by-side.

### Conventions doc
- `packages/api-client/README.md` covers: when to add a new service file, hook naming, error handling, how to test, when *not* to use the hook (e.g. mutations in event handlers).

---

## 2. Alternatives considered

| Option | Why not |
|---|---|
| **Axios** | Extra dep, RN bundle weight, no real win over `fetch` for our needs. |
| **TanStack Query / SWR built in** | Heavy, opinionated, RN caveats, peer-dep surface. Apps can wrap our services with React Query later if they want — service functions are framework-agnostic. |
| **Codegen from contracts** | Slows iteration, harder to debug, repo already prefers Zod-as-source-of-truth. |
| **Result type (`Result<T, E>`) instead of throwing** | Throwing is idiomatic in JS, plays better with `try/catch` in hooks and route handlers, and reduces ceremony at every call site. |
| **Token storage inside the package** | Storage differs sharply per platform (cookies / SecureStore / localStorage). The `getAccessToken` callback is platform-neutral; storage stays in each app. |
| **Single global client via Context** | More implicit. Exporting an instance from each app's `lib/` is explicit, tree-shakeable, and matches how `@mono/logger` is consumed today. |
| **Built-in refresh-token retry** | Refresh semantics depend on session storage + concurrent-call dedup. Doing it right is a chunk of work; doing it wrong is worse than nothing. v1 surfaces 401 cleanly; refresh comes later as a wrapper. |

---

## 3. Risks / trade-offs

- **No request dedup or caching.** Two components mounting at the same time will fetch twice. Acceptable for v1; the hook is small enough to swap for React Query later without changing service functions.
- **Throw-based error model leaks into call sites.** Every consumer must handle errors. The hook wraps this for React; service-only consumers (e.g. server actions) need `try/catch`.
- **Optional schema validation** means apps must remember to pass the schema if they want runtime safety. We make it the default in the example service to set the convention.
- **Base-URL env vars are per-platform** (`NEXT_PUBLIC_API_BASE_URL` vs `EXPO_PUBLIC_API_BASE_URL`). Adding a third frontend means a third env var. Acceptable — each platform has its own conventions for "public" envs.
- **No SSR helper today.** Calls work from Next.js server code, but the auth pattern there usually means forwarding incoming cookies, not a Bearer token. v1 doesn't ship an SSR adapter; we leave a `TODO` in the README.
- **`crypto.randomUUID` availability.** Available in modern browsers, Node ≥ 19, Hermes (RN). We provide a small fallback for older environments.

---

## 4. Exact file plan

### New files

```
packages/api-client/
├── package.json
├── tsconfig.lib.json
├── README.md
└── src/
    ├── index.ts                          — public re-exports
    ├── client.ts                         — createApiClient, ApiClient type, request impl
    ├── errors.ts                         — ApiError, UnauthorizedError, NetworkError,
    │                                       ResponseValidationError, parseErrorBody
    ├── correlation.ts                    — generateRequestId() with fallback
    ├── client.spec.ts                    — vitest coverage
    ├── services/
    │   ├── index.ts
    │   └── me.service.ts                 — getCurrentUserProfile(client)
    └── hooks/
        ├── index.ts
        └── use-current-user-profile.ts   — { data, error, loading, refetch }
```

Per-app client instantiation:

```
apps/web/src/lib/api-client.ts
apps/admin/src/lib/api-client.ts
apps/mobile/src/lib/api-client.ts
```

### Modified files

- `apps/web/package.json` — add `@mono/api-client` dep.
- `apps/admin/package.json` — add `@mono/api-client` dep.
- `apps/mobile/package.json` — add `@mono/api-client` dep.
- `apps/web/tsconfig.json` — reference `packages/api-client`.
- `apps/admin/tsconfig.json` — reference `packages/api-client`.
- `apps/mobile/tsconfig.app.json` — reference `packages/api-client`.
- `apps/web/src/app/profile/page.tsx` — "Load from API" button + result panel.
- `apps/admin/src/app/profile/page.tsx` — same.
- `apps/mobile/src/app/App.tsx` — same, in the existing profile section.
- `apps/web/src/i18n/en.ts`, `hi.ts` — `loadFromApi`, `apiResult`, `apiError` keys.
- `apps/admin/src/i18n/en.ts`, `hi.ts` — same.
- `apps/mobile/src/i18n/en.ts`, `hi.ts` — same.
- `docs/VERTICAL-SLICE.md` — short pointer to the new client package + README.

### Test coverage targets

- Success path returns parsed body and validates with schema when provided.
- Non-2xx maps to `ApiError` with parsed `code` / `message` / `details`.
- 401 maps to `UnauthorizedError` and fires `onUnauthorized` callback exactly once.
- `fetch` rejection maps to `NetworkError`.
- Schema mismatch throws `ResponseValidationError` (response body included in error for debugging).
- `Authorization` header omitted when `getAccessToken` returns `undefined`.
- `x-request-id` header is present on every request and a fresh id per call.

---

## 5. Out of scope (deliberately)

- Refresh-token flow with concurrent-call dedup.
- SSR / server-action helpers for Next.js.
- React Query / SWR adapter.
- Per-platform token-storage helpers.
- Cancellation token plumbing beyond `AbortSignal` pass-through.
- Upload / streaming endpoints.

These can each be added as small, additive layers once the v1 surface settles.
