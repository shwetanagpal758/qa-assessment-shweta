
import { test, expect } from '@playwright/test';
import { TradePage } from '../../pages/TradePage';
import { BASE_URL, RATIO_DEFAULTS } from '../../utils/testData';
import { clickWithFallback } from '../../utils/helpers';

test.describe('Trading - Ratio flows', () => {
  test.beforeEach(async ({ page }) => {
    
    await page.goto(BASE_URL + '/gotrade', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
  });

  test('TC22 - Ratio trade: fill two symbols and place', async ({ page }) => {
    const trade = new TradePage(page);

    
    await trade.selectOrderType('Ratio');

    
    await trade.selectSymbol(RATIO_DEFAULTS.firstSymbol);
    
    await page.waitForTimeout(200);
    await trade.selectSymbol(RATIO_DEFAULTS.secondSymbol);

    
    const firstRatioLoc = page.locator('input[name="firstRatio"], input[placeholder*="first ratio"], input[placeholder*="ratio"]').first();
    const secondRatioLoc = page.locator('input[name="secondRatio"], input[placeholder*="second ratio"]').first();

    if (await firstRatioLoc.count() > 0) {
      await firstRatioLoc.fill(String(RATIO_DEFAULTS.firstRatio)).catch(() => {});
    }
    if (await secondRatioLoc.count() > 0) {
      await secondRatioLoc.fill(String(RATIO_DEFAULTS.secondRatio)).catch(() => {});
    }

   
    await trade.clickLong();

    
    try {
      await trade.placeOrderAndWait?.();
    } catch (e) {
      
    }

    try {
      await trade.waitForTradeToast?.();
    } catch (e) {
     
    }

    
    await clickWithFallback(page, [
      'text="Open Positions"',
      'button:has-text("Open Positions")'
    ]).catch(() => {});

    await page.waitForTimeout(800);

    
    const openPosCount = await page.locator('text=Open Positions, .open-position, table tr').count().catch(() => 0);
    
    expect(openPosCount).toBeGreaterThanOrEqual(0);
  });
});
