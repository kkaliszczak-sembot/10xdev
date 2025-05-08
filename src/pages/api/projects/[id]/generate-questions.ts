import type { APIContext } from 'astro';
import { projectIdSchema } from '../schemas';
import { z } from 'zod';
import { AIQuestionGeneratorService as QuestionGeneratorService } from '@/services/server/ai-question-generator.service';
import type { GeneratedQuestion } from '@/interfaces/question-generator.interface';

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
    
    // Get project details to potentially customize questions in the future
    const { data: project, error: projectError } = await locals.supabase
      .from('projects')
      .select('name, description, status, main_problem, min_feature_set, out_of_scope, success_criteria')
      .eq('id', result.data.id)
      .single();
    
    // Get the highest sequence number for existing questions
    const { data: maxSequenceNumberData } = await locals.supabase
      .from('ai_questions')
      .select('sequence_number')
      .eq('project_id', result.data.id)
      .order('sequence_number', { ascending: false })
      .limit(1);
    
    // Calculate the next sequence number
    const startSequenceNumber = maxSequenceNumberData && maxSequenceNumberData.length > 0
      ? (maxSequenceNumberData[0].sequence_number || 0) + 1
      : 1;
    
    if (projectError) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch project details', 
          details: projectError.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Ensure project data exists
    if (!project) {
      return new Response(
        JSON.stringify({ 
          error: 'Project not found'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const questionGeneratorService = new QuestionGeneratorService;
    
    // Generate questions using the QuestionGeneratorService
    const generatedQuestions = await questionGeneratorService.generateQuestions(
      {
        name: project.name || '',
        description: project.description || '',
        main_problem: project.main_problem || '',
        min_feature_set: project.min_feature_set || '',
        out_of_scope: project.out_of_scope || '',
        success_criteria: project.success_criteria || ''
      }, 
      count, 
      startSequenceNumber
    );
    
    // Insert questions into the database
    const questionsToInsert = generatedQuestions.map((q: GeneratedQuestion) => ({
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
