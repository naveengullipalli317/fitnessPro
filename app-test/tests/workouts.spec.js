import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';
import { sampleWorkout, todayIso } from './helpers/data.js';

test.describe('Workouts', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndSignIn(page, 'workouts');
    await page.goto('/dashboard/workouts');
  });

  test('empty state appears for a brand-new account', async ({ page }) => {
    await expect(page.getByText(/No workouts logged yet/i)).toBeVisible();
  });

  test('user can log a workout and see it on the grid', async ({ page }) => {
    const w = sampleWorkout({ type: 'strength', duration: 50, caloriesBurned: 350 });

    await page.getByRole('button', { name: /Log Workout/i }).click();
    // Form input order: type(select), duration, calories, distance, date, notes
    await page.locator('form select').first().selectOption(w.type);
    const nums = page.locator('form input[type="number"]');
    await nums.nth(0).fill(String(w.duration));
    await nums.nth(1).fill(String(w.caloriesBurned));
    await page.locator('form input[type="date"]').fill(todayIso());
    await page.locator('form textarea').fill(w.notes);
    await page.getByRole('button', { name: /Save Workout/i }).click();

    await expect(page.getByText(/No workouts logged yet/i)).not.toBeVisible();
    await expect(page.getByText('strength').first()).toBeVisible();
    await expect(page.getByText(`${w.duration}`).first()).toBeVisible();
  });

  test('multiple workouts render as cards', async ({ page }) => {
    const types = ['cardio', 'yoga'];
    for (const t of types) {
      await page.getByRole('button', { name: /Log Workout/i }).click();
      await page.locator('form select').first().selectOption(t);
      await page.locator('form input[type="number"]').first().fill('30');
      await page.getByRole('button', { name: /Save Workout/i }).click();
    }
    for (const t of types) {
      await expect(page.getByText(t).first()).toBeVisible();
    }
  });

  test('user can delete a workout', async ({ page }) => {
    // Log one workout, then verify deletion shrinks the visible delete-button
    // count by exactly one (resilient to whatever else this shared test user
    // already has).
    await page.getByRole('button', { name: /Log Workout/i }).click();
    await page.locator('form select').first().selectOption('pilates');
    await page.locator('form input[type="number"]').first().fill('47');
    await page.getByRole('button', { name: /Save Workout/i }).click();

    // Wait for the save POST to flush so the new card is in the DOM.
    await expect(page.getByText(/Saving…/)).toHaveCount(0);

    const deleteButtons = page.getByRole('button', { name: /Delete/i });
    // The Delete button uses opacity-0 + group-hover:opacity-100, so it's
    // not "visible" until hovered. Skip visibility, count() works regardless.
    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0
    );
    const before = await deleteButtons.count();
    expect(before).toBeGreaterThan(0);

    page.once('dialog', (d) => d.accept());
    const deleteResp = page.waitForResponse(
      (r) => r.url().includes('/workouts/') && r.request().method() === 'DELETE'
    );
    await deleteButtons.first().click({ force: true });
    await deleteResp;

    await expect(deleteButtons).toHaveCount(before - 1);
  });
});
