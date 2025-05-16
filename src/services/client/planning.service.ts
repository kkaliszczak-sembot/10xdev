import type { AIQuestionDTO } from '@/types';

export class PlanningService {
  /**
   * Fetch existing planning questions for a project
   */
  static async fetchExistingQuestions(projectId: string): Promise<AIQuestionDTO[]> {
    try {
      const response = await fetch(`/api/projects/${projectId}/planning-questions`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch existing questions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if data exists and has the expected structure
      if (data && data.data && Array.isArray(data.data)) {
        return data.data;
      } else {
        return [];
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error fetching existing questions:', err);
      // Don't show error toast for fetching existing questions as it's not a user-initiated action
      // and could be confusing if there are simply no questions yet
      return [];
    }
  }

  /**
   * Generate new planning questions for a project
   */
  static async generateQuestions(projectId: string): Promise<AIQuestionDTO[]> {
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-questions`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate questions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format: expected data.data to be an array');
      }
      
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Error generating questions:', err);
      throw new Error(errorMessage);
    }
  }

  /**
   * Save planning question answers
   */
  static async saveAnswers(projectId: string, formattedAnswers: any[]): Promise<boolean> {
    try {
      const response = await fetch(`/api/projects/${projectId}/planning-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save answers: ${response.statusText}`);
      }
      
      return true;
    } catch (err) {
      console.error('Save answers error:', err);
      // Only throw if it's not a network error
      if (err instanceof Error && !err.message.includes('network')) {
        throw err;
      }
      return false;
    }
  }
}
