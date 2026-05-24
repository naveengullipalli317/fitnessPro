# Deployment Guide

How NeverGiveUp ships from your laptop to a real environment. One-time
setup is in **§5**; the day-to-day flow is in **§2**.

---

## 1. Architecture at a glance

```
                ┌─────────────┐
                │   GitHub    │
                │  (3 branches)│
                └──────┬──────┘
                       │ push
       ┌───────────────┼───────────────┐
       │               │               │
   ┌───▼────┐     ┌────▼────┐    ┌─────▼─────┐
   │  CI    │     │ Deploy  │    │ Manual    │
   │ (lint+ │     │ workflow│    │ approval  │
   │  test) │     │         │    │ (prod)    │
   └────────┘     └────┬────┘    └─────┬─────┘
                       │               │
              ┌────────┼───────────────┘
              │        │
        ┌─────▼──┐  ┌──▼──────┐
        │ Vercel │  │ Render  │
        │ (FE)   │  │ (BE)    │
        └────────┘  └─────────┘
                       │
                  ┌────▼─────┐
                  │ MongoDB  │
                  │  Atlas   │
                  └──────────┘
```

| Layer | Tool | Why |
|---|---|---|
| CI/CD | GitHub Actions | Native to repo, free, version-controlled workflows |
| Frontend | Vercel | Vite-aware, instant PR previews, free tier |
| Backend | Render | Node-friendly, IaC via `render.yaml`, deploy hooks |
| Database | MongoDB Atlas | Already in use; 3 logical DBs on one cluster |
| Email | Mailtrap / SendGrid / Resend | Sandbox dev, real delivery prod |

---

## 2. Branch → Environment mapping

| Branch | Environment | Deploy trigger | Approval | Vercel scope | Render service |
|---|---|---|---|---|---|
| `development` | **dev** | Auto on push | — | Preview | `fitness-tracking-backend-dev` |
| `qa` | **qa** | Auto on push | — | Preview | `fitness-tracking-backend-qa` |
| `master` | **prod** | Push → manual approval gate | ✅ Required reviewer | Production | `fitness-tracking-backend-prod` |

**Promotion flow**: feature branch → PR to `development` → merge → PR to
`qa` (CI runs Playwright) → merge → PR to `master` → merge → approve
prod deploy in GitHub UI → live.

---

## 3. Workflow files (what's in the repo)

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Backend lint, frontend lint+build on every push. Playwright e2e only on PRs into `qa`/`master`. Uses an ephemeral MongoDB service container so CI never touches real Atlas DBs. |
| `.github/workflows/deploy.yml` | Branch-driven deploy. Resolves env → runs Vercel CLI for frontend, hits Render deploy hook for backend, runs `smoke-check` job that polls `/api/health` until `db:connected`. |
| `fitness-tracking-backend/render.yaml` | IaC blueprint declaring all three backend services with env-var keys (`sync: false` — actual values via Render dashboard). |
| `fitness-tracking-frontend/vercel.json` | SPA fallback rewrites + security headers + asset cache policy. |

---

## 4. Environment variable matrix

A complete map of every variable × every environment, including where the
value comes from and where it's stored.

