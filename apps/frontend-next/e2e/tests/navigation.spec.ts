import { test, expect } from '@playwright/test';

test.describe('Authenticated Navigation', () => {
  test('should display dashboard with key elements', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Leaderboard')).toBeVisible();
  });

  test('should navigate to admin dashboard', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Total Players')).toBeVisible();
    await expect(page.getByText('Tournaments')).toBeVisible();
  });

  test('should navigate to admin players list', async ({ page }) => {
    await page.goto('/admin/players');

    await expect(page.getByRole('heading', { name: 'Players' })).toBeVisible();
    await expect(page.getByPlaceholder('Search players...')).toBeVisible();
  });

  test('should navigate to admin tournaments list', async ({ page }) => {
    await page.goto('/admin/tournaments');

    await expect(page.getByRole('heading', { name: 'Tournaments' })).toBeVisible();
  });
});
