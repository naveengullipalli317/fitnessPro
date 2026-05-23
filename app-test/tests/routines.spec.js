import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

test.describe('Routines', () => {
  test('user can create a private routine and see it on the Mine tab', async ({ page }) => {
    await registerAndSignIn(page, 'routines-a');
    await page.goto('/dashboard/routines');

    await expect(page.getByText(/haven't created any routines/i)).toBeVisible();

    await page.getByRole('button', { name: /Create Routine/i }).click();
    await page.getByPlaceholder('e.g. PPL Hypertrophy').fill('Solo PPL');
    await page.getByPlaceholder(/What is this routine for/i).fill('Private to me');
    await page.getByRole('button', { name: /^Create Routine$/i }).click();

    await expect(page.getByRole('heading', { name: 'Solo PPL' })).toBeVisible();
    await expect(page.getByText('Private').first()).toBeVisible();
  });

  test('regression — User B does NOT see User A\'s private routines', async ({ page, context }) => {
    // User A creates a private routine.
    await registerAndSignIn(page, 'routines-userA');
    await page.goto('/dashboard/routines');
    await page.getByRole('button', { name: /Create Routine/i }).click();
    await page.getByPlaceholder('e.g. PPL Hypertrophy').fill('User A Secret Plan');
    await page.getByRole('button', { name: /^Create Routine$/i }).click();
    await expect(page.getByRole('heading', { name: 'User A Secret Plan' })).toBeVisible();

    // Fresh context = fresh login as user B.
    const pageB = await context.browser().newContext().then((c) => c.newPage());
    await registerAndSignIn(pageB, 'routines-userB');
    await pageB.goto('/dashboard/routines');

    // Mine tab is empty for user B.
    await expect(pageB.getByText(/haven't created any routines/i)).toBeVisible();

    // Public tab should not show user A's private routine either.
    await pageB.getByRole('button', { name: /Public/i }).click();
    await expect(pageB.getByRole('heading', { name: 'User A Secret Plan' })).toHaveCount(0);

    await pageB.close();
  });

  test('public routine made by user A is visible to user B', async ({ page, context }) => {
    await registerAndSignIn(page, 'routines-publicA');
    await page.goto('/dashboard/routines');
    await page.getByRole('button', { name: /Create Routine/i }).click();
    await page.getByPlaceholder('e.g. PPL Hypertrophy').fill('Open Source Strength');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /^Create Routine$/i }).click();
    await expect(page.getByRole('heading', { name: 'Open Source Strength' }).first()).toBeVisible();

    const pageB = await context.browser().newContext().then((c) => c.newPage());
    await registerAndSignIn(pageB, 'routines-publicB');
    await pageB.goto('/dashboard/routines');
    await pageB.getByRole('button', { name: /Public/i }).click();
    // Prior test runs may have left other public routines with the same name
    // in the shared dev DB — using .first() is intentional.
    await expect(pageB.getByRole('heading', { name: 'Open Source Strength' }).first()).toBeVisible();
    await pageB.close();
  });

  test('user can delete their own routine', async ({ page }) => {
    await registerAndSignIn(page, 'routines-del');
    await page.goto('/dashboard/routines');
    await page.getByRole('button', { name: /Create Routine/i }).click();
    await page.getByPlaceholder('e.g. PPL Hypertrophy').fill('Throwaway Routine');
    await page.getByRole('button', { name: /^Create Routine$/i }).click();
    await expect(page.getByRole('heading', { name: 'Throwaway Routine' })).toBeVisible();

    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /Delete/i }).first().click();
    await expect(page.getByText(/haven't created any routines/i)).toBeVisible();
  });
});
