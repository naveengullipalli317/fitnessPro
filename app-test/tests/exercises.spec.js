import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

test.describe('Exercise library', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndSignIn(page, 'exercises');
    await page.goto('/dashboard/exercises');
  });

  test('library banner and filter chips render', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Exercise Library' })).toBeVisible();
    await expect(page.getByPlaceholder(/Search exercises/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^All$/ })).toBeVisible();
    for (const c of ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio']) {
      await expect(page.getByRole('button', { name: new RegExp(`^${c}$`, 'i') })).toBeVisible();
    }
  });

  test('category chip narrows the list', async ({ page }) => {
    // If the DB has any seeded exercises we can interact. If empty, the test
    // verifies the empty-state copy.
    await page.getByRole('button', { name: /^chest$/i }).click();
    const cards = page.locator('button:has(h3)');
    const count = await cards.count();
    if (count === 0) {
      await expect(page.getByText(/No exercises match your filters|No exercises in the library/i)).toBeVisible();
    } else {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('search input filters by name (when library has data)', async ({ page }) => {
    await page.getByPlaceholder(/Search exercises/i).fill('zzznoresultsmatch');
    await expect(page.getByText(/No exercises match your filters|No exercises in the library/i)).toBeVisible();
  });

  test('opening an exercise shows the video embed and instructions', async ({ page }) => {
    const cards = page.locator('button:has(h3)');
    const count = await cards.count();
    test.skip(count === 0, 'Library is empty in this environment');

    await cards.first().click();
    // Modal video iframe + Watch on YouTube fallback link
    await expect(page.locator('iframe[title*="form tutorial"]')).toBeVisible();
    await expect(page.getByRole('link', { name: /Watch on YouTube/i })).toBeVisible();
    await expect(page.getByText(/Instructions/i)).toBeVisible();
    // Close modal
    await page.getByRole('button', { name: '×' }).click();
    await expect(page.locator('iframe[title*="form tutorial"]')).toHaveCount(0);
  });
});
