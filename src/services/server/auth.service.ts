import { supabaseClient } from '@/db/supabase.client';
import type { AuthError, AuthResponse, User, UserResponse } from '@supabase/supabase-js';

/**
 * Service for handling authentication operations with Supabase
 */
export class AuthService {
  /**
   * Sign up a new user with email and password
   * @param email User's email
   * @param password User's password
   * @param name User's name
   * @returns Promise with the auth response
   */
  static async signUp(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
    const response = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          avatar_url: null,
          created_at: new Date().toISOString()
        }
      }
    });

    return response;
  }

  /**
   * Sign in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the auth response
   */
  static async signIn(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    return response;
  }

  /**
   * Sign out the current user
   * @returns Promise with void
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    return await supabaseClient.auth.signOut();
  }

  /**
   * Get the current user
   * @returns Promise with the user response
   */
  static async getCurrentUser(): Promise<UserResponse> {
    return await supabaseClient.auth.getUser();
  }

  /**
   * Check if a user is authenticated
   * @returns Promise with boolean indicating if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const { data } = await this.getCurrentUser();
    return !!data.user;
  }

  /**
   * Send a password reset email
   * @param email User's email
   * @returns Promise with the auth response
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    return await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  }
}
