# Shared Error Handling Strategy — Design Plan

A single error model across the NestJS backend and all clients (web, admin, mobile). Standard wire shape, global server-side normalization, typed client-side parsing, and reusable UI patterns for both general and form errors. Status: **proposed, not yet implemented.**

---

## 1. Design decisions

### Single wire shape, hardened
Keep the existing `{ error: { code, message, details? } }` envelope from `apiErrorSchema`, but make `requestId` a first-class field (always set by the server, optional in the schema for older responses). The client already parses this shape — we tighten it rather than reinvent.

### Three error categories, named explicitly
- **Operational** — expected 4xx (auth, forbidden, not found, conflict, rate-limit). Caller can act.
- **Validation** — 422 specifically. `details` is a typed array of `{ path: 'a.b.c', message, code? }`. UI maps these to form fields.
- **Unexpected** — 5xx. Bugs / infra. Caller cannot meaningfully act; user sees a generic message + request id.

### Code registry in `@mono/api-contracts`
One `ERROR_CODES` const, shared by backend (when throwing) and clients (when categorizing / translating). Domain codes added there too with a resource prefix (`PROFILE_*`, `BOOKING_*`).

### Backend: one global `ExceptionFilter` + a marker exception class
The filter is the single point that normalizes anything thrown — `HttpException`, `ZodError`, `BusinessException`, unknown `Error` — into the wire shape. A new `BusinessException` carries `code`, `status`, and a `userSafeMessage` flag. Anything else → message is replaced by a generic one in production. Stack traces stay server-side only.

### Production safety by default
In `NODE_ENV=production`, 5xx responses always send `{ code: 'INTERNAL_ERROR', message: 'Internal server error', requestId }` regardless of what was thrown. Dev keeps the original message + an extra `stack` field for fast iteration.

### Request correlation as the bridge
Every response carries `requestId`. Every server log line carries `requestId`. Every client log line carries `requestId`. The user-visible "something went wrong" message includes the request id so support can find the log.

### Client: format helpers, not framework
`@mono/api-client` adds `categorizeError`, `getFieldErrors`, `getUserMessage(error, { codeMessages? })`, and `logError(logger, error)`. No automatic UI mounting, no toast injection. Apps choose their surface.

### UI: two reusable shapes
- `<ErrorBanner error={apiError} />` — for page/section-level errors. Lives in `@mono/ui-web` and `@mono/ui-mobile`, same prop shape on both.
- Form field errors — no new component. Existing `TextField` / form primitives already render `error?: string`. `getFieldErrors(error)` returns `{ path → message }` that the form maps onto its fields. Zero new abstractions.

### i18n: codes are stable, server message is the fallback
Server sends English `message` for every error. Apps that want translated strings supply a `codeMessages: Record<ErrorCode, string>` to `getUserMessage`. Anything not in the map falls back to the server message. Apps can add codes incrementally.

### Logger integration
- Server filter logs:
  - 4xx → `warn`, body includes `code`, `requestId`, `path`, `userId?`.
  - 422 (validation) → `info` (user input, not a defect).
  - 5xx → `error`, includes `code`, `requestId`, `stack` (server-only).
  PII fields stay redacted by the existing `REDACT_PATHS` list.
- Client `logError(logger, error)` emits a structured line with `code`, `status`, `requestId`, `message` (never `details` — could be huge).

---

## 2. Alternatives considered

