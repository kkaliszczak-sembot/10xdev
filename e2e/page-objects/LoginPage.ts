import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import BasePage from './BasePage';

export default class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigate('/login');
  }

  /**
   * Login with credentials
   */
  async login(email: string, password: string): Promise<void> {
    // Fill in email
    await this.page.locator('#email').fill(email);
    
    // Fill in password
    await this.page.locator('#password').fill(password);
    
    // Click login button - using the Button element
    await this.page.locator('button[type="submit"]').click();
    
    // Wait for navigation to complete
    await this.waitForNavigation();
  }

  /**
   * Check if login was successful
   */
  async expectLoginSuccess(): Promise<void> {
    // Check for successful login by verifying we're on the homepage/dashboard
    // This assumes successful login redirects to the homepage
    await expect(this.page).toHaveURL('/');
  }

  /**
   * Check if login error is displayed
   */
  async expectLoginError(): Promise<void> {
    // Check for error message in the login form
    await expect(this.page.locator('.text-red-600')).toBeVisible();
  }
}
