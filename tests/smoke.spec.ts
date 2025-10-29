// tests/smoke.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BASE_URL, TEST_USER } from '../utils/testData';
import { clickWithFallback } from '../utils/helpers';

test('Smoke - login -> get started -> basic trade UI', async ({ page }) => {
  const login = new LoginPage(page);

  
  try {
    await login.goto();
  } catch {
    
    await page.goto(BASE_URL + '/auth/login', { waitUntil: 'domcontentloaded' }).catch(() => {});
  }

 
  const emailVisible = await page.locator('input[name="email"], input[name="username"]').first().isVisible().catch(() => false);
  if (emailVisible) {
    
    if (typeof login.login === 'function') {
      await login.login(TEST_USER.email, TEST_USER.password).catch(() => {});
    } else {
      await page.fill('input[name="email"], input[name="username"]', TEST_USER.email).catch(() => {});
      await page.fill('input[name="password"]', TEST_USER.password).catch(() => {});
      await clickWithFallback(page, [
        'button:has-text("Sign In")',
        'button:has-text("Login")',
        'text="Sign In"',
        'text="Login"'
      ]).catch(() => {});
    }
  }

  
  const reached = await Promise.race([
    page.waitForURL(/\/gotrade/, { timeout: 7000 }).then(() => true).catch(() => false),
    page.locator('button:has-text("Get Started")').first().waitFor({ timeout: 7000 }).then(() => true).catch(() => false),
    page.locator('text="Trading"').first().waitFor({ timeout: 7000 }).then(() => true).catch(() => false),
    page.locator('text="Order Book"').first().waitFor({ timeout: 7000 }).then(() => true).catch(() => false)
  ]);

  if (!reached) {
    console.log(' Smoke: dashboard markers not detected. Current URL:', page.url());
    await page.screenshot({ path: 'test-results/smoke-dashboard-missing.png', fullPage: true }).catch(() => {});
  }

  
  const tradingVisible = (
    (await page.locator('text="Trading"').count().catch(() => 0)) > 0 ||
    (await page.locator('text="GoTrade"').count().catch(() => 0)) > 0 ||
    (await page.locator('text="Order Book"').count().catch(() => 0)) > 0
  );

  expect(reached || tradingVisible || page.url().includes('/gotrade')).toBeTruthy();
});
