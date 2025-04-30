import { defineMiddleware } from 'astro:middleware';
import { supabaseClient } from '../db/supabase.client';
import type { User } from '@supabase/supabase-js';

// Define the custom properties for Astro's Locals interface
declare global {
  namespace App {
    interface Locals {
      supabase: typeof supabaseClient;
      user?: User;
      userId?: string;
    }
  }
}

/**
 * Middleware for the application
 * 1. Initialize Supabase client
 * 2. Authenticate user for API endpoints
 * 3. Verify project ownership for project-specific endpoints
 * 4. Continue to route handler
 */
export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize Supabase client
  context.locals.supabase = supabaseClient;
  
  // For API endpoints, apply authentication
  if (context.url.pathname.startsWith('/api/')) {
    // Get session from Supabase
    const { data: { session }, error: sessionError } = await context.locals.supabase.auth.getSession();
    
    // Handle session retrieval errors
    if (sessionError) {
      console.error('Error retrieving session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Authentication error', message: 'Failed to verify authentication' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user is authenticated
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Add user information to context for use in API handlers
    context.locals.user = session.user;
    context.locals.userId = session.user.id;
    
    // For project-specific endpoints, verify ownership
    if (context.url.pathname.startsWith('/api/projects/')) {
      const projectIdMatch = context.url.pathname.match(/^\/api\/projects\/([^\/]+)/);
      
      // Skip if not a project-specific endpoint or it's the listing endpoint
      if (projectIdMatch && projectIdMatch.length >= 2 && projectIdMatch[1] !== 'index') {
        const projectId = projectIdMatch[1];
        
        try {
          // Query to check if project belongs to current user
          const { data, error } = await context.locals.supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();
          
          // Handle database errors
          if (error) {
            if (error.code === 'PGRST116') {
              return new Response(
                JSON.stringify({ error: 'Not Found', message: `Project with ID ${projectId} not found` }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
              );
            }
            
            return new Response(
              JSON.stringify({ error: 'Database error', message: error.message }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
          
          // Check if project exists and belongs to current user
          if (!data || data.user_id !== context.locals.userId) {
            return new Response(
              JSON.stringify({ error: 'Forbidden', message: 'You do not have permission to access this project' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }
        } catch (error) {
          console.error('Error checking project ownership:', error);
          return new Response(
            JSON.stringify({ 
              error: 'Authorization error', 
              message: error instanceof Error ? error.message : 'Failed to verify project ownership' 
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }
  }
  
  // Continue to the route handler
  return next();
});
