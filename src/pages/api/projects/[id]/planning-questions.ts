import type { APIContext } from 'astro';
import { projectIdSchema } from '../schemas';
import { z } from 'zod';

/**
 * GET /api/projects/:id/planning-questions - Get planning questions for a project
 */
export async function GET({ params, locals, url }: APIContext) {
  try {
    // Handle errors and edge cases early
    if (!locals.supabase) {
      return new Response(
        JSON.stringify({ error: 'Database client is not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate project ID
    const result = projectIdSchema.safeParse(params);
    
    // Handle validation errors
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid project ID', 
          details: result.error.format() 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get count parameter from URL query
    const count = url.searchParams.get('count') ? parseInt(url.searchParams.get('count') as string, 10) : undefined;

    // Get existing questions for this project
    const { data: existingQuestions, error: fetchError } = await locals.supabase
      .from('ai_questions')
      .select('id, question, answer, sequence_number, created_at')
      .eq('project_id', result.data.id)
      .order('sequence_number', { ascending: true });

    if (fetchError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch existing questions', 
          details: fetchError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the questions (may be empty array if none exist)
    const questions = existingQuestions || [];
    
    // Return only the requested number of questions if count is specified
    const limitedQuestions = count ? questions.slice(0, count) : questions;
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        data: limitedQuestions,
        project_id: result.data.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Log error for debugging
    console.error(`Error in GET /api/projects/${params.id}/planning-questions:`, error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch planning questions', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/projects/:id/planning-questions - Submit answers to planning questions
 */
export async function POST({ request, params, locals }: APIContext) {
  try {
    // Handle errors and edge cases early
    if (!locals.supabase) {
      return new Response(
        JSON.stringify({ error: 'Database client is not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate project ID
    const result = projectIdSchema.safeParse(params);
    
    // Handle validation errors
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid project ID', 
          details: result.error.format() 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate request body with Zod
    const answersSchema = z.object({
      answers: z.array(z.object({
        question_id: z.string(),
        question: z.string(),
        answer: z.string()
      }))
    });
    
    const validationResult = answersSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body', 
          details: validationResult.error.format() 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Store the answers in the database
    const updatePromises = validationResult.data.answers.map(async (answer) => {
      return locals.supabase
        .from('ai_questions')
        .update({ answer: answer.answer })
        .eq('id', answer.question_id)
        .eq('project_id', result.data.id);
    });
    
    // Wait for all updates to complete
    const updateResults = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = updateResults.filter(result => result.error).map(result => result.error);
    
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update some answers', 
          details: errors 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Answers submitted successfully',
        project_id: result.data.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Log error for debugging
    console.error(`Error in POST /api/projects/${params.id}/planning-questions:`, error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to submit planning question answers', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
