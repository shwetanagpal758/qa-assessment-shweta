import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  retries: 1, // optional: re-run failed test once
  use: {
    storageState: 'auth.json',
    headless: false,
    baseURL: 'https://test1.gotrade.goquant.io/',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure', //  helpful for debugging
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: 'tests/auth/auth.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
  reporter: [['list'], ['html', { outputFolder: 'reports/html' }]],
});


