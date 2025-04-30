import type { APIContext } from 'astro';
import { ProjectService } from '../../../services/project.service';
import { projectIdSchema, updateProjectSchema } from './schemas';

/**
 * GET /api/projects/:id - Get a single project by ID
 */
export async function GET({ params, locals }: APIContext) {
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
      // Get project from service
      const project = await ProjectService.getProjectById(
        locals.supabase,
        result.data.id
      );
      
      // Return successful response
      return new Response(
        JSON.stringify(project),
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
    console.error(`Error in GET /api/projects/${params.id}:`, error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch project', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * PUT /api/projects/:id - Update an existing project
 */
export async function PUT({ request, params, locals }: APIContext) {
  try {
    // Handle errors and edge cases early
    if (!locals.supabase) {
      return new Response(
        JSON.stringify({ error: 'Database client is not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate project ID
    const idResult = projectIdSchema.safeParse(params);
    
    // Handle ID validation errors
    if (!idResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid project ID', 
          details: idResult.error.format() 
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
    
    // Validate request body against schema
    const dataResult = updateProjectSchema.safeParse(body);
    
    // Handle data validation errors
    if (!dataResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid project data', 
          details: dataResult.error.format() 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      // Update project using service
      const updatedProject = await ProjectService.updateProject(
        locals.supabase,
        idResult.data.id,
        dataResult.data
      );
      
      // Return successful response
      return new Response(
        JSON.stringify(updatedProject),
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
    console.error(`Error in PUT /api/projects/${params.id}:`, error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update project', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * DELETE /api/projects/:id - Delete a project by ID
 */
export async function DELETE({ params, locals }: APIContext) {
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
      // Delete project using service
      const response = await ProjectService.deleteProject(
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
    console.error(`Error in DELETE /api/projects/${params.id}:`, error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to delete project', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
