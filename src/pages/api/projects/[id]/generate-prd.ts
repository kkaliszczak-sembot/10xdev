import type { APIContext } from 'astro';
import { ProjectService } from '../../../../services/project.service';
import { projectIdSchema } from '../schemas';

/**
 * POST /api/projects/:id/generate-prd - Generate PRD for a project
 */
export async function POST({ params, locals }: APIContext) {
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
    
    try {
      // Generate PRD using service
      const response = await ProjectService.generatePRD(
        locals.supabase,
        result.data.id
      );
      
      // Return successful response
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      // Handle not found error
      if (error instanceof Error && error.message.includes('not found')) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Re-throw other errors to be caught by outer try-catch
      throw error;
    }
  } catch (error) {
    // Log error for debugging
    console.error(`Error in POST /api/projects/${params.id}/generate-prd:`, error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate PRD', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
