import type { ProjectDetailsDTO, ProjectListQueryParams, ProjectListResponseDTO, CreateProjectCommand, UpdateProjectCommand, DeleteResponseDTO, GeneratedPRDDTO } from '@/types';

/**
 * Client-side service for project operations
 * Handles API calls to the project endpoints
 */
export class ProjectClientService {
  /**
   * Get a paginated list of projects with optional filtering and sorting
   * @param params - Query parameters for filtering, sorting and pagination
   * @returns Promise with project list and pagination metadata
   */
  static async getProjects(params: ProjectListQueryParams = {}): Promise<ProjectListResponseDTO> {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);
      
      const queryString = queryParams.toString();
      const url = `/api/projects${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error fetching projects:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch projects');
    }
  }

  /**
   * Get a project by ID
   * @param id - Project ID
   * @returns Promise with project details
   */
  static async getProjectById(id: string): Promise<ProjectDetailsDTO> {
    if (!id) {
      throw new Error('Project ID is required');
    }

    try {
      const response = await fetch(`/api/projects/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error fetching project:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch project');
    }
  }
  
  /**
   * Create a new project
   * @param project - Project creation data
   * @returns Promise with created project details
   */
  static async createProject(project: CreateProjectCommand): Promise<ProjectDetailsDTO> {
    if (!project.name) {
      throw new Error('Project name is required');
    }
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error creating project:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create project');
    }
  }
  
  /**
   * Update an existing project
   * @param id - Project ID
   * @param project - Project update data
   * @returns Promise with updated project details
   */
  static async updateProject(id: string, project: UpdateProjectCommand): Promise<ProjectDetailsDTO> {
    if (!id) {
      throw new Error('Project ID is required');
    }
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update project: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error updating project:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to update project');
    }
  }
  
  /**
   * Delete a project
   * @param id - Project ID
   * @returns Promise with deletion status
   */
  static async deleteProject(id: string): Promise<DeleteResponseDTO> {
    if (!id) {
      throw new Error('Project ID is required');
    }
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete project: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error deleting project:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to delete project');
    }
  }
  
  /**
   * Generate PRD for a project
   * @param id - Project ID
   */
  static async generatePRD(id: string): Promise<GeneratedPRDDTO> {
    if (!id) {
      throw new Error('Project ID is required');
    }
    
    try {
      const response = await fetch(`/api/projects/${id}/generate-prd`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate PRD: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error generating PRD:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to generate PRD');
    }
  }
}
