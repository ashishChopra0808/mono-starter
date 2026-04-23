import { describe, expect, it } from 'vitest';

import { hasRole, Role, ROLE_HIERARCHY, ROLES } from '../roles';

describe('roles', () => {
  describe('ROLES', () => {
    it('contains all role values', () => {
      expect(ROLES).toContain('user');
      expect(ROLES).toContain('editor');
      expect(ROLES).toContain('admin');
      expect(ROLES).toHaveLength(3);
    });
  });

  describe('ROLE_HIERARCHY', () => {
    it('ranks admin highest', () => {
      expect(ROLE_HIERARCHY[Role.ADMIN]).toBeGreaterThan(ROLE_HIERARCHY[Role.EDITOR]);
      expect(ROLE_HIERARCHY[Role.EDITOR]).toBeGreaterThan(ROLE_HIERARCHY[Role.USER]);
    });
  });

  describe('hasRole()', () => {
    it('returns true when user role equals required role', () => {
      expect(hasRole(Role.USER, Role.USER)).toBe(true);
      expect(hasRole(Role.EDITOR, Role.EDITOR)).toBe(true);
      expect(hasRole(Role.ADMIN, Role.ADMIN)).toBe(true);
    });

    it('returns true when user role is higher than required', () => {
      expect(hasRole(Role.ADMIN, Role.USER)).toBe(true);
      expect(hasRole(Role.ADMIN, Role.EDITOR)).toBe(true);
      expect(hasRole(Role.EDITOR, Role.USER)).toBe(true);
    });

    it('returns false when user role is lower than required', () => {
      expect(hasRole(Role.USER, Role.EDITOR)).toBe(false);
      expect(hasRole(Role.USER, Role.ADMIN)).toBe(false);
      expect(hasRole(Role.EDITOR, Role.ADMIN)).toBe(false);
    });
  });
});
