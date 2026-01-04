import { test, expect } from '@playwright/test';
import { PlayersPage, PlayerProfilePage } from './page-objects/players.page';

// Seeded test data (from packages/db-prisma/prisma/seed.ts)
const SEEDED_PLAYERS = {
  alice: {
    name: 'Alice Champion',
    rating: 1850,
    ratingDeviation: 50,
    ranking: 5,
    isRated: true,
    eventCount: 25,
  },
  bob: {
    name: 'Bob Wizard',
    rating: 1750,
    ratingDeviation: 60,
    ranking: 12,
    isRated: true,
    eventCount: 18,
  },
  charlie: {
    name: 'Charlie Flipper',
    rating: 1650,
    ratingDeviation: 75,
    ranking: 28,
    isRated: true,
    eventCount: 12,
  },
  diana: {
    name: 'Diana Tilt',
    rating: 1550,
    ratingDeviation: 100,
    ranking: 45,
    isRated: true,
    eventCount: 8,
  },
  eve: {
    name: 'Eve Plunger',
    rating: 1300,
    ratingDeviation: 150,
    ranking: null,
    isRated: false,
    eventCount: 3,
  },
};

test.describe('Players Page - Navigation', () => {
  test('should navigate to /players from header', async ({ page }) => {
    await page.goto('/');

    // Click the Players link in the header
    await page.getByRole('link', { name: 'Players' }).first().click();

    await expect(page).toHaveURL('/players');
    await expect(page.getByRole('heading', { name: 'Players', level: 1 })).toBeVisible();
  });
});

test.describe('Players Page - Player List', () => {
  test('should display page without JavaScript errors', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const errors: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    await playersPage.goto();
    await playersPage.expectLoaded();

    expect(errors).toEqual([]);
  });

  test('should display player list with seeded data', async ({ page }) => {
    const playersPage = new PlayersPage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.expectTableVisible();

    // Verify seeded players are visible
    await playersPage.expectPlayerInList(SEEDED_PLAYERS.alice.name);
    await playersPage.expectPlayerInList(SEEDED_PLAYERS.bob.name);
    await playersPage.expectPlayerInList(SEEDED_PLAYERS.charlie.name);
  });

  test('should display table headers', async ({ page }) => {
    const playersPage = new PlayersPage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.expectTableVisible();
  });

  test('should show rated badge for rated players', async ({ page }) => {
    const playersPage = new PlayersPage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();

    // Alice is a rated player
    await playersPage.expectRatedBadge(SEEDED_PLAYERS.alice.name);
  });
});

test.describe('Players Page - Search', () => {
  test('should filter players by name search', async ({ page }) => {
    const playersPage = new PlayersPage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();

    // Search for Alice
    await playersPage.search('Alice');

    await playersPage.expectPlayerInList(SEEDED_PLAYERS.alice.name);
    // Other players should not be visible (assuming search is case-insensitive)
  });

  test('should show no results message for non-matching search', async ({ page }) => {
    const playersPage = new PlayersPage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();

    // Search for a non-existent player
    await playersPage.search('NonexistentPlayerXYZ');

    await expect(playersPage.noSearchResults).toBeVisible();
  });

  test('should clear search and show all players again', async ({ page }) => {
    const playersPage = new PlayersPage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();

    // First verify Bob is visible
    await playersPage.expectPlayerInList(SEEDED_PLAYERS.bob.name);

    // Search for Alice only
    await playersPage.search('Alice');
    await playersPage.expectPlayerInList(SEEDED_PLAYERS.alice.name);

    // Clear search
    await playersPage.clearSearch();

    // All players should be visible again
    await playersPage.expectPlayerInList(SEEDED_PLAYERS.alice.name);
    await playersPage.expectPlayerInList(SEEDED_PLAYERS.bob.name);
  });

  test('should hide pagination during search', async ({ page }) => {
    const playersPage = new PlayersPage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();

    // Search for a specific player
    await playersPage.search('Alice');

    // Pagination should be hidden during search
    await playersPage.expectPaginationHidden();
  });
});

test.describe('Players Page - Navigation to Profile', () => {
  test('should navigate to player profile when clicking player name', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();

    // Click on Alice's name
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);

    // Should navigate to player profile
    await expect(page).toHaveURL(/\/players\/[a-z0-9-]+/);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);
  });
});

test.describe('Player Profile Page', () => {
  test('should display player profile without JavaScript errors', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);
    const errors: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    // Navigate to a player profile
    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    expect(errors).toEqual([]);
  });

  test('should display back link to players list', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    await playerProfilePage.expectBackLinkVisible();
  });

  test('should navigate back to players list via back link', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    await playerProfilePage.goBackToPlayers();

    await expect(page).toHaveURL('/players');
    await playersPage.expectLoaded();
  });

  test('should display rating card with correct values', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    await playerProfilePage.expectRatingCardContent(
      SEEDED_PLAYERS.alice.rating,
      SEEDED_PLAYERS.alice.ratingDeviation
    );
  });

  test('should display ranking card with position', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    await playerProfilePage.expectRankingCardContent(SEEDED_PLAYERS.alice.ranking!);
  });

  test('should display rated badge for rated player', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    await expect(playerProfilePage.ratedBadge).toBeVisible();
  });

  test('should display events until rated for unrated player', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.eve.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.eve.name);

    // Eve has 3 events, needs 2 more to be rated
    await expect(playerProfilePage.eventsUntilRated).toBeVisible();
  });

  test('should display performance stats section', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    await playerProfilePage.expectPerformanceStatsVisible();
  });

  test('should display tournament history', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    await playerProfilePage.expectTournamentHistoryVisible();

    // Alice has results in World Championship and Spring Classics
    await playerProfilePage.expectTournamentInHistory('World Pinball Championship 2024');
    await playerProfilePage.expectTournamentInHistory('Spring Classics 2024');
  });

  test('should display event booster badges in tournament history', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    // World Championship is a Major (M badge), Spring Classics is Certified (C badge)
    await playerProfilePage.expectEventBoosterBadge('M');
    await playerProfilePage.expectEventBoosterBadge('C');
  });

  test('should navigate to tournament from history', async ({ page }) => {
    const playersPage = new PlayersPage(page);
    const playerProfilePage = new PlayerProfilePage(page);

    await playersPage.goto();
    await playersPage.expectLoaded();
    await playersPage.clickPlayer(SEEDED_PLAYERS.alice.name);
    await playerProfilePage.expectLoaded(SEEDED_PLAYERS.alice.name);

    // Click on a tournament
    await playerProfilePage.clickTournament('World Pinball Championship 2024');

    // Should navigate to tournament page
    await expect(page).toHaveURL(/\/tournaments\/[a-z0-9-]+/);
  });
});
