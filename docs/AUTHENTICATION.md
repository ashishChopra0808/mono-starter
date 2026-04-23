# Authentication & Authorization

This document explains the auth strategy, implementation details, and how to use it in your code.

---

## Strategy Overview

The monorepo uses a **dual authentication strategy** — the same backend serves both session-friendly web clients and token-based mobile clients.

| Client | Transport | Storage | Why |
|---|---|---|---|
| **Web / Admin** (Next.js) | HTTP-only cookie *(planned)* | Browser cookie jar | XSS-proof — JS cannot read the token |
| **Mobile** (Expo) | `Authorization: Bearer <token>` | Expo SecureStore | No cookie jar on native platforms |

**Current implementation:** JWT-based flow for both. Cookie-based sessions will be added when Better Auth or Auth.js is integrated — the API surface stays the same.

---

## Authentication vs Authorization

```
Authentication (WHO are you?)           Authorization (WHAT can you do?)
─────────────────────────────           ─────────────────────────────────
JwtAuthGuard                            RolesGuard
  ↓ validates token                       ↓ checks @Roles() decorator
  ↓ attaches AuthUser to request          ↓ compares user.role to requirement
  ↓ rejects → 401 Unauthorized           ↓ rejects → 403 Forbidden
```

### Separation Boundaries

| Layer | Package | What it does |
|---|---|---|
| **Shared types** | `@mono/auth` | Role enum, permissions, AuthUser type — platform-agnostic |
| **Authentication** | `apps/api` guards | Token validation, session management — server-only |
| **Authorization** | `apps/api` guards | Role/permission checking — server-only |

---

## Roles & Permissions

### Roles (in `@mono/auth`)

```typescript
import { Role } from '@mono/auth';

Role.USER    // 'user'   — default role
Role.EDITOR  // 'editor' — can write/publish content
Role.ADMIN   // 'admin'  — full access
```

Roles have a **hierarchy**: `admin > editor > user`. A higher role automatically satisfies a lower role requirement.

### Permissions (in `@mono/auth`)

Permissions use `resource:action` naming:

```typescript
import { hasPermission, Permission } from '@mono/auth';

hasPermission('admin', Permission.USERS_DELETE);  // true
hasPermission('user', Permission.USERS_DELETE);   // false
hasPermission('admin', Permission.CONTENT_READ);  // true (inherited from user)
```

---

## API Endpoints

All endpoints are prefixed with the API version (e.g., `/api/v1/`).

### `POST /auth/sign-in` (Public)

```json
// Request
{ "email": "admin@example.com", "password": "password123" }

// Response 200
{
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "admin" },
    "accessToken": "eyJhbG...",
    "refreshToken": "a3f8c2...",
    "expiresAt": "2026-04-30T12:00:00.000Z"
  }
}
```

### `POST /auth/refresh` (Public)

```json
// Request
{ "refreshToken": "a3f8c2..." }

// Response 200 — same shape as sign-in
```

Token rotation: the old refresh token is deleted and a new one is issued.

### `POST /auth/sign-out` (Public)

```json
// Request
{ "refreshToken": "a3f8c2..." }

// Response 204 No Content
```

### `GET /auth/me` (Authenticated)

```
Authorization: Bearer eyJhbG...

// Response 200
{ "data": { "id": "...", "email": "...", "name": "...", "role": "admin" } }
```

---

## How to Protect a Route

### Default: All routes require authentication

The `JwtAuthGuard` is registered globally. Every route requires a valid JWT **unless** explicitly opted out.

### Mark a route as public

```typescript
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Get('health')
check(): HealthResponse { ... }
```

### Require a specific role

```typescript
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@mono/auth';

@Roles(Role.ADMIN)
@Get('users')
async list(): Promise<UserListResponse> { ... }
```

### Access the current user

```typescript
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '@mono/auth';

@Get('profile')
async getProfile(@CurrentUser() user: AuthUser): Promise<ProfileResponse> {
  // user.id, user.email, user.role are available
}
```

---

## Token Strategy

| Token | Type | Lifetime | Storage |
|---|---|---|---|
| Access token | JWT (signed) | 15 minutes | Client memory or SecureStore |
| Refresh token | Opaque hex string | 7 days | `sessions` table in DB + client SecureStore |

### Token Rotation

On every `/auth/refresh` call:
1. The old refresh token is **deleted** from the database
2. A new access + refresh token pair is issued
3. This prevents replay attacks with leaked tokens

### JWT Payload

```typescript
{
  sub: "user-uuid",     // User ID
  role: "admin",        // For authorization decisions
  iat: 1714000000,      // Issued at
  exp: 1714000900       // Expires in 15 min
}
```

Kept minimal — full user data is fetched from DB when needed (via `GET /auth/me`).

---

## Security Considerations

### Password Handling

- Passwords are hashed with **bcrypt** (10 salt rounds, ~100ms per hash)
- The `passwordHash` column is **never** included in API responses or `AuthUser` types
- The `users.passwordHash` field is nullable to support future OAuth providers

### Token Security

- Access tokens are short-lived (15 min) — limits the damage window of a leaked token
- Refresh tokens are stored server-side and deleted on use (rotation)
- Sign-out deletes the server-side session — the refresh token becomes unusable

### XSS/CSRF (planned)

When Better Auth or Auth.js is integrated:
- Web/admin will use `HttpOnly` + `Secure` + `SameSite=Lax` cookies
- This makes tokens invisible to JavaScript (XSS-proof)
- `SameSite=Lax` provides CSRF protection for most use cases

---

## Future: Better Auth / Auth.js Integration

The architecture is designed for a smooth transition:

| What stays | What changes |
|---|---|
| `@mono/auth` roles, permissions, types | Token creation moves to Better Auth |
| `@Public()`, `@Roles()`, `@CurrentUser()` decorators | `JwtAuthGuard` wraps Better Auth's session verification |
| API endpoint shapes (`/auth/sign-in`, etc.) | Internal implementation delegates to Better Auth SDK |
| Authorization logic (guards, role checks) | Cookie session management handled by Better Auth |

The key insight: **guards read a generic `AuthUser` from the request — they don't care how it got there.** Swapping JWT verification for Better Auth session lookup is a single change in `JwtAuthGuard`.

---

## Quick Reference

```bash
# Sign in and get tokens
curl -X POST http://localhost:3000/api/v1/auth/sign-in \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"password123"}'

# Use the access token
curl http://localhost:3000/api/v1/auth/me \
  -H 'Authorization: Bearer <accessToken>'

# Refresh tokens
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<refreshToken>"}'

# Sign out
curl -X POST http://localhost:3000/api/v1/auth/sign-out \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<refreshToken>"}'
```

### Seed Users (local dev)

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `password123` | admin |
| `editor@example.com` | `password123` | editor |
| `user@example.com` | `password123` | user |
