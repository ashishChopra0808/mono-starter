# Logging Conventions

This monorepo uses `@mono/logger` for structured logging. The backend uses [Pino](https://getpino.io/) for high-performance JSON logs. Frontend and mobile apps use a lightweight console wrapper with the same interface.

---

## Package Overview

| Import | Use case | Dependencies |
|---|---|---|
| `@mono/logger` | Browser/mobile apps — types, `createBrowserLogger()`, `redactValue()` | None |
| `@mono/logger/node` | Node.js apps (API) — `createLogger()` backed by Pino | `pino`, `pino-pretty` |

**Rule:** Never import `@mono/logger/node` in frontend or mobile code. It will pull Pino into the client bundle.

---

## Log Levels

Use the right level for the right situation:

| Level | When to use | Example |
|---|---|---|
| `fatal` | Process cannot continue — about to crash | Uncaught exception in bootstrap |
| `error` | Operation failed, needs attention | Payment gateway returned 500 |
| `warn` | Unexpected but recoverable | Retry attempt 3/5 for external API |
| `info` | Normal operations worth recording | Request completed, user logged in |
| `debug` | Detailed context for troubleshooting | Cache miss for key `user:123` |
| `trace` | Extremely verbose — rarely used | Full serialized request body (non-sensitive) |

### Environment Defaults

| Environment | Backend level | Frontend level |
|---|---|---|
| Development | `debug` | `debug` |
| Production | `info` | `warn` |

---

## Structured Logging Patterns

Always use Pino's structured form — pass data as the first argument and the message as the second:

```typescript
// GOOD — structured, searchable in log aggregators
logger.info({ userId: 42, action: 'login' }, 'User logged in');

// BAD — loses structure, harder to query
logger.info(`User 42 logged in`);
```

### Child Loggers

Use `child()` to bind context that applies to multiple log lines:

```typescript
const requestLogger = logger.child({ correlationId, userId });
requestLogger.info({ action: 'fetchOrders' }, 'Fetching orders');
requestLogger.info({ orderCount: 5 }, 'Orders retrieved');
```

---

## What Should NEVER Be Logged

These must never appear in log output, even at `debug` or `trace` level:

- **Passwords** — plain text or hashed
- **API keys and secrets** — internal or third-party
- **Authentication tokens** — JWTs, session tokens, OAuth tokens
- **Session cookies**
- **Personally Identifiable Information (PII)** — SSNs, credit card numbers, full date of birth
- **Raw request/response bodies** containing user-submitted data (forms, file uploads)
- **Database connection strings** with credentials
- **Environment variables** containing secrets

When in doubt, don't log it. If you need to reference a sensitive value, log a masked version using `redactValue()`.

---

## Redaction

### Automatic Redaction (Backend)

The server logger automatically redacts these dot-paths in any logged object:

```
password, secret, token, authorization, cookie, ssn, creditCard,
req.headers.authorization, req.headers.cookie
```

Pino replaces these values with `[Redacted]` at the serialization level — the original value never reaches the transport or log output.

To add custom paths:

```typescript
import { createLogger } from '@mono/logger/node';

const logger = createLogger({
  name: 'payments',
  redactPaths: ['cardNumber', 'billing.cvv'],
});
```

### Manual Masking

For cases where you want to show a partial value (e.g., last 4 digits of a token):

```typescript
import { redactValue } from '@mono/logger';

logger.info({ apiKey: redactValue(key) }, 'Using API key');
// Output: { apiKey: "****ab3f" } Using API key
```

---

## Correlation IDs

Every HTTP request to the API is assigned a correlation ID:

1. The `CorrelationIdMiddleware` reads the `x-correlation-id` request header, or generates one via `crypto.randomUUID()`
2. The ID is attached to `req.correlationId` and set as the `x-correlation-id` response header
3. The `LoggingInterceptor` creates a Pino child logger bound to `{ correlationId }`, so every log within that request includes the ID

### Querying by Correlation ID

In a log aggregator (Datadog, ELK, CloudWatch Logs Insights):

```
correlationId:"a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### Passing Correlation IDs Across Services

If this API calls another service, forward the correlation ID:

```typescript
const res = await fetch('https://other-service/api', {
  headers: { 'x-correlation-id': req.correlationId },
});
```

---

## Frontend Logging

The browser logger (`createBrowserLogger()`) is for **developer debugging** — it writes to the browser console and is not production observability tooling.

### When to Log

- Errors caught in try/catch blocks
- Key user actions for debugging (button clicks, navigation)
- State transitions that are hard to trace

### When NOT to Log

- Sensitive form data (passwords, credit cards)
- Analytics events — these belong in your analytics SDK, not the console
- Every render cycle or state change — this creates noise

### Disabling in Production

The browser logger defaults to `warn` level in production. To disable entirely:

```typescript
const logger = createBrowserLogger({ enabled: false });
```

---

## Adding a New App

### Node.js / NestJS App

```typescript
import { createLogger } from '@mono/logger/node';

const logger = createLogger({ name: 'my-service' });
```

Add to `tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@mono/logger/node": ["packages/logger/dist/node.d.ts"]
    }
  },
  "references": [
    { "path": "../../packages/logger/tsconfig.lib.json" }
  ]
}
```

### Frontend / Mobile App

```typescript
import { createBrowserLogger } from '@mono/logger';

const logger = createBrowserLogger({ prefix: 'my-app' });
```

Add `'@mono/logger'` to `transpilePackages` in `next.config.js` (Next.js apps only).
