import type { Database } from './database.types';

/**
 * Project status enum
 */
export type ProjectStatus = Database['public']['Enums']['project_status'];

/**
 * Project details data transfer object
 */
export type ProjectDetailsDTO = Database['public']['Tables']['projects']['Row'] & {
  prd?: string;
};

/**
 * Project list response with pagination
 */
export type ProjectListResponseDTO = {
  data: ProjectDetailsDTO[];
  pagination: {
    total_count: number;
    page_count: number;
    current_page: number;
    per_page: number;
  };
};

/**
 * Query parameters for project list
 */
export type ProjectListQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  sort?: string;
  order?: 'asc' | 'desc';
};

/**
 * Command for creating a new project
 */
export type CreateProjectCommand = {
  name: string;
  description?: string;
  status?: ProjectStatus;
};

/**
 * Command for updating an existing project
 */
export type UpdateProjectCommand = {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  main_problem?: string | null;
  min_feature_set?: string | null;
  out_of_scope?: string | null;
  success_criteria?: string | null;
  prd?: string;
};

/**
 * Response for delete operations
 */
export type DeleteResponseDTO = {
  success: boolean;
  message: string;
};
