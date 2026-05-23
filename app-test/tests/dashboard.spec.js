import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndSignIn(page, 'dash');
    await page.goto('/dashboard');
  });

  test('shows greeting, stat row, and three detail cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Hey /i })).toBeVisible();
    // Stat tiles
    for (const label of ['Sessions', 'Minutes', 'Calories', 'Avg Session']) {
      await expect(page.getByText(label, { exact: false }).first()).toBeVisible();
    }
    // Detail cards
    await expect(page.getByRole('heading', { name: 'Workout Mix' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent Workouts' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upcoming Goals' })).toBeVisible();
  });

  test('header nav links route to feature pages', async ({ page }) => {
    const links = [
      { name: 'Workouts', url: /\/dashboard\/workouts$/ },
      { name: 'Calendar', url: /\/dashboard\/calendar$/ },
      { name: 'Exercises', url: /\/dashboard\/exercises$/ },
      { name: 'Goals', url: /\/dashboard\/goals$/ },
      { name: 'Routines', url: /\/dashboard\/routines$/ },
      { name: 'Profile', url: /\/dashboard\/profile$/ },
    ];
    for (const l of links) {
      await page.locator('header').getByRole('link', { name: l.name }).click();
      await expect(page).toHaveURL(l.url);
    }
  });

  test('notification bell renders the empty state for a fresh user', async ({ page }) => {
    await page.getByRole('button', { name: /Notifications|missed workouts/i }).click();
    await expect(page.getByText(/all caught up|missed session/i).first()).toBeVisible();
  });
});
