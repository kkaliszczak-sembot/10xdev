import type { APIContext } from 'astro';
import { projectIdSchema } from '../schemas';
import { z } from 'zod';
import { QuestionGeneratorService } from '../../../../services/question-generator.service';

/**
 * POST /api/projects/:id/generate-questions - Generate new planning questions for a project
 */
export async function POST({ params, locals, url }: APIContext) {
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
    const count = url.searchParams.get('count') ? parseInt(url.searchParams.get('count') as string, 10) : 5;
    const startSequenceNumber = url.searchParams.get('startSequenceNumber') ? parseInt(url.searchParams.get('startSequenceNumber') as string, 10) : 1;
    
    // Get project details to potentially customize questions in the future
    const { data: project, error: projectError } = await locals.supabase
      .from('projects')
      .select('name, description, status')
      .eq('id', result.data.id)
      .single();
    
    if (projectError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch project details', 
          details: projectError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate questions using the QuestionGeneratorService
    const generatedQuestions = QuestionGeneratorService.generateQuestions(count, startSequenceNumber);
    
    // Insert questions into the database
    const questionsToInsert = generatedQuestions.map(q => ({
      question: q.question,
      sequence_number: q.sequence_number,
      project_id: result.data.id,
      answer: null
      // Note: We can't store the category as metadata since the column doesn't exist
      // If category storage is needed, the database schema would need to be updated
    }));
    
    // Update project status to in_progress if it's currently 'new'
    if (project.status === 'new') {
      const { error: updateError } = await locals.supabase
        .from('projects')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', result.data.id);
      
      if (updateError) {
        console.error('Failed to update project status:', updateError);
        // Continue with question creation even if status update fails
      }
    }
    
    const { data: insertedQuestions, error: insertError } = await locals.supabase
      .from('ai_questions')
      .insert(questionsToInsert)
      .select('id, question, answer, sequence_number, created_at');
    
    if (insertError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create questions', 
          details: insertError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        data: insertedQuestions || [],
        project_id: result.data.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Log error for debugging
    console.error(`Error in POST /api/projects/${params.id}/generate-questions:`, error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate planning questions', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
