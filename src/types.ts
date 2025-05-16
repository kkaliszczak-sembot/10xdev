/**
 * Types for Data Transfer Objects (DTOs) and Command Models
 * Based on the database schema and API requirements
 */
import type { Database } from './db/database.types';

// Type aliases for better readability
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type ProjectStatus = Database['public']['Enums']['project_status'];

// --- DTOs (Data Transfer Objects) ---

/**
 * Base project information for list views
 */
export type ProjectListItemDTO = Pick<
  Tables<'projects'>,
  'id' | 'name' | 'description' | 'status' | 'created_at' | 'updated_at'
>;

/**
 * Complete project details with all fields
 * Includes 'prd' field which is not in the database schema
 */
export type ProjectDetailsDTO = Tables<'projects'> & {
  prd?: string;
};

/**
 * Pagination metadata for list responses
 */
export type PaginationDTO = {
  total_count: number;
  page_count: number;
  current_page: number;
  per_page: number;
};

/**
 * Response structure for paginated list of projects
 */
export type ProjectListResponseDTO = {
  data: ProjectListItemDTO[];
  pagination: PaginationDTO;
};

/**
 * AI Question information
 */
export type AIQuestionDTO = Pick<
  Tables<'ai_questions'>,
  'id' | 'question' | 'answer' | 'sequence_number' | 'created_at'
>;

/**
 * Response structure for successful deletion operations
 */
export type DeleteResponseDTO = {
  success: boolean;
  message: string;
};

/**
 * Response structure for PRD generation
 */
export type GeneratedPRDDTO = {
  project: ProjectDetailsDTO;
  status: 'success';
  generated_at: string;
};



// --- Command Models (Input data for operations) ---

/**
 * Data required to create a new project
 */
export type CreateProjectCommand = {
  name: string;
  description?: string | null;
  main_problem?: string | null;
  min_feature_set?: string | null;
  out_of_scope?: string | null;
  success_criteria?: string | null;
};

/**
 * Data for updating an existing project
 * All fields are optional since any subset can be updated
 */
export type UpdateProjectCommand = Partial<{
  name: string;
  description: string | null;
  status: ProjectStatus;
  main_problem: string | null;
  min_feature_set: string | null;
  out_of_scope: string | null;
  success_criteria: string | null;
  prd: string | null;
}>;


/**
 * Data for updating an AI question's answer
 */
export type UpdateAIQuestionCommand = {
  answer: string;
};

/**
 * Query parameters for project list endpoints
 */
export type ProjectListQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  sort?: keyof Tables<'projects'>;
  order?: 'asc' | 'desc';
};

/**
 * Query parameters for AI questions list endpoints
 */
export type AIQuestionListQueryParams = {
  page?: number;
  limit?: number;
};
