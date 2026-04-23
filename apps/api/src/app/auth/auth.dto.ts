import { emailSchema } from '@mono/validation';
import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────────────────────
// Zod schemas for auth request validation — consistent with the project
// module's approach. Used via ZodValidationPipe in controllers.

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});

export type SignInDto = z.infer<typeof signInSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshDto = z.infer<typeof refreshSchema>;
