# Error Handling

The shared error model for the mono-starter API and its clients. This is the operator-facing companion to `docs/ERROR-HANDLING-PLAN.md`.

## TL;DR

- **Wire shape:** `{ error: { code, message, details?, requestId } }`. Every error response.
- **Codes:** registered in `@mono/api-contracts` → `ERROR_CODES`. Use them on both sides.
- **Backend:** throw `BusinessException` when the message should reach users. Anything else gets a generic message in production.
- **Client:** catch `ApiError` (and its subclasses) from `@mono/api-client`. Use `<ErrorBanner>` for page-level errors and `getFieldErrors(error)` for form fields.
- **Correlation:** every request carries `x-request-id`; every response echoes it; every log line carries it.

## Error categories

| Category | When | HTTP | What the user sees | Logged at |
|---|---|---|---|---|
| **Operational** | Expected outcomes the caller can act on | 401, 403, 404, 409, 429 | server `message` (or translated by code) | `warn` |
| **Validation** | Request payload doesn't match a schema | 422 | per-field message rendered inline | `info` |
| **Unexpected** | Bug or infrastructure failure | 5xx | generic "Something went wrong" + request id | `error` (with stack) |
| **Network (client only)** | Transport failure (offline, CORS) | n/a | "Connection issue" + retry CTA | `warn` |

## Standard wire shape

```jsonc
{
  "error": {
    "code": "PROFILE_NOT_FOUND",
    "message": "No profile exists for that user.",
    "details": [{ "path": "userId", "message": "Required" }],
    "requestId": "0d8c7a18-…",
    // `stack` is only present when NODE_ENV !== 'production'.
    "stack": "Error: …"
  }
}
```

- `code` — stable, machine-readable, drawn from `ERROR_CODES`. Domain codes use a resource prefix (`PROFILE_*`, `BOOKING_*`).
- `message` — user-facing for `BusinessException` and 4xx framework exceptions. Generic in production for 5xx and unknown throws.
- `details` — typed array of `{ path, message, code? }` for `VALIDATION_FAILED`. Free-form for other codes; the UI does not render it for non-validation errors.
- `requestId` — always set by the server. Sent back on `x-request-id` header too.

## Backend — throwing errors

### When the user should see the message

Use `BusinessException`:

```ts
import { BusinessException } from '../common/exceptions/business.exception';

if (!profile) {
  throw new BusinessException({
    code: 'PROFILE_NOT_FOUND',
    message: 'No profile exists for that user.',
    status: 404, // optional; defaults from HTTP_STATUS_BY_CODE
  });
}
```

The filter preserves both fields verbatim, even in production.

### When you don't want the user to see the message

Throw a normal `Error` or rely on framework exceptions:

```ts
// Acceptable — message is scrubbed in production:
throw new Error(`Stripe customer ${id} not found in DB`);

// Better — explicit operational error:
throw new BusinessException({ code: 'CONFLICT', message: 'Item already exists.' });
```

In production, unknown `Error`s become `{ code: 'INTERNAL_ERROR', message: 'Internal server error', requestId }`. The original message and full stack go to the server logs only.

### Validation

`ZodValidationPipe` throws a `BusinessException` with `code: 'VALIDATION_FAILED'` and `details: ValidationErrorDetail[]` (dotted paths). The filter renders it as a 422. You usually don't need to catch validation errors yourself — let them propagate.

### HTTP framework exceptions

`UnauthorizedException`, `ForbiddenException`, `NotFoundException`, etc., are mapped automatically to the right code by the global filter. Their `message` is preserved for 4xx and scrubbed for 5xx in production.

## Client — handling errors

### Categorize first

```ts
import { categorizeError, ApiError, UnauthorizedError } from '@mono/api-client';

try {
  await getCurrentUserProfile(apiClient);
} catch (e) {
  if (e instanceof UnauthorizedError) {
    redirectToSignIn();
    return;
  }
  if (e instanceof ApiError) {
    const category = categorizeError(e);
    // 'auth' | 'permission' | 'not-found' | 'validation' | 'rate-limit'
    // | 'conflict' | 'network' | 'response-validation' | 'unexpected'
  }
}
```

