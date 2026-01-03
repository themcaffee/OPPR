import { type Page, type Locator, expect } from '@playwright/test';
import type { TestUser } from '../fixtures/test-user';

export class RegisterPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Create Account' });
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Confirm Password');
    this.submitButton = page.getByRole('button', { name: 'Create Account' });
    // Use specific class selector to avoid Next.js route announcer
    this.errorAlert = page.locator('.bg-red-50[role="alert"]');
    this.signInLink = page.getByRole('link', { name: /sign in/i });
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(user: TestUser) {
    await this.nameInput.fill(user.name);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    await this.submitButton.click();
  }

  async expectError(message: string | RegExp) {
    await expect(this.errorAlert).toContainText(message);
  }
}

export class SignInPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly createAccountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Sign In' });
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    // Use specific class selector to avoid Next.js route announcer
    this.errorAlert = page.locator('.bg-red-50[role="alert"]');
    this.createAccountLink = page.getByRole('link', { name: /create account/i });
  }

  async goto() {
    await this.page.goto('/sign-in');
  }

  async gotoWithRedirect(redirectPath: string) {
    await this.page.goto(`/sign-in?redirect=${encodeURIComponent(redirectPath)}`);
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await Promise.all([
      this.page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 10000 }),
      this.submitButton.click(),
    ]);
  }

  async expectError(message: string | RegExp) {
    await expect(this.errorAlert).toContainText(message);
  }
}

export class ProfilePage {
  readonly page: Page;
  readonly welcomeHeading: Locator;
  readonly goToDashboardLink: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeHeading = page.getByRole('heading', { name: /welcome to opprs/i });
    this.goToDashboardLink = page.getByRole('link', { name: /go to dashboard/i });
    this.signOutButton = page.getByRole('button', { name: /sign out/i });
  }

  async expectVisible() {
    await expect(this.welcomeHeading).toBeVisible();
  }
}
