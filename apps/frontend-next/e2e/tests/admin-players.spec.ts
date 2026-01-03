import { test, expect } from '@playwright/test';

test.describe('Admin Players Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/players');
    await page.waitForLoadState('networkidle');
  });

  test('should display players table with seeded data', async ({ page }) => {
    // Wait for data to load
    await expect(page.getByText('Loading...')).toBeHidden({ timeout: 10000 });

    // Check for seeded player names
    await expect(page.getByText('Alice Champion')).toBeVisible();
    await expect(page.getByText('Bob Wizard')).toBeVisible();
  });

  test('should search for players', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search players...');
    await searchInput.fill('Alice');

    // Wait for search results
    await page.waitForTimeout(500); // Debounce
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Alice Champion')).toBeVisible();
    await expect(page.getByText('Bob Wizard')).toBeHidden();
  });

  test('should navigate to player detail page', async ({ page }) => {
    // Wait for table to load
    await expect(page.getByText('Loading...')).toBeHidden({ timeout: 10000 });

    // Click on a player row
    await page.getByText('Alice Champion').click();

    // Should navigate to player detail page
    await expect(page).toHaveURL(/.*\/admin\/players\/.+/);
  });
});
