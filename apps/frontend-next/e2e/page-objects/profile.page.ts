import { type Page, type Locator, expect } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  // Header elements
  readonly heading: Locator;
  readonly headerLogo: Locator;
  readonly signOutButton: Locator;

  // Loading state
  readonly loadingText: Locator;

  // No player profile state
  readonly noPlayerProfileCard: Locator;
  readonly noPlayerProfileHeading: Locator;

  // Leaderboard card
  readonly leaderboardCard: Locator;
  readonly leaderboardHeading: Locator;
  readonly leaderboardList: Locator;
  readonly currentPlayerHighlight: Locator;
  readonly noPlayersMessage: Locator;

  // Player Stats card
  readonly playerStatsCard: Locator;

  // Recent Results table
  readonly recentResultsCard: Locator;
  readonly recentResultsTable: Locator;
  readonly noResultsMessage: Locator;

  // Activity Feed
  readonly activityFeed: Locator;
  readonly recentTournamentsHeading: Locator;
  readonly noTournamentsMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header elements
    this.heading = page.getByRole('heading', { name: 'Profile' });
    this.headerLogo = page.getByRole('link', { name: 'OPPRS' });
    this.signOutButton = page.getByRole('button', { name: /sign out|logout/i });

    // Loading state
    this.loadingText = page.getByText('Loading profile...');

    // No player profile state
    this.noPlayerProfileCard = page.getByText('No Player Profile Linked');
    this.noPlayerProfileHeading = page.getByRole('heading', {
      name: 'No Player Profile Linked',
    });

    // Leaderboard card
    this.leaderboardCard = page.getByText('Leaderboard').locator('..');
    this.leaderboardHeading = page.getByRole('heading', { name: 'Leaderboard' });
    this.leaderboardList = page.locator('ul').filter({ has: page.locator('li') });
    this.currentPlayerHighlight = page.getByText('(You)');
    this.noPlayersMessage = page.getByText('No players ranked yet.');

    // Player Stats card
    this.playerStatsCard = page.getByRole('heading', { name: 'Performance Stats' }).locator('..');

    // Recent Results table
    this.recentResultsCard = page.getByText('Recent Results').locator('..');
    this.recentResultsTable = page.locator('table');
    this.noResultsMessage = page.getByText('No tournament results yet.');

    // Activity Feed
    this.activityFeed = page.getByText('Recent Tournaments').locator('..');
    this.recentTournamentsHeading = page.getByRole('heading', { name: 'Recent Tournaments' });
    this.noTournamentsMessage = page.getByText('No recent tournaments.');
  }

  async goto() {
    await this.page.goto('/profile');
  }

  async expectLoaded() {
    await expect(this.loadingText).toBeHidden({ timeout: 10000 });
    await expect(this.heading).toBeVisible();
  }

  async expectNoPlayerProfile() {
    await expect(this.noPlayerProfileCard).toBeVisible();
  }

  async expectPlayerProfile() {
    await expect(this.noPlayerProfileCard).not.toBeVisible();
  }

  async expectLeaderboardVisible() {
    await expect(this.leaderboardHeading).toBeVisible();
  }

  async expectActivityFeedVisible() {
    await expect(this.recentTournamentsHeading).toBeVisible();
  }

  async expectPlayerStatsVisible() {
    await expect(this.playerStatsCard).toBeVisible();
  }

  async expectRecentResultsVisible() {
    await expect(this.recentResultsCard).toBeVisible();
  }

  async expectCurrentPlayerHighlighted() {
    await expect(this.currentPlayerHighlight).toBeVisible();
  }

  async getLeaderboardEntries(): Promise<number> {
    const entries = await this.page.locator('ul li').count();
    return entries;
  }

  async signOut() {
    await this.signOutButton.click();
  }
}
