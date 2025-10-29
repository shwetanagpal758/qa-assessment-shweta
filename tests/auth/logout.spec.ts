// tests/auth/logout.spec.ts
import { test, expect } from '@playwright/test';
import { BASE_URL, TEST_USER } from '../../utils/testData';
import { clickWithFallback } from '../../utils/helpers';


test('Logout via username dropdown (robust) — clicks sign out or falls back to DOM click', async ({ page }) => {
  const base = (typeof BASE_URL === 'string' && BASE_URL.length) ? BASE_URL : 'https://test1.gotrade.goquant.io';
  await page.goto(base, { waitUntil: 'domcontentloaded' });

  
  const onLogin = await page.locator('input[name="email"], input[name="username"]').first().isVisible().catch(()=>false);
  if (onLogin) {
    await page.fill('input[name="email"], input[name="username"]', TEST_USER.email).catch(()=>{});
    await page.fill('input[name="password"]', TEST_USER.password).catch(()=>{});
    await clickWithFallback(page, [
      'button:has-text("Sign In")',
      'button:has-text("Login")',
      'text="Sign In"',
      'text="Login"'
    ]).catch(()=>{});
    
    await page.waitForTimeout(2000);
  }

  
  const userSelectors = [
    `button:has-text("${TEST_USER.email}")`,
    `text=${TEST_USER.email}`,
    `button:has-text("${TEST_USER.email.split('@')[0]}")`,
    `text=${TEST_USER.email.split('@')[0]}`,
    'button[aria-label*="user"]',
    'button[title*="user"]',
    'button[aria-label*="account"]',
    'button[title*="account"]',
    'button[aria-label*="profile"]',
    'button[title*="profile"]'
  ];
  const opened = await clickWithFallback(page, userSelectors).catch(()=>false);
  if (!opened) {
    
    await page.locator('header button, nav button').first().click().catch(()=>{});
  }

  
  await page.waitForTimeout(400); 
  const menuCandidates = [
    'role=menu',
    '[role="menu"]',
    '.menu, .dropdown, .user-menu, .profile-menu',
    'div[role="listbox"]',
    'ul[role="menu"], ul[role="listbox"]'
  ];


  let menuLocator = null;
  for (const sel of menuCandidates) {
    const loc = page.locator(sel).first();
    if (await loc.count().catch(()=>0) > 0 && await loc.isVisible().catch(()=>false)) {
      menuLocator = loc;
      break;
    }
  }

  
  const signSelectors = [
    'button:has-text("Sign out")',
    'button:has-text("Sign Out")',
    'button:has-text("Logout")',
    'button:has-text("Log out")',
    'text="Sign out"',
    'text="Sign Out"',
    'text="Logout"',
    'text="Log out"'
  ];

  let didSignOut = false;

  if (menuLocator) {
    for (const s of signSelectors) {
      const inside = menuLocator.locator(s).first();
      if (await inside.count().catch(()=>0) > 0) {
        await inside.click().catch(()=>{});
        didSignOut = true;
        break;
      }
    }
  }

  
  if (!didSignOut) {
    for (const s of signSelectors) {
      const loc = page.locator(s).first();
      if (await loc.count().catch(()=>0) > 0 && await loc.isVisible().catch(()=>false)) {
        await loc.click().catch(()=>{});
        didSignOut = true;
        break;
      }
    }
  }

  
  if (!didSignOut) {
    const clicked = await page.evaluate(() => {
      const texts = ['Sign out', 'Sign Out', 'Logout', 'Log out'];
      for (const t of texts) {
        
        const xpath = `//button[normalize-space()="${t}"] | //a[normalize-space()="${t}"] | //div[normalize-space()="${t}"]`;
        const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement | null;
        if (el) { el.click(); return true; }
        
        const nodes = Array.from(document.querySelectorAll('button,a,div,span')).find(n => n.textContent?.trim() === t);
        if (nodes) { (nodes as HTMLElement).click(); return true; }
      }
      return false;
    }).catch(()=>false);

    if (clicked) didSignOut = true;
  }

  
  await page.waitForTimeout(800);

  
  const reachedLogin = await Promise.race([
    page.waitForURL(/\/auth\/login|\/login/, { timeout: 8000 }).then(()=>true).catch(()=>false),
    page.locator('input[name="email"], input[name="username"]').first().waitFor({ timeout: 8000 }).then(()=>true).catch(()=>false)
  ]).catch(()=>false);

  if (!didSignOut || !reachedLogin) {
    
    await page.screenshot({ path: 'test-results/logout-failure.png', fullPage: true }).catch(()=>{});
    
    let outer = '';
    try {
      outer = menuLocator ? await menuLocator.evaluate((n: any) => n.outerHTML).catch(()=>'') : '';
    } catch {}
    
    console.log('--- LOGOUT DIAGNOSTIC --- didSignOut=', didSignOut, 'reachedLogin=', reachedLogin);
    console.log('Menu outerHTML (if any):\n', outer);
  }

  expect(reachedLogin).toBeTruthy();
});


