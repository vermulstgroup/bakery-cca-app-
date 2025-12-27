import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 45000,

  use: {
    baseURL: 'http://localhost:9002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['iPhone 14 Pro'],
        // Override to use Chromium
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: 'npm run dev -- -p 9002',
    url: 'http://localhost:9002',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
