import { expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

/** Build a unique test user. Uses a real TLD so backend Joi validator accepts. */
export const buildTestUser = (label = 'pw') => {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return {
    name: `Playwright ${label}`,
    email: `pw-${label}-${stamp}@pwtest.example.com`,
    password: 'PWtest!2345',
  };
};

// Cache one registration per label so a spec that calls registerAndSignIn in
// every beforeEach doesn't blow the backend's auth rate limit (20 / 15 min).
const userCache = new Map();

/**
 * Register a brand-new user via the API (faster than UI for setup), then
 * inject the JWT into localStorage so the SPA boots authenticated.
 *
 * When called repeatedly with the same `label` inside one test process the
 * same user/token is reused, sidestepping the auth rate limiter.
 */
export const registerAndSignIn = async (page, label = 'pw') => {
  let entry = userCache.get(label);

  if (!entry) {
    const user = buildTestUser(label);
    const ctx = page.context();
    const res = await ctx.request.post(`${API_URL}/auth/register`, {
      data: { name: user.name, email: user.email, password: user.password },
    });
    expect(res.ok(), `register: ${res.status()} ${await res.text()}`).toBeTruthy();
    const body = await res.json();
    const payload = body.data || body;
    const token = payload.token;
    if (!token) throw new Error('No token in register response');
    const { token: _t, ...stored } = payload;
    entry = { user, token, stored };
    userCache.set(label, entry);
  }

  const { user, token, stored } = entry;
  await page.addInitScript(
    ([t, u]) => {
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(u));
    },
    [token, stored]
  );

  return { ...user, token, _id: stored._id };
};

/**
 * UI-driven sign-up. Slower but exercises the actual register page.
 * Returns the user object that was created.
 */
export const registerViaUi = async (page, label = 'ui') => {
  const user = buildTestUser(label);
  await page.goto('/register');
  await page.getByPlaceholder('Alex Johnson').fill(user.name);
  await page.getByPlaceholder('you@example.com').fill(user.email);
  const pwInputs = page.getByPlaceholder('••••••••');
  await pwInputs.nth(0).fill(user.password);
  await pwInputs.nth(1).fill(user.password);
  await page.getByRole('button', { name: /create my account/i }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  return user;
};

/** Sign out via the UI. */
export const signOut = async (page) => {
  await page.getByRole('button', { name: 'Logout' }).click();
};
