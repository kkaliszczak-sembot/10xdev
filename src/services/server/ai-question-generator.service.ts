import { z } from 'zod';
import { OpenRouterService, type OpenRouterMessage, type OpenRouterModel } from '@/services/server/openrouter.service';
import type { GeneratedQuestion, IQuestionGenerator, ProjectDetails, QuestionAnswer } from '@/interfaces/question-generator.interface';
import { generatePrdPrompt } from '@/services/server/ai-question-prompt';

/**
 * Schema for validating AI-generated question responses
 */
const aiQuestionResponseSchema = z.object({
  questions: z.array(z.object({
    question: z.string()
  }))
});

/**
 * AI Question Generator Service
 * Uses OpenRouter API to generate contextual questions for project planning
 */
export class AIQuestionGeneratorService implements IQuestionGenerator {
  /**
   * Default AI model to use for question generation
   */
  private readonly DEFAULT_MODEL: OpenRouterModel = 'mistralai/mistral-7b-instruct:free';

  /**
   * Generate questions based on project context
   * @param projectDetails - Project details to contextualize questions
   * @param count - Number of questions to generate (default: 5)
   * @param startSequenceNumber - Starting sequence number for questions (default: 1)
   * @param previousQuestionsAnswers - Optional array of previous questions and answers to consider
   * @returns Promise with array of generated questions
   */
  public async generateQuestions(
    projectDetails: ProjectDetails,
    count: number = 5,
    startSequenceNumber: number = 1,
    previousQuestionsAnswers?: QuestionAnswer[]
  ): Promise<GeneratedQuestion[]> {
    try {
      // Create a detailed context from project details
      const projectContext = this.buildProjectContext(projectDetails);
      
      // Build the system message
      const systemMessage = {
        role: 'system' as const,
        content: `You are an experienced product manager tasked with helping to create a comprehensive Product Requirements Document (PRD) based on the provided information. Your goal is to generate a list of questions and recommendations that will be used in a follow-up prompt to create a complete PRD.
        Generate exactly ${count} of questions, no more, and no less.
        Format your response as a JSON object with a 'questions' array, where each question has a 'question' field. Example: { "questions": ["Question 1", "Question 2"] }`
      };
      
      // Build the user message with project context
      let userMessageContent = generatePrdPrompt(projectContext, count);
      
      // Add previous questions and answers if available
      if (previousQuestionsAnswers && previousQuestionsAnswers.length > 0) {
        userMessageContent += `\nThe team has already answered the following questions:\n\n`;

        previousQuestionsAnswers.filter((qa) => qa.answer !== null).forEach((qa, index) => {
          userMessageContent += `Question ${index + 1}: ${qa.question}\nAnswer: ${qa.answer}\n\n`;
        });
        
        userMessageContent += `\nBased on these previous answers, generate ${count} NEW questions that build upon this information and help the team think more deeply about their project.\n;
        Avoid asking questions that are too similar to the ones already answered.\n`;
      }
      
      const messages: OpenRouterMessage[] = [
        systemMessage,
        {
          role: 'user',
          content: userMessageContent
        }
      ];

      try {
        return await this.processAIResponse(messages, count, startSequenceNumber);
      } catch (aiError) {
        console.warn('AI contextual question generation failed, using fallback:', aiError);
        return this.getFallbackQuestions(count, startSequenceNumber);
      }
    } catch (error) {
      console.error('Error generating contextual questions:', error);
      throw new Error('Failed to generate contextual questions');
    }
  }

  /**
   * Process the AI response to extract questions
   * @param messages - The messages to send to the AI
   * @param count - Number of questions to generate
   * @param startSequenceNumber - Starting sequence number for questions
   * @returns Promise with array of generated questions
   * @private
   */
  private async processAIResponse(
    messages: OpenRouterMessage[],
    count: number,
    startSequenceNumber: number
  ): Promise<GeneratedQuestion[]> {
    try {
      // Make the API request to OpenRouter
      const response = await OpenRouterService.generateCompletion({
        model: this.DEFAULT_MODEL,
        messages,
        max_tokens: 2000,
        response_format: { 
          type: "json_schema",
          json_schema: {
            name: "questions",
            strict: true,
            schema: {
              type: "array",
              minItems: count,
              maxItems: count,
              items: {
                type: "string"
              }
            }
          }
        }
      });

      // Extract the content from the response
      const content = response.choices[0]?.message.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      // Parse the JSON response
      const parsedContent = JSON.parse(content);
      
      // Validate the response format
      const validationResult = aiQuestionResponseSchema.safeParse(parsedContent);
      
      if (!validationResult.success) {
        console.error('Invalid AI response format:', validationResult.error);
        throw new Error('AI returned an invalid response format');
      }

      // Map the validated questions to the GeneratedQuestion format
      const questions = validationResult.data.questions.map((q, index) => {
        return {
          question: q.question,
          sequence_number: startSequenceNumber + index
        };
      });

      return questions;
    } catch (error) {
      console.error('Error processing AI response:', error);
      throw new Error('Failed to process AI response for question generation');
    }
  }

  /**
   * Build a detailed context string from project details
   * @param projectDetails - The project details
   * @returns A formatted context string
   * @private
   */
  private buildProjectContext(projectDetails: ProjectDetails): string {
    const contextParts = [
      `Project Name: ${projectDetails.name}`,
    ];

    if (projectDetails.description) {
      contextParts.push(`Project Description: ${projectDetails.description}`);
    }

    if (projectDetails.main_problem) {
      contextParts.push(`Main Problem: ${projectDetails.main_problem}`);
    }

    if (projectDetails.min_feature_set) {
      contextParts.push(`Minimum Feature Set: ${projectDetails.min_feature_set}`);
    }

    if (projectDetails.out_of_scope) {
      contextParts.push(`Out of Scope: ${projectDetails.out_of_scope}`);
    }

    if (projectDetails.success_criteria) {
      contextParts.push(`Success Criteria: ${projectDetails.success_criteria}`);
    }

    return contextParts.join('\n');
  }

  /**
   * Fallback to static questions if AI generation fails
   * @param count - Number of questions to generate
   * @param startSequenceNumber - Starting sequence number for questions
   * @returns Array of statically generated questions
   * @private
   */
  private getFallbackQuestions(count: number = 5, startSequenceNumber: number = 1): GeneratedQuestion[] {
    // Predefined question templates by category
    const questionTemplates: Record<string, string[]> = {
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

    const questions: GeneratedQuestion[] = [];
    const categories = Object.keys(questionTemplates) as string[];
    
    // Ensure we have at least one question from each category if count allows
    const minCategories = Math.min(categories.length, count);
    
    // Shuffle categories to get a random selection
    const shuffledCategories = this.shuffleArray([...categories]);
    
    // First, add one question from each of the top categories up to minCategories
    for (let i = 0; i < minCategories; i++) {
      const category = shuffledCategories[i];
      const templates = questionTemplates[category];
      const randomIndex = Math.floor(Math.random() * templates.length);
      
      questions.push({
        question: templates[randomIndex],
        sequence_number: i + startSequenceNumber
      });
    }
    
    // If we need more questions, add random ones from any category
    if (count > minCategories) {
      for (let i = minCategories; i < count; i++) {
        // Pick a random category
        const category = categories[Math.floor(Math.random() * categories.length)];
        const templates = questionTemplates[category];
        const randomIndex = Math.floor(Math.random() * templates.length);
        
        questions.push({
          question: templates[randomIndex],
          sequence_number: i + startSequenceNumber
        });
      }
    }
    
    return questions;
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   * @param array - The array to shuffle
   * @returns The shuffled array
   * @private
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
