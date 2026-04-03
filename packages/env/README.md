# @mono/env

Type-safe, validated environment variables for the monorepo. Powered by [Zod](https://zod.dev/) and [@t3-oss/env](https://env.t3.gg/).

## Overview

This package provides a centralized, validated, and type-safe way to manage environment variables across all apps in the monorepo. It:

- **Validates all env vars at startup** — the app crashes immediately with a clear error instead of failing mysteriously at runtime.
- **Provides full TypeScript types** — `env.DATABASE_URL` is typed as `string`, `env.PORT` as `number`, etc.
- **Enforces server/client boundaries** — prevents accidentally leaking secrets into browser bundles.
- **Centralizes schemas** — common variables like `DATABASE_URL` are defined once and reused across apps.

## Quick Start

Each app imports only the env config it needs:

```ts
// apps/web — any file
import { env } from '../env';  // or '@mono/env/web'
console.log(env.NEXT_PUBLIC_API_URL);  // ✅ typed, validated
console.log(env.DATABASE_URL);         // ✅ only in server components
```

```ts
// apps/api — any file
import { apiEnv } from '@mono/env/api';
console.log(apiEnv.PORT);           // ✅ number (coerced from string)
console.log(apiEnv.DATABASE_URL);   // ✅ validated URL
```

```ts
// apps/mobile — any file
import { env } from '../env';  // or '@mono/env/mobile'
console.log(env.EXPO_PUBLIC_API_URL);  // ✅ validated URL
```

> **Important:** Never access `process.env` directly in app code. Always use the typed env objects.

## Available Env Configs

| Import Path       | App     | Framework  | Client Prefix    |
|-------------------|---------|------------|------------------|
| `@mono/env/web`   | web     | Next.js    | `NEXT_PUBLIC_`   |
| `@mono/env/admin` | admin   | Next.js    | `NEXT_PUBLIC_`   |
| `@mono/env/api`   | api     | NestJS     | _(none)_         |
| `@mono/env/mobile`| mobile  | Expo       | `EXPO_PUBLIC_`   |

## Server vs Client Boundaries

### Next.js Apps (web, admin)

Next.js has a strict server/client boundary. Variables are split as:

| Placement | Prefix          | Access                                     |
|-----------|-----------------|---------------------------------------------|
| `server`  | _(none)_        | Server Components, API Routes, middleware    |
| `client`  | `NEXT_PUBLIC_`  | Any component (embedded in browser bundle)   |

**⚠ Never put secrets in `NEXT_PUBLIC_` variables.** They are visible to anyone inspecting the page source.

```ts
// ✅ Server Component — full access
import { env } from '../env';
console.log(env.DATABASE_URL);           // works
console.log(env.NEXT_PUBLIC_API_URL);    // works

// ❌ Client Component — accessing server var throws at runtime
'use client';
import { env } from '../env';
console.log(env.DATABASE_URL);           // 💥 throws error
console.log(env.NEXT_PUBLIC_API_URL);    // works
```

### Expo App (mobile)

Expo uses `EXPO_PUBLIC_` prefix for variables embedded in the JS bundle. Since mobile is always client-side, all env vars go in the `client` config section.

**⚠ `EXPO_PUBLIC_` variables are baked into the JavaScript bundle at build time.** They are NOT secrets.

### NestJS API

The API app is purely server-side — all variables are in the `server` config. There is no client/server split.

## Adding New Environment Variables

Follow these steps whenever you need a new env var:

### 1. Decide: Shared or App-Specific?

- **Shared across apps?** → Add to `packages/env/src/server.ts` (for server-side) or `packages/env/src/shared.ts` (for helpers/schemas).
- **Only one app?** → Add directly to that app's config file (e.g., `packages/env/src/web.ts`).

### 2. Add the Schema

```ts
// packages/env/src/web.ts (example — adding a new server var)
export const webEnv = createEnv({
  server: {
    ...sharedServerSchemas,
    MY_NEW_SECRET: z.string().min(1),  // ← add here
  },
  client: {
    // ...
  },
  // ...
});
```

For client-side variables, remember to also add to `experimental__runtimeEnv` (Next.js) or `runtimeEnv`:

```ts
// Next.js apps — must destructure client vars
experimental__runtimeEnv: {
  // ...existing vars...
  NEXT_PUBLIC_MY_VAR: process.env['NEXT_PUBLIC_MY_VAR'],  // ← add
},
```

### 3. Update `.env.example` Files

Add the variable with a safe default or placeholder:

```env
# Root .env.example
MY_NEW_SECRET=change-me

# App-specific .env.example
MY_NEW_SECRET=change-me
```

### 4. Rebuild the Env Package

After changing schemas, rebuild so consuming apps get the updated types:

```bash
pnpm nx build @mono/env
```

### 5. Set the Value

Add the actual value to your local `.env` / `.env.local` file (not committed to git).

## Available Helpers

The `shared.ts` module exports reusable Zod schemas:

```ts
import { nodeEnvSchema, portSchema, urlSchema, booleanSchema } from '@mono/env';

// nodeEnvSchema  → z.enum(['development', 'test', 'production'])
// portSchema     → coerces to number, 1–65535
// urlSchema      → validates URL format
// booleanSchema  → "true"/"1"/"yes" → true, everything else → false
```

## Startup Validation

Validation runs **at import time**. If any required variable is missing or invalid, you'll see an error like:

```
❌ Invalid environment variables:
  DATABASE_URL: Required
  JWT_SECRET: String must contain at least 32 character(s)
```

To skip validation (e.g., during build steps that don't need env vars), set:

```env
SKIP_ENV_VALIDATION=1
```

And update your env config:

```ts
export const webEnv = createEnv({
  // ...
  skipValidation: process.env['SKIP_ENV_VALIDATION'] === '1',
});
```

## File Structure

```
packages/env/src/
├── index.ts      # Barrel export
├── shared.ts     # Common Zod schemas (nodeEnv, port, url, boolean)
├── server.ts     # Shared server-only schemas (DATABASE_URL, JWT_SECRET, etc.)
├── web.ts        # Web app (Next.js) env config
├── admin.ts      # Admin app (Next.js) env config
├── api.ts        # API app (NestJS) env config
└── mobile.ts     # Mobile app (Expo) env config
```

## Troubleshooting

### "Cannot find module '@mono/env/web'"

Make sure the env package is built:

```bash
pnpm nx build @mono/env
```

### "Invalid environment variables" on startup

Check your `.env` / `.env.local` file for missing or malformed values. Compare against the `.env.example` file for the app you're running.

### "Server-side variable accessed on the client"

You're importing a server-only variable in a Client Component. Either:
- Move the code to a Server Component, or
- Create a `NEXT_PUBLIC_` version of the variable if it's safe to expose.
