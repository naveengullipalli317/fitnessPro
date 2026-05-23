import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndSignIn(page, 'notif');
    await page.goto('/dashboard');
  });

  test('bell icon visible in header for logged-in user', async ({ page }) => {
    await expect(
      page.locator('header').getByRole('button', { name: /Notifications|missed workouts/i })
    ).toBeVisible();
  });

  test('empty bell shows "all caught up" copy', async ({ page }) => {
    await page.locator('header').getByRole('button', { name: /Notifications|missed workouts/i }).click();
    await expect(page.getByText(/all caught up|missed session/i).first()).toBeVisible();
  });

  test('no banner appears on dashboard when there are no missed sessions', async ({ page }) => {
    await expect(page.getByText(/missed \d+ session/i)).toHaveCount(0);
  });

  test('clicking outside the bell closes the dropdown', async ({ page }) => {
    const trigger = page.locator('header').getByRole('button', { name: /Notifications|missed workouts/i });
    await trigger.click();
    const heading = page.getByText(/all caught up|missed session/i).first();
    await expect(heading).toBeVisible();
    // Click on a neutral area
    await page.mouse.click(10, 200);
    await expect(heading).not.toBeVisible();
  });
});
