const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders all 64 squares and the initial position', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Chess Game' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText("User's turn");
  await expect(page.getByRole('group', { name: 'Chessboard' }).getByRole('button')).toHaveCount(64);
  await expect(page.getByRole('button', { name: 'e2 white pawn' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'e7 black pawn' })).toBeVisible();
  await expect(page.locator('.move-history')).toContainText('No moves yet');
});

test('rejects an illegal pawn move without changing the board', async ({ page }) => {
  await page.getByRole('button', { name: 'e2 white pawn' }).click();
  await page.getByRole('button', { name: 'e5 empty square' }).click();

  await expect(page.getByRole('button', { name: 'e2 white pawn' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'e5 empty square' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText("User's turn");
  await expect(page.locator('.move-history')).toContainText('No moves yet');
});

test('plays a legal move and receives a legal CPU reply', async ({ page }) => {
  await page.getByRole('button', { name: 'e2 white pawn' }).click();
  await page.getByRole('button', { name: 'e4 empty square' }).click();

  await expect(page.getByRole('button', { name: 'e4 white pawn' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText(/CPU's turn/);

  // The CPU reply is random, so assert the turn and move count rather than a specific move.
  await expect(page.getByRole('status')).toContainText(/User's turn|Your turn/, { timeout: 10_000 });
  await expect(page.locator('.move-history')).toContainText(/e4\s+\S+/, { timeout: 10_000 });
});
