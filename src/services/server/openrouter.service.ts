import { z } from 'zod';

/**
 * OpenRouter API response schema
 */
const openRouterResponseSchema = z.object({
  id: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
        role: z.string(),
      }),
      finish_reason: z.string().optional(),
      index: z.number(),
    })
  ),
  model: z.string(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

/**
 * OpenRouter API error schema
 */
const openRouterErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string().optional(),
    param: z.string().optional(),
    code: z.string().optional(),
  }),
});

/**
 * Types for OpenRouter service
 */
export type OpenRouterModel = string; 

export type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type OpenRouterRequestOptions = {
  model: OpenRouterModel;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  response_format?: { 
    type: 'text' | 'json_schema',
    json_schema?: {
      name: string;
      strict: boolean;
      schema: any;
    }
  };
  stream?: boolean;
  timeout?: number; // Custom timeout in milliseconds
};

export type OpenRouterResponse = z.infer<typeof openRouterResponseSchema>;
export type OpenRouterError = z.infer<typeof openRouterErrorSchema>;

/**
 * Custom error class for OpenRouter API errors
 */
export class OpenRouterServiceError extends Error {
  statusCode?: number;
  errorType?: string;
  errorParam?: string;
  errorCode?: string;

  constructor(message: string, statusCode?: number, errorDetails?: Partial<OpenRouterError['error']>) {
    super(message);
    this.name = 'OpenRouterServiceError';
    this.statusCode = statusCode;
    this.errorType = errorDetails?.type;
    this.errorParam = errorDetails?.param;
    this.errorCode = errorDetails?.code;
  }
}

/**
 * Service for interacting with the OpenRouter API
 */
export class OpenRouterService {
  private static readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  /**
   * Send a completion request to the OpenRouter API
   */
  static async generateCompletion(options: OpenRouterRequestOptions): Promise<OpenRouterResponse> {
    // Validate API key availability
    const apiKey = import.meta.env.OPEN_ROUTER_KEY;
    if (!apiKey) {
      throw new OpenRouterServiceError('OpenRouter API key is not configured', 500);
    }

    // Handle early error cases
    if (!options.messages || options.messages.length === 0) {
      throw new OpenRouterServiceError('No messages provided', 400);
    }

    if (!options.model) {
      throw new OpenRouterServiceError('No model specified', 400);
    }

    try {
      // Prepare request options
      const timeout = options.timeout || this.DEFAULT_TIMEOUT;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Prepare request body
      const requestBody = {
        model: options.model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        top_p: options.top_p,
        frequency_penalty: options.frequency_penalty,
        presence_penalty: options.presence_penalty,
        stop: options.stop,
        response_format: options.response_format,
        stream: options.stream || false,
      };

      // Make the API request
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-Title': 'Project Manager App', // Identify your application
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json();
        
        // Try to parse the error with our schema
        try {
          const parsedError = openRouterErrorSchema.parse(errorData);
          throw new OpenRouterServiceError(
            parsedError.error.message,
            response.status,
            parsedError.error
          );
        } catch (parseError) {
          // If parsing fails, throw a generic error with the status
          throw new OpenRouterServiceError(
            `OpenRouter API error: ${response.statusText}`,
            response.status
          );
        }
      }

      // Parse successful response
      const data = await response.json();
      
      // Validate response format
      try {
        return openRouterResponseSchema.parse(data);
      } catch (parseError) {
        throw new OpenRouterServiceError(
          'Invalid response format from OpenRouter API',
          200,
          { message: 'Schema validation failed' }
        );
      }
    } catch (error) {
      // Handle abort errors (timeouts)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new OpenRouterServiceError(`Request timed out after ${options.timeout || this.DEFAULT_TIMEOUT}ms`, 408);
      }
      
      // Re-throw OpenRouterServiceError instances
      if (error instanceof OpenRouterServiceError) {
        throw error;
      }
      
      // Handle other errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('OpenRouter API request failed:', error);
      throw new OpenRouterServiceError(`Failed to communicate with OpenRouter API: ${errorMessage}`, 500);
    }
  }
}
