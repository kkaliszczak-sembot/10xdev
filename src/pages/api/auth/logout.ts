import type { APIRoute } from 'astro';
import { AuthService } from '@/services/auth.service';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Use AuthService to sign out
    const { error } = await AuthService.signOut();
    
    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
      }),
      { status: 500 }
    );
  }
};
