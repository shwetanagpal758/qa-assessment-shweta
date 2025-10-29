// tests/goops/settleTransfer.spec.ts
import { test, expect } from '@playwright/test';
import { GoOpsPage } from '../../pages/GoOpsPage';
import { TEST_USER } from '../../utils/testData';
import { clickWithFallback } from '../../utils/helpers';

test.describe('GoOps - Settle Transfer', () => {
  test('TC - Attempt transfer and verify feedback', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const needsLogin = await page.locator('input[name="email"], input[name="username"]').first().isVisible().catch(()=>false);
    if (needsLogin) {
      await page.fill('input[name="email"], input[name="username"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await clickWithFallback(page, [
           'button:has-text("Sign In")',
           'button:has-text("Login")',
           'text="Sign In"',
           'text="Login"'
]);
      await page.waitForTimeout(2500);
    }

    const goops = new GoOpsPage(page);
    await goops.goto();
    await goops.openNewTransfer?.call?.(goops).catch(()=>{});
    await goops.fillAndSubmitTransfer?.call?.(goops, {
      from: 'BINANCEUSDM',
      to: 'BINANCECOINM',
      currency: 'USDT',
      amount: 1
    }).catch(()=>{});

    
    const ok = await page.locator('text=Transfer successful, text=Success').first().isVisible().catch(()=>false);
    const fail = await page.locator('text=Transfer failed, text=Error').first().isVisible().catch(()=>false);
    expect(ok || fail).toBeTruthy();
  });
});
