import { test, expect } from '@playwright/test';
import { SignInPage } from './page-objects/auth.page';
import { DashboardPage } from './page-objects/dashboard.page';

test.describe('Login Redirect Functionality', () => {
  test('should redirect to dashboard after login when accessing protected route', async ({
    page,
  }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    // Access protected dashboard route
    await page.goto('/dashboard');

    // Should be redirected to sign-in with redirect param
    await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fdashboard/);

    // Login
    await signInPage.signIn('test@example.com', 'TestPassword123!');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();
  });

  test('should display public landing page when accessing root without auth', async ({ page }) => {
    // Access root route (now public)
    await page.goto('/');

    // Should stay on landing page, not redirect to sign-in
    await expect(page).toHaveURL('/');

    // Should show landing page content
    await expect(page.getByRole('heading', { name: /Open Pinball Player Ranking System/i })).toBeVisible();
  });

  test('should handle URL-encoded redirect parameter', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    // Navigate with pre-encoded redirect param
    await signInPage.gotoWithRedirect('/dashboard');

    // Login
    await signInPage.signIn('test@example.com', 'TestPassword123!');

    // Should decode and redirect properly
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();
  });

  test('should redirect to dashboard when no redirect param', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    // Navigate directly to sign-in (no redirect param)
    await signInPage.goto();
    await expect(page).toHaveURL('/sign-in');

    // Login
    await signInPage.signIn('test@example.com', 'TestPassword123!');

    // Should redirect to default dashboard
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();
  });
});

test.describe('Login Validation', () => {
  test('should show validation error for missing email', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.passwordInput.fill('TestPassword123!');
    await signInPage.submitButton.click();

    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('should show validation error for missing password', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.emailInput.fill('test@example.com');
    await signInPage.submitButton.click();

    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  // Note: Invalid email format is handled by browser's HTML5 validation (type="email")
  // before the form submits, so Zod validation error won't appear in the UI
});

test.describe('Session Management', () => {
  test('should persist session across page reloads', async ({ page, context }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    await signInPage.goto();
    await signInPage.signIn('test@example.com', 'TestPassword123!');

    // Wait for dashboard to load
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();

    // Verify cookie exists
    const cookies = await context.cookies();
    const accessCookie = cookies.find((c) => c.name === 'opprs_access');
    expect(accessCookie).toBeDefined();

    // Reload page
    await page.reload();

    // Should still be on dashboard (not redirected to sign-in)
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();
  });

  test('should logout and redirect to sign-in', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login first
    await signInPage.goto();
    await signInPage.signIn('test@example.com', 'TestPassword123!');
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();

    // Logout - wait for navigation to sign-in
    await Promise.all([
      page.waitForURL('/sign-in'),
      dashboardPage.signOut(),
    ]);

    // Should be on sign-in page
    await expect(page).toHaveURL('/sign-in');
    await expect(signInPage.heading).toBeVisible();
  });

  test('should access protected routes after login', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    await signInPage.goto();
    await signInPage.signIn('test@example.com', 'TestPassword123!');
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();

    // Navigate to dashboard explicitly - should still work
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();
  });
});

test.describe('Login Security', () => {
  test('should not redirect to external URLs', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    // Attempt to inject external URL
    await page.goto('/sign-in?redirect=https://evil.com');
    await signInPage.signIn('test@example.com', 'TestPassword123!');

    // Should redirect to default dashboard, not external site
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();
  });

  test('should not redirect with protocol-relative URL', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    // Attempt protocol-relative URL injection
    await page.goto('/sign-in?redirect=//evil.com');
    await signInPage.signIn('test@example.com', 'TestPassword123!');

    // Should redirect to default dashboard, not external site
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();
  });

  test('should not redirect with javascript URL', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);

    // Attempt javascript URL injection
    await page.goto('/sign-in?redirect=javascript:alert(1)');
    await signInPage.signIn('test@example.com', 'TestPassword123!');

    // Should redirect to default dashboard, not execute javascript
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();
  });
});
