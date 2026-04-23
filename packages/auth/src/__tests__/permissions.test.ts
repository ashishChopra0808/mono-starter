import { describe, expect, it } from 'vitest';

import { getPermissions, hasPermission, Permission, PERMISSIONS } from '../permissions';
import { Role } from '../roles';

describe('permissions', () => {
  describe('PERMISSIONS', () => {
    it('contains all permission values', () => {
      expect(PERMISSIONS).toContain('users:read');
      expect(PERMISSIONS).toContain('content:read');
      expect(PERMISSIONS.length).toBeGreaterThan(0);
    });
  });

  describe('getPermissions()', () => {
    it('returns only content:read for user role', () => {
      const perms = getPermissions(Role.USER);
      expect(perms).toContain(Permission.CONTENT_READ);
      expect(perms).not.toContain(Permission.CONTENT_WRITE);
      expect(perms).not.toContain(Permission.USERS_READ);
    });

    it('returns content permissions + inherited for editor role', () => {
      const perms = getPermissions(Role.EDITOR);
      // Own permissions
      expect(perms).toContain(Permission.CONTENT_WRITE);
      expect(perms).toContain(Permission.CONTENT_PUBLISH);
      // Inherited from user
      expect(perms).toContain(Permission.CONTENT_READ);
      // Should NOT have admin permissions
      expect(perms).not.toContain(Permission.USERS_READ);
      expect(perms).not.toContain(Permission.USERS_WRITE);
      expect(perms).not.toContain(Permission.USERS_DELETE);
    });

    it('returns all permissions for admin role', () => {
      const perms = getPermissions(Role.ADMIN);
      // Own permissions
      expect(perms).toContain(Permission.USERS_READ);
      expect(perms).toContain(Permission.USERS_WRITE);
      expect(perms).toContain(Permission.USERS_DELETE);
      // Inherited from editor
      expect(perms).toContain(Permission.CONTENT_WRITE);
      expect(perms).toContain(Permission.CONTENT_PUBLISH);
      // Inherited from user
      expect(perms).toContain(Permission.CONTENT_READ);
      // Should have ALL permissions
      expect(perms).toHaveLength(PERMISSIONS.length);
    });
  });

  describe('hasPermission()', () => {
    it('returns true for a role with the permission', () => {
      expect(hasPermission(Role.USER, Permission.CONTENT_READ)).toBe(true);
      expect(hasPermission(Role.ADMIN, Permission.USERS_DELETE)).toBe(true);
    });

    it('returns true for inherited permissions', () => {
      expect(hasPermission(Role.ADMIN, Permission.CONTENT_READ)).toBe(true);
      expect(hasPermission(Role.EDITOR, Permission.CONTENT_READ)).toBe(true);
    });

    it('returns false for a role without the permission', () => {
      expect(hasPermission(Role.USER, Permission.USERS_READ)).toBe(false);
      expect(hasPermission(Role.USER, Permission.CONTENT_WRITE)).toBe(false);
      expect(hasPermission(Role.EDITOR, Permission.USERS_DELETE)).toBe(false);
    });
  });
});
