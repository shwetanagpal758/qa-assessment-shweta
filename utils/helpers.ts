
import type { Page } from '@playwright/test';


export async function clickWithFallback(page: Page, selectors: string[], timeout = 8000) {
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel);
      const count = await loc.count().catch(() => 0);
      if (count > 0) {
        const first = loc.first();
        const visible = await first.isVisible().catch(() => false);
        if (visible) {
          await first.click({ timeout });
          return true;
        }
      }
      
      await page.click(sel, { timeout }).then(() => true).catch(() => { throw new Error('page.click failed'); });
      return true;
    } catch {
      
    }
  }
  throw new Error(`clickWithFallback: none worked: ${JSON.stringify(selectors)}`);
}
