/**
 * Client-side authentication service that uses the API endpoints
 * instead of direct Supabase client access
 */

export interface AuthResponse {
  error?: string;
  data?: any;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export const AuthClientService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password } as LoginRequest),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return { error: result.error || 'Login failed' };
      }
      
      return { data: result.data };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'An unexpected error occurred during login' };
    }
  },

  /**
   * Register a new user
   */
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name } as RegisterRequest),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return { error: result.error || 'Registration failed' };
      }
      
      return { data: result.data };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'An unexpected error occurred during registration' };
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      
      if (!response.ok) {
        return { error: result.error || 'Failed to get session' };
      }
      
      return { data: result.data };
    } catch (error) {
      console.error('Get session error:', error);
      return { error: 'An unexpected error occurred while getting session' };
    }
  },
};
