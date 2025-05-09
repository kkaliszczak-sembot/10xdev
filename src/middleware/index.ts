import { defineMiddleware } from 'astro:middleware';
import { supabaseClient } from '../db/supabase.client';
import type { User } from '@supabase/supabase-js';

// Define the custom properties for Astro's Locals interface
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
 * 2. Check authentication for protected routes
 * 3. Handle API authentication and project ownership
 */
export const onRequest = defineMiddleware(async (context, next) => {
  // Initialize Supabase client
  context.locals.supabase = supabaseClient;
  
  const pathname = context.url.pathname;
  const isAuthPage = ['/login', '/register'].includes(pathname);
  
  // Get session
  const { data: { session }, error: sessionError } = await context.locals.supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Error retrieving session:', sessionError);
    return new Response(
      JSON.stringify({ error: 'Authentication error', message: 'Failed to verify authentication' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Handle authentication redirects for non-API routes
  if (!pathname.startsWith('/api/')) {
    // Redirect authenticated users away from auth pages
    if (isAuthPage && session) {
      return context.redirect('/');
    }
    
    // Redirect unauthenticated users to login for protected routes
    if (!isAuthPage && !session) {
      return context.redirect('/login');
    }
  }
  
  // For API endpoints, require authentication except for auth endpoints
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
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
    if (pathname.startsWith('/api/projects/')) {
      // eslint-disable-next-line no-useless-escape
      const projectIdMatch = pathname.match(/^\/api\/projects\/([^\/]+)/);
      
      // Skip if not a project-specific endpoint or it's the listing endpoint
      if (projectIdMatch && projectIdMatch.length >= 2 && projectIdMatch[1] !== 'index') {
        const projectId = projectIdMatch[1];
        
        try {
          // Query to check if project belongs to current user
          const { data, error } = await context.locals.supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('user_id', context.locals.userId)
            .single();
          
          // Handle database errors
          if (error) {
            console.error('Error verifying project ownership:', error);
            return new Response(
              JSON.stringify({ error: 'Server error', message: 'Failed to verify project ownership' }),
              { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
          }
          
          // If no project found, user doesn't have access
          if (!data) {
            return new Response(
              JSON.stringify({ error: 'Forbidden', message: 'You do not have access to this project' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }
        } catch (error) {
          console.error('Error in project ownership verification:', error);
          return new Response(
            JSON.stringify({ error: 'Server error', message: 'An unexpected error occurred' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }
  }
  
  // Continue to the route handler
  return next();
});
