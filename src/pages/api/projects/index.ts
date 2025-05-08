import type { APIContext } from 'astro';
import { ProjectService } from '@/services/server/project.service';
import { projectListQuerySchema } from './schemas';

// Mark this endpoint as server-rendered (not static)
export const prerender = false;

/**
 * GET /api/projects - List projects with pagination, filtering and sorting
 */
export async function GET({ request, locals }: APIContext) {
  try {
    // Handle errors and edge cases early
    if (!locals.supabase) {
      return new Response(
        JSON.stringify({ error: 'Database client is not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get query parameters from URL
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    
    // Validate query parameters
    const result = projectListQuerySchema.safeParse(queryParams);
    
    // Handle validation errors
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid query parameters', 
          details: result.error.format() 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get projects from service
    const response = await ProjectService.getProjects(
      locals.supabase,
      result.data
    );
    
    // Return successful response
    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Log error for debugging
    console.error('Error in GET /api/projects:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch projects', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST({ request, locals }: APIContext) {
  try {
    // Handle errors and edge cases early
    if (!locals.supabase) {
      return new Response(
        JSON.stringify({ error: 'Database client is not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
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
    const { createProjectSchema } = await import('./schemas');
    const result = createProjectSchema.safeParse(body);
    
    // Handle validation errors
    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid project data', 
          details: result.error.format() 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create project using service
    const project = await ProjectService.createProject(
      locals.supabase,
      result.data
    );
    
    // Return successful response
    return new Response(
      JSON.stringify(project),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Log error for debugging
    console.error('Error in POST /api/projects:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create project', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
