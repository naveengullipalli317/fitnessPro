import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndSignIn(page, 'profile');
    await page.goto('/dashboard/profile');
  });

  test('cover, avatar, and identity cards render', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Athlete profile/i })).toHaveCount(0); // eyebrow, not heading
    await expect(page.getByText(/Athlete profile/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Identity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fitness' })).toBeVisible();
  });

  test('user can edit and persist height/weight/fitness level', async ({ page }) => {
    await page.getByRole('button', { name: /Edit Profile/i }).click();
    await page.locator('input[type="number"]').nth(0).fill('30'); // age
    await page.locator('input[type="number"]').nth(1).fill('182'); // height
    await page.locator('input[type="number"]').nth(2).fill('80'); // weight
    await page.locator('select').last().selectOption('advanced');
    await page.getByRole('button', { name: /Save Changes/i }).click();

    await expect(page.getByText(/Profile updated/i)).toBeVisible();
    await expect(page.getByText('182 cm')).toBeVisible();
    await expect(page.getByText('80 kg')).toBeVisible();
    await expect(page.getByText('advanced', { exact: false })).toBeVisible();
  });

  test('logout button signs the user out and returns to home/login', async ({ page }) => {
    // Profile has its own Logout button (top-right) AND the global Header has
    // one — click the profile one explicitly to avoid the strict-mode collision.
    await page.locator('main').getByRole('button', { name: /Logout/i }).click();
    await expect(page).toHaveURL(/\/(login|)$/);
  });
});
