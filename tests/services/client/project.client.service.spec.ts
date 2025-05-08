import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectClientService } from '../../../src/services/client/project.client.service';
import type { CreateProjectCommand, ProjectDetailsDTO } from '../../../src/types';

// Store original fetch implementation
const originalFetch = global.fetch;

describe('ProjectClientService', () => {
  describe('createProject', () => {
    // Setup mock fetch before each test
    beforeEach(() => {
      // Create a new mock function for each test
      global.fetch = vi.fn();
    });

    // Restore original fetch after each test
    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should successfully create a project with valid data', async () => {
      // Arrange
      const projectData: CreateProjectCommand = {
        name: 'Test Project',
        description: 'This is a test project'
      };

      const expectedResponse: ProjectDetailsDTO = {
        id: '123',
        name: 'Test Project',
        description: 'This is a test project',
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user123',
        prd: undefined,
        main_problem: null,
        min_feature_set: null,
        out_of_scope: null,
        success_criteria: null
      };

      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedResponse)
      });

      // Act
      const result = await ProjectClientService.createProject(projectData);

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error when project name is empty', async () => {
      // Arrange
      const projectData: CreateProjectCommand = {
        name: '',
        description: 'This is a test project'
      };

      // Act & Assert
      await expect(ProjectClientService.createProject(projectData))
        .rejects
        .toThrow('Project name is required');

      // Verify fetch was not called
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should throw an error when project name is missing', async () => {
      // Arrange
      const projectData = {} as CreateProjectCommand;

      // Act & Assert
      await expect(ProjectClientService.createProject(projectData))
        .rejects
        .toThrow('Project name is required');

      // Verify fetch was not called
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle API error responses with status text', async () => {
      // Arrange
      const projectData: CreateProjectCommand = {
        name: 'Test Project',
        description: 'This is a test project'
      };

      // Mock failed response with status text
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      // Act & Assert
      await expect(ProjectClientService.createProject(projectData))
        .rejects
        .toThrow('Failed to create project: Bad Request');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle network errors during API call', async () => {
      // Arrange
      const projectData: CreateProjectCommand = {
        name: 'Test Project',
        description: 'This is a test project'
      };

      // Mock network error
      const networkError = new Error('Network error');
      (global.fetch as any).mockRejectedValueOnce(networkError);

      // Act & Assert
      await expect(ProjectClientService.createProject(projectData))
        .rejects
        .toThrow('Network error');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle unexpected errors during API call', async () => {
      // Arrange
      const projectData: CreateProjectCommand = {
        name: 'Test Project',
        description: 'This is a test project'
      };

      // Mock unexpected error (not an Error instance)
      (global.fetch as any).mockRejectedValueOnce('Unexpected error');

      // Act & Assert
      await expect(ProjectClientService.createProject(projectData))
        .rejects
        .toThrow('Failed to create project');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should create a project with minimal required data (only name)', async () => {
      // Arrange
      const projectData: CreateProjectCommand = {
        name: 'Minimal Project'
      };

      const expectedResponse: ProjectDetailsDTO = {
        id: '456',
        name: 'Minimal Project',
        description: null,
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user123',
        prd: undefined,
        main_problem: null,
        min_feature_set: null,
        out_of_scope: null,
        success_criteria: null
      };

      // Mock successful response
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(expectedResponse)
      });

      // Act
      const result = await ProjectClientService.createProject(projectData);

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      expect(result).toEqual(expectedResponse);
    });

    it('should handle JSON parsing errors in the response', async () => {
      // Arrange
      const projectData: CreateProjectCommand = {
        name: 'Test Project',
        description: 'This is a test project'
      };

      // Mock successful response but with JSON parsing error
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      // Act & Assert
      await expect(ProjectClientService.createProject(projectData))
        .rejects
        .toThrow('Invalid JSON');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
