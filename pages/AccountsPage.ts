import { Page } from '@playwright/test';

export class AccountsPage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    const acc = this.page.locator('text=Accounts');
    await acc.click().catch(() => {});
    const admin = this.page.locator('text=Admin').first();
    if (await admin.isVisible().catch(() => false)) {
      await admin.click().catch(() => {});
    }
    await this.page.waitForTimeout(1000);
  }

  async addAccount(name: string) {
    const addBtn = this.page.locator('button:has-text("Add Account")');
    await addBtn.click().catch(() => {});
    await this.page.getByPlaceholder('Account Name').fill(name);
    await this.page.locator('button:has-text("Add")').click().catch(() => {});
    await this.page.waitForTimeout(1000);
  }
}
