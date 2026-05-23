import { test, expect } from '@playwright/test';
import { buildTestUser, registerViaUi, signOut } from './helpers/user.js';

test.describe('Authentication', () => {
  test('Register page is reachable from public-layout header CTA', async ({ page }) => {
    // The marketing Home page has its own CTAs; the persistent header lives on
    // /about etc. Use that to verify the header's Join Free button works.
    await page.goto('/about');
    await page.locator('header').getByRole('link', { name: /Join Free/i }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: /Claim your strongest year/i })).toBeVisible();
  });

  test('Register → Onboarding → Dashboard happy path', async ({ page }) => {
    await registerViaUi(page, 'signup');
    // Onboarding step 1
    await expect(page.getByRole('heading', { name: /Welcome aboard/i })).toBeVisible();
    await page.getByPlaceholder('e.g. 28').fill('29');
    await page.getByRole('button', { name: /^Male$/ }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2
    await page.getByPlaceholder('e.g. 175').fill('178');
    await page.getByPlaceholder('e.g. 72.5').fill('74');
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3 — Intermediate
    await page.getByRole('button', { name: /Intermediate/i }).click();
    await page.getByRole('button', { name: /Save & Start Training/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: /Hey/i })).toBeVisible();
  });

  test('Onboarding "Skip for now" jumps straight to dashboard', async ({ page }) => {
    await registerViaUi(page, 'skip');
    await page.getByRole('button', { name: /Skip for now/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('Login fails with bad credentials', async ({ page }) => {
    // Watch the API response directly — it's the most reliable signal that
    // the credentials were rejected (the UI's error pill is brief).
    const loginResponse = page.waitForResponse(
      (r) => r.url().includes('/auth/login') && r.request().method() === 'POST'
    );
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('nobody@pwtest.example.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: /Sign In/i }).click();
    const res = await loginResponse;
    expect(res.status()).toBeGreaterThanOrEqual(400);
    await expect(page).toHaveURL(/\/login/);
  });

  test('Login with valid credentials lands on dashboard', async ({ page }) => {
    const user = buildTestUser('login');
    await page.goto('/register');
    await page.getByPlaceholder('Alex Johnson').fill(user.name);
    await page.getByPlaceholder('you@example.com').fill(user.email);
    const pw = page.getByPlaceholder('••••••••');
    await pw.nth(0).fill(user.password);
    await pw.nth(1).fill(user.password);
    await page.getByRole('button', { name: /Create my account/i }).click();
    await expect(page).toHaveURL(/\/onboarding/);

    // Skip onboarding, log out, then log back in.
    await page.getByRole('button', { name: /Skip for now/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await signOut(page);

    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill(user.email);
    await page.getByPlaceholder('••••••••').fill(user.password);
    await page.getByRole('button', { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('Protected routes redirect unauthenticated users away', async ({ page }) => {
    await page.goto('/dashboard');
    // PrivateRoute should bounce us to login (or home).
    await expect(page).toHaveURL(/\/(login|)$/);
  });
});
