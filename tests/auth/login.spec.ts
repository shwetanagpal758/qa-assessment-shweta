// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { TEST_USER } from '../../utils/testData';

test.describe('Auth - login tests (3 cases)', () => {

  test('valid credentials -> should reach dashboard', async ({ page }) => {
    const login = new LoginPage(page);

    // open login page (LoginPage.goto should navigate to app/login)
    await login.goto();

    // perform login using centralized test user
    await login.login(TEST_USER.email, TEST_USER.password);

    // give UI a bit of time to settle / redirect
    await page.waitForTimeout(1500);
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    const current = page.url();
    console.log('🌍 Current URL after login attempt:', current);

    // dashboard detection: either /gotrade in URL OR known dashboard markers visible
    const looksLikeDashboardUrl = current.includes('/gotrade') || current === 'https://test1.gotrade.goquant.io/' || current.endsWith('/gotrade');
    const dashboardMarker = await page.locator('text=Trading, text=GoTrade, text=Order Book').first().isVisible().catch(() => false);
    const usernameMarker = await page.locator(`text=${TEST_USER.email}`).first().isVisible().catch(() => false);

    expect(looksLikeDashboardUrl || dashboardMarker || usernameMarker).toBeTruthy();
  });

  test('empty fields -> show validation', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    
    if (typeof login.clickSignIn === 'function') {
      await login.clickSignIn();
    } else {
      await page.click('button:has-text("Sign In"), button:has-text("Login")').catch(() => {});
    }

    
    await page.waitForTimeout(700);

    
    if (typeof login.checkEmptyFieldValidation === 'function') {
      await login.checkEmptyFieldValidation();
    } else {
      
      const validationVisible = await page.locator('text=Username must be at least, text=Enter your email address, [aria-invalid="true"]').first().isVisible().catch(()=>false);
      expect(validationVisible).toBeTruthy();
    }
  });

  test('invalid credentials -> stay on login and show error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    
    await login.login('nonexistent@example.com', 'wrongpassword').catch(() => {});

   
    await page.waitForTimeout(1000);

    const current = page.url();
    console.log('🔍 URL after invalid login attempt:', current);

    
    expect(current).toContain('/auth/login');

    if (typeof login.checkInvalidLoginError === 'function') {
      await login.checkInvalidLoginError();
    } else {
      const err = await page.locator('text=The user was not found, text=Invalid credentials, text=Incorrect').first().isVisible().catch(()=>false);
      expect(err).toBeTruthy();
    }
  });

});