### Page / section errors

Use `<ErrorBanner>` from `@mono/ui-web` or `@mono/ui-mobile`:

```tsx
<ErrorBanner
  error={error}
  onRetry={refetch}
  codeMessages={{
    UNAUTHORIZED: t('errors.UNAUTHORIZED'),
    FORBIDDEN: t('errors.FORBIDDEN'),
    NOT_FOUND: t('errors.NOT_FOUND'),
    INTERNAL_ERROR: t('errors.INTERNAL_ERROR'),
  }}
/>
```

`<ErrorBanner>` automatically:
- picks a headline by category,
- formats the message via `getUserMessage(error, { codeMessages })`,
- shows the request id for unexpected / network / response-validation errors,
- renders a retry button when `onRetry` is provided.

### Form errors

Map validation `details` onto your form fields with `getFieldErrors`:

```tsx
import { getFieldErrors } from '@mono/api-client';

const fieldErrors = error ? getFieldErrors(error) : {};

<TextField name="email" error={fieldErrors.email} />
<TextField name="address.street" error={fieldErrors['address.street']} />
```

The keys are dotted paths — match them to your input `name`s. Returns `{}` for non-validation errors so you can spread it unconditionally.

### Logging on the client

```ts
import { logError } from '@mono/api-client';
import { createBrowserLogger } from '@mono/logger';

const logger = createBrowserLogger({ prefix: 'web' });

try { /* … */ }
catch (e) {
  if (e instanceof ApiError) logError(logger, e, { feature: 'profile' });
}
```

- Validation → `info`
- Auth / permission / network → `warn`
- Unexpected / response-validation → `error`

`details` is never logged (could be large or contain user input).

## What reaches users vs what is logged

**Users see:**
- `BusinessException.message` — verbatim.
- Framework 4xx `message` — verbatim.
- `VALIDATION_FAILED` field messages — under the corresponding input.
- 5xx in production: generic "Something went wrong" + request id.
- Network failures: generic banner with retry CTA.

**Only the server logs:**
- `stack` (in production).
- Internal context: `userId`, `route`, full request id chain.
- Original `message` for non-`BusinessException` 5xx errors.
- `details` for errors other than validation.

## Adding a new error code

1. Add the code to `packages/api-contracts/src/error-codes.ts`. Pick the right HTTP status in `HTTP_STATUS_BY_CODE` if it's a registered status, or set it on the throw site.
2. Throw it from the service: `throw new BusinessException({ code, message, details? })`.
3. Optional: add a translation in each app's i18n `errors.*` namespace, then pass it via `codeMessages` to `<ErrorBanner>` / `getUserMessage`.
4. If multiple apps need to react to it programmatically, document the contract (when it fires, what `details` carries).

## Code registry conventions

- `SCREAMING_SNAKE_CASE`.
- Bare names for cross-cutting (`UNAUTHORIZED`, `RATE_LIMITED`).
- Resource prefix for domain codes (`PROFILE_NOT_FOUND`, `BOOKING_PAYMENT_DECLINED`).
- One code per outcome, not per HTTP status. `NOT_FOUND` is the catch-all; `PROFILE_NOT_FOUND` is for when "the user record exists but their profile row doesn't" matters to the caller.

## Anti-patterns

- **Throwing `new Error(stripeApiKey)`.** The message is scrubbed in production — but it lands in logs uncategorized. Wrap with `BusinessException` if it's user-actionable, or with a more specific `Error` subclass if you need server-side identification.
- **Returning `{ error: ... }` directly from a controller.** Always throw. The filter is the only place that formats the response.
- **Catching `ApiError` and re-throwing as `Error`.** You lose `code`, `status`, `requestId`. If you need to add context, prefer `logError(logger, e, { extra })` then re-throw the same error.
- **Building a form-field error renderer on top of `<ErrorBanner>`.** They serve different surfaces — `<ErrorBanner>` is page-level, `TextField error={...}` is field-level.
- **Mapping HTTP statuses on the client.** Use `categorizeError(error)` so the mapping is in one place.
