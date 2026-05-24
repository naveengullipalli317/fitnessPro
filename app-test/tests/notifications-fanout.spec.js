import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

const uniqueName = (label) => `${label} ${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

test.describe('Public-community fan-out', () => {
  test('B sees a notification when A creates a PUBLIC community', async ({ page, context }) => {
    // A creates the community via API (skips the UI to keep the test focused).
    const A = await registerAndSignIn(page, 'fanout-pubA');
    const name = uniqueName('Fan Public');
    const create = await page.context().request.post(`${API_URL}/communities`, {
      headers: { Authorization: `Bearer ${A.token}` },
      data: { name, type: 'public' },
    });
    expect(create.ok()).toBeTruthy();

    // B signs in fresh and visits the dashboard. The bell should be badged
    // and the entry should be visible inside the dropdown.
    const pageB = await context.browser().newContext().then((c) => c.newPage());
    await registerAndSignIn(pageB, 'fanout-pubB');
    // Important: B must register AFTER the community is created so the
    // fan-out reaches them. Wait — actually fan-out queries users at the
    // time of creation. Let's create a SECOND public community after B
    // registers so we're certain B is in the recipient list.
    const name2 = uniqueName('Fan Public 2');
    const create2 = await pageB.context().request.post(`${API_URL}/communities`, {
      headers: { Authorization: `Bearer ${A.token}` },
      data: { name: name2, type: 'public' },
    });
    expect(create2.ok()).toBeTruthy();
    // Give async fan-out a moment to fan out.
    await pageB.waitForTimeout(800);

    await pageB.goto('/dashboard');
    // The bell button has aria-label that includes the count when >0.
    const bell = pageB.locator('header').getByRole('button', { name: /Notifications|notifications/ }).first();
    await expect(bell).toBeVisible();
    await bell.click();

    // Notification title is "New community"; message mentions the community name.
    await expect(pageB.getByText('New community').first()).toBeVisible();
    await expect(pageB.getByText(name2)).toBeVisible();
    await pageB.close();
  });

  test('B does NOT get a notification when A creates a PRIVATE community', async ({ page, context }) => {
    // B exists first so it's in any fan-out recipient list.
    const pageB = await context.browser().newContext().then((c) => c.newPage());
    await registerAndSignIn(pageB, 'fanout-privB');

    const A = await registerAndSignIn(page, 'fanout-privA');
    const name = uniqueName('Fan Private');
    await page.context().request.post(`${API_URL}/communities`, {
      headers: { Authorization: `Bearer ${A.token}` },
      data: { name, type: 'private' },
    });
    await pageB.waitForTimeout(800);

    await pageB.goto('/dashboard');
    const bell = pageB.locator('header').getByRole('button', { name: /Notifications|notifications/ }).first();
    await bell.click();

    // The private community name must NOT appear anywhere in the bell.
    await expect(pageB.getByText(name)).toHaveCount(0);
    await pageB.close();
  });
});
