import type { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global setup for Playwright tests
 * This runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('Starting Supabase testing instance...');
  
  try {
    // Start the Supabase testing instance
    // Use relative path from project root
    execSync('bunx supabase start --workdir ./e2e', {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../../')
    });
    
    console.log('Supabase testing instance started successfully');
  } catch (error) {
    console.error('Failed to start Supabase testing instance:', error);
    throw error;
  }
}

export default globalSetup;
