import { PERMISSIONS, ROLES } from '@mono/auth';
import { z } from 'zod';

import { emailSchema, isoDateTimeSchema, uuidSchema } from './primitives.js';

// ─── User Profile ────────────────────────────────────────────────────────────
// Enriched user profile as returned by GET /auth/me.
// Extends the basic AuthUser shape with computed permissions and timestamps.

/** Valid role values — imported from @mono/auth. */
const roleSchema = z.enum(ROLES);

/** Valid permission values — imported from @mono/auth. */
const permissionSchema = z.enum(PERMISSIONS);

/**
 * Full user profile schema.
 *
 * Used for runtime validation of the GET /auth/me response on the client.
 * The API computes `permissions` from the user's role using @mono/auth.
 */
export const userProfileSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  name: z.string().nullable(),
  role: roleSchema,
  permissions: z.array(permissionSchema),
  createdAt: isoDateTimeSchema,
});

export type UserProfile = z.infer<typeof userProfileSchema>;
