import { test, expect } from '@playwright/test';
import { buildTestUser } from './helpers/user.js';

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

test.describe('Password reset', () => {
  test('user requests reset, completes flow, signs in with new password', async ({ page }) => {
    // Set up a real user via the API so we have known credentials.
    const user = buildTestUser('reset-happy');
    const reg = await page.context().request.post(`${API_URL}/auth/register`, {
      data: { name: user.name, email: user.email, password: user.password },
    });
    expect(reg.ok()).toBeTruthy();

    // 1. Visit /forgot-password from the login page
    await page.goto('/login');
    await page.getByRole('link', { name: /forgot/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);

    // 2. Submit email — generic success + dev-mode token returned inline
    await page.getByPlaceholder('you@example.com').fill(user.email);
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByText(/a reset link has been sent/i)).toBeVisible();

    // The dev-token panel renders a link with the reset URL.
    const resetLink = page.getByRole('link', { name: /reset-password\?token=/i });
    await expect(resetLink).toBeVisible();
    const href = await resetLink.getAttribute('href');
    expect(href).toMatch(/\/reset-password\?token=[a-f0-9]{64}$/);

    // 3. Open the reset link, set new password
    await page.goto(href);
    const newPassword = 'BrandNew1234';
    await page.getByPlaceholder('••••••••').first().fill(newPassword);
    await page.getByPlaceholder('••••••••').nth(1).fill(newPassword);
    await page.getByRole('button', { name: /reset password/i }).click();

    // 4. UI shows success and auto-redirects to /login
    await expect(page.getByText(/password reset/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    // 5. Old password is rejected — new password is accepted
    const oldLogin = await page.context().request.post(`${API_URL}/auth/login`, {
      data: { email: user.email, password: user.password },
    });
    expect(oldLogin.status()).toBe(401);

    const newLogin = await page.context().request.post(`${API_URL}/auth/login`, {
      data: { email: user.email, password: newPassword },
    });
    expect(newLogin.ok()).toBeTruthy();
  });

  test('forgot-password for unknown email shows same generic success (anti-enumeration)', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('you@example.com').fill('definitely-not-a-real-user@nowhere.example');
    await page.getByRole('button', { name: /send reset link/i }).click();
    await expect(page.getByText(/a reset link has been sent/i)).toBeVisible();
    // No dev-token panel for fake emails.
    await expect(page.getByText(/Dev mode/i)).toHaveCount(0);
  });

  test('malformed token shows clear UI message; submit is gated', async ({ page }) => {
    await page.goto('/reset-password?token=abc');
    await expect(page.getByText(/malformed or incomplete/i)).toBeVisible();
    // The submit button stays disabled even if you type a password.
    await page.getByPlaceholder('••••••••').first().fill('Valid12345');
    await page.getByPlaceholder('••••••••').nth(1).fill('Valid12345');
    await expect(page.getByRole('button', { name: /reset password/i })).toBeDisabled();
  });

  test('stale token after a successful reset is rejected (single-use)', async ({ page }) => {
    const user = buildTestUser('reset-replay');
    await page.context().request.post(`${API_URL}/auth/register`, {
      data: { name: user.name, email: user.email, password: user.password },
    });
    // Mint a token via API
    const r = await page.context().request.post(`${API_URL}/auth/forgot-password`, {
      data: { email: user.email },
    });
    const body = await r.json();
    const token = body._devToken;
    expect(token).toMatch(/^[a-f0-9]{64}$/);

    // First use: succeeds via UI
    await page.goto(`/reset-password?token=${token}`);
    const newPass = 'AfterReset12';
    await page.getByPlaceholder('••••••••').first().fill(newPass);
    await page.getByPlaceholder('••••••••').nth(1).fill(newPass);
    await page.getByRole('button', { name: /reset password/i }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    // Second use of the same token: rejected
    const replay = await page.context().request.post(`${API_URL}/auth/reset-password`, {
      data: { token, password: 'AnotherOne123' },
    });
    expect(replay.status()).toBe(400);
    const replayBody = await replay.json();
    expect(replayBody.message).toMatch(/invalid or expired/i);
  });
});
