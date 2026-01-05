import { type Page, type Locator, expect } from '@playwright/test';

export class AdminUsersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly usersTable: Locator;
  readonly loadingText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Users' });
    this.usersTable = page.locator('table');
    this.loadingText = page.getByText('Loading...');
  }

  async goto() {
    await this.page.goto('/admin/users');
  }

  async expectLoaded() {
    await expect(this.loadingText).toBeHidden({ timeout: 10000 });
    await expect(this.heading).toBeVisible();
  }

  async clickEditForUser(email: string) {
    const row = this.page.locator('tr').filter({ hasText: email });
    await row.getByRole('button', { name: 'Edit' }).click();
  }

  async getUserRow(email: string) {
    return this.page.locator('tr').filter({ hasText: email });
  }
}

export class AdminUserEditPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly roleSelect: Locator;
  readonly passwordInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly deleteButton: Locator;
  readonly loadingText: Locator;
  readonly errorAlert: Locator;
  readonly playerSearchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Edit User' });
    this.roleSelect = page.getByLabel('Role');
    this.passwordInput = page.getByLabel(/New Password/i);
    this.saveButton = page.getByRole('button', { name: /Save Changes/i });
    this.cancelButton = page.getByRole('button', { name: /Cancel/i }).first();
    this.deleteButton = page.getByRole('button', { name: /Delete User/i });
    this.loadingText = page.getByText('Loading...');
    this.errorAlert = page.locator('.bg-red-50');
    this.playerSearchInput = page.getByPlaceholder(/search for a player/i);
  }

  async goto(userId: string) {
    await this.page.goto(`/admin/users/${userId}`);
  }

  async expectLoaded() {
    await expect(this.loadingText).toBeHidden({ timeout: 10000 });
    await expect(this.heading).toBeVisible();
  }

  async setRole(role: 'USER' | 'ADMIN') {
    await this.roleSelect.selectOption(role);
  }

  async setPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async selectPlayer(playerName: string) {
    await this.playerSearchInput.focus();
    await this.page.getByText(playerName).click();
  }

  async clearPlayer() {
    // Find the clear button (X icon) within the player selector display
    const selectedPlayerContainer = this.page.locator('.relative').filter({
      has: this.page.locator('button svg'),
    });
    const clearButton = selectedPlayerContainer.locator('button').first();
    await clearButton.click();
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async deleteUser() {
    await this.deleteButton.click();
  }

  async confirmDelete() {
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  async cancelDelete() {
    await this.page.getByRole('button', { name: 'Cancel' }).last().click();
  }

  getEmailDisplay() {
    return this.page.locator('.bg-gray-50.border-gray-200');
  }
}
