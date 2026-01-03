import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for frontend-next e2e tests.
 *
 * Tests run against local development servers:
 * - frontend-next: http://localhost:3001
 * - rest-api: http://localhost:3000
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000,

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'pnpm --filter rest-api run dev',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      timeout: 60000,
    },
    {
      command: 'pnpm --filter frontend-next run dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      cwd: '../..',
      timeout: 60000,
      env: {
        PORT: '3001',
        NEXT_PUBLIC_API_URL: 'http://localhost:3000/api/v1',
      },
    },
  ],
});
