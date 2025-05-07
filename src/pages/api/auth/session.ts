import type { APIRoute } from 'astro';
import { AuthService } from '@/services/auth.service';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Use AuthService to get current user
    const { data, error } = await AuthService.getCurrentUser();
    
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
    console.error('Session error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
      }),
      { status: 500 }
    );
  }
};
