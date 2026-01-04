import { test, expect } from '@playwright/test';
import { SignInPage } from './page-objects/auth.page';
import { ProfilePage } from './page-objects/profile.page';

// Seeded test user credentials (from packages/db-prisma/prisma/seed.ts)
const SEEDED_USER = {
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
};

test.describe('Login Redirect Functionality', () => {
  test('should redirect to profile after login when accessing protected route', async ({
    page,
  }) => {
    const signInPage = new SignInPage(page);
    const profilePage = new ProfilePage(page);

    // Access protected profile route
    await page.goto('/profile');

    // Should be redirected to sign-in with redirect param
    await expect(page).toHaveURL(/\/sign-in\?redirect=%2Fprofile/);

    // Login with seeded test user
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);

    // Should redirect to profile
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();
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
    const profilePage = new ProfilePage(page);

    // Navigate with pre-encoded redirect param
    await signInPage.gotoWithRedirect('/profile');

    // Login with seeded test user
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);

    // Should decode and redirect properly
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();
  });

  test('should redirect to profile when no redirect param', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const profilePage = new ProfilePage(page);

    // Navigate directly to sign-in (no redirect param)
    await signInPage.goto();
    await expect(page).toHaveURL('/sign-in');

    // Login with seeded test user
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);

    // Should redirect to default profile
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();
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
    const profilePage = new ProfilePage(page);

    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);

    // Wait for profile to load
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();

    // Verify cookie exists
    const cookies = await context.cookies();
    const accessCookie = cookies.find((c) => c.name === 'opprs_access');
    expect(accessCookie).toBeDefined();

    // Reload page
    await page.reload();

    // Should still be on profile (not redirected to sign-in)
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();
  });

  test('should logout and redirect to sign-in', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const profilePage = new ProfilePage(page);

    // Login first
    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();

    // Logout - wait for navigation to sign-in
    await Promise.all([page.waitForURL('/sign-in'), profilePage.signOut()]);

    // Should be on sign-in page
    await expect(page).toHaveURL('/sign-in');
    await expect(signInPage.heading).toBeVisible();
  });

  test('should access protected routes after login', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const profilePage = new ProfilePage(page);

    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();

    // Navigate to profile explicitly - should still work
    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();
  });
});

test.describe('Login Security', () => {
  test('should not redirect to external URLs', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const profilePage = new ProfilePage(page);

    // Attempt to inject external URL
    await page.goto('/sign-in?redirect=https://evil.com');
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);

    // Should redirect to default profile, not external site
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();
  });

  test('should not redirect with protocol-relative URL', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const profilePage = new ProfilePage(page);

    // Attempt protocol-relative URL injection
    await page.goto('/sign-in?redirect=//evil.com');
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);

    // Should redirect to default profile, not external site
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();
  });

  test('should not redirect with javascript URL', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const profilePage = new ProfilePage(page);

    // Attempt javascript URL injection
    await page.goto('/sign-in?redirect=javascript:alert(1)');
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);

    // Should redirect to default profile, not execute javascript
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();
  });
});
