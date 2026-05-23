import { defineConfig, devices } from '@playwright/test';

// Vite defaults to :5173 since v5; override with FRONTEND_URL if your project pins a different port.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Test backend runs on a dedicated port (see fitness-tracking-backend/.env.test.example)
// so it can't collide with a developer's dev server on :5000.
const BACKEND_PORT = process.env.BACKEND_PORT || '5001';
const API_URL = process.env.API_URL || `http://localhost:${BACKEND_PORT}/api`;
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // run sequentially — shared DB state
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: 1, // single worker keeps user registrations + ordered tests deterministic
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    extraHTTPHeaders: { Accept: 'application/json' },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to run against multiple browsers
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
  ],

  // Start both servers automatically: the backend in NODE_ENV=test (loads
  // fitness-tracking-backend/.env.test → dedicated test DB) and the frontend
  // pointed at it via VITE_API_URL. Set PW_NO_SERVER=1 to start them yourself.
  webServer: process.env.PW_NO_SERVER
    ? undefined
    : [
        {
          command: 'npm run start:test --prefix ../fitness-tracking-backend',
          url: `http://localhost:${BACKEND_PORT}/api/health`,
          reuseExistingServer: !CI,
          timeout: 60_000,
          stdout: 'pipe',
          stderr: 'pipe',
        },
        {
          command: `VITE_API_URL=${API_URL} npm run dev --prefix ../fitness-tracking-frontend`,
          url: FRONTEND_URL,
          reuseExistingServer: !CI,
          timeout: 60_000,
          stdout: 'ignore',
          stderr: 'pipe',
        },
      ],

  metadata: { FRONTEND_URL, API_URL },
});
