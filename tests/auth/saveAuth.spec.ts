// tests/auth/saveAuth.spec.ts
import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { TEST_USER } from '../../utils/testData';
import { AUTH_FILE } from '../../utils/helpers';

test('saveAuth - login and persist storageState', async ({ page, context }) => {
  
  const outDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  
  const login = new LoginPage(page);
  await login.goto();

  
  const emailInputVisible = await page.locator('input[name="email"], input[name="username"]').first().isVisible().catch(() => false);
  if (emailInputVisible) {
    await login.login(TEST_USER.email, TEST_USER.password);
    
    await page.waitForTimeout(3000);
  } else {
    console.log('Login inputs not visible — likely already authenticated in this context.');
  }


  const gs = page.locator('button:has-text("Get Started"), text=Get Started').first();
  if (await gs.isVisible().catch(() => false)) {
    await gs.click().catch(() => {});
    await page.waitForTimeout(1000);
  }

  
  await page.waitForTimeout(1200);

  
  await context.storageState({ path: AUTH_FILE });
  console.log(' Saved storageState to', AUTH_FILE);

  
  try {
    const ls: Record<string, string> = await page.evaluate(() => {
      const out: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) out[k] = localStorage.getItem(k) || '';
      }
      return out;
    });
    fs.writeFileSync(path.join(outDir, 'debug.localStorage.json'), JSON.stringify(ls, null, 2));
    console.log('Saved debug.localStorage.json');
  } catch (e) {
    console.warn('Could not save debug localStorage', e);
  }
});
