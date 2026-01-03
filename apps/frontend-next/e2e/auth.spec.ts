import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/home.page';
import { RegisterPage, SignInPage, ProfilePage } from './page-objects/auth.page';
import { generateTestUser, type TestUser } from './fixtures/test-user';

test.describe('User Registration', () => {
  let testUser: TestUser;

  test.beforeEach(() => {
    testUser = generateTestUser();
  });

  test('should navigate from home to register page', async ({ page }) => {
    const homePage = new HomePage(page);
    const registerPage = new RegisterPage(page);

    await homePage.goto();
    await homePage.clickCreateAccount();

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

    await registerPage.expectError(/already exists/i);
  });
});

test.describe('User Login', () => {
  let registeredUser: TestUser;

  test.beforeAll(async ({ browser }) => {
    registeredUser = generateTestUser('login');
    const page = await browser.newPage();
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(registeredUser);
    await expect(page).toHaveURL('/profile');
    await page.close();
  });

  test('should navigate from home to sign-in page', async ({ page }) => {
    const homePage = new HomePage(page);
    const signInPage = new SignInPage(page);

    await homePage.goto();
    await homePage.clickSignIn();

    await expect(signInPage.heading).toBeVisible();
    await expect(page).toHaveURL('/sign-in');
  });

  test('should login with valid credentials', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.signIn(registeredUser.email, registeredUser.password);

    await expect(page).toHaveURL('/');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.signIn('nonexistent@example.com', 'WrongPassword123!');

    await signInPage.expectError(/invalid email or password/i);
  });

  test('should show validation error for missing fields', async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.submitButton.click();

    await expect(page.getByText(/required/i)).toBeVisible();
  });
});
