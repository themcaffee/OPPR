import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',

  // Run tests sequentially for stability with shared database state
  fullyParallel: false,
  workers: 1,

  // Fail fast in CI
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  // Reporter configuration
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  // Global settings
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  // Global setup/teardown
  globalSetup: './e2e/support/global-setup.ts',
  globalTeardown: './e2e/support/global-teardown.ts',

  // Timeouts
  timeout: 30000,
  expect: { timeout: 5000 },

  // Project configurations
  projects: [
    // Setup project - authenticate and save state
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    // Main tests using authenticated state
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],
});
