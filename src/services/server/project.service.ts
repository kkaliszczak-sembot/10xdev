import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  ProjectListQueryParams, 
  ProjectListResponseDTO, 
  ProjectDetailsDTO, 
  CreateProjectCommand, 
  UpdateProjectCommand,
  DeleteResponseDTO,
  AIQuestionDTO
} from '@/types';
import { AIQuestionGeneratorService } from './ai-question-generator.service';
import { getSecret } from 'astro:env/server';

/**
 * Service for handling project-related operations
 */
export class ProjectService {
  /**
   * Get a paginated list of projects with optional filtering and sorting
   * @param supabase - Supabase client instance
   * @param params - Query parameters for filtering, sorting and pagination
   * @returns Promise with project list and pagination metadata
   */
  static async getProjects(
    supabase: SupabaseClient, 
    params: ProjectListQueryParams
  ): Promise<ProjectListResponseDTO> {
    // Handle errors and edge cases early
    if (!supabase) {
      throw new Error('Database client is not available');
    }

    // Destructure query parameters with defaults
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      sort = 'created_at', 
      order = 'desc' 
    } = params;

    // Calculate pagination values
    const offset = (page - 1) * limit;
    
    // Start building the query
    let query = supabase
      .from('projects')
      .select('id, name, description, status, created_at, updated_at', { count: 'exact' });
    
    // Apply filters if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Get total count before pagination
    const { count: total_count } = await query;
    
    // Apply sorting and pagination
    const { data, error } = await query
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);
    
    // Handle database errors
    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }
    
    // Calculate pagination metadata
    const page_count = Math.ceil((total_count || 0) / limit);
    
    // Return formatted response
    return {
      data: data || [],
      pagination: {
        total_count: total_count || 0,
        page_count,
        current_page: page,
        per_page: limit
      }
    };
  }

  /**
   * Get a single project by ID
   * @param supabase - Supabase client instance
   * @param id - Project ID (UUID)
   * @returns Promise with project details
   */
  static async getProjectById(
    supabase: SupabaseClient, 
    id: string
  ): Promise<ProjectDetailsDTO> {
    // Handle errors and edge cases early
    if (!supabase) {
      throw new Error('Database client is not available');
    }
    
    if (!id) {
      throw new Error('Project ID is required');
    }

    // Query the database
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    // Handle database errors
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Project with ID ${id} not found`);
      }
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
    
    // Handle not found case
    if (!data) {
      throw new Error(`Project with ID ${id} not found`);
    }
    
    return data;
  }

  /**
   * Create a new project
   * @param supabase - Supabase client instance
   * @param command - Project creation data
   * @returns Promise with created project details
   */
  static async createProject(
    supabase: SupabaseClient, 
    command: CreateProjectCommand
  ): Promise<ProjectDetailsDTO> {
    // Handle errors and edge cases early
    if (!supabase) {
      throw new Error('Database client is not available');
    }
    
    if (!command.name) {
      throw new Error('Project name is required');
    }
    
    // Insert new project
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...command,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();
    
    // Handle database errors
    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
    
    // Handle unexpected response
    if (!data) {
      throw new Error('Failed to create project: No data returned');
    }
    
    return data;
  }

  /**
   * Update an existing project
   * @param supabase - Supabase client instance
   * @param id - Project ID (UUID)
   * @param command - Project update data
   * @returns Promise with updated project details
   */
  static async updateProject(
    supabase: SupabaseClient,
    id: string,
    command: UpdateProjectCommand
  ): Promise<ProjectDetailsDTO> {
    // Handle errors and edge cases early
    if (!supabase) {
      throw new Error('Database client is not available');
    }
    
    if (!id) {
      throw new Error('Project ID is required');
    }
    
    // Check if project exists before updating
    const existingProject = await this.getProjectById(supabase, id);
    
    // Update project
    const { data, error } = await supabase
      .from('projects')
      .update(command)
      .eq('id', id)
      .select()
      .single();
    
    // Handle database errors
    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
    
    // Handle unexpected response
    if (!data) {
      throw new Error('Failed to update project: No data returned');
    }
    
    return data;
  }

  /**
   * Delete a project by ID
   * @param supabase - Supabase client instance
   * @param id - Project ID (UUID)
   * @returns Promise with deletion status
   */
  static async deleteProject(
    supabase: SupabaseClient,
    id: string
  ): Promise<DeleteResponseDTO> {
    // Handle errors and edge cases early
    if (!supabase) {
      throw new Error('Database client is not available');
    }
    
    if (!id) {
      throw new Error('Project ID is required');
    }
    
    // Check if project exists before deleting
    await this.getProjectById(supabase, id);
    
    // Delete project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    // Handle database errors
    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
    
    return {
      success: true,
      message: `Project with ID ${id} has been successfully deleted`
    };
  }

  /**
   * Generate PRD for a project
   * @param supabase - Supabase client instance
   * @param id - Project ID (UUID)
   * @returns Promise with generated PRD data
   */
  static async generatePRD(
    supabase: SupabaseClient,
    id: string
  ) {
    // Handle errors and edge cases early
    if (!supabase) {
      throw new Error('Database client is not available');
    }
    
    if (!id) {
      throw new Error('Project ID is required');
    }
    
    // Get project details
    const project = await this.getProjectById(supabase, id);

    // Create an instance of AIQuestionGeneratorService
    const aiGenerator = new AIQuestionGeneratorService();

    const { data: existingQuestions, error: fetchError } = await supabase
      .from('ai_questions')
      .select('id, question, answer, sequence_number, created_at')
      .eq('project_id', id)
      .order('sequence_number', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch existing questions: ${fetchError.message}`);
    }

    const apiKey = getSecret('OPEN_ROUTER_KEY');
    if (!apiKey) {
      throw new Error('OpenRouter API key is not available');
    }
  
    const prdContent = await aiGenerator.generatePrdDocument(project, existingQuestions as AIQuestionDTO[], apiKey);
  
    // Update project with generated PRD
    // The 'prd' field in the database should accept the type returned by generatePrdDocument (currently string).
    const updatedProject = await this.updateProject(supabase, id, { prd: prdContent, status: 'finished' });
    
    return {
      project: updatedProject,
      status: 'success' as const,
      generated_at: new Date().toISOString()
    };
  }
}
