import { userProfileSchema, type UserProfile } from '@mono/validation';
import { z } from 'zod';

import type { ApiClient } from '../client.js';

// The API wraps payloads as `{ data: ... }`. We unwrap here so callers get
// the entity directly. This is the convention every service should follow.
const meResponseSchema = z.object({ data: userProfileSchema });

/**
 * Fetch the current user's profile from `GET /auth/me`.
 *
 * Throws `UnauthorizedError` if no valid session, `ApiError` for other
 * non-2xx responses, `NetworkError` for transport failures, and
 * `ResponseValidationError` if the server returns an unexpected shape.
 */
export async function getCurrentUserProfile(client: ApiClient): Promise<UserProfile> {
  const result = await client.request({
    method: 'GET',
    path: '/auth/me',
    responseSchema: meResponseSchema,
  });
  return result.data;
}
