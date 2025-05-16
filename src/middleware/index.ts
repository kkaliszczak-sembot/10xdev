import { defineMiddleware, sequence } from 'astro:middleware';
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
      rateLimitInfo?: {
        remaining: number;
        reset: number;
        limit: number;
      };
    }
  }
}

// Rate limit configuration
interface RateLimitConfig {
  limit: number;
  windowMs: number;
  endpoints: RegExp[];
}

// In-memory store for rate limiting
// In a production environment, consider using Redis or another distributed store
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

/**
 * Authentication middleware for the application
 * 1. Initialize Supabase client
 * 2. Check authentication for protected routes
 * 3. Handle API authentication and project ownership
 */
const authMiddleware = defineMiddleware(async (context, next) => {
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
  
  // Continue to the next middleware
  return next();
});

/**
 * Rate limiting middleware for API endpoints
 * Limits requests to specific endpoints defined by regexes
 */
const rateLimitMiddleware = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  
  // Rate limit configuration - replace these with your actual regexes
  const rateLimitConfig: RateLimitConfig = {
    limit: 5, // requests
    windowMs: 60 * 1000, // 1 minute
    endpoints: [
      /^\/api\/projects\/.*\/generate-questions/,
      /^\/api\/projects\/.*\/generate-prd/,
    ]
  };
  
  // Check if the current path matches any of the rate-limited endpoints
  const shouldRateLimit = rateLimitConfig.endpoints.some(regex => regex.test(pathname));
  
  if (shouldRateLimit) {
    // Use userId as the key for rate limiting if available, otherwise use IP
    const key = context.locals.userId || context.clientAddress || 'anonymous';
    const now = Date.now();
    
    // Get or create rate limit entry
    let rateLimit = rateLimitStore.get(key);
    
    if (!rateLimit || now > rateLimit.resetTime) {
      // Create new entry if none exists or window has expired
      rateLimit = {
        count: 0,
        resetTime: now + rateLimitConfig.windowMs
      };
    }
    
    // Increment request count
    rateLimit.count++;
    
    // Store updated rate limit info
    rateLimitStore.set(key, rateLimit);
    
    // Add rate limit info to context
    context.locals.rateLimitInfo = {
      remaining: Math.max(0, rateLimitConfig.limit - rateLimit.count),
      reset: rateLimit.resetTime,
      limit: rateLimitConfig.limit
    };
    
    // Check if rate limit exceeded
    if (rateLimit.count > rateLimitConfig.limit) {
      // Calculate time until reset
      const retryAfter = Math.ceil((rateLimit.resetTime - now) / 1000);
      
      return new Response(
        JSON.stringify({ 
          error: 'Too Many Requests', 
          message: 'Rate limit exceeded. Please try again later.' 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': rateLimitConfig.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString()
          } 
        }
      );
    }
    
    // Add rate limit headers to the response
    context.locals.rateLimitInfo = {
      remaining: rateLimitConfig.limit - rateLimit.count,
      reset: rateLimit.resetTime,
      limit: rateLimitConfig.limit
    };
  }
  
  // Continue to the route handler
  const response = await next();
  
  // Add rate limit headers to the response if applicable
  if (shouldRateLimit && context.locals.rateLimitInfo) {
    const info = context.locals.rateLimitInfo;
    
    // Create a new response with headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'X-RateLimit-Limit': info.limit.toString(),
        'X-RateLimit-Remaining': info.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(info.reset / 1000).toString()
      }
    });
  }
  
  return response;
});

/**
 * Combined middleware sequence
 * 1. Authentication middleware runs first
 * 2. Rate limiting middleware runs after authentication
 */
export const onRequest = sequence(authMiddleware, rateLimitMiddleware);
