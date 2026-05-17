import { z } from 'zod';

// ─── Pagination ──────────────────────────────────────────────────────────────

export const sortOrderSchema = z.enum(['asc', 'desc']).default('asc');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: sortOrderSchema.optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  totalCount: z.number().int(),
  totalPages: z.number().int(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/** Factory: wraps an item schema into a paginated response. */
export function paginatedResponseSchema<T extends z.ZodType>(
  itemSchema: T,
) {
  return z.object({
    data: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}

// ─── Success response ────────────────────────────────────────────────────────

/** Factory: wraps a data schema into a standard success response. */
export function successResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({ data: dataSchema });
}

// ─── Error responses ─────────────────────────────────────────────────────────
// The wire shape every error response follows. The server sets `requestId` on
// every response; older responses (pre-PR-17) may omit it, so the schema keeps
// it optional. See `docs/ERROR-HANDLING.md` for the full taxonomy.

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: z.string().optional(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * One field-level validation problem.
 *
 * `path` is a dotted string (e.g. `"address.street"`) that matches the form
 * field name on the UI. The backend converts Zod's array path before sending.
 */
export const validationErrorDetailSchema = z.object({
  path: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export const validationErrorSchema = z.object({
  error: z.object({
    code: z.literal('VALIDATION_FAILED'),
    message: z.string(),
    details: z.array(validationErrorDetailSchema),
    requestId: z.string().optional(),
  }),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;
export type ValidationErrorDetail = z.infer<typeof validationErrorDetailSchema>;
