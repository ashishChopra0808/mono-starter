# Backend Architecture

The API is a NestJS application at `apps/api/` with modular architecture, structured logging, Zod-based validation, and a global exception filter that produces consistent error responses.

---

## Folder Structure

```
apps/api/src/
├── main.ts                              # Bootstrap: prefix, pipes, filters
├── app/
│   ├── app.module.ts                    # Root module — imports all feature modules
│   ├── app.controller.ts                # Root GET / endpoint
│   ├── app.service.ts
│   ├── health/                          # Infrastructure: health probe
│   │   ├── health.controller.ts         #   GET /health (no version prefix)
│   │   └── health.module.ts
│   ├── auth/                            # Placeholder: authentication
│   │   ├── auth.controller.ts           #   GET /api/v1/auth/me → 501
│   │   └── auth.module.ts
│   ├── users/                           # Placeholder: user management
│   │   ├── users.controller.ts          #   GET /api/v1/users → 501
│   │   └── users.module.ts
│   └── project/                         # Feature: CRUD example
│       ├── project.controller.ts        #   Full CRUD at /api/v1/projects
│       ├── project.service.ts
│       └── project.module.ts
├── common/
│   └── filters/
│       └── all-exceptions.filter.ts     # Global exception → ApiError shape
├── logging/
│   ├── index.ts                         # Barrel export
│   ├── correlation-id.middleware.ts      # x-correlation-id header
│   ├── logging.interceptor.ts           # Request start/complete logging
│   └── pino-logger.adapter.ts           # Pino → NestJS LoggerService
└── validation/
    └── zod-validation.pipe.ts           # Zod schema → parameter validation
```

---

## Why Modules Are Organized This Way

### `app/` — Feature and infrastructure modules

Every distinct domain or infrastructure concern gets its own NestJS module. Each module contains its own controller, service, and any module-specific providers. This gives clear boundaries:

- **HealthModule** sits alongside feature modules but is excluded from the versioned prefix so infrastructure probes reach `/health` directly.
- **AuthModule** and **UsersModule** are placeholders that establish the boundaries for future implementation without premature code.
- **ProjectModule** is the reference implementation showing how to wire Zod validation, contracts, and pagination.

### `common/` — Cross-cutting infrastructure

Shared components that are used globally but don't belong to any feature module. Currently holds the global exception filter. As the API grows, this is where guards, decorators, and other shared utilities go.

### `logging/` — Structured request logging

Isolated from `common/` because it contains closely related files (middleware, interceptor, adapter) that form a single cohesive logging subsystem. All three are registered globally in `AppModule`.

### `validation/` — Schema validation pipe

The `ZodValidationPipe` is used per-parameter across all controllers. Kept separate from `common/` because it's a single-purpose pipe tied to the Zod validation strategy.

---

## Request Lifecycle

Every HTTP request flows through these layers in order:

```
Request
  │
  ▼
CorrelationIdMiddleware          Read or generate x-correlation-id
  │
  ▼
Global ValidationPipe            Basic type coercion (transform: true)
  │
  ▼
LoggingInterceptor (pre)         Log: incoming request with method, url, correlationId
  │
  ▼
Route Handler                    Controller method executes
  │  ├─ ZodValidationPipe        Per-parameter schema validation (if applied)
  │  └─ Business logic           Service layer
  │
  ▼
LoggingInterceptor (post)        Log: statusCode, durationMs
  │
  ▼
AllExceptionsFilter              Catch any thrown error → ApiError shape
  │
  ▼
Response
```

### Error flow

If an exception is thrown anywhere in the handler:

1. **HttpException** (including `BadRequestException` from `ZodValidationPipe`): The filter extracts the status code, maps it to a machine-readable error code, and returns the standard `{ error: { code, message } }` shape. If the exception body already has this shape, it passes through unchanged.

2. **Unknown error**: The filter logs the full error with correlation ID, then returns a 500 response with `{ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }`. The actual error details are never leaked to the client.

---

## API Versioning

All resource endpoints are prefixed with `/api/v1`:

| Method | Path | Module |
|---|---|---|
| GET | `/health` | HealthModule (no prefix) |
| GET | `/api/v1` | AppController |
| GET | `/api/v1/projects` | ProjectModule |
| POST | `/api/v1/projects` | ProjectModule |
| GET | `/api/v1/projects/:id` | ProjectModule |
| PATCH | `/api/v1/projects/:id` | ProjectModule |
| DELETE | `/api/v1/projects/:id` | ProjectModule |
| GET | `/api/v1/auth/me` | AuthModule (placeholder) |
| GET | `/api/v1/users` | UsersModule (placeholder) |

The health endpoint is excluded from the prefix via `setGlobalPrefix('api/v1', { exclude: [...] })` so infrastructure probes can reach it at `/health` without version coupling.

---

## Adding a New Module

1. **Create the directory** at `apps/api/src/app/<name>/`

2. **Create the module files**:
   - `<name>.module.ts` — declares controllers and providers
   - `<name>.controller.ts` — route handlers, use `ZodValidationPipe` for validation
   - `<name>.service.ts` — business logic

3. **Define schemas** in `packages/validation/src/<name>.ts` and export from the barrel

4. **Define the contract** in `packages/api-contracts/src/<name>.contract.ts` and export from the barrel

5. **Import the module** in `apps/api/src/app/app.module.ts`:
   ```typescript
   import { NewModule } from './<name>/<name>.module';

   @Module({
     imports: [HealthModule, AuthModule, UsersModule, ProjectModule, NewModule],
     // ...
   })
   ```

6. **Typecheck**: `cd apps/api && npx tsc --noEmit --project tsconfig.app.json`

---

## Global Infrastructure Summary

| Concern | Implementation | Registration |
|---|---|---|
| Logging | Pino via `@mono/logger/node` | `NestFactory.create({ logger })` |
| Correlation IDs | `CorrelationIdMiddleware` | `AppModule.configure()` — all routes |
| Request logging | `LoggingInterceptor` | `APP_INTERCEPTOR` in AppModule |
| Exception formatting | `AllExceptionsFilter` | `APP_FILTER` in AppModule + `app.useGlobalFilters()` |
| Type coercion | `ValidationPipe({ transform: true })` | `app.useGlobalPipes()` in main.ts |
| Schema validation | `ZodValidationPipe` | Per-parameter in controllers |
| Environment | `@mono/env/api` (Zod-validated) | Imported in main.ts |
