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


test('requires an explicit promotion choice in the browser', async ({ page }) => {
  const fen = '4k3/P7/8/8/8/8/8/4K3 w - - 0 1';
  await page.goto(`/?testFen=${encodeURIComponent(fen)}`);

  await page.getByRole('button', { name: 'a7 white pawn' }).click();
  await page.getByRole('button', { name: 'a8 empty square' }).click();

  await expect(page.getByRole('group', { name: 'Choose promotion piece' })).toBeVisible();
  await page.getByRole('button', { name: 'Promote to queen' }).click();
  await expect(page.getByRole('button', { name: 'a8 white queen' })).toBeVisible();
});

test('shows terminal outcome and reset starts a new game', async ({ page }) => {
  const fen = '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1';
  await page.goto(`/?testFen=${encodeURIComponent(fen)}`);

  await page.getByRole('button', { name: 'f7 white queen' }).click();
  await page.getByRole('button', { name: 'g7 empty square' }).click();
  await expect(page.getByRole('status')).toContainText(/checkmate/i);

  await page.getByRole('button', { name: 'Reset game' }).click();
  await expect(page.getByRole('status')).toHaveText("User's turn");
  await expect(page.getByRole('button', { name: 'e2 white pawn' })).toBeVisible();
  await expect(page.locator('.move-history')).toContainText('No moves yet');
});