| Variable | dev value | qa value | prod value | Storage |
|---|---|---|---|---|
| `NODE_ENV` | `development` | `production` | `production` | render.yaml (literal) |
| `MONGODB_URI` | atlas/fitness_tracking_dev | atlas/fitness_tracking_qa | atlas/fitness_tracking_prod | Render dashboard (secret) |
| `JWT_SECRET` | unique random | unique random | unique random | Render dashboard (secret) |
| `JWT_EXPIRES_IN` | `7d` | `7d` | `7d` | render.yaml (literal) |
| `BCRYPT_SALT_ROUNDS` | `12` | `12` | `12` | render.yaml (literal) |
| `FRONTEND_URL` | Vercel dev preview URL | Vercel qa preview URL | https://nevergiveup.app (your prod) | Render dashboard (secret) |
| `MAIL_HOST` | sandbox.smtp.mailtrap.io | sandbox.smtp.mailtrap.io | smtp.sendgrid.net (or similar) | Render dashboard (secret) |
| `MAIL_PORT` | `2525` / `587` | `2525` / `587` | `587` | render.yaml (literal) |
| `MAIL_USER`/`PASS` | Mailtrap creds | Mailtrap creds | SendGrid API key | Render dashboard (secret) |
| `MAIL_SECURE` | `false` | `false` | `false` | render.yaml (literal) |
| `MAIL_FROM` | dev display addr | qa display addr | `NeverGiveUp <no-reply@yourdomain.com>` | Render dashboard (secret) |
| `VITE_API_URL` | https://dev-backend.onrender.com/api | https://qa-backend.onrender.com/api | https://api.nevergiveup.app/api | Vercel project env (per-env) |

GitHub Actions secrets (set per **GitHub Environment** in repo settings):

| Secret | Where you get it |
|---|---|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Vercel project settings → "General" → Team/Personal ID |
| `VERCEL_PROJECT_ID` | Vercel project settings → "General" → Project ID |
| `RENDER_DEPLOY_HOOK` | Render service → "Settings" → "Deploy Hook" — different per env! |
| `BACKEND_URL` | The deployed Render URL for this env (e.g. `https://fitness-tracking-backend-dev.onrender.com`) |

---

## 5. One-time operator setup

Do these in order. Each step is "run once when bootstrapping the
pipeline" — they don't need to repeat per deploy.

### 5.1 MongoDB Atlas

You already have `fitness_tracking_dev` and `fitness_tracking_test`. Add:

1. Atlas → Database → your cluster → **Browse Collections** → **Create
   Database** → name `fitness_tracking_qa` → any starter collection.
2. Repeat for `fitness_tracking_prod`.
3. Atlas → Database Access → **Add New Database User** — create one
   user per env (`ng-dev`, `ng-qa`, `ng-prod`) with role
   **`readWrite` scoped to that specific database**. Gives you per-env
   credential isolation; a leaked qa password can't touch prod data.
4. For each new user, copy the connection string with that user's
   credentials and the matching DB name — you'll paste these into
   Render in step 5.4.

### 5.2 Vercel project

1. Vercel dashboard → **Add New** → **Project** → connect this GitHub repo.
2. Pick **Root Directory**: `fitness-tracking-frontend`.
3. **Framework Preset** should auto-detect as Vite.
4. **Production Branch**: `master`.
5. Project Settings → **Environment Variables** — for each environment
   (Production / Preview), set `VITE_API_URL` to the matching backend
   URL from the table above. Note Vercel's preview env applies to all
   non-prod branches; if you need distinct dev vs qa URLs, prefix the
   variable name with a branch filter or use Vercel's "Preview Environment
   Variables → Branch" UI (newer Vercel UI exposes per-branch overrides).
6. Copy `VERCEL_TOKEN` (from Settings → Tokens), `VERCEL_ORG_ID`, and
   `VERCEL_PROJECT_ID` — you'll need them in step 5.5.

### 5.3 Render Blueprint

1. Push the current branch (with `render.yaml` committed) so Render can
   see it.
2. Render dashboard → **New +** → **Blueprint** → connect this repo →
   Render reads `fitness-tracking-backend/render.yaml`.
3. Render creates three services. Each will fail its first build until
   you fill in env vars (step 5.4).

### 5.4 Render environment variables

For **each** of the three backend services:

1. Service → **Environment** tab.
2. For every variable marked `sync: false` in `render.yaml`, paste the
   value from your matrix in §4. Atlas connection strings, JWT secrets,
   mail credentials, `FRONTEND_URL`.
