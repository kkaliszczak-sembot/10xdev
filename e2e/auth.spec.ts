import { test } from '@playwright/test';
import LoginPage from './page-objects/LoginPage';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const testEmail = process.env.E2E_USERNAME as string;
    const testPassword = process.env.E2E_PASSWORD as string;
    
    // Act
    await loginPage.navigateToLogin();
    await loginPage.login(testEmail, testPassword);
    
    // Assert
    try {
      await loginPage.expectLoginSuccess();
    } catch (error) {
      // Take screenshot on failure for debugging
      await page.screenshot({ path: 'login-failure.png' });
      throw error;
    }
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    
    // Act
    await loginPage.navigateToLogin();
    await loginPage.login('wrong@example.com', 'wrongpassword');
    
    // Assert
    await loginPage.expectLoginError();
  });
});
