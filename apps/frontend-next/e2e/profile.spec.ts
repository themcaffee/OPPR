import { test, expect } from '@playwright/test';
import { RegisterPage, SignInPage } from './page-objects/auth.page';
import { ProfilePage } from './page-objects/profile.page';
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

test.describe('Profile - Authentication', () => {
  test('should redirect to sign-in when not authenticated', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('should display profile without errors after authentication', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const profilePage = new ProfilePage(page);
    const errors: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    // Use seeded user credentials
    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL('/profile');
    await profilePage.expectLoaded();

    expect(errors).toEqual([]);
    await expect(profilePage.heading).toBeVisible();
  });
});

test.describe('Profile - New User (Fresh Registration)', () => {
  // Note: New users automatically get a player profile created during registration.
  // However, they won't have any tournament results or stats until they participate.
  let testUser: TestUser;

  test.beforeEach(async ({ page }) => {
    testUser = generateTestUser('profile');
    const registerPage = new RegisterPage(page);

    await registerPage.goto();
    await registerPage.register(testUser);
    await expect(page).toHaveURL('/profile');
  });

  test('should display profile with player profile for new user', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.goto();
    await profilePage.expectLoaded();

    // New users have a player profile (created during registration)
    await profilePage.expectPlayerProfile();
  });

  test('should display leaderboard card with seeded players', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.goto();
    await profilePage.expectLoaded();
    await profilePage.expectLeaderboardVisible();

    // Should show seeded players in leaderboard
    const entries = await profilePage.getLeaderboardEntries();
    expect(entries).toBeGreaterThan(0);
  });

  test('should display activity feed with recent tournaments', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.goto();
    await profilePage.expectLoaded();
    await profilePage.expectActivityFeedVisible();
  });

  test('should have OPPRS logo linking to home', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.goto();
    await profilePage.expectLoaded();

    // Verify the OPPRS logo is visible and links to home
    await expect(profilePage.headerLogo).toBeVisible();
    await expect(profilePage.headerLogo).toHaveAttribute('href', '/');
  });

  test('should sign out and redirect to sign-in', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    const signInPage = new SignInPage(page);

    await profilePage.goto();
    await profilePage.expectLoaded();

    await Promise.all([page.waitForURL('/sign-in'), profilePage.signOut()]);

    await expect(page).toHaveURL('/sign-in');
    await expect(signInPage.heading).toBeVisible();
  });
});

test.describe('Profile - Leaderboard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    const signInPage = new SignInPage(page);

    // Use seeded user for leaderboard tests
    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL('/profile');
  });

  test('should toggle between Ranking and Rating leaderboard views', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.expectLeaderboardVisible();

    // Initially on Ranking view
    await expect(profilePage.rankingToggle).toHaveClass(/bg-blue-600/);

    // Switch to Rating view
    await profilePage.switchToRatingLeaderboard();
    await expect(profilePage.ratingToggle).toHaveClass(/bg-blue-600/);

    // Switch back to Ranking view
    await profilePage.switchToRankingLeaderboard();
    await expect(profilePage.rankingToggle).toHaveClass(/bg-blue-600/);
  });

  test('should show ranking positions in Ranking view', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.expectLeaderboardVisible();

    // Ranking view should show positions in the leaderboard list
    const leaderboardList = page.locator('ul.space-y-2');
    await expect(leaderboardList.locator('li').first()).toBeVisible();
    // Verify list contains ranking format (#N)
    await expect(leaderboardList.locator('li').first().getByText(/#\d+/)).toBeVisible();
  });

  test('should show rating numbers in Rating view', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.switchToRatingLeaderboard();

    // Rating view should show rating numbers (4 digit numbers without #)
    const leaderboardList = page.locator('ul.space-y-2');
    await expect(leaderboardList.locator('li').first()).toBeVisible();
    // Verify list contains rating format (4-digit number)
    await expect(leaderboardList.locator('li').first().getByText(/\d{4}/)).toBeVisible();
  });

  test('should display seeded players in leaderboard', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();

    // Verify seeded player names are visible in the leaderboard list
    const leaderboardList = page.locator('ul.space-y-2');
    // Check that we have at least the seeded players (we seeded 5 + any auto-created from registrations)
    const count = await leaderboardList.locator('li').count();
    expect(count).toBeGreaterThanOrEqual(4);
    // Verify "Bob Wizard" is in the list (won't conflict with welcome message)
    await expect(leaderboardList.getByText('Bob Wizard')).toBeVisible();
  });
});

test.describe('Profile - With Player Profile (Seeded User)', () => {
  test.beforeEach(async ({ page }) => {
    const signInPage = new SignInPage(page);

    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL('/profile');
  });

  test('should display Rating card with correct values', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.expectPlayerProfile();

    // Verify rating card content
    await profilePage.expectRatingCardContent(SEEDED_USER.rating, SEEDED_USER.ratingDeviation);

    // Alice is a rated player (has 25 events)
    await expect(profilePage.ratedPlayerBadge).toBeVisible();
  });

  test('should display Ranking card with world ranking', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.expectPlayerProfile();

    // Verify ranking card content
    await profilePage.expectRankingCardContent(SEEDED_USER.ranking);
    await expect(profilePage.rankingPoints).toBeVisible();
  });

  test('should display Quick Actions card with navigation links', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.expectQuickActionsVisible();
  });

  test('should display Player Stats card', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.expectPlayerStatsVisible();
  });

  test('should display Recent Results table with tournament history', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.expectRecentResultsVisible();

    // Verify tournament names from seed data are visible in the results table
    const resultsTable = page.locator('table');
    await expect(
      resultsTable.getByRole('cell', { name: /World Pinball Championship 2024/ })
    ).toBeVisible();
  });

  test('should highlight current player in leaderboard', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.expectLeaderboardVisible();

    // Current player (Alice Champion) should be highlighted with "(You)"
    await profilePage.expectCurrentPlayerHighlighted();
  });

  test('should navigate to results page via Quick Actions', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.viewResultsLink.click();

    await expect(page).toHaveURL('/profile/results');
  });

  test('should navigate to tournaments page via Quick Actions', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.findTournamentsLink.click();

    await expect(page).toHaveURL('/profile/tournaments');
  });

  test('should navigate to settings page via Quick Actions', async ({ page }) => {
    const profilePage = new ProfilePage(page);

    await profilePage.expectLoaded();
    await profilePage.updateProfileLink.click();

    await expect(page).toHaveURL('/profile/settings');
  });
});

test.describe('Profile - Error Handling', () => {
  test('should not show JavaScript errors during normal usage', async ({ page }) => {
    const signInPage = new SignInPage(page);
    const profilePage = new ProfilePage(page);
    const errors: string[] = [];

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    await signInPage.goto();
    await signInPage.signIn(SEEDED_USER.email, SEEDED_USER.password);
    await profilePage.expectLoaded();

    // Interact with the profile page
    await profilePage.switchToRatingLeaderboard();
    await profilePage.switchToRankingLeaderboard();

    // Verify no errors occurred
    expect(errors).toEqual([]);
  });
});
