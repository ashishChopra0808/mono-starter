# API Contracts

This monorepo uses a three-package layered architecture for shared frontend/backend contracts. Zod schemas are the single source of truth — TypeScript types are derived via `z.infer<>`, eliminating type drift.

---

## Package Responsibilities

| Package | Purpose | Dependencies |
|---|---|---|
| `@mono/types` | Pure TypeScript utility types (`Nullable`, `Brand`, `WithTimestamps`, etc.) | None |
| `@mono/validation` | Zod schemas for domain entities and reusable primitives | `zod` |
| `@mono/api-contracts` | HTTP contracts: pagination, error shapes, endpoint definitions | `zod`, `@mono/validation` |

### What goes where?

**Put it in `@mono/types` if:**
- It's a pure TypeScript type with no runtime validation needs
- It's a utility type, branded type, or generic helper
- You need it in code that shouldn't depend on Zod

**Put it in `@mono/validation` if:**
- It defines a domain entity shape (e.g., `projectSchema`, `userSchema`)
- It's a reusable schema primitive (e.g., `emailSchema`, `uuidSchema`)
- It needs runtime validation (form submissions, API payloads)
- It infers the canonical TypeScript types via `z.infer<>`

**Put it in `@mono/api-contracts` if:**
- It defines an HTTP endpoint contract (method, path, request/response schemas)
- It's an API-layer convention (pagination, error shape, list response wrapper)
- It composes schemas from `@mono/validation` into HTTP-specific shapes

---

## Conventions

### Pagination

All paginated list endpoints use the same query and response shape.

**Query parameters** (validated by `paginationQuerySchema`):

| Parameter | Type | Default | Constraints |
|---|---|---|---|
| `page` | number | 1 | min 1 |
| `limit` | number | 20 | min 1, max 100 |
| `sortBy` | string | — | optional, resource-specific field name |
| `sortOrder` | `'asc'` \| `'desc'` | `'asc'` | optional |

**Response shape**:

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 42,
    "totalPages": 3
  }
}
```

### Error Responses

All error responses follow the same shape:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Project abc123 not found"
  }
}
```

`code` is a machine-readable string (e.g., `NOT_FOUND`, `UNAUTHORIZED`, `INTERNAL_ERROR`). `message` is human-readable.

### Validation Errors

Validation failures use code `VALIDATION_ERROR` and include field-level details:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "path": "name", "message": "Must not be empty" },
      { "path": "status", "message": "Invalid enum value" }
    ]
  }
}
```

### Success Responses

Single-resource responses wrap the data:

```json
{
  "data": { "id": "...", "name": "..." }
}
```

---

## Adding a New Resource Contract

Follow this process to add a new resource (e.g., "organization"):

### 1. Define schemas in `@mono/validation`

Create `packages/validation/src/organization.ts`:

```typescript
import { z } from 'zod';
import { nonEmptyString, uuidSchema, isoDateTimeSchema } from './primitives.js';

export const organizationSchema = z.object({
  id: uuidSchema,
  name: nonEmptyString.max(100),
  slug: nonEmptyString.max(50),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const createOrganizationSchema = z.object({
  name: nonEmptyString.max(100),
  slug: nonEmptyString.max(50),
});

export const updateOrganizationSchema = z.object({
  name: nonEmptyString.max(100).optional(),
});

export type Organization = z.infer<typeof organizationSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;
```

Export from `packages/validation/src/index.ts`.

### 2. Define the contract in `@mono/api-contracts`

Create `packages/api-contracts/src/organization.contract.ts`:

```typescript
import { z } from 'zod';
import {
  organizationSchema,
  createOrganizationSchema,
  updateOrganizationSchema,
} from '@mono/validation';
import {
  paginatedResponseSchema,
  paginationQuerySchema,
  successResponseSchema,
} from './common.js';

export const organizationContract = {
  list: {
    method: 'GET' as const,
    path: '/organizations',
    query: paginationQuerySchema,
    response: paginatedResponseSchema(organizationSchema),
  },
  create: {
    method: 'POST' as const,
    path: '/organizations',
    body: createOrganizationSchema,
    response: successResponseSchema(organizationSchema),
  },
  // ...
};
```

Export from `packages/api-contracts/src/index.ts`.

### 3. Create the NestJS module

In `apps/api/src/app/organization/`:

- `organization.controller.ts` — use `ZodValidationPipe` with the shared schemas
- `organization.service.ts` — business logic
- `organization.module.ts` — wire controller and service

Import the module in `app.module.ts`.

---

## Backend: Using ZodValidationPipe

The `ZodValidationPipe` validates request data against a Zod schema and returns structured validation errors on failure. Use it as a parameter-level pipe:

```typescript
import { Body, Controller, Post, Query } from '@nestjs/common';
import { createProjectSchema } from '@mono/validation';
import type { CreateProject } from '@mono/validation';
import { paginationQuerySchema } from '@mono/api-contracts';
import type { PaginationQuery } from '@mono/api-contracts';
import { ZodValidationPipe } from '../../validation/zod-validation.pipe';

@Controller('projects')
export class ProjectController {
  @Post()
  create(
    @Body(new ZodValidationPipe(createProjectSchema)) body: CreateProject,
  ) {
    // body is validated and typed — safe to use directly
  }

  @Get()
  list(
    @Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQuery,
  ) {
    // query.page, query.limit are parsed numbers with defaults applied
  }
}
```

The pipe:
- Returns parsed data (with defaults and coercions applied) on success
- Throws `BadRequestException` with the standard validation error shape on failure

---

## Frontend: Usage Patterns

### Form validation

Use `@mono/validation` schemas directly for client-side form validation:

```typescript
import { createProjectSchema } from '@mono/validation';

function validateForm(data: unknown) {
  const result = createProjectSchema.safeParse(data);
  if (!result.success) {
    return result.error.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    }));
  }
  return null; // valid
}
```

### Type-safe API calls

Use inferred types from `@mono/api-contracts` for type-safe fetch wrappers:

```typescript
import type { ProjectListResponse } from '@mono/api-contracts';
import type { CreateProject, Project } from '@mono/validation';

async function listProjects(page = 1): Promise<ProjectListResponse> {
  const res = await fetch(`/api/projects?page=${page}`);
  return res.json();
}

async function createProject(data: CreateProject): Promise<{ data: Project }> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
```

---

## Schema Primitives Reference

Available from `@mono/validation`:

| Schema | Description | Example valid value |
|---|---|---|
| `nonEmptyString` | Trimmed, min length 1 | `"hello"` |
| `emailSchema` | Valid email | `"user@example.com"` |
| `uuidSchema` | UUID v4 | `"550e8400-e29b-41d4-a716-446655440000"` |
| `isoDateTimeSchema` | ISO 8601 datetime | `"2025-01-15T10:30:00.000Z"` |
| `urlSchema` | Valid URL | `"https://example.com"` |
