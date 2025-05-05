/**
 * Service for generating AI planning questions
 * Provides methods to create relevant questions for different project aspects
 */

/**
 * Question category types for organizing questions by topic
 */
export type QuestionCategory = 
  | 'user_research' 
  | 'problem_definition' 
  | 'market_analysis' 
  | 'technical' 
  | 'business' 
  | 'timeline' 
  | 'success_metrics';

/**
 * Interface for a generated question
 */
export interface GeneratedQuestion {
  question: string;
  category: QuestionCategory;
  sequence_number: number;
}

/**
 * Question Generator Service
 * Responsible for creating relevant questions for project planning
 */
export class QuestionGeneratorService {
  /**
   * Question templates by category
   * Each category has multiple question templates to choose from
   */
  private static questionTemplates: Record<QuestionCategory, string[]> = {
    user_research: [
      'Who is the primary user persona for this project?',
      'What are the key pain points your users are experiencing?',
      'How do you plan to gather user feedback during development?',
      'What user research have you conducted so far?',
      'What are the primary user journeys for your product?'
    ],
    problem_definition: [
      'What specific problem does this project solve?',
      'How is this problem currently being solved?',
      'Why is now the right time to solve this problem?',
      'What are the consequences if this problem remains unsolved?',
      'How did you validate that this problem is worth solving?'
    ],
    market_analysis: [
      'Who are your main competitors in this space?',
      'What is your unique value proposition?',
      'What existing solutions have you researched?',
      'How large is the target market for this product?',
      'What market trends support the need for your solution?'
    ],
    technical: [
      'What technical constraints are you working with?',
      'What technology stack do you plan to use?',
      'What are the potential technical challenges you foresee?',
      'How will you ensure the solution is scalable?',
      'What security considerations are important for this project?'
    ],
    business: [
      'What is your budget for this project?',
      'How do you plan to monetize this solution?',
      'What is the expected ROI for this project?',
      'What business metrics will you track?',
      'How does this project align with your overall business strategy?'
    ],
    timeline: [
      'What is your timeline for launching this project?',
      'What are the key milestones for this project?',
      'How have you prioritized features for the initial release?',
      'What is your release strategy?',
      'How will you manage scope to meet your timeline?'
    ],
    success_metrics: [
      'What metrics will you use to measure success?',
      'How will you know if this project is successful?',
      'What are your KPIs for this project?',
      'How will you gather feedback after launch?',
      'What would make this project a failure in your view?'
    ]
  };

  /**
   * Generate a set of questions for a project
   * @param count - Number of questions to generate
   * @returns Array of generated questions
   */
  static generateQuestions(count: number = 5): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    const categories = Object.keys(this.questionTemplates) as QuestionCategory[];
    
    // Ensure we have at least one question from each category if count allows
    const minCategories = Math.min(categories.length, count);
    
    // Shuffle categories to get a random selection
    const shuffledCategories = this.shuffleArray([...categories]);
    
    // First, add one question from each of the top categories up to minCategories
    for (let i = 0; i < minCategories; i++) {
      const category = shuffledCategories[i];
      const question = this.getRandomQuestionFromCategory(category);
      
      questions.push({
        ...question,
        sequence_number: i + 1
      });
    }
    
    // If we need more questions, add random ones from any category
    if (count > minCategories) {
      for (let i = minCategories; i < count; i++) {
        // Pick a random category
        const category = categories[Math.floor(Math.random() * categories.length)];
        const question = this.getRandomQuestionFromCategory(category);
        
        questions.push({
          ...question,
          sequence_number: i + 1
        });
      }
    }
    
    return questions;
  }
  
  /**
   * Get a random question from a specific category
   * @param category - The question category
   * @returns A question object with the question text and category
   */
  private static getRandomQuestionFromCategory(category: QuestionCategory): Omit<GeneratedQuestion, 'sequence_number'> {
    const templates = this.questionTemplates[category];
    const randomIndex = Math.floor(Math.random() * templates.length);
    
    return {
      question: templates[randomIndex],
      category
    };
  }
  
  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param array - The array to shuffle
   * @returns The shuffled array
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
