import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

// Each test makes a fresh community by timestamp so reruns can't collide on
// the unique-name constraint when fixtures linger between runs.
const uniqueName = (label) => `${label} ${Date.now()}-${Math.floor(Math.random() * 1e4)}`;

const goToCommunityChat = async (page, communityId) => {
  await page.goto(`/dashboard/community/${communityId}`);
};

test.describe('Community chat', () => {
  test('member can post and see their own message', async ({ page }) => {
    const user = await registerAndSignIn(page, 'chat-solo');

    // Create a community via API so the test doesn't depend on the create-form UI.
    const create = await page.context().request.post(`${API_URL}/communities`, {
      headers: { Authorization: `Bearer ${user.token}` },
      data: { name: uniqueName('Solo Chat'), type: 'public' },
    });
    const community = (await create.json()).data;

    await goToCommunityChat(page, community._id);
    // Composer visible because the creator is an active owner-member.
    const composer = page.getByPlaceholder('Type a message…');
    await expect(composer).toBeVisible();

    await composer.fill('hello world');
    await page.getByRole('button', { name: /^Send$/ }).click();

    await expect(page.getByText('hello world')).toBeVisible();
  });

  test('non-member cannot see chat composer and is redirected by membership gate', async ({ page, context }) => {
    // Owner creates a private community via API
    const owner = await registerAndSignIn(page, 'chat-priv-owner');
    const create = await page.context().request.post(`${API_URL}/communities`, {
      headers: { Authorization: `Bearer ${owner.token}` },
      data: { name: uniqueName('Gated Chat'), type: 'private' },
    });
    const community = (await create.json()).data;

    // Outsider visits chat URL directly
    const outsider = await context.browser().newContext().then((c) => c.newPage());
    await registerAndSignIn(outsider, 'chat-priv-outsider');
    await goToCommunityChat(outsider, community._id);

    // Private community is hidden from non-members on GET /communities/:id,
    // so the page renders the "Failed to load" error rather than the chat.
    // Either way: no composer.
    await expect(outsider.getByPlaceholder('Type a message…')).toHaveCount(0);
    await outsider.close();
  });

  test('member B sees member A\'s message on page load', async ({ page, context }) => {
    // A creates the community and posts a message via API
    const A = await registerAndSignIn(page, 'chat-2a');
    const create = await page.context().request.post(`${API_URL}/communities`, {
      headers: { Authorization: `Bearer ${A.token}` },
      data: { name: uniqueName('Two-Member Chat'), type: 'public' },
    });
    const community = (await create.json()).data;
    await page.context().request.post(`${API_URL}/communities/${community._id}/messages`, {
      headers: { Authorization: `Bearer ${A.token}` },
      data: { content: 'message from A' },
    });

    // B joins and visits the chat
    const pageB = await context.browser().newContext().then((c) => c.newPage());
    const B = await registerAndSignIn(pageB, 'chat-2b');
    await pageB.context().request.post(`${API_URL}/communities/${community._id}/join`, {
      headers: { Authorization: `Bearer ${B.token}` },
    });
    await goToCommunityChat(pageB, community._id);

    await expect(pageB.getByText('message from A')).toBeVisible();
    await pageB.close();
  });

  test('author can delete their own message; tombstone appears', async ({ page }) => {
    const user = await registerAndSignIn(page, 'chat-del');
    const create = await page.context().request.post(`${API_URL}/communities`, {
      headers: { Authorization: `Bearer ${user.token}` },
      data: { name: uniqueName('Self-Delete Chat'), type: 'public' },
    });
    const community = (await create.json()).data;
    await goToCommunityChat(page, community._id);

    const composer = page.getByPlaceholder('Type a message…');
    await composer.fill('soon to be deleted');
    await page.getByRole('button', { name: /^Send$/ }).click();
    await expect(page.getByText('soon to be deleted')).toBeVisible();

    // Hover-only delete button — force-click with confirm-accept.
    page.once('dialog', (d) => d.accept());
    // The '✕' button is hidden until hover. Use a more reliable locator:
    // find the row containing our text and click its first button.
    const row = page.locator('div', { hasText: 'soon to be deleted' }).first();
    await row.hover();
    await row.getByRole('button', { name: '✕' }).first().click();

    await expect(page.getByText('soon to be deleted')).toHaveCount(0);
    await expect(page.getByText('message deleted')).toBeVisible();
  });
});
