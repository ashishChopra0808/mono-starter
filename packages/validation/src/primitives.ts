import { z } from 'zod';

/** Non-empty trimmed string. */
export const nonEmptyString = z.string().trim().min(1, 'Must not be empty');

/** Valid email address. */
export const emailSchema = z.string().email();

/** UUID v4 string. */
export const uuidSchema = z.string().uuid();

/** ISO 8601 date-time string. */
export const isoDateTimeSchema = z.string().datetime();

/** Valid URL string. */
export const urlSchema = z.url();
