import { test, expect } from '@playwright/test';
import { LoginPage } from '../utils/LoginPage';

test.describe('Login Tests', () => {

  test('valid login navigates to dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.login('user25@goquant.io', '60Re3G9KvvFl4Ihegxpi');

    console.log('✅ Current URL:', page.url());
    expect(page.url()).toContain('/gotrade'); // Adjust if dashboard URL changes
  });

  test('empty fields shows validation', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.clickSignIn();

    // Use LoginPage method to check validation
    await login.checkEmptyFieldValidation();
  });

  test('invalid credentials remain on login page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    // Use invalid credentials
    await login.login('shweta@gmail.com', 'wrongpassword', false);

    // Ensure we remain on login page
    expect(page.url()).toContain('/auth/login');

    // Use LoginPage method to check proper error
    await login.checkInvalidLoginError();
  });

});
