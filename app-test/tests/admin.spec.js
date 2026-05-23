import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerAndSignIn } from './helpers/user.js';

const execp = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// app-test/tests/.. = app-test/, then ../fitness-tracking-backend
const BACKEND_DIR = path.resolve(__dirname, '..', '..', 'fitness-tracking-backend');

/**
 * Promote a user to admin by shelling out to the same CLI an operator would
 * use in production. Inherits NODE_ENV=test from the parent process so it
 * targets the test DB.
 */
async function promoteToAdmin(email) {
  await execp(`node src/scripts/promote-admin.js ${email}`, {
    cwd: BACKEND_DIR,
    env: { ...process.env, NODE_ENV: 'test' },
  });
}

test.describe('Admin', () => {
  test('non-admin user is bounced from /admin to /dashboard', async ({ page }) => {
    await registerAndSignIn(page, 'admin-reject');
    await page.goto('/admin');
    // AdminRoute does a Navigate replace to /dashboard for non-admins.
    await expect(page).toHaveURL(/\/dashboard($|\/)/);
  });

  test('admin sees the Operations Console and a users table', async ({ page }) => {
    const me = await registerAndSignIn(page, 'admin-yes');
    await promoteToAdmin(me.email);

    await page.goto('/admin');
    await expect(page.getByText('Operations Console')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Admin Dashboard/i })).toBeVisible();
    // KPI tile
    await expect(page.getByText('Total users')).toBeVisible();
    // The admin's own row should appear in the users table.
    await expect(page.getByText(me.email)).toBeVisible();
    // Admin badge in the row
    await expect(page.getByText('admin', { exact: false }).first()).toBeVisible();
  });

  test('admin can drill into a community and kick a member', async ({ page, context }) => {
    // Admin (will moderate)
    const admin = await registerAndSignIn(page, 'admin-kick');
    await promoteToAdmin(admin.email);

    // Community owner — separate user, creates the community via the SPA
    const ownerPage = await context.browser().newContext().then((c) => c.newPage());
    await registerAndSignIn(ownerPage, 'kick-owner');
    await ownerPage.goto('/dashboard/community');
    const communityName = `KickTest ${Date.now()}`;
    await ownerPage.getByRole('button', { name: /Create Community/i }).click();
    await ownerPage.getByPlaceholder('e.g. Iron Athletes').fill(communityName);
    await ownerPage.getByRole('button', { name: /^Create Community$/i }).click();
    await expect(ownerPage.getByRole('heading', { name: communityName })).toBeVisible();
    await ownerPage.close();

    // Member who will get kicked
    const memberPage = await context.browser().newContext().then((c) => c.newPage());
    const memberUser = await registerAndSignIn(memberPage, 'kick-victim');
    await memberPage.goto('/dashboard/community');
    await memberPage.getByRole('button', { name: /Explore/i }).click();
    const card = memberPage.locator(`[data-testid="community-card"][data-community-name="${communityName}"]`);
    await card.getByRole('button', { name: /^Join$/ }).click();
    // Confirm they're in
    await memberPage.getByRole('button', { name: /My Communities/i }).click();
    await expect(memberPage.getByRole('heading', { name: communityName })).toBeVisible();
    await memberPage.close();

    // Admin: navigate from /admin to the community detail page
    await page.goto('/admin');
    await page.getByRole('link', { name: communityName }).click();
    await expect(page).toHaveURL(/\/admin\/communities\//);
    await expect(page.getByRole('heading', { name: communityName })).toBeVisible();

    // Kick the member
    const memberRow = page.locator('tr', { hasText: memberUser.email });
    page.once('dialog', (d) => d.accept());
    await memberRow.getByRole('button', { name: /^Kick$/ }).click();

    // The row should disappear after reload
    await expect(page.locator('tr', { hasText: memberUser.email })).toHaveCount(0);
  });

  test('admin cannot kick the community owner', async ({ page, context }) => {
    const admin = await registerAndSignIn(page, 'admin-noowner');
    await promoteToAdmin(admin.email);

    const ownerPage = await context.browser().newContext().then((c) => c.newPage());
    const owner = await registerAndSignIn(ownerPage, 'kick-noowner-owner');
    await ownerPage.goto('/dashboard/community');
    const name = `OwnerKickTest ${Date.now()}`;
    await ownerPage.getByRole('button', { name: /Create Community/i }).click();
    await ownerPage.getByPlaceholder('e.g. Iron Athletes').fill(name);
    await ownerPage.getByRole('button', { name: /^Create Community$/i }).click();
    await expect(ownerPage.getByRole('heading', { name })).toBeVisible();
    await ownerPage.close();

    await page.goto('/admin');
    await page.getByRole('link', { name }).click();
    const ownerRow = page.locator('tr', { hasText: owner.email });
    // Owner row's "Kick" button is replaced by a disabled "Owner" label.
    await expect(ownerRow.getByRole('button', { name: 'Owner' })).toBeDisabled();
  });

  test('Admin link only renders in header for admins', async ({ page, context }) => {
    // Regular user: no Admin link.
    await registerAndSignIn(page, 'admin-link-no');
    await page.goto('/dashboard');
    await expect(page.locator('header').getByRole('link', { name: 'Admin' })).toHaveCount(0);

    // Admin: link visible.
    const adminPage = await context.browser().newContext().then((c) => c.newPage());
    const admin = await registerAndSignIn(adminPage, 'admin-link-yes');
    await promoteToAdmin(admin.email);
    await adminPage.goto('/dashboard');
    await expect(adminPage.locator('header').getByRole('link', { name: 'Admin' })).toBeVisible();
    await adminPage.close();
  });
});
