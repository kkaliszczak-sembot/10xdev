/**
 * Question Generator Interface
 * Defines the contract for services that generate project planning questions
 */

/**
 * Interface for a generated question
 */
export interface GeneratedQuestion {
  question: string;
  sequence_number: number;
}

/**
 * Interface for a question with its answer
 */
export interface QuestionAnswer {
  question: string;
  answer: string | null;
}

/**
 * Interface for question generator services
 */
export interface IQuestionGenerator {
  /**
   * Generate questions based on project context
   * @param projectDetails - Project details to contextualize questions
   * @param apiKey - API key for authentication
   * @param count - Number of questions to generate
   * @param startSequenceNumber - Starting sequence number for questions
   * @param previousQuestionsAnswers - Optional array of previous questions and answers to consider
   * @returns Array of generated questions
   */
  generateQuestions(
    projectDetails: ProjectDetails, 
    apiKey: string, 
    count?: number, 
    startSequenceNumber?: number,
    previousQuestionsAnswers?: QuestionAnswer[]
  ): Promise<GeneratedQuestion[]>;
}

/**
 * Project details interface for contextual question generation
 */
export interface ProjectDetails {
  name: string;
  description?: string;
  main_problem?: string;
  min_feature_set?: string;
  out_of_scope?: string;
  success_criteria?: string;
}
