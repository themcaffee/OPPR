import type { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly signInLink: Locator;
  readonly createAccountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'OPPRS' });
    this.signInLink = page.getByRole('link', { name: 'Sign In' });
    this.createAccountLink = page.getByRole('link', { name: 'Create Account' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickSignIn() {
    await this.signInLink.click();
  }

  async clickCreateAccount() {
    await this.createAccountLink.click();
  }
}
