import { z } from 'zod';

import { isoDateTimeSchema, nonEmptyString, uuidSchema } from './primitives.js';

export const projectStatusValues = [
  'active',
  'archived',
  'draft',
] as const;

export const projectStatusSchema = z.enum(projectStatusValues);

/** Full project entity as returned by the API. */
export const projectSchema = z.object({
  id: uuidSchema,
  name: nonEmptyString.max(100),
  description: z.string().max(500).optional(),
  status: projectStatusSchema,
  ownerId: uuidSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

/** Payload for creating a new project. */
export const createProjectSchema = z.object({
  name: nonEmptyString.max(100),
  description: z.string().max(500).optional(),
  status: projectStatusSchema.default('draft'),
});

/** Payload for updating a project (all fields optional). */
export const updateProjectSchema = z.object({
  name: nonEmptyString.max(100).optional(),
  description: z.string().max(500).optional(),
  status: projectStatusSchema.optional(),
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
