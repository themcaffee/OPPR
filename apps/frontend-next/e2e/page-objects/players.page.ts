import { type Page, type Locator, expect } from '@playwright/test';

export class PlayersPage {
  readonly page: Page;

  // Header elements
  readonly heading: Locator;
  readonly description: Locator;

  // Search elements
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly clearButton: Locator;

  // Table elements
  readonly table: Locator;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly playerLinks: Locator;

  // Pagination
  readonly paginationInfo: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;

  // States
  readonly loadingState: Locator;
  readonly emptyState: Locator;
  readonly noSearchResults: Locator;
  readonly errorState: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header elements
    this.heading = page.getByRole('heading', { name: 'Players', level: 1 });
    this.description = page.getByText('Browse all players and view their profiles.');

    // Search elements
    this.searchInput = page.getByPlaceholder('Search players...');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.clearButton = page.getByRole('button', { name: 'Clear' });

    // Table elements
    this.table = page.locator('table');
    this.tableHeaders = page.locator('th');
    this.tableRows = page.locator('tbody tr');
    this.playerLinks = page.locator('tbody tr a');

    // Pagination
    this.paginationInfo = page.getByText(/Page \d+ of \d+/);
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.nextButton = page.getByRole('button', { name: 'Next' });

    // States
    this.loadingState = page.locator('.animate-pulse');
    this.emptyState = page.getByText('No players yet.');
    this.noSearchResults = page.getByText('No players found matching your search.');
    this.errorState = page.getByText('Failed to load players');
  }

  async goto() {
    await this.page.goto('/players');
  }

  async expectLoaded() {
    await expect(this.loadingState.first()).toBeHidden({ timeout: 10000 });
    await expect(this.heading).toBeVisible();
    await expect(this.description).toBeVisible();
  }

  async expectTableVisible() {
    await expect(this.table).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Player' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Rating' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Rank' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Events' })).toBeVisible();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    // Wait for loading to complete
    await expect(this.loadingState.first()).toBeHidden({ timeout: 5000 });
  }

  async clearSearch() {
    await this.clearButton.click();
    // Wait for loading to complete
    await expect(this.loadingState.first()).toBeHidden({ timeout: 5000 });
  }

  async getPlayerCount(): Promise<number> {
    return await this.tableRows.count();
  }

  async expectPlayerInList(playerName: string) {
    await expect(this.page.getByRole('link', { name: playerName })).toBeVisible();
  }

  async expectPlayerNotInList(playerName: string) {
    await expect(this.page.getByRole('link', { name: playerName })).not.toBeVisible();
  }

  async clickPlayer(playerName: string) {
    await this.page.getByRole('link', { name: playerName }).click();
  }

  async expectPaginationVisible() {
    await expect(this.paginationInfo).toBeVisible();
    await expect(this.previousButton).toBeVisible();
    await expect(this.nextButton).toBeVisible();
  }

  async expectPaginationHidden() {
    await expect(this.paginationInfo).not.toBeVisible();
  }

  async goToNextPage() {
    await this.nextButton.click();
    await expect(this.loadingState.first()).toBeHidden({ timeout: 5000 });
  }

  async goToPreviousPage() {
    await this.previousButton.click();
    await expect(this.loadingState.first()).toBeHidden({ timeout: 5000 });
  }

  async expectRatedBadge(playerName: string) {
    const row = this.page.locator('tr').filter({ hasText: playerName });
    await expect(row.getByText('Rated')).toBeVisible();
  }
}

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
    this.backLink = page.getByRole('link', { name: '← Back to players' });
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
    this.performanceStatsSection = page.getByRole('heading', { name: 'Performance Stats' }).locator('..');
    this.firstPlacesValue = page.locator('div').filter({ hasText: 'First Places' }).locator('.text-xl');
    this.topThreeValue = page.locator('div').filter({ hasText: 'Top 3 Finishes' }).locator('.text-xl');
    this.bestFinishValue = page.locator('div').filter({ hasText: 'Best Finish' }).locator('.text-xl');
    this.avgEfficiencyValue = page.locator('div').filter({ hasText: 'Avg Efficiency' }).locator('.text-xl');

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
    await expect(this.backLink).toHaveAttribute('href', '/players');
  }

  async goBackToPlayers() {
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
