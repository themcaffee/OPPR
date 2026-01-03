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

  test('should display dashboard after authentication', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    await expect(dashboardPage.heading).toBeVisible();
    await expect(dashboardPage.headerLogo).toBeVisible();
    await expect(dashboardPage.signOutButton).toBeVisible();
  });

  test('should show no player profile message for new users', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    await dashboardPage.expectNoPlayerProfile();
  });

  test('should redirect to sign-in when not authenticated', async ({ page, context }) => {
    await context.clearCookies();

    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should logout successfully', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    await dashboardPage.signOut();

    await expect(page).toHaveURL('/sign-in');

    await dashboardPage.goto();
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
