import { test, expect } from '@playwright/test';
import { SignInPage } from './page-objects/auth.page';

test.describe('Navigation', () => {
  test.describe('Public Navigation (Not Signed In)', () => {
    test('should display OPPRS logo that links to home', async ({ page }) => {
      await page.goto('/');

      const logo = page.getByRole('link', { name: 'OPPRS' });
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute('href', '/');
    });

    test('should display main navigation links', async ({ page }) => {
      await page.goto('/');

      const header = page.locator('header');
      await expect(header.getByRole('link', { name: 'Rankings' })).toBeVisible();
      await expect(header.getByRole('link', { name: 'Tournaments' })).toBeVisible();
      await expect(header.getByRole('link', { name: 'Players' })).toBeVisible();
    });

    test('should display Sign in and Register links when not authenticated', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    });

    test('should not display Dashboard or Admin links when not authenticated', async ({ page }) => {
      await page.goto('/');

      // Wait for the page to load and auth check to complete
      await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();

      await expect(page.getByRole('link', { name: 'Dashboard' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
    });

    test('should navigate to Rankings page', async ({ page }) => {
      await page.goto('/');

      // Use header locator to avoid "View full rankings" link in page content
      const header = page.locator('header');
      await header.getByRole('link', { name: 'Rankings' }).click();

      await expect(page).toHaveURL('/rankings');
    });

    test('should navigate to Tournaments page', async ({ page }) => {
      await page.goto('/');

      // Use header locator to avoid "View all tournaments" link in page content
      const header = page.locator('header');
      await header.getByRole('link', { name: 'Tournaments' }).click();

      await expect(page).toHaveURL('/tournaments');
    });

    test('should navigate to Players page', async ({ page }) => {
      await page.goto('/');

      const header = page.locator('header');
      await header.getByRole('link', { name: 'Players' }).click();

      await expect(page).toHaveURL('/players');
    });
  });

  test.describe('Authenticated Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in using seeded test user
      const signInPage = new SignInPage(page);
      await signInPage.goto();
      await signInPage.signIn('e2e-test@example.com', 'TestPassword123!');
    });

    test('should display Dashboard link when authenticated', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    });

    test('should display Sign Out button when authenticated', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    });

    test('should not display Sign in and Register links when authenticated', async ({ page }) => {
      await page.goto('/');

      // Wait for auth check to complete
      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

      await expect(page.getByRole('link', { name: 'Sign in' })).not.toBeVisible();
      await expect(page.getByRole('link', { name: 'Register' })).not.toBeVisible();
    });

    test('should navigate to Dashboard page', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('link', { name: 'Dashboard' }).click();

      await expect(page).toHaveURL('/dashboard');
    });

    test('should sign out when clicking Sign Out button', async ({ page }) => {
      await page.goto('/');

      // Wait for Dashboard link to be visible (indicating auth state is loaded)
      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();

      await page.getByRole('button', { name: 'Sign Out' }).click();

      // Should redirect to sign-in page
      await expect(page).toHaveURL('/sign-in');
    });
  });

  // Note: Admin navigation tests are skipped because there's no seeded admin user
  // To test admin functionality, add an admin user to the seed file
  test.describe('Admin Navigation', () => {
    test.skip('should display Admin link for admin users', async ({ page }) => {
      // This test requires a seeded admin user
      await page.goto('/');
      await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    });

    test.skip('should navigate to Admin panel', async ({ page }) => {
      // This test requires a seeded admin user
      await page.goto('/');
      await page.getByRole('link', { name: 'Admin' }).click();
      await expect(page).toHaveURL('/admin');
    });
  });
});

test.describe('Footer', () => {
  test('should display OPPRS description', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Open Pinball Player Ranking System')).toBeVisible();
  });

  test('should display GitHub link', async ({ page }) => {
    await page.goto('/');

    const githubLink = page.getByRole('link', { name: /github/i });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/themcaffee/OPPR');
    await expect(githubLink).toHaveAttribute('target', '_blank');
  });

  test('should not display Rankings, Tournaments, or Players links in footer', async ({
    page,
  }) => {
    await page.goto('/');

    // The footer should not have duplicate navigation links
    // Check that there are no links in the footer element specifically
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'Rankings' })).not.toBeVisible();
    await expect(footer.getByRole('link', { name: 'Tournaments' })).not.toBeVisible();
    await expect(footer.getByRole('link', { name: 'Players' })).not.toBeVisible();
  });
});
