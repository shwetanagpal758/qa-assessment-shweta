// pages/TradePage.ts
import { Page, Locator } from '@playwright/test';

export class TradePage {
  readonly page: Page;
  readonly orderTypeSelect: Locator;
  readonly symbolSelect: Locator;
  readonly quantityInput: Locator;
  readonly durationInput: Locator;
  readonly priceInput: Locator;
  readonly intervalInput: Locator;
  readonly decayFactorInput: Locator;
  readonly longBtn: Locator;
  readonly shortBtn: Locator;
  readonly tradeBtn: Locator;

  constructor(page: Page) {
    this.page = page;

   
    this.orderTypeSelect = page.locator('div[role="list"], div.order-types, .order-type').first();
    this.symbolSelect = page.locator('select[name="symbol"], div.symbol-select, .symbol-dropdown').first();
    this.quantityInput = page.locator('input[name="quantity"], input[placeholder*="quantity"], input[aria-label*="Quantity"]').first();
    this.durationInput = page.locator('input[name="duration"], input[placeholder*="duration"]').first();
    this.priceInput = page.locator('input[name="price"], input[placeholder*="price"]').first();
    this.intervalInput = page.locator('input[name="interval"], input[placeholder*="interval"]').first();
    this.decayFactorInput = page.locator('input[name="decay"], input[placeholder*="decay"]').first();

   
    this.longBtn = page.locator('button:has-text("Long")').first();
    this.shortBtn = page.locator('button:has-text("Short")').first();
    this.tradeBtn = page.locator('button:has-text("Trade"), button:has-text("Place Order")').first();
  }

  
  async selectOrderType(type: string) {
   
    const btnByText = this.page.locator(`button:has-text("${type}")`);
    if ((await btnByText.count()) > 0) {
      await btnByText.first().click().catch(() => {});
      await this.page.waitForTimeout(200);
      return;
    }

    
    const textSel = this.page.locator(`text=\"${type}\"`);
    if ((await textSel.count()) > 0) {
      await textSel.first().click().catch(() => {});
      await this.page.waitForTimeout(200);
      return;
    }

    
    const select = this.page.locator('select[name="algorithm"], select[aria-label*="algorithm"]');
    if ((await select.count()) > 0) {
      await select.selectOption({ label: type }).catch(() => {});
      await this.page.waitForTimeout(200);
      return;
    }

    
    try {
      const anyBtn = this.page.locator('button').filter({ hasText: type }).first();
      if ((await anyBtn.count()) > 0) {
        await anyBtn.click().catch(() => {});
        await this.page.waitForTimeout(200);
        return;
      }
    } catch {
      
    }
  }

  async selectSymbol(symbol: string) {
   
    const select = this.page.locator('select[name="symbol"]');
    if ((await select.count()) > 0) {
      try {
        await select.selectOption({ label: symbol }).catch(() => {});
        await this.page.waitForTimeout(150);
        return;
      } catch { /* ignore */ }
    }

   
    const symbolDropdown = this.page.locator('div.symbol-dropdown, .symbol-list, button:has-text("Symbol")').first();
    if ((await symbolDropdown.count()) > 0) {
      await symbolDropdown.click().catch(() => {});
      await this.page.waitForTimeout(150);
      const option = this.page.locator(`text=\"${symbol}\"`).first();
      if ((await option.count()) > 0) {
        await option.click().catch(() => {});
        await this.page.waitForTimeout(150);
        return;
      }
    }

   
    const input = this.page.locator('input[placeholder*="symbol"], input[name="symbol"]');
    if ((await input.count()) > 0) {
      await input.fill(symbol).catch(() => {});
      await this.page.keyboard.press('Enter').catch(() => {});
      await this.page.waitForTimeout(150);
    }
  }

  
  async fillBasicFields(quantity: number | string, duration: number | string) {
    if ((await this.quantityInput.count()) > 0) await this.quantityInput.fill(String(quantity)).catch(() => {});
    if ((await this.durationInput.count()) > 0) await this.durationInput.fill(String(duration)).catch(() => {});
    await this.page.waitForTimeout(150);
  }

  
  async fillMarketOrder(quantity: number | string, duration: number | string) {
    return this.fillBasicFields(quantity, duration);
  }

  
  async fillLimit(quantity: number | string, duration: number | string, price: number | string) {
    await this.fillBasicFields(quantity, duration);
    if ((await this.priceInput.count()) > 0) await this.priceInput.fill(String(price)).catch(() => {});
    await this.page.waitForTimeout(150);
  }

  
  async fillTwap(quantity: number | string, duration: number | string, interval: number | string, decayFactor: number | string) {
    await this.fillBasicFields(quantity, duration);
    if ((await this.intervalInput.count()) > 0) await this.intervalInput.fill(String(interval)).catch(() => {});
    if ((await this.decayFactorInput.count()) > 0) await this.decayFactorInput.fill(String(decayFactor)).catch(() => {});
    await this.page.waitForTimeout(150);
  }

