import { test, expect } from '@playwright/test';
import { RegisterPage } from './page-objects/auth.page';
import { DashboardPage } from './page-objects/dashboard.page';
import { generateTestUser, type TestUser } from './fixtures/test-user';

test.describe('Dashboard', () => {
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser('dashboard');
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(testUser);
    await expect(page).toHaveURL('/profile');
  });

  test('should redirect to sign-in when not authenticated', async ({ page, context }) => {
    await context.clearCookies();

    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should display dashboard without errors after authentication', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const errors: string[] = [];

    // Capture any page errors
    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // Verify no JavaScript errors occurred
    expect(errors).toEqual([]);

    // Verify dashboard heading is visible
    await expect(dashboardPage.heading).toBeVisible();
  });
});
