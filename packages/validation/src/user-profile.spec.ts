import { describe, expect, it } from 'vitest';
import { userProfileSchema } from './user-profile.js';

describe('userProfileSchema', () => {
  const validPayload = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
    permissions: ['content:read'],
    createdAt: '2023-10-01T12:00:00Z',
  };

  it('should parse a valid user profile payload', () => {
    const result = userProfileSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.role).toBe('user');
    }
  });

  it('should allow nullable name', () => {
    const payload = { ...validPayload, name: null };
    const result = userProfileSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should reject an invalid role', () => {
    const payload = { ...validPayload, role: 'superadmin' };
    const result = userProfileSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject an invalid permission', () => {
    const payload = { ...validPayload, permissions: ['invalid:permission'] };
    const result = userProfileSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it('should reject an invalid createdAt timestamp', () => {
    const payload = { ...validPayload, createdAt: 'not-a-date' };
    const result = userProfileSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
