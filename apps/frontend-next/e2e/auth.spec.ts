import { test, expect } from '@playwright/test';
import { RegisterPage, SignInPage, ProfilePage } from './page-objects/auth.page';
import { generateTestUser, type TestUser } from './fixtures/test-user';

test.describe('User Registration', () => {
  let testUser: TestUser;

  test.beforeEach(() => {
    testUser = generateTestUser();
  });

  test('should display register page correctly', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();

    await expect(registerPage.heading).toBeVisible();
    await expect(page).toHaveURL('/register');
  });

  test('should register a new user successfully', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const profilePage = new ProfilePage(page);

    await registerPage.goto();
    await registerPage.register(testUser);

    await expect(page).toHaveURL('/profile');
    await profilePage.expectVisible();
  });

  test('should show validation error for weak password', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();

    await registerPage.nameInput.fill(testUser.name);
    await registerPage.emailInput.fill(testUser.email);
    await registerPage.passwordInput.fill('weak');
    await registerPage.confirmPasswordInput.fill('weak');
    await registerPage.submitButton.click();

    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test('should show error for password mismatch', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.goto();

    await registerPage.nameInput.fill(testUser.name);
    await registerPage.emailInput.fill(testUser.email);
    await registerPage.passwordInput.fill('StrongPassword123!');
    await registerPage.confirmPasswordInput.fill('DifferentPassword123!');
    await registerPage.submitButton.click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('should show error for duplicate email registration', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const profilePage = new ProfilePage(page);

    await registerPage.goto();
    await registerPage.register(testUser);
    await profilePage.expectVisible();

    await profilePage.signOutButton.click();

    await registerPage.goto();
    await registerPage.register(testUser);

    await registerPage.expectError(/already/i);
  });
});

test.describe('User Login', () => {
  test('should display sign-in page correctly', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();

    await expect(signInPage.heading).toBeVisible();
    await expect(page).toHaveURL('/sign-in');
  });

  test('should login and access protected routes', async ({ page, context }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    // Use seeded test user (from packages/db-prisma/prisma/seed.ts)
    await signInPage.emailInput.fill('e2e-test@example.com');
    await signInPage.passwordInput.fill('TestPassword123!');
    await signInPage.submitButton.click();

    // Wait for navigation to complete
    await expect(page).toHaveURL('/profile', { timeout: 10000 });

    // Verify auth cookies were set
    const cookies = await context.cookies();
    const accessCookie = cookies.find((c) => c.name === 'opprs_access');
    expect(accessCookie).toBeDefined();

    // Should be on profile (not redirected to sign-in)
    await expect(page).not.toHaveURL(/sign-in/);
  });

  test('should show validation error for missing fields', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.submitButton.click();

    // Use first() to handle multiple "required" error messages
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });
});
