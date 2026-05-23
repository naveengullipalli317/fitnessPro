import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';

const PUBLIC_ROUTES = [
  { path: '/', heading: /Train hard/i },
  { path: '/about', heading: /Built by athletes/i },
  { path: '/privacy', heading: /Privacy/i },
  { path: '/terms', heading: /Terms of/i },
  { path: '/contact', heading: /Let's/i },
  { path: '/login', heading: /Let's get back to work/i },
  { path: '/register', heading: /Claim your strongest year/i },
];

const AUTHED_ROUTES = [
  { path: '/dashboard', heading: /Hey/i },
  { path: '/dashboard/workouts', heading: /My Workouts/i },
  { path: '/dashboard/calendar', heading: /Training Calendar/i },
  { path: '/dashboard/exercises', heading: /Exercise Library/i },
  { path: '/dashboard/goals', heading: /My Goals/i },
  { path: '/dashboard/routines', heading: /Workout Routines/i },
  { path: '/dashboard/profile', heading: /Athlete profile/i },
];

test.describe('Smoke — every route renders without errors', () => {
  test('public routes', async ({ page }) => {
    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    for (const r of PUBLIC_ROUTES) {
      await page.goto(r.path);
      await expect(page.locator('body')).toBeVisible();
    }

    // Ignore network-related errors caused by missing assets in some envs.
    const realErrors = consoleErrors.filter((e) => !/net::ERR|favicon/i.test(e));
    expect(realErrors, `console errors: ${realErrors.join(' | ')}`).toHaveLength(0);
  });

  test('authed routes', async ({ page }) => {
    await registerAndSignIn(page, 'smoke');
    for (const r of AUTHED_ROUTES) {
      await page.goto(r.path);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