| Option | Why not |
|---|---|
| **RFC 7807 (`application/problem+json`)** | More verbose, no native `code` field (uses URIs), and the codebase already uses the `{ error: { ... } }` shape end-to-end. Switching now would churn every contract for no gain. Worth a separate proposal if we ever federate APIs. |
| **Single `Error` class with a discriminant** | Typed subclasses (`UnauthorizedError`, `NetworkError`, …) already exist in the client and work well with `instanceof` in catch blocks. Subclasses + a `kind` discriminant covers both styles. |
| **Codegen error codes from YAML** | More rigorous, but yet another build step for negligible value at this scale. A hand-curated `as const` object is fine until we have hundreds of codes. |
| **Server-side i18n of error messages** | Couples the API to user locale and to UI copy. Sending stable `code` + English `message` keeps the API simple; clients translate. |
| **Build a toast/snackbar primitive into the client package** | Too prescriptive — web wants Radix toasts, admin wants banners at the top, mobile wants something inline. Format helpers + a thin `<ErrorBanner>` is enough. |
| **Always include `stack` in dev responses** | `stack` exposes internal paths and makes the response shape conditional on env. We log the stack server-side and only include `stack` in the response when `NODE_ENV !== 'production'` *and* the request comes from localhost — limits surprise leaks. |
| **Bake observability shipping (Sentry, OTLP) into the filter** | Different concern. The filter produces a structured log; an exporter is a separate layer that can read those logs. |

---

## 3. Risks / trade-offs

- **Double-mapping risk.** If the filter doesn't recognize an exception type, it falls through to "unexpected" and the user sees a generic message even when the throw was deliberate. Mitigation: `BusinessException` is the explicit "show this to users" channel, plus the filter recognizes `HttpException` for back-compat with NestJS-thrown errors.
- **Production message leaking.** A developer who throws `new Error('user 123 not found')` in a service must not leak that to users. The filter strips messages from non-`BusinessException` errors in production — strict by default, opt-in for user-facing strings.
- **Field path mismatch.** Backend uses Zod's array paths (`['address', 'street']`); UIs use dotted strings. Wire format is dotted; the filter does the join. Existing forms must match on dotted names.
- **Code drift.** Adding a code in the registry without using it (or vice versa) goes unnoticed without a test. We add a smoke test that asserts every code thrown by the API exists in `ERROR_CODES`. (Possible v2: lint rule.)
- **i18n falls back to English `message`.** Acceptable, but UX is uneven until apps fill in their `codeMessages` maps. We ship a small starter map for the common codes.
- **`<ErrorBanner>` duplication.** Two copies (web + mobile) because the design tokens / primitives differ. They share the same prop shape so consumers feel one API. If duplication grows, factor a single render-prop component later.
- **No retry logic in the client.** A 503 won't auto-retry. v1 surfaces it cleanly; a `retryablePolicy` wrapper is a future addition.

---

## 4. Operational vs validation vs unexpected — at a glance

|  | Examples | HTTP | Caller can act? | User sees | Logged at |
|---|---|---|---|---|---|
| **Operational** | `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED` | 4xx | yes | server `message` (or translated via code) | `warn` |
| **Validation** | `VALIDATION_FAILED` | 422 | yes — per-field | per-field message under each input | `info` |
| **Unexpected** | uncaught throw, DB outage, `BadGatewayException` | 5xx | no | "Something went wrong. Request id: …" | `error` (with stack server-side) |

Network failures and timeouts on the client (`NetworkError`) are also "unexpected" from the user's POV — same UX, but logged at `warn` since the cause is outside the server's control.

---

## 5. What reaches users vs what is only logged

**Users see:**
- For `BusinessException`: the `message` set by the throwing service (intentional, reviewed copy).
- For `HttpException` with a known code: the framework-default message OR a translated string from the app's `codeMessages` map.
- For `VALIDATION_FAILED`: each `details[*].message`, displayed against its `path`.
- For 5xx in production: a fixed generic string + the `requestId`. Never the original message.
- Network/timeout: a fixed generic string. Apps may render a retry CTA.

**Only logged (never returned to the client):**
- `stack` (in production).
- Internal context attached by the filter: `userId`, `route`, `correlationId`, `requestBodySizeBytes`, etc.
- Anything in `details` for non-validation errors (treated as developer context, not user copy).

---

## 6. Exact file plan

### New files

