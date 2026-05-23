import { defineConfig, devices } from '@playwright/test';

// Run the test frontend AND backend on dedicated ports so they never collide
// with a developer's dev servers (Vite :5173, backend :5000). This also
// guarantees we don't accidentally "reuse" a dev Vite whose VITE_API_URL is
// pointing at the dev backend.
const FRONTEND_PORT = process.env.FRONTEND_PORT || '5174';
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${FRONTEND_PORT}`;
const BACKEND_PORT = process.env.BACKEND_PORT || '5001';
const API_URL = process.env.API_URL || `http://localhost:${BACKEND_PORT}/api`;
const CI = !!process.env.CI;

// Propagate API_URL into workers' process.env so tests/helpers/*.js (which
// default to :5000) talk to the test backend.
process.env.API_URL = API_URL;

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
    // Capture artifacts for every test (pass or fail) so `npm run report`
    // shows the trace/video/screenshot for any test you click. Heavier on
    // disk; test-results/ and playwright-report/ are gitignored.
    trace: 'on',
    screenshot: 'on',
    video: 'on',
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
          // Force the test frontend onto its own port with --strictPort so
          // a missed override fails loudly instead of silently falling forward.
          // reuseExistingServer is OFF so we never inherit a dev Vite's env.
          command: `VITE_API_URL=${API_URL} npm run dev --prefix ../fitness-tracking-frontend -- --port ${FRONTEND_PORT} --strictPort`,
          url: FRONTEND_URL,
          reuseExistingServer: false,
          timeout: 60_000,
          stdout: 'ignore',
          stderr: 'pipe',
        },
      ],

  metadata: { FRONTEND_URL, API_URL },
});
