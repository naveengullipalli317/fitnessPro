import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';
import { futureDateIso } from './helpers/data.js';

test.describe('Goals', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndSignIn(page, 'goals');
    await page.goto('/dashboard/goals');
  });

  test('empty state for a fresh user', async ({ page }) => {
    await expect(page.getByText(/No goals set yet/i)).toBeVisible();
  });

  test('create a weight-loss goal and see progress bar', async ({ page }) => {
    await page.getByRole('button', { name: /Add Goal/i }).click();
    await page.locator('form select').first().selectOption('weightLoss');
    await page.locator('form input[type="number"]').fill('6');
    await page.locator('form input[type="date"]').fill(futureDateIso(45));
    const goalResponse = page.waitForResponse(
      (r) => r.url().includes('/goals') && r.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /Save Goal/i }).click();
    await goalResponse;

    await expect(page.getByRole('heading', { name: /weight Loss/i })).toBeVisible();
    await expect(page.getByText(/In Progress/i).first()).toBeVisible();
    await expect(page.getByText(/0\s*\/\s*6/).first()).toBeVisible();
  });

  test('create a distance goal alongside an existing one', async ({ page }) => {
    // First goal
    await page.getByRole('button', { name: /Add Goal/i }).click();
    await page.locator('form select').first().selectOption('weightLoss');
    await page.locator('form input[type="number"]').fill('3');
    await page.locator('form input[type="date"]').fill(futureDateIso(30));
    const goalResponse = page.waitForResponse(
      (r) => r.url().includes('/goals') && r.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /Save Goal/i }).click();
    await goalResponse;
    // Second goal
    await page.getByRole('button', { name: /Add Goal/i }).click();
    await page.locator('form select').first().selectOption('distance');
    await page.locator('form input[type="number"]').fill('100');
    await page.locator('form input[type="date"]').fill(futureDateIso(90));
    const goalResponse2 = page.waitForResponse(
      (r) => r.url().includes('/goals') && r.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /Save Goal/i }).click();
    await goalResponse2;

    // Prior tests in the same spec may have left additional weight-loss
    // goals on this shared user, so use .first() to avoid strict mode.
    await expect(page.getByRole('heading', { name: /weight Loss/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /distance/i }).first()).toBeVisible();
  });
});
