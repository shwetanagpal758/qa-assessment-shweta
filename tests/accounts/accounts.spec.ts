// tests/accounts/accounts.spec.ts
import { test, expect } from '@playwright/test';
import { AccountsPage } from '../../pages/AccountsPage';
import { TEST_USER } from '../../utils/testData';

test.describe(' Accounts Tests - Add OKX Account', () => {
  test('Add OKX Account successfully', async ({ page }) => {
    
    await page.goto('https://test1.gotrade.goquant.io/', {
      waitUntil: 'domcontentloaded',
    });

    
    const email = page.locator('input[name="email"], input[name="username"]');
    if (await email.isVisible().catch(() => false)) {
      await email.fill(TEST_USER.email);
      await page
        .locator('input[name="password"]')
        .fill(TEST_USER.password)
        .catch(() => {});
      await page.locator('button:has-text("Sign in")').click();
      await page.waitForTimeout(4000);
    }

    // Step 3: Go to Accounts page
    const accounts = new AccountsPage(page);
    await accounts.goto();

    
    await accounts.fillAddAccount({
      name: 'User25_OKX',
      key: 'YOUR_OKX_KEY',
      secret: 'YOUR_OKX_SECRET',
      passphrase: 'YOUR_PASSPHRASE',
      testMode: true,
    });

    await accounts.fillAddAccount({
      name: 'User25_COINM',
      key: 'YOUR_COINM_KEY',
      secret: 'YOUR_COINM_SECRET',
      testMode: true,
    });

    // Step 5: Verify success message or connection visible
    const connected = await page
      .locator('text=Connected, text=Connected successfully, text=OKX')
      .first()
      .isVisible()
      .catch(() => false);

    expect(connected).toBeTruthy();
  });
});
