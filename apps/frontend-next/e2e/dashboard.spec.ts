import { test, expect } from '@playwright/test';
import { RegisterPage, SignInPage } from './page-objects/auth.page';
import { DashboardPage } from './page-objects/dashboard.page';
import { generateTestUser, type TestUser } from './fixtures/test-user';

// Seeded test user credentials (from packages/db-prisma/prisma/seed.ts)
// This user is linked to "Alice Champion" who has tournament history and stats
const SEEDED_USER = {
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
  playerName: 'Alice Champion',
  rating: 1850,
  ratingDeviation: 50,
  ranking: 5,
};

test.describe('Dashboard - Authentication', () => {
  test('should redirect to sign-in when not authenticated', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should display dashboard without errors after authentication', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);
    const errors: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    // Use seeded user credentials
    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL('/dashboard');
    await dashboardPage.expectLoaded();

    expect(errors).toEqual([]);
    await expect(dashboardPage.heading).toBeVisible();
  });
});

test.describe('Dashboard - New User (Fresh Registration)', () => {
  // Note: New users automatically get a player profile created during registration.
  // However, they won't have any tournament results or stats until they participate.
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser('dashboard');
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(testUser);
    await expect(page).toHaveURL('/profile');
  });

  test('should display dashboard with player profile for new user', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // New users have a player profile (created during registration)
    await dashboardPage.expectPlayerProfile();
  });

  test('should display leaderboard card with seeded players', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
    await dashboardPage.expectLeaderboardVisible();

    // Should show seeded players in leaderboard
    const entries = await dashboardPage.getLeaderboardEntries();
    expect(entries).toBeGreaterThan(0);
  });

  test('should display activity feed with recent tournaments', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();
    await dashboardPage.expectActivityFeedVisible();
  });

  test('should have OPPRS logo linking to home', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    // Verify the OPPRS logo is visible and links to home
    await expect(dashboardPage.headerLogo).toBeVisible();
    await expect(dashboardPage.headerLogo).toHaveAttribute('href', '/');
  });

  test('should sign out and redirect to sign-in', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const signInPage = new SignInPage(page);

    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    await Promise.all([page.waitForURL('/sign-in'), dashboardPage.signOut()]);

    await expect(page).toHaveURL('/sign-in');
    await expect(signInPage.heading).toBeVisible();
  });
});

test.describe('Dashboard - Leaderboard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    const signInPage = new SignInPage(page);

    // Use seeded user for leaderboard tests
    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL('/dashboard');
  });

  test('should toggle between Ranking and Rating leaderboard views', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectLeaderboardVisible();

    // Initially on Ranking view
    await expect(dashboardPage.rankingToggle).toHaveClass(/bg-blue-600/);

    // Switch to Rating view
    await dashboardPage.switchToRatingLeaderboard();
    await expect(dashboardPage.ratingToggle).toHaveClass(/bg-blue-600/);

    // Switch back to Ranking view
    await dashboardPage.switchToRankingLeaderboard();
    await expect(dashboardPage.rankingToggle).toHaveClass(/bg-blue-600/);
  });

  test('should show ranking positions in Ranking view', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectLeaderboardVisible();

    // Ranking view should show positions in the leaderboard list
    const leaderboardList = page.locator('ul.space-y-2');
    await expect(leaderboardList.locator('li').first()).toBeVisible();
    // Verify list contains ranking format (#N)
    await expect(leaderboardList.locator('li').first().getByText(/#\d+/)).toBeVisible();
  });

  test('should show rating numbers in Rating view', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.switchToRatingLeaderboard();

    // Rating view should show rating numbers (4 digit numbers without #)
    const leaderboardList = page.locator('ul.space-y-2');
    await expect(leaderboardList.locator('li').first()).toBeVisible();
    // Verify list contains rating format (4-digit number)
    await expect(leaderboardList.locator('li').first().getByText(/\d{4}/)).toBeVisible();
  });

  test('should display seeded players in leaderboard', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();

    // Verify seeded player names are visible in the leaderboard list
    const leaderboardList = page.locator('ul.space-y-2');
    // Check that we have at least the seeded players (we seeded 5 + any auto-created from registrations)
    const count = await leaderboardList.locator('li').count();
    expect(count).toBeGreaterThanOrEqual(4);
    // Verify "Bob Wizard" is in the list (won't conflict with welcome message)
    await expect(leaderboardList.getByText('Bob Wizard')).toBeVisible();
  });
});

test.describe('Dashboard - With Player Profile (Seeded User)', () => {
  test.beforeEach(async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display welcome message with player name', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectWelcomeMessage(SEEDED_USER.playerName);
  });

  test('should display Rating card with correct values', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectPlayerProfile();

    // Verify rating card content
    await dashboardPage.expectRatingCardContent(SEEDED_USER.rating, SEEDED_USER.ratingDeviation);

    // Alice is a rated player (has 25 events)
    await expect(dashboardPage.ratedPlayerBadge).toBeVisible();
  });

  test('should display Ranking card with world ranking', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectPlayerProfile();

    // Verify ranking card content
    await dashboardPage.expectRankingCardContent(SEEDED_USER.ranking);
    await expect(dashboardPage.rankingPoints).toBeVisible();
  });

  test('should display Quick Actions card with navigation links', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectQuickActionsVisible();
  });

  test('should display Player Stats card', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectPlayerStatsVisible();
  });

  test('should display Recent Results table with tournament history', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectRecentResultsVisible();

    // Verify tournament names from seed data are visible in the results table
    const resultsTable = page.locator('table');
    await expect(
      resultsTable.getByRole('cell', { name: /World Pinball Championship 2024/ })
    ).toBeVisible();
  });

  test('should highlight current player in leaderboard', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.expectLeaderboardVisible();

    // Current player (Alice Champion) should be highlighted with "(You)"
    await dashboardPage.expectCurrentPlayerHighlighted();
  });

  test('should navigate to results page via Quick Actions', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.viewResultsLink.click();

    await expect(page).toHaveURL('/dashboard/results');
  });

  test('should navigate to tournaments page via Quick Actions', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.findTournamentsLink.click();

    await expect(page).toHaveURL('/dashboard/tournaments');
  });

  test('should navigate to profile page via Quick Actions', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    await dashboardPage.expectLoaded();
    await dashboardPage.updateProfileLink.click();

    await expect(page).toHaveURL('/dashboard/profile');
  });
});

test.describe('Dashboard - Error Handling', () => {
  test('should not show JavaScript errors during normal usage', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const dashboardPage = new DashboardPage(page);
    const errors: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await dashboardPage.expectLoaded();

    // Interact with the dashboard
    await dashboardPage.switchToRatingLeaderboard();
    await dashboardPage.switchToRankingLeaderboard();

    // Verify no errors occurred
    expect(errors).toEqual([]);
  });
});
