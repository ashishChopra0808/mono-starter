import { type Role, Role as RoleEnum, ROLE_HIERARCHY } from './roles.js';

// ─── Permissions ─────────────────────────────────────────────────────────────
// Permissions are fine-grained access controls mapped to roles.
//
// To add a new permission:
//   1. Add the constant to the `Permission` object
//   2. Assign it to the appropriate roles in `ROLE_PERMISSIONS`
//   3. Use `hasPermission()` in guards or service logic

/**
 * Application permissions.
 *
 * Named as `resource:action` for clarity.
 */
export const Permission = {
  // Users
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',

  // Content (example domain — extend as needed)
  CONTENT_READ: 'content:read',
  CONTENT_WRITE: 'content:write',
  CONTENT_PUBLISH: 'content:publish',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/** All valid permission values as an array. */
export const PERMISSIONS = Object.values(Permission) as readonly Permission[];

/**
 * Maps each role to its **own** permissions (not inherited).
 *
 * Higher roles inherit all permissions of lower roles automatically
 * via the `getPermissions()` function.
 */
const ROLE_OWN_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [RoleEnum.USER]: [Permission.CONTENT_READ],
  [RoleEnum.EDITOR]: [Permission.CONTENT_WRITE, Permission.CONTENT_PUBLISH],
  [RoleEnum.ADMIN]: [Permission.USERS_READ, Permission.USERS_WRITE, Permission.USERS_DELETE],
};

/**
 * Returns all permissions for a role, **including inherited permissions**
 * from lower roles in the hierarchy.
 *
 * @example
 * getPermissions('admin')
 * // → ['content:read', 'content:write', 'content:publish', 'users:read', ...]
 */
export function getPermissions(role: Role): readonly Permission[] {
  const level = ROLE_HIERARCHY[role];

  const allPermissions = new Set<Permission>();

  for (const [r, perms] of Object.entries(ROLE_OWN_PERMISSIONS)) {
    if (ROLE_HIERARCHY[r as Role] <= level) {
      for (const p of perms) {
        allPermissions.add(p);
      }
    }
  }

  return [...allPermissions];
}

/**
 * Check if a role has a specific permission (including inherited).
 *
 * @example
 * hasPermission('admin', 'content:read')  // true — inherited from user
 * hasPermission('user', 'users:write')    // false — admin only
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return getPermissions(role).includes(permission);
}
