// ─── Auth Package ────────────────────────────────────────────────────────────
// Shared authentication and authorization primitives.
//
// This package is platform-agnostic — it contains NO server/client-specific
// code. It provides:
//   - Role definitions and hierarchy
//   - Permission map with inheritance
//   - Shared types (AuthUser, AuthSession, TokenPayload)

export { getPermissions, hasPermission, Permission, PERMISSIONS } from './permissions.js';
export { hasRole, Role, ROLE_HIERARCHY, ROLES } from './roles.js';
export type { AuthSession, AuthUser, RefreshRequest, SignInRequest, TokenPayload } from './types.js';
