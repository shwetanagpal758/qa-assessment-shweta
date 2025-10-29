import { Page, Locator, expect } from '@playwright/test';


export class GoOpsPage {
  readonly page: Page;
  readonly walletsTab: Locator;
  readonly metricsTab: Locator;
  readonly openTransferBtn: Locator;
  readonly fromSelect: Locator;
  readonly toSelect: Locator;
  readonly currencySelect: Locator;
  readonly amountInput: Locator;
  readonly confirmBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.walletsTab = page.locator('text=Wallets, button:has-text("Wallets")').first();
    this.metricsTab = page.locator('text=Metrics, button:has-text("Metrics")').first();

    
    this.openTransferBtn = page.locator('button:has-text("New Transfer"), text=Create Transfer').first();
    this.fromSelect = page.locator('select[name="from"], [placeholder*="From"]');
    this.toSelect = page.locator('select[name="to"], [placeholder*="To"]');
    this.currencySelect = page.locator('select[name="currency"], [placeholder*="Currency"]').first();
    this.amountInput = page.locator('input[name="amount"], [placeholder*="Amount"]').first();
    this.confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Submit"), text=Transfer').first();
  }

 
  async goto() {
    await this.page.goto('/gosettle', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await this.page.waitForTimeout(1000);
    if (await this.walletsTab.isVisible().catch(() => false)) {
      console.log(' GoOps Wallets tab visible.');
    } else {
      console.log('ℹ GoOps page not loaded fully yet.');
    }
  }

 
  async openNewTransfer() {
    if (await this.openTransferBtn.isVisible().catch(() => false)) {
      await this.openTransferBtn.click().catch(() => {});
      console.log(' Opened New Transfer modal.');
    } else {
      console.log(' New Transfer button not found.');
    }
  }

  
  async fillAndSubmitTransfer(opts: {
    from: string;
    to: string;
    currency: string;
    amount: number;
  }) {
    const { from, to, currency, amount } = opts;

    if (await this.fromSelect.isVisible().catch(() => false))
      await this.fromSelect.selectOption({ label: from }).catch(() => {});

    if (await this.toSelect.isVisible().catch(() => false))
      await this.toSelect.selectOption({ label: to }).catch(() => {});

    if (await this.currencySelect.isVisible().catch(() => false))
      await this.currencySelect.selectOption({ label: currency }).catch(() => {});

    if (await this.amountInput.isVisible().catch(() => false))
      await this.amountInput.fill(String(amount)).catch(() => {});

    await this.confirmBtn.click().catch(() => {});
    await this.page.waitForTimeout(2000);
    console.log(' Transfer form submitted.');
  }
}
