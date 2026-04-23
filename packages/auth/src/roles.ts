// ─── Roles ───────────────────────────────────────────────────────────────────
// Roles are the foundation of authorization. They are stored as plain strings
// in the database (not Postgres enums) for easy migration.
//
// To add a new role:
//   1. Add it to the `Role` object below
//   2. Assign a hierarchy level in `ROLE_HIERARCHY`
//   3. Map its permissions in `permissions.ts`

/**
 * Application roles.
 *
 * Use the value constants (`Role.USER`, `Role.ADMIN`) in code.
 * The `Role` type is the union of all possible role strings.
 */
export const Role = {
  USER: 'user',
  EDITOR: 'editor',
  ADMIN: 'admin',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/** All valid role values as an array — useful for validation schemas. */
export const ROLES = Object.values(Role) as readonly Role[];

/**
 * Role hierarchy — higher number = more privileged.
 *
 * Used by `hasRole()` for "at least this role" checks.
 * Example: `hasRole('editor', 'user')` → true (editor ≥ user)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.USER]: 0,
  [Role.EDITOR]: 1,
  [Role.ADMIN]: 2,
};

/**
 * Check if a user's role meets a minimum role requirement.
 *
 * Uses the hierarchy: admin > editor > user.
 *
 * @example
 * hasRole('admin', 'editor')  // true — admin ≥ editor
 * hasRole('user', 'editor')   // false — user < editor
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
