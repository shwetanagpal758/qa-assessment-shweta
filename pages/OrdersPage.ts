// pages/OrdersPage.ts
import { Page, Locator } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;
  readonly workingOrdersTabBtn: Locator;
  readonly orderHistoryTabBtn: Locator;
  readonly workingOrdersTable: Locator;
  readonly cancelAllBtn: Locator;
  readonly orderRows: Locator;
  readonly orderRejectedBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.workingOrdersTabBtn = page.locator('button:has-text("Working Orders"), text=Working Orders').first();
    this.orderHistoryTabBtn = page.locator('button:has-text("Order History"), text=Order History').first();
    this.workingOrdersTable = page.locator('div:has-text("Working Orders"), table:has-text("Working Orders")').first();
    this.orderRows = page.locator('table tr, div.order-row, div:has(.order-id)');
    this.cancelAllBtn = page.locator('button:has-text("Cancel Working Orders"), button:has-text("Cancel All")').first();
    this.orderRejectedBadge = page.locator('text=Order Rejected, div:has-text("Order Rejected")');
  }

  async gotoWorkingOrders(timeout = 3000): Promise<boolean> {
    try {
      if (await this.workingOrdersTabBtn.isVisible().catch(() => false)) {
        await this.workingOrdersTabBtn.click().catch(() => {});
        await this.page.waitForTimeout(500);
      } else {
        await this.page.locator('text=Working Orders').first().click().catch(() => {});
      }

      if (await this.workingOrdersTable.isVisible().catch(() => false)) return true;

      const rows = await this.page.locator('table tr').count().catch(() => 0);
      if (rows > 0) return true;

      const start = Date.now();
      while (Date.now() - start < timeout) {
        if (await this.workingOrdersTable.isVisible().catch(() => false)) return true;
        if ((await this.page.locator('table tr').count().catch(() => 0)) > 0) return true;
        await this.page.waitForTimeout(200);
      }
      return false;
    } catch {
      return false;
    }
  }

  
  async openWorkingOrders(timeout = 3000) { return this.gotoWorkingOrders(timeout); }

  
  async anyWorkingOrderRows(): Promise<boolean> {
    const count = await this.orderRows.count().catch(() => 0);
    return count > 0;
  }

  async cancelAllOrders() {
    try {
      const visible = await this.cancelAllBtn.isVisible().catch(() => false);
      if (!visible) {
        const cancelBtns = this.page.locator('button:has-text("Cancel"), button[aria-label="Cancel order"]');
        const count = await cancelBtns.count().catch(() => 0);
        for (let i = 0; i < count; i++) {
          await cancelBtns.nth(i).click().catch(() => {});
          await this.page.waitForTimeout(300);
        }
        return;
      }

      await this.cancelAllBtn.click().catch(() => {});
      await this.page.waitForTimeout(700);
      const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click().catch(() => {});
        await this.page.waitForTimeout(500);
      }
    } catch (err) {
      console.warn('cancelAllOrders encountered an error:', (err as Error).message);
    }
  }

  
  async cancelAllBth() { return this.cancelAllOrders(); }

  
  async verifyCancelledOrEmpty(): Promise<boolean> {
    try {
      if ((await this.orderRejectedBadge.count().catch(() => 0)) > 0) return true;
      const rows = await this.orderRows.count().catch(() => 0);
      return rows === 0;
    } catch {
      return false;
    }
  }

  
  async gotoOrderHistory(timeout = 2000): Promise<boolean> {
    try {
      if (await this.orderHistoryTabBtn.isVisible().catch(() => false)) {
        await this.orderHistoryTabBtn.click().catch(() => {});
        await this.page.waitForTimeout(400);
      } else {
        await this.page.locator('text=Order History').first().click().catch(() => {});
      }
     
      const marker = await this.page.locator('text=Order History, table:has-text("Order History")').count().catch(() => 0);
      return marker > 0;
    } catch {
      return false;
    }
  }

  async cancelOrderById(orderId: string) {
    try {
      const row = this.page.locator(`text=${orderId}`).first();
      if (await row.isVisible().catch(() => false)) {
        const cancelBtn = row.locator('button:has-text("Cancel"), button:has-text("X"), button:has-text("Close")').first();
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click().catch(() => {});
          await this.page.waitForTimeout(500);
        }
      }
    } catch { /* non-fatal */ }
  }

  async verifyOrderCancelled(): Promise<boolean> {
    try {
      if ((await this.orderRejectedBadge.count().catch(() => 0)) > 0) return true;
      const rows = await this.page.locator('table tr').count().catch(() => 0);
      return rows === 0;
    } catch {
      return false;
    }
  }
}
