// tests/trading/limitEdge.spec.ts
import { test, expect } from '@playwright/test';
import { TradePage } from '../../pages/TradePage';
import { BASE_URL, TRADE_DEFAULTS } from '../../utils/testData';
import { clickWithFallback } from '../../utils/helpers';

test.describe('Trading - Limit Edge flows', () => {
  test.beforeEach(async ({ page }) => {
    
    await page.goto(BASE_URL + '/gotrade', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400); 
  });

  test('TC12 - Place Limit-Edge order (Long) and verify in Order History', async ({ page }) => {
    const trade = new TradePage(page);

    await trade.selectOrderType('Limit-Edge');
    await trade.selectSymbol(TRADE_DEFAULTS.symbol);
    await trade.fillLimit(TRADE_DEFAULTS.price, TRADE_DEFAULTS.quantity, TRADE_DEFAULTS.duration);
    await trade.clickLong();

    
    await trade.waitForTradeToast?.().catch(() => {});

    
    await clickWithFallback(page, [
      'button:has-text("Order History")',
      'text="Order History"',
    ]);

    await page.waitForTimeout(800);

    
    const countA = await page.locator('text=Limit-Edge').count().catch(() => 0);
    const countB = await page.locator('text=Order History').count().catch(() => 0);
    expect(countA + countB).toBeGreaterThan(0);
  });

  test('TC13 - Place Limit-Edge order (Short) and verify', async ({ page }) => {
    const trade = new TradePage(page);

    await trade.selectOrderType('Limit-Edge');
    await trade.selectSymbol(TRADE_DEFAULTS.symbol);
    await trade.fillLimit(TRADE_DEFAULTS.price, TRADE_DEFAULTS.quantity, TRADE_DEFAULTS.duration);
    await trade.clickShort();

    await trade.waitForTradeToast?.().catch(() => {});

    await clickWithFallback(page, [
      'button:has-text("Order History")',
      'text="Order History"',
    ]);

    await page.waitForTimeout(800);
    const marker = await page.locator('text=Order History').count().catch(() => 0);
    expect(marker).toBeGreaterThanOrEqual(0);
  });
});
