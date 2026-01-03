import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  // Clear auth state for these tests
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to register page from sign-in', async ({ page }) => {
    await page.goto('/sign-in');
    await page.click('text=Create Account');

    await expect(page).toHaveURL(/.*register/);
  });
});
