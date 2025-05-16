/// <reference types="astro/client" />
/// <reference path="../.astro/env.d.ts" />

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      runtime: {
        env: {
          OPEN_ROUTER_KEY: string;
          SESSION_SECRET?: string; 
          SESSION?: KVNamespace;
          // Add other environment variables accessed via runtime.env here
        };
        waitUntil: (promise: Promise<any>) => void;
        next: () => Promise<Response>;
        // Add other Cloudflare runtime properties if needed
      };
      // You can add other custom properties to locals here, e.g.:
      // user?: YourUserType;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
