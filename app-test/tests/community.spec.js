import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

// Each test uses a fresh community name (timestamped) so reruns don't collide
// with leftover docs in the test DB if a previous run died mid-way.
const uniqueName = (label) => `${label} ${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

test.describe('Community', () => {
  test('user can create a public community and see it on My tab', async ({ page }) => {
    await registerAndSignIn(page, 'community-a');
    await page.goto('/dashboard/community');

    await expect(page.getByText(/haven't joined any communities/i)).toBeVisible();

    const name = uniqueName('Iron Athletes');
    await page.getByRole('button', { name: /Create Community/i }).click();
    await page.getByPlaceholder('e.g. Iron Athletes').fill(name);
    await page.getByPlaceholder(/What's this community about/i).fill('Strength training crew');
    await page.getByRole('button', { name: /^Create Community$/i }).click();

    await expect(page.getByRole('heading', { name })).toBeVisible();
    await expect(page.getByText('Public').first()).toBeVisible();
  });

  test('private community is NOT visible to other users on Explore', async ({ page, context }) => {
    await registerAndSignIn(page, 'community-privA');
    await page.goto('/dashboard/community');

    const name = uniqueName('Secret Squad');
    await page.getByRole('button', { name: /Create Community/i }).click();
    await page.getByPlaceholder('e.g. Iron Athletes').fill(name);
    await page.getByText('Private', { exact: false }).first().click();
    await page.getByRole('button', { name: /^Create Community$/i }).click();
    await expect(page.getByRole('heading', { name })).toBeVisible();

    const pageB = await context.browser().newContext().then((c) => c.newPage());
    await registerAndSignIn(pageB, 'community-privB');
    await pageB.goto('/dashboard/community');
    await pageB.getByRole('button', { name: /Explore/i }).click();
    await expect(pageB.getByRole('heading', { name })).toHaveCount(0);
    await pageB.close();
  });

  test('public community by user A is visible and joinable by user B', async ({ page, context }) => {
    await registerAndSignIn(page, 'community-pubA');
    await page.goto('/dashboard/community');

    const name = uniqueName('Open Crew');
    await page.getByRole('button', { name: /Create Community/i }).click();
    await page.getByPlaceholder('e.g. Iron Athletes').fill(name);
    // Public is the default — no need to click the radio.
    await page.getByRole('button', { name: /^Create Community$/i }).click();
    await expect(page.getByRole('heading', { name })).toBeVisible();

    const pageB = await context.browser().newContext().then((c) => c.newPage());
    await registerAndSignIn(pageB, 'community-pubB');
    await pageB.goto('/dashboard/community');
    await pageB.getByRole('button', { name: /Explore/i }).click();

    const card = pageB.locator(`[data-testid="community-card"][data-community-name="${name}"]`);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: /^Join$/ }).click();

    // After joining, the community shows up on B's My tab.
    await pageB.getByRole('button', { name: /My Communities/i }).click();
    await expect(pageB.getByRole('heading', { name })).toBeVisible();

    await pageB.close();
  });

  test('owner can delete their own community', async ({ page }) => {
    await registerAndSignIn(page, 'community-del');
    await page.goto('/dashboard/community');

    const name = uniqueName('Disposable Crew');
    await page.getByRole('button', { name: /Create Community/i }).click();
    await page.getByPlaceholder('e.g. Iron Athletes').fill(name);
    await page.getByRole('button', { name: /^Create Community$/i }).click();
    await expect(page.getByRole('heading', { name })).toBeVisible();

    page.once('dialog', (d) => d.accept());
    const card = page.locator(`[data-testid="community-card"][data-community-name="${name}"]`);
    await card.getByRole('button', { name: /Delete/ }).click();

    await expect(page.getByRole('heading', { name })).toHaveCount(0);
  });
});
