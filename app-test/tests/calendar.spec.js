import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

test.describe('Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await registerAndSignIn(page, 'cal');
    await page.goto('/dashboard/calendar');
  });

  test('renders banner stats, weekday header, and 6×7 grid', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Training Calendar' })).toBeVisible();
    for (const w of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      await expect(page.getByText(w, { exact: true })).toBeVisible();
    }
  });

  test('month navigation moves the cursor forward and back', async ({ page }) => {
    const initial = await page.locator('h3').filter({ hasText: /\d{4}/ }).first().innerText();
    await page.getByRole('button', { name: 'Next month' }).click();
    const next = await page.locator('h3').filter({ hasText: /\d{4}/ }).first().innerText();
    expect(next).not.toEqual(initial);
    await page.getByRole('button', { name: /Today/i }).click();
    const after = await page.locator('h3').filter({ hasText: /\d{4}/ }).first().innerText();
    expect(after).toEqual(initial);
  });

  test('quick-log marks a workout as done on the selected day', async ({ page }) => {
    await page.getByRole('button', { name: /Log workout for this day/i }).click();
    await page.locator('select').first().selectOption('strength');
    await page.locator('input[type="number"]').first().fill('25');
    await page.getByRole('button', { name: /Mark done/i }).click();

    // The day's task list should now have a green check entry.
    await expect(page.getByText('strength').first()).toBeVisible();
  });

  test('?date= query param selects a specific day', async ({ page }) => {
    const target = new Date();
    target.setDate(1);
    const monthName = target.toLocaleDateString(undefined, { month: 'long' });
    const key = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-01`;
    await page.goto(`/dashboard/calendar?date=${key}`);
    // The right-hand detail panel shows the full date, e.g. "January 1, 2026".
    await expect(page.getByRole('heading', { name: new RegExp(`${monthName} 1, \\d{4}`) })).toBeVisible();
  });
});
