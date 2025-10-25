import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.signInButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('https://test1.gotrade.goquant.io/auth/login', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('domcontentloaded');
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  async clickSignIn() {
    await expect(this.signInButton).toBeEnabled({ timeout: 5000 });
    await this.signInButton.click();
  }

  async login(email: string, password: string, expectSuccess: boolean = true) {
    await this.emailInput.fill(email.trim());
    await this.passwordInput.fill(password.trim());
    await expect(this.signInButton).toBeEnabled({ timeout: 5000 });

    if (expectSuccess) {
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
        this.signInButton.click(),
      ]);
    } else {
      await this.signInButton.click();
    }
  }

  // Dynamic validation for empty fields
  async checkEmptyFieldValidation() {
    const possibleMessages = [
      'Username must be at least 5 characters',
      'Email is required',
      'Password is required'
    ];

    let found = false;
    for (const msg of possibleMessages) {
      const locator = this.page.locator(`text=${msg}`);
      if (await locator.count() > 0) {
        await expect(locator).toBeVisible({ timeout: 5000 });
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error('No expected empty-field validation message was found.');
    }
  }

  // Dynamic error for invalid login
  async checkInvalidLoginError() {
    const possibleErrors = [
      'Invalid email or password',
      'The user was not found in the system',
      'Incorrect login credentials'
    ];

    let found = false;
    for (const msg of possibleErrors) {
      const locator = this.page.locator(`text=${msg}`);
      if (await locator.count() > 0) {
        await expect(locator).toBeVisible({ timeout: 5000 });
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error('No expected invalid login error message was found.');
    }
  }
}
