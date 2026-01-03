import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for frontend-next e2e tests.
 *
 * Tests run against Docker Compose stack:
 * - Caddy proxy: http://localhost:8080
 *
 * Start the stack with: docker compose up
 * Run tests with: pnpm --filter frontend-next run test:e2e
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
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'echo "Waiting for Docker Compose stack..."',
    url: 'http://localhost:8080/health',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
