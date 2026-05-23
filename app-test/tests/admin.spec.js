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
