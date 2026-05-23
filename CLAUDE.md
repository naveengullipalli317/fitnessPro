# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a two-package monorepo (no root `package.json`) for a Gym & Fitness Tracking Platform:

- `fitness-tracking-backend/` — Node.js + Express 5 + MongoDB (Mongoose) REST API
- `fitness-tracking-frontend/` — React 19 + Vite 8 + Tailwind 3 SPA

The two apps are developed and run independently. Run `npm install` in each directory separately.

## Common Commands

### Backend (`fitness-tracking-backend/`)
- `npm run dev` — start with nodemon (port 5000 by default)
- `npm start` — production start (`node src/server.js`)
- `npm run seed` — run `src/seed.js` to populate the database
- `npm run lint` / `npm run format` — ESLint / Prettier on `src/**/*.js`
- No test runner is configured (`npm test` exits 1).

Required env vars (in `fitness-tracking-backend/.env`): `NODE_ENV`, `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`.

### Frontend (`fitness-tracking-frontend/`)
- `npm run dev` — Vite dev server (port 3000)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` / `npm run format` — ESLint / Prettier on `src/**/*.{js,jsx}`

Required env var (in `.env.vite`): `VITE_API_URL` (e.g. `http://localhost:5000/api`).

## Backend Architecture

Layered Express app, wired in `src/app.js` and booted by `src/server.js`:

- **Routes** (`src/routes/*.routes.js`) — define endpoints, attach `auth.middleware` and `validation.middleware`.
- **Controllers** (`src/controllers/*.controller.js`) — thin HTTP layer; parse req, call services, shape responses.
- **Services** (`src/services/*.service.js`) — business logic; the only layer that talks to Mongoose models.
- **Models** (`src/models/*.js`) — Mongoose schemas: `User`, `Workout`, `WorkoutDetail`, `Exercise`, `Goal`, `Routine`.
- **Middleware** — `requestId` (adds `req.id`), `logging`, `auth` (JWT), `validation` (Joi), `dbReady` (gates requests on Mongo connection), `error` (final handler returning `{ success, message }`).
- **Config** (`src/config/`) — `database.js` (Mongoose connect), `environment.js`, `passport.js`.

Cross-cutting behaviour to preserve when editing:
- All API routes are mounted twice: under `/api/v1` and `/api` (legacy alias). See `mountApi()` in `app.js`.
- Two rate limiters: a stricter `authLimiter` (20/15min) on `/auth`, a general `apiLimiter` (300/15min) on the rest.
- Every non-health route runs through `dbReady` — if Mongo isn't connected, the request short-circuits before hitting controllers.
- Health check at `GET /api/health` (and `/api/v1/health`) returns DB state from `mongoose.connection.readyState`.

Resource domains (each has a route/controller/service/model set): **auth/users, workouts (+ workoutDetails), exercises, goals, routines**.

## Frontend Architecture

Vite + React 19 SPA in `fitness-tracking-frontend/src/`:

- **Entry**: `main.jsx` → `App.jsx` → `routes/AppRoutes.jsx`. Protected pages are wrapped by `routes/PrivateRoute.jsx`.
- **Pages** (`pages/`): `Home`, `Login`, `Register`, `Dashboard`, `Workouts`, `ExerciseLibrary`, `Goals`, `Routines`, `Profile` — these map 1:1 to backend resource domains.
- **Components** split into three buckets: `components/ui/` (primitives), `components/layout/` (Header/Footer/shell), `components/features/` (domain-specific composites).
- **Hooks** (`hooks/`): one hook per resource (`useAuth`, `useWorkouts`, `useExercises`, `useGoals`, `useRoutines`) plus generic `useApi`. Data fetching lives here, not in pages.
- **API client**: `utils/api.js` (axios) — uses `VITE_API_URL` and is the single integration point with the backend. New endpoints should go through this client, not raw `fetch`.
- **Store** (`store/index.js`) is present but minimal; most state is in hooks/context (`useAuth.jsx` is a context provider).
- **Styling**: Tailwind 3 via `tailwind.config.js` + `postcss.config.js`; global CSS in `index.css` / `App.css` / `styles/`.

## Conventions Worth Knowing

- Backend is CommonJS (`"type": "commonjs"`); frontend is ESM (`"type": "module"`).
- Backend file naming is `<resource>.<layer>.js` (e.g. `workout.controller.js`). Keep new files consistent.
- Validation is centralised in `middleware/validation.middleware.js` using Joi schemas — add new request validation there rather than inline in controllers.
- Error responses follow `{ success: false, message }`; the global `error.middleware` is the only place that should `res.status(5xx)`.
