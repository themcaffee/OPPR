import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly headerLogo: Locator;
  readonly signOutButton: Locator;
  readonly loadingText: Locator;
  readonly noPlayerProfileCard: Locator;
  readonly ratingCard: Locator;
  readonly rankingCard: Locator;
  readonly leaderboardCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.headerLogo = page.getByRole('link', { name: 'OPPRS' });
    this.signOutButton = page.getByRole('button', { name: 'Sign Out' });
    this.loadingText = page.getByText('Loading dashboard...');
    this.noPlayerProfileCard = page.getByText('No Player Profile Linked');
    this.ratingCard = page.getByText('Glicko Rating');
    this.rankingCard = page.getByText('World Ranking');
    this.leaderboardCard = page.getByText('Top Players');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectLoaded() {
    await expect(this.loadingText).toBeHidden({ timeout: 10000 });
    await expect(this.heading).toBeVisible();
  }

  async expectNoPlayerProfile() {
    await expect(this.noPlayerProfileCard).toBeVisible();
  }

  async expectPlayerProfile() {
    await expect(this.ratingCard).toBeVisible();
    await expect(this.rankingCard).toBeVisible();
  }

  async signOut() {
    await this.signOutButton.click();
  }
}