3. Click **Save Changes** — Render triggers a redeploy automatically.
4. After ~2 minutes the service should be live at its assigned URL
   (visible in the service's Overview tab). Hit `<url>/api/health` to
   confirm `{"status":"OK","db":"connected"}`.
5. Service → **Settings** → **Deploy Hook** → click "Copy" — you'll
   paste this into GitHub in step 5.5 as `RENDER_DEPLOY_HOOK`.

### 5.5 GitHub Environments + secrets

1. Repo → **Settings** → **Environments** → **New environment** — create
   three: `dev`, `qa`, `prod`.
2. For the `prod` environment, **add a required reviewer** (yourself or
   a teammate). This is what blocks prod deploys behind a manual approve.
3. For **each** environment, add these secrets (Settings → Environments
   → \<env\> → "Add secret"):
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `RENDER_DEPLOY_HOOK` (the one for THIS env's Render service)
   - `BACKEND_URL` (this env's Render URL)
4. `VERCEL_*` values are the same across all three environments (one
   project, three deploy targets). `RENDER_DEPLOY_HOOK` and `BACKEND_URL`
   are different per environment.

### 5.6 First deploy

1. Make any trivial change on `development` and push.
2. GitHub → Actions tab → watch **CI** run (lint + build).
3. Watch **Deploy** run after CI — frontend and backend deploy, then
   smoke-check verifies `/api/health`.
4. Visit the Vercel preview URL → SPA loads → register an account →
   verify it lands in Atlas's `fitness_tracking_dev`.

---

## 6. Smoke-check customisation

The smoke-check step in `deploy.yml` polls `BACKEND_URL/api/health` up
to 30× with 5s gaps, then fails. Three things you might want to tune:

- **Faster fail on paid Render**: drop `MAX_ATTEMPTS` to `12`. Free-tier
  cold-starts can take 60s; paid tiers are healthy in ~10s.
- **Stricter health definition**: hit a deeper endpoint that exercises
  Mongo (e.g. `GET /api/notifications` with a service token) instead of
  just `/api/health`. Currently we accept any response containing
  `status:OK` AND `db:connected`.
- **Log redaction**: if `BACKEND_URL` is a private staging hostname you
  don't want leaking into Actions logs, add this above the loop:
  ```bash
  echo "::add-mask::$BACKEND_URL"
  ```

Edit `.github/workflows/deploy.yml` → `smoke-check` job → `Wait for
backend health` step.

---

## 7. Rollback procedures

### 7.1 Vercel (frontend)

1. Vercel dashboard → project → **Deployments** tab.
2. Find the last known-good deployment (green check).
3. Click **⋯** → **Promote to Production** (for prod) or **Redeploy**
   (for preview).
4. Live within ~10 seconds (Vercel re-publishes the same artifact).

### 7.2 Render (backend)

1. Render dashboard → service → **Events** or **Deploys** tab.
2. Find the last known-good deploy.
3. Click **Rollback to this deploy**.
4. Render replays the same artifact; live in ~30 seconds (paid plan)
   or ~60 seconds (free).

### 7.3 Source-of-truth rollback (preferred)

Vercel/Render rollbacks revert the *deployed bits* but leave the *git
history* claiming the bad commit is current. For prod, prefer:

```bash
git checkout master
git revert <bad-commit-sha>
git push origin master
```

This re-runs the full pipeline (including smoke-check) and ensures
the prod deploy matches `master`. Manual approval is still required.

---

## 8. Recommendations for later

Not blocking, but you'll want these as you scale:

| Need | Tool |
|---|---|
| Uptime monitoring | UptimeRobot / BetterStack (poll `/api/health` every minute) |
| Error tracking | Sentry (both backend and frontend) |
| Log aggregation | Render's built-in for now; Logtail / Datadog when noisy |
| Cost alerts | Atlas, Vercel, Render all have billing alerts in dashboard |
| DB backups | Atlas's continuous backup tier (paid; free-tier has snapshot only) |
| Custom domain | Vercel + Cloudflare/Namecheap DNS; add to Render via dashboard |
| Synthetic tests in prod | Playwright in scheduled CI runs against the prod URL |
| Separate Atlas cluster for prod | Once paying customers exist — full isolation from dev/qa |
