import { z } from 'zod';

// ─── Common Schemas ─────────────────────────────────────────────────────────

/** Validates NODE_ENV as one of the standard environment names. */
export const nodeEnvSchema = z.enum(['development', 'test', 'production']);

/** Coerces a string to number. Useful for PORT-like variables. */
export const portSchema = z.coerce.number().int().min(1).max(65535);

/** Validates a well-formed URL string. */
export const urlSchema = z.url();

/**
 * Coerces common truthy/falsy string representations to a boolean.
 * "true", "1", "yes" → true; everything else → false.
 */
export const booleanSchema = z
  .string()
  .transform((val) => ['true', '1', 'yes'].includes(val.toLowerCase()))
  .pipe(z.boolean());
