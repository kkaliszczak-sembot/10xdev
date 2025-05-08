import type { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global teardown for Playwright tests
 * This runs once after all tests
 */
async function globalTeardown(config: FullConfig) {
  console.log('Stopping Supabase testing instance...');
  
  try {
    // Stop the Supabase testing instance
    // Use relative path from project root
    execSync('bunx supabase stop --workdir ./e2e', {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../../')
    });
    
    console.log('Supabase testing instance stopped successfully');
  } catch (error) {
    console.error('Failed to stop Supabase testing instance:', error);
    // Don't throw here to avoid failing tests if cleanup fails
    console.error(error);
  }
}

export default globalTeardown;