**Contracts**
- `packages/api-contracts/src/error-codes.ts` — `ERROR_CODES` const + `ErrorCode` type + `HTTP_STATUS_BY_CODE` map.
- `packages/api-contracts/src/errors.ts` — tightened `apiErrorSchema` (with `requestId`), `validationErrorDetailSchema` (`{path: dotted string, message, code?}`), `ValidationErrorBody`, `ApiErrorBody` re-exported.

**Backend**
- `apps/api/src/common/exceptions/business.exception.ts` — `BusinessException` extending `HttpException` with `code` and a `userSafeMessage: true` flag.
- `apps/api/src/common/filters/global-exception.filter.ts` — the catch-all filter.
- `apps/api/src/common/filters/global-exception.filter.spec.ts` — unit tests: HttpException, ZodError, BusinessException, unknown Error, prod-vs-dev message stripping, validation detail dotted-path conversion.
- `apps/api/src/common/middleware/request-id.middleware.ts` — reads `x-request-id`, generates one if absent, stashes on request and response.

**Client**
- `packages/api-client/src/format.ts` — `categorizeError`, `getFieldErrors`, `getUserMessage`, `logError`.
- `packages/api-client/src/format.spec.ts` — unit tests for each helper.

**UI**
- `packages/ui-web/src/components/ErrorBanner.tsx` — Radix-styled banner.
- `packages/ui-mobile/src/components/ErrorBanner.tsx` — RN banner.

**Docs**
- `docs/ERROR-HANDLING.md` — taxonomy, what reaches users, what gets logged, code registry conventions, examples for adding a new error.
- `docs/ERROR-HANDLING-PLAN.md` — this design plan.

### Modified files

- `packages/api-contracts/src/common.ts` — add `requestId` to `apiErrorSchema`; export `ValidationErrorDetail` type.
- `packages/api-contracts/src/index.ts` — re-export `ERROR_CODES`, `ErrorCode`, error types.
- `packages/api-client/src/index.ts` — export `categorizeError`, `getFieldErrors`, `getUserMessage`, `logError`.
- `packages/api-client/src/errors.ts` — make `code` typed as `ErrorCode | string` (open union) so consumers get autocomplete without losing forward-compat.
- `apps/api/src/app/app.module.ts` — register `GlobalExceptionFilter` via `APP_FILTER`, mount `RequestIdMiddleware` first.
- `apps/api/src/validation/zod-validation.pipe.ts` — throw a `BusinessException` (`VALIDATION_FAILED`, status 422) carrying Zod issues so the filter formats them uniformly.
- `apps/api/src/main.ts` — keep correlation middleware before logger middleware.
- `apps/{web,admin}/src/app/profile/page.tsx` — replace the inline error block in the "Live from API" panel with `<ErrorBanner>`.
- `apps/mobile/src/app/App.tsx` — same.
- `apps/{web,admin,mobile}/src/i18n/{en,hi}.ts` — small starter `errors.*` map (`UNAUTHORIZED`, `FORBIDDEN`, `INTERNAL_ERROR`, `NETWORK`, `VALIDATION_FAILED`, `NOT_FOUND`).
- `packages/ui-web/src/index.ts` and `packages/ui-mobile/src/index.ts` — export `ErrorBanner`.
- `docs/VERTICAL-SLICE.md` — short pointer to `docs/ERROR-HANDLING.md`.

### Test plan additions

- `global-exception.filter.spec.ts`: `HttpException` → mapped status & code; `ZodError` via pipe → 422 + dotted paths; `BusinessException` → message preserved; unknown `Error` in prod → generic message; same in dev → original message + stack.
- `format.spec.ts`: `categorizeError` for each kind; `getFieldErrors` returns `{}` for non-validation; dotted path mapping; `getUserMessage` uses `codeMessages` then falls back to `error.message`; `logError` calls logger at the right level.

### Out of scope (deliberately)

- Sentry / OTLP exporters.
- Retry / circuit-breaker policy in the client.
- Translating every code on day one — apps fill in `codeMessages` incrementally.
- A custom Problem Details media type / RFC 7807 migration.
- Lint rule that flags `throw new Error(...)` in services (worth doing, but as a separate PR).
