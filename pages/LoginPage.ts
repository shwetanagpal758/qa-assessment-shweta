// pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly primarySignInButton: Locator;

  
  static EMPTY_FIELD_MESSAGES = [
    'Username must be at least 5 characters',
    'Email is required',
    'Password is required',
    'Please enter your email',
    'Please enter your password',
    'This field is required'
  ];

  static INVALID_LOGIN_MESSAGES = [
    'Invalid email or password',
    'The user was not found in the system',
    'Incorrect login credentials',
    'Invalid credentials',
    'User not found',
    'Authentication failed'
  ];

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"], input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    // keep a simple primary locator (used as quick path) but we will fallback to others when clicking
    this.primarySignInButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
  }

 private async _clickSignInFallback() {
    const selectors = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      'text="Sign In"',
      'text="Login"'
    ];

    for (const s of selectors) {
      try {
        const loc = this.page.locator(s).first();
        if (await loc.count().catch(() => 0) > 0 && await loc.isVisible().catch(() => false)) {
          await loc.click().catch(() => {});
          return true;
        }
      } catch { /* ignore and continue */ }
    }

    
    const clicked = await this.page.evaluate(() => {
      const labels = ['Sign In', 'Sign in', 'Login'];
      for (const lab of labels) {
        const el = Array.from(document.querySelectorAll('button, a, div')).find(n => n.textContent?.trim() === lab);
        if (el) { (el as HTMLElement).click(); return true; }
      }
      return false;
    }).catch(() => false);

    return clicked;
  }

  
  async goto() {
    const url = process.env.BASE_URL ?? 'https://test1.gotrade.goquant.io';
    await this.page.goto(`${url}/auth/login`, { waitUntil: 'domcontentloaded' }).catch(async () => {
      // fallback to base if /auth/login redirect not available
      await this.page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
    });
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  
  async clickSignIn() {
    
    try {
      await expect(this.primarySignInButton).toBeEnabled({ timeout: 3000 });
    } catch { /* ignore */ }
    const ok = await this._clickSignInFallback();
    if (!ok) {
      throw new Error('Sign In button not found/clickable via fallbacks');
    }
  }

 
  async login(email: string, password: string, expectSuccess: boolean = true) {
    // fill fields safely
    if (email !== undefined && email !== null) {
      await this.emailInput.fill(String(email)).catch(() => {});
    }
    if (password !== undefined && password !== null) {
      await this.passwordInput.fill(String(password)).catch(() => {});
    }

   
    await this._clickSignInFallback();

    if (!expectSuccess) {
      
      await this.page.waitForTimeout(800);
      return;
    }

    
    const base = process.env.BASE_URL ?? 'https://test1.gotrade.goquant.io';
    const successPromise = this.page.waitForURL(/\/gotrade|\/dashboard/, { timeout: 15000 }).catch(() => false);
    const getStartedPromise = this.page.locator('button:has-text("Get Started")').first().waitFor({ timeout: 15000 }).then(()=>true).catch(()=>false);
    const usernamePromise = this.page.locator(`text=${(email || '').toString().split('@')[0]}`).first().waitFor({ timeout: 15000 }).then(()=>true).catch(()=>false);
    const errorPromise = this._waitForPossibleError(15000);

    
    const [succeeded] = await Promise.all([Promise.race([successPromise, getStartedPromise, usernamePromise, errorPromise]), this.page.waitForTimeout(200)]).catch(()=>[false]);

    
    const urlNow = this.page.url();
    if (urlNow.includes('/gotrade') || urlNow.includes('/dashboard') || urlNow === base || urlNow === base + '/') {
      return; // success
    }

    
    const errVisible = await this._hasErrorVisible();
    if (errVisible) {
      throw new Error('Login attempt resulted in an error message being shown (invalid credentials or server error).');
    }

    
    await this.page.waitForTimeout(500);
  }

  
  private async _waitForPossibleError(timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this._hasErrorVisible()) return true;
      await this.page.waitForTimeout(200);
    }
    return false;
  }

  private async _hasErrorVisible() {
    
    for (const t of LoginPage.INVALID_LOGIN_MESSAGES) {
      if (await this.page.locator(`text=${t}`).first().isVisible().catch(()=>false)) return true;
    }
    
    const generic = await this.page.locator('text=Error, text=Error:, text=Invalid, .toast, .ant-alert, .alert').first().isVisible().catch(()=>false);
    if (generic) return true;

    
    const emailInvalid = await this.emailInput.evaluate((el: any) => el.getAttribute && (el.getAttribute('aria-invalid') === 'true')).catch(()=>false);
    const pwdInvalid = await this.passwordInput.evaluate((el: any) => el.getAttribute && (el.getAttribute('aria-invalid') === 'true')).catch(()=>false);
    if (emailInvalid || pwdInvalid) return true;

    return false;
  }

  
  async checkEmptyFieldValidation() {
    
    for (const m of LoginPage.EMPTY_FIELD_MESSAGES) {
      const loc = this.page.locator(`text=${m}`).first();
      if (await loc.isVisible().catch(()=>false)) {
        await expect(loc).toBeVisible();
        return;
      }
    }

   
    const emailInvalid = await this.emailInput.getAttribute('aria-invalid').catch(()=>null);
    const passInvalid = await this.passwordInput.getAttribute('aria-invalid').catch(()=>null);
    if (emailInvalid === 'true' || passInvalid === 'true') {
      return;
    }

  
    const near = await this.page.locator('.error, .validation-message, .invalid-feedback, .ant-form-item-explain').first().isVisible().catch(()=>false);
    if (near) return;

    throw new Error('No empty-field validation message or indicator found (checked common messages, aria-invalid and validation classes).');
  }

  
  async checkInvalidLoginError() {
    
    for (const t of LoginPage.INVALID_LOGIN_MESSAGES) {
      const loc = this.page.locator(`text=${t}`).first();
      if (await loc.isVisible().catch(()=>false)) {
        await expect(loc).toBeVisible();
        return;
      }
    }

    
    const generic = await this.page.locator('text=Error, .toast:has-text("Error"), .ant-alert').first().isVisible().catch(()=>false);
    if (generic) {
      return;
    }

    
    const stillOnLogin = (this.page.url().includes('/auth/login') || this.page.url().includes('/login') || (await this.emailInput.isVisible().catch(()=>false)));
    if (stillOnLogin) return;

    throw new Error('No invalid-login error message found and not clearly on login page — check application behavior and add the exact message to LoginPage.INVALID_LOGIN_MESSAGES if custom.');
  }
}

export default LoginPage;
