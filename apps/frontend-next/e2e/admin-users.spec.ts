import { test, expect } from '@playwright/test';
import { SignInPage } from './page-objects/auth.page';
import { AdminUsersPage, AdminUserEditPage } from './page-objects/admin-users.page';
import { generateTestUser } from './fixtures/test-user';

// Seeded admin user credentials (from packages/db-prisma/prisma/seed.ts)
const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
};

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as admin user
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.signIn(ADMIN_USER.email, ADMIN_USER.password);

    // Wait for navigation to complete
    await expect(page).toHaveURL('/profile', { timeout: 10000 });
  });

  test.describe('Users List', () => {
    test('should display users list for admin', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      await usersPage.goto();
      await usersPage.expectLoaded();

      await expect(page).toHaveURL('/admin/users');
      await expect(usersPage.usersTable).toBeVisible();
    });

    test('should show admin user in the list', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      await usersPage.goto();
      await usersPage.expectLoaded();

      // The admin user we logged in as should be in the list
      await expect(page.getByRole('cell', { name: ADMIN_USER.email })).toBeVisible();
    });

    test('should navigate to edit page when clicking Edit', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      await usersPage.goto();
      await usersPage.expectLoaded();

      await usersPage.clickEditForUser(ADMIN_USER.email);

      await expect(page).toHaveURL(/\/admin\/users\/[a-zA-Z0-9-]+/);
    });
  });

  test.describe('Edit User Page', () => {
    test('should display edit page correctly', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      const editPage = new AdminUserEditPage(page);

      await usersPage.goto();
      await usersPage.expectLoaded();
      await usersPage.clickEditForUser(ADMIN_USER.email);

      await editPage.expectLoaded();
      await expect(page.getByRole('main').getByText(ADMIN_USER.email)).toBeVisible();
    });

    test('should show role selector', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      const editPage = new AdminUserEditPage(page);

      await usersPage.goto();
      await usersPage.expectLoaded();
      await usersPage.clickEditForUser(ADMIN_USER.email);

      await editPage.expectLoaded();
      await expect(editPage.roleSelect).toBeVisible();
      await expect(editPage.roleSelect).toHaveValue('ADMIN');
    });

    test('should show password reset field', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      const editPage = new AdminUserEditPage(page);

      await usersPage.goto();
      await usersPage.expectLoaded();
      await usersPage.clickEditForUser(ADMIN_USER.email);

      await editPage.expectLoaded();
      await expect(editPage.passwordInput).toBeVisible();
      await expect(page.getByText(/Leave blank to keep current password/i)).toBeVisible();
    });

    test('should show linked player section', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      const editPage = new AdminUserEditPage(page);

      await usersPage.goto();
      await usersPage.expectLoaded();
      await usersPage.clickEditForUser(ADMIN_USER.email);

      await editPage.expectLoaded();
      await expect(page.getByText('Linked Player')).toBeVisible();
    });

    test('should navigate back on Cancel click', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      const editPage = new AdminUserEditPage(page);

      await usersPage.goto();
      await usersPage.expectLoaded();
      await usersPage.clickEditForUser(ADMIN_USER.email);

      await editPage.expectLoaded();
      await editPage.cancel();

      await expect(page).toHaveURL('/admin/users');
    });

    test('should show delete confirmation dialog', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      const editPage = new AdminUserEditPage(page);

      await usersPage.goto();
      await usersPage.expectLoaded();
      await usersPage.clickEditForUser(ADMIN_USER.email);

      await editPage.expectLoaded();
      await editPage.deleteUser();

      await expect(page.getByText(/Are you sure you want to delete/)).toBeVisible();
    });

    test('should close delete dialog on Cancel', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      const editPage = new AdminUserEditPage(page);

      await usersPage.goto();
      await usersPage.expectLoaded();
      await usersPage.clickEditForUser(ADMIN_USER.email);

      await editPage.expectLoaded();
      await editPage.deleteUser();

      await expect(page.getByText(/Are you sure you want to delete/)).toBeVisible();
      await editPage.cancelDelete();

      await expect(page.getByText(/Are you sure you want to delete/)).toBeHidden();
    });
  });

  test.describe('Edit User with New Test User', () => {
    test('should create and edit a test user', async ({ page }) => {
      // First, register a new user
      const testUser = generateTestUser('admin-edit-test');

      // Go to register page and create user
      await page.goto('/register');
      await page.getByLabel('Name').fill(testUser.name);
      await page.getByLabel('Email').fill(testUser.email);
      await page.getByLabel('Password', { exact: true }).fill(testUser.password);
      await page.getByLabel('Confirm Password').fill(testUser.password);
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Create Account' }).click();

      await expect(page).toHaveURL('/profile', { timeout: 10000 });

      // Sign out and sign back in as admin
      await page.getByRole('button', { name: /sign out|logout/i }).click();
      await expect(page).toHaveURL('/sign-in');

      const signInPage = new SignInPage(page);
      await signInPage.signIn(ADMIN_USER.email, ADMIN_USER.password);
      await expect(page).toHaveURL('/profile', { timeout: 10000 });

      // Now go to admin users and find/edit the new user
      const usersPage = new AdminUsersPage(page);
      const editPage = new AdminUserEditPage(page);

      await usersPage.goto();
      await usersPage.expectLoaded();

      // Find and click edit for the new user
      await usersPage.clickEditForUser(testUser.email);
      await editPage.expectLoaded();

      // Verify we can see the user's email
      await expect(page.getByRole('main').getByText(testUser.email)).toBeVisible();

      // Change role to ADMIN
      await editPage.setRole('ADMIN');
      await editPage.save();

      // Should redirect back to users list
      await expect(page).toHaveURL('/admin/users');

      // Verify the role was updated by checking the list
      await usersPage.expectLoaded();
      const userRow = await usersPage.getUserRow(testUser.email);
      await expect(userRow.locator('span', { hasText: 'ADMIN' })).toBeVisible();

      // Clean up: delete the test user
      await usersPage.clickEditForUser(testUser.email);
      await editPage.expectLoaded();
      await editPage.deleteUser();
      await expect(page.getByText(/Are you sure you want to delete/)).toBeVisible();
      await editPage.confirmDelete();

      await expect(page).toHaveURL('/admin/users', { timeout: 10000 });
    });
  });
});
