import { z } from 'zod';

/**
 * Schema for validating project list query parameters
 */
export const projectListQuerySchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  limit: z.coerce.number().positive().max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(['new', 'in_progress', 'finished']).optional(),
  sort: z.enum(['name', 'created_at', 'updated_at', 'status']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

/**
 * Schema for validating project creation data
 */
export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  main_problem: z.string().nullable().optional(),
  min_feature_set: z.string().nullable().optional(),
  out_of_scope: z.string().nullable().optional(),
  success_criteria: z.string().nullable().optional()
});

/**
 * Schema for validating project update data
 */
export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['new', 'in_progress', 'finished']).optional(),
  main_problem: z.string().nullable().optional(),
  min_feature_set: z.string().nullable().optional(),
  out_of_scope: z.string().nullable().optional(),
  success_criteria: z.string().nullable().optional()
});

/**
 * Schema for validating project ID parameter
 */
export const projectIdSchema = z.object({
  id: z.string().uuid()
});