  async fillLimitFields(quantity: number | string, duration: number | string, price: number | string) {
    return this.fillLimit(quantity, duration, price);
  }

  async fillTwapFields(quantity: number | string, duration: number | string, interval: number | string, decayFactor: number | string) {
    return this.fillTwap(quantity, duration, interval, decayFactor);
  }

  async clickLong() {
    
    const longCandidates = [
      this.page.locator('button:has-text("Long")').first(),
      this.page.locator('button:has-text("Buy")').first()
    ];
    for (const cand of longCandidates) {
      if ((await cand.count()) > 0) {
        await cand.click().catch(() => {});
        await this.page.waitForTimeout(200);
        return;
      }
    }
    if ((await this.tradeBtn.count()) > 0) {
      await this.tradeBtn.click().catch(() => {});
      await this.page.waitForTimeout(200);
    }
  }

  async clickShort() {
    const shortCandidates = [
      this.page.locator('button:has-text("Short")').first(),
      this.page.locator('button:has-text("Sell")').first()
    ];
    for (const cand of shortCandidates) {
      if ((await cand.count()) > 0) {
        await cand.click().catch(() => {});
        await this.page.waitForTimeout(200);
        return;
      }
    }
    if ((await this.tradeBtn.count()) > 0) {
      await this.tradeBtn.click().catch(() => {});
      await this.page.waitForTimeout(200);
    }
  }

  async placeOrderAndWaitForResponse(timeout = 10000): Promise<string | undefined> {
    let orderId: string | undefined;
    const p = this.page.waitForResponse(resp => {
      try {
        const url = resp.url();
        return /order(s)?/i.test(url) && resp.status() < 500;
      } catch {
        return false;
      }
    }, { timeout }).then(async resp => {
      try {
        const json = await resp.json().catch(() => null);
        if (json && typeof json === 'object') {
          if ((json as any).orderId) orderId = String((json as any).orderId);
          else if ((json as any).id) orderId = String((json as any).id);
          else if ((json as any).data?.id) orderId = String((json as any).data.id);
        }
      } catch {}
    }).catch(() => {});

    if ((await this.tradeBtn.count()) > 0) await this.tradeBtn.click().catch(() => {});

    await Promise.race([p, new Promise(r => setTimeout(r, timeout))]);
    return orderId;
  }

  
  async placeOrderAndWait(timeout = 10000) {
    return this.placeOrderAndWaitForResponse(timeout);
  }

  async waitForTradeToast(timeout = 10000) {
    const candidates = [
      'text="Order placed"', 'text="Trade successful"', 'text="Order Rejected"',
      'text="Order Submitted"', 'text="Execution complete"'
    ];
    const start = Date.now();
    while (Date.now() - start < timeout) {
      for (const c of candidates) {
        const count = await this.page.locator(c).count().catch(() => 0);
        if (count > 0) return true;
      }
      await this.page.waitForTimeout(300);
    }
    return false;
  }
}
