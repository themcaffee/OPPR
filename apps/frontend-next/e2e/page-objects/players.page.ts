import { type Page, type Locator, expect } from '@playwright/test';

export class PlayerProfilePage {
  readonly page: Page;

  // Header elements
  readonly backLink: Locator;
  readonly playerName: Locator;
  readonly ratedBadge: Locator;
  readonly eventsUntilRated: Locator;

  // Stats cards
  readonly ratingCard: Locator;
  readonly ratingValue: Locator;
  readonly ratingDeviation: Locator;
  readonly rankingCard: Locator;
  readonly rankingValue: Locator;
  readonly rankingPoints: Locator;
  readonly eventsCard: Locator;
  readonly eventsValue: Locator;
  readonly avgPositionCard: Locator;

  // Performance stats
  readonly performanceStatsSection: Locator;
  readonly firstPlacesValue: Locator;
  readonly topThreeValue: Locator;
  readonly bestFinishValue: Locator;
  readonly avgEfficiencyValue: Locator;

  // Tournament history
  readonly tournamentHistorySection: Locator;
  readonly tournamentHistoryTable: Locator;
  readonly tournamentRows: Locator;
  readonly noResultsMessage: Locator;

  // States
  readonly loadingState: Locator;
  readonly errorState: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header elements
    this.backLink = page.getByRole('link', { name: '← Back to rankings' });
    this.playerName = page.getByRole('heading', { level: 1 });
    this.ratedBadge = page.getByText('Rated', { exact: true });
    this.eventsUntilRated = page.getByText(/more events? to rated/);

    // Stats cards - located by their label text
    this.ratingCard = page.locator('.text-center').filter({ hasText: 'Rating' });
    this.ratingValue = this.ratingCard.locator('.text-2xl');
    this.ratingDeviation = page.getByText(/RD:/);
    this.rankingCard = page.locator('.text-center').filter({ hasText: 'Ranking' });
    this.rankingValue = this.rankingCard.locator('.text-2xl');
    this.rankingPoints = page.getByText(/pts$/);
    this.eventsCard = page.locator('.text-center').filter({ hasText: /^Events$/ });
    this.eventsValue = this.eventsCard.locator('.text-2xl');
    this.avgPositionCard = page.locator('.text-center').filter({ hasText: 'Avg Position' });

    // Performance stats
    this.performanceStatsSection = page
      .getByRole('heading', { name: 'Performance Stats' })
      .locator('..');
    this.firstPlacesValue = page
      .locator('div')
      .filter({ hasText: 'First Places' })
      .locator('.text-xl');
    this.topThreeValue = page
      .locator('div')
      .filter({ hasText: 'Top 3 Finishes' })
      .locator('.text-xl');
    this.bestFinishValue = page.locator('div').filter({ hasText: 'Best Finish' }).locator('.text-xl');
    this.avgEfficiencyValue = page
      .locator('div')
      .filter({ hasText: 'Avg Efficiency' })
      .locator('.text-xl');

    // Tournament history
    this.tournamentHistorySection = page.getByText(/Tournament History/).locator('..');
    this.tournamentHistoryTable = page.locator('table');
    this.tournamentRows = page.locator('tbody tr');
    this.noResultsMessage = page.getByText('No tournament results yet.');

    // States
    this.loadingState = page.locator('.animate-pulse');
    this.errorState = page.getByText('Failed to load player');
  }

  async goto(playerId: string) {
    await this.page.goto(`/players/${playerId}`);
  }

  async expectLoaded(playerName: string) {
    await expect(this.loadingState.first()).toBeHidden({ timeout: 10000 });
    await expect(this.page.getByRole('heading', { name: playerName })).toBeVisible();
  }

  async expectBackLinkVisible() {
    await expect(this.backLink).toBeVisible();
    await expect(this.backLink).toHaveAttribute('href', '/rankings');
  }

  async goBackToRankings() {
    await this.backLink.click();
  }

  async expectRatingCardContent(rating: number, rd: number) {
    await expect(this.ratingValue).toContainText(String(Math.round(rating)));
    await expect(this.page.getByText(`RD: ${Math.round(rd)}`)).toBeVisible();
  }

  async expectRankingCardContent(ranking: number) {
    await expect(this.rankingValue).toContainText(`#${ranking}`);
  }

  async expectEventsCount(count: number) {
    await expect(this.eventsValue).toContainText(String(count));
  }

  async expectPerformanceStatsVisible() {
    await expect(this.performanceStatsSection).toBeVisible();
  }

  async expectPerformanceStatsHidden() {
    await expect(this.page.getByRole('heading', { name: 'Performance Stats' })).not.toBeVisible();
  }

  async expectTournamentHistoryVisible() {
    await expect(this.tournamentHistorySection).toBeVisible();
  }

  async expectTournamentInHistory(tournamentName: string) {
    await expect(this.page.getByRole('link', { name: tournamentName })).toBeVisible();
  }

  async clickTournament(tournamentName: string) {
    await this.page.getByRole('link', { name: tournamentName }).click();
  }

  async expectEventBoosterBadge(badgeText: string) {
    await expect(this.page.getByText(badgeText, { exact: true })).toBeVisible();
  }

  async expectNoTournamentResults() {
    await expect(this.noResultsMessage).toBeVisible();
  }

  async getTournamentCount(): Promise<number> {
    return await this.tournamentRows.count();
  }
}
