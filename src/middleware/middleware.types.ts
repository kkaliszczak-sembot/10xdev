import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

/**
 * Extended Locals interface for Astro context
 * Adds custom properties used in middleware and API handlers
 */
export interface AppLocals {
  supabase: SupabaseClient;
  user?: User;
  userId?: string;
  [key: string]: any; // Add index signature to satisfy Astro's type constraints
}

// Augment the Astro namespace to include our custom locals
declare module 'astro' {
  interface Locals extends AppLocals {}
}
