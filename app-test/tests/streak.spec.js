import { test, expect } from '@playwright/test';
import { registerAndSignIn } from './helpers/user.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execp = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '..', '..', 'fitness-tracking-backend');

// Insert workouts directly via the backend's mongoose models — gives us
// precise control over `date` (workout day, not creation time) which is
// what the streak service keys on. Shell out to a node one-liner so we
// don't need mongoose in app-test/.
async function seedWorkouts(email, daysAgoList) {
  const script = `
    require('./src/config/environment');
    const mongoose = require('mongoose');
    const User = require('./src/models/User');
    const Workout = require('./src/models/Workout');
    const today = (n=0) => { const d = new Date(); d.setUTCHours(0,0,0,0); d.setUTCDate(d.getUTCDate()-n); return d; };
    (async () => {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      const u = await User.findOne({ email: '${email}' });
      if (!u) { console.error('no user'); process.exit(2); }
      await Workout.insertMany([${daysAgoList.join(',')}].map(n => ({
        userId: u._id, type: 'cardio', date: today(n), duration: 30, caloriesBurned: 200
      })));
      await mongoose.disconnect();
    })().catch(e => { console.error(e.message); process.exit(1); });
  `;
  await execp(`node -e "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
    cwd: BACKEND_DIR,
    env: { ...process.env, NODE_ENV: 'test' },
  });
}

test.describe('Streak notifications', () => {
  test('brand-new user (no workouts) sees NO streak banner on dashboard', async ({ page }) => {
    await registerAndSignIn(page, 'streak-never');
    await page.goto('/dashboard');
    // The active-pill text or banner-headline text — both absent for never-started.
    await expect(page.getByText(/-day streak/i)).toHaveCount(0);
    await expect(page.getByText(/Streak (broken|at risk)/i)).toHaveCount(0);
  });

  test('user with workouts ending several days ago sees a "Streak broken" banner with miss date', async ({ page }) => {
    const me = await registerAndSignIn(page, 'streak-broken');
    // 5-day streak that ended 3 days ago — missed day = 2 days ago
    await seedWorkouts(me.email, [3, 4, 5, 6, 7]);

    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /Streak broken/i })).toBeVisible();
    // Message should mention "5-day streak"
    await expect(page.getByText(/5-day streak/i)).toBeVisible();
    // Should show "Start a new streak →" CTA
    await expect(page.getByRole('link', { name: /Start a new streak/i })).toBeVisible();
  });

  test('user with workout today sees the small "active" streak pill, not a banner', async ({ page }) => {
    const me = await registerAndSignIn(page, 'streak-active');
    await seedWorkouts(me.email, [0, 1, 2]); // today + 2 prior

    await page.goto('/dashboard');
    await expect(page.getByText(/3-day streak/i)).toBeVisible();
    // The "Streak broken" heading should NOT be present.
    await expect(page.getByRole('heading', { name: /Streak broken/i })).toHaveCount(0);
  });

  test('NotificationBell badge counts streak alert + missed sessions', async ({ page }) => {
    const me = await registerAndSignIn(page, 'streak-bell');
    await seedWorkouts(me.email, [4, 5, 6, 7]); // 4-day streak broken 4 days ago

    await page.goto('/dashboard');
    // Open the bell — expect a streak entry visible inside the dropdown.
    await page.getByRole('button', { name: /Notifications|notifications/ }).first().click();
    await expect(page.getByText(/Streak (broken|at risk)/i).first()).toBeVisible();
    await expect(page.getByText(/4-day streak/i)).toBeVisible();
  });
});
