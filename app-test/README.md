# app-test — Playwright E2E for NeverGiveUp

End-to-end browser tests for the full NeverGiveUp fitness platform (`fitness-tracking-frontend` + `fitness-tracking-backend`).

## Prerequisites

1. The backend must be running and reachable at `http://localhost:5000` (`npm run dev` in `fitness-tracking-backend/`) with MongoDB connected. The tests hit the real API to register users and seed data, so you need a working stack.
2. The frontend will be started automatically by Playwright's `webServer` (set `PW_NO_SERVER=1` to skip and start `fitness-tracking-frontend` yourself on `:3000`).

## Install

```bash
cd app-test
npm install
npm run install:browsers   # downloads Chromium once
```

## Run

```bash
npm test                   # headless, reports to ./playwright-report
npm run test:headed        # open a real browser to watch
npm run test:ui            # interactive Playwright UI
npm run test:debug         # inspector
npm run report             # open the last HTML report
```

Custom URLs:

```bash
FRONTEND_URL=http://localhost:3000 \
API_URL=http://localhost:5000/api \
npm test
```

## What's covered

| Spec | What it verifies |
|------|------------------|
| `smoke.spec.js` | Every public + authenticated route mounts cleanly with no console errors |
| `public-pages.spec.js` | Home, About, Privacy, Terms, Contact + footer navigation + contact form |
| `auth.spec.js` | Register → Onboarding → Dashboard happy path, skip onboarding, login, logout, redirect of unauthenticated requests |
| `dashboard.spec.js` | Greeting + stat row + detail cards + nav links + empty-state notifications |
| `workouts.spec.js` | CRUD on `/dashboard/workouts` (log, list, delete) |
| `exercises.spec.js` | Library filters, search empty-state, modal + video embed + YouTube fallback |
| `goals.spec.js` | Create goals, progress bar copy, multi-goal layout |
| `routines.spec.js` | Create/delete + **multi-user isolation** regression (User B can't see User A's private routine; public routines do propagate) |
| `calendar.spec.js` | Month nav, quick-log flow, `?date=` deep-link |
| `profile.spec.js` | Cover, edit form, persistence, logout |
| `notifications.spec.js` | Bell empty state, dashboard banner absence on fresh user, click-outside-to-close |

## Conventions

- Each test creates a **fresh user** via the API (`tests/helpers/user.js`) and injects the JWT into `localStorage` so the SPA boots authenticated. UI-driven register is exercised in `auth.spec.js`.
- Workers are pinned to `1` (`playwright.config.js`) so the tests don't race against shared Mongo state.
- All tests are independent — running any single spec in isolation is supported.
- Selectors prefer `getByRole` and visible text, matching the actual UI copy. No `data-testid` are added to the app.

## Test data hygiene

Every run leaves behind users named `Playwright <label>` with emails like `pw-<label>-<timestamp>@pwtest.example.com`. Periodically prune them from MongoDB:

```js
// In the mongo shell of your dev DB
db.users.deleteMany({ email: /@pwtest\.example\.com$/ });
db.routines.deleteMany({ name: { $regex: /(Solo PPL|User A Secret Plan|Open Source Strength|Throwaway Routine)/ } });
```

## Troubleshooting

- **Tests fail with `net::ERR_CONNECTION_REFUSED`** — the backend isn't running, or `MONGODB_URI` isn't reachable. Boot the backend first.
- **Register API returns 429** — the auth rate-limiter (20/15min) has been hit by repeated test runs. Wait or temporarily raise the limit during testing.
- **Some Exercise Library specs skip** — the seed DB may not contain exercises. Run `npm run seed` in the backend.
- **YouTube iframes empty** — embeds load network content; the test only verifies the iframe element exists, not video playback.
