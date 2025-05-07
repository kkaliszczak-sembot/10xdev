import type { APIRoute } from 'astro';
import { AuthService } from '@/services/auth.service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get request body
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: 'Email and password are required',
        }),
        { status: 400 }
      );
    }
    
    // Use AuthService to sign in
    const { data, error } = await AuthService.signIn(email, password);
    
    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 401 }
      );
    }
    
    return new Response(
      JSON.stringify({
        data,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
      }),
      { status: 500 }
    );
  }
};
