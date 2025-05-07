import type { APIRoute } from 'astro';
import { AuthService } from '@/services/auth.service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get request body
    const body = await request.json();
    const { email, password, name } = body;
    
    // Validate required fields
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({
          error: 'Email, password, and name are required',
        }),
        { status: 400 }
      );
    }
    
    // Use AuthService to sign up
    const { data, error } = await AuthService.signUp(email, password, name);
    
    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({
        data,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
      }),
      { status: 500 }
    );
  }
};
