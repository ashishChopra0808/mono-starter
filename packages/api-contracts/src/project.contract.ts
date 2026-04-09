import { z } from 'zod';

import {
  createProjectSchema,
  projectSchema,
  updateProjectSchema,
} from '@mono/validation';

import {
  paginatedResponseSchema,
  paginationQuerySchema,
  successResponseSchema,
} from './common.js';

export const projectContract = {
  list: {
    method: 'GET' as const,
    path: '/projects',
    query: paginationQuerySchema,
    response: paginatedResponseSchema(projectSchema),
  },

  getById: {
    method: 'GET' as const,
    path: '/projects/:id',
    params: z.object({ id: z.string().uuid() }),
    response: successResponseSchema(projectSchema),
  },

  create: {
    method: 'POST' as const,
    path: '/projects',
    body: createProjectSchema,
    response: successResponseSchema(projectSchema),
  },

  update: {
    method: 'PATCH' as const,
    path: '/projects/:id',
    params: z.object({ id: z.string().uuid() }),
    body: updateProjectSchema,
    response: successResponseSchema(projectSchema),
  },

  delete: {
    method: 'DELETE' as const,
    path: '/projects/:id',
    params: z.object({ id: z.string().uuid() }),
    response: successResponseSchema(z.object({ deleted: z.literal(true) })),
  },
} as const;

export type ProjectListResponse = z.infer<
  typeof projectContract.list.response
>;
export type ProjectResponse = z.infer<
  typeof projectContract.getById.response
>;
