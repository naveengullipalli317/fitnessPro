# NeverGiveUp — Investor Demo Script

A practical, presenter-ready walkthrough of every shipping feature. Built to
hand to anyone who needs to demo the platform in 15-20 minutes.

---

## 1. The 30-second elevator

> **NeverGiveUp is a fitness platform where athletes track their training,
> hit measurable goals, and stay accountable through communities they
> actually want to be part of.** It combines the workout-logging mechanics
> of MyFitnessPal, the social accountability of Strava, and the discipline
> mechanics of Duolingo — wrapped in an operator-grade admin console so
> the platform can be run safely at scale from day one.

Three claims to defend in the demo:

1. **Engagement is built-in, not bolted on** — streaks, communities, and
   real-time chat keep users opening the app daily.
2. **The data tells the truth** — admin analytics show exactly how the
   platform is performing, who the power users are, and what's growing.
3. **Production-ready foundations** — RBAC, session security, email
   delivery, isolated test environment, 65 end-to-end tests passing.

---

## 2. Demo prep (do this 30 minutes before)

### Accounts to have ready

| Role | Email | Notes |
|---|---|---|
| **Admin presenter** | `testadmin@yopmail.com` | Your account; admin role; runs admin console portion |
| **Member "Alex" (creator)** | `alex@yopmail.com` | Creates communities, posts workouts |
| **Member "Sam" (joiner)** | `sam@yopmail.com` | Discovers, joins, chats |

Create the two member accounts via `/register` if you haven't already. Use
the same password for all three so you don't fumble during the demo.

### Demo data to seed

Sign in as **Alex** and:

1. **Log 3 workouts** spread over the last few days (Dashboard → Workouts →
   ＋Log workout). Pick varied types (cardio, strength, hiit) and dates
   covering today + 2 prior days — this lights up the active streak pill.
2. **Create one goal** (Goals → ＋ New Goal, e.g. "Run a 10K", 30-day target).
3. **Create one public community** named *"Sunday Long Runs"* with a short
   description. (This triggers a notification to every other user.)
4. **Create one private community** named *"Personal Coaching"* — you'll
   use this to demonstrate the privacy gate.

Sign in as **Sam** (use a different browser profile or incognito so both
sessions stay live in parallel) and:

5. **Don't log any workouts yet** — we want Sam to be a fresh face during
   the demo so you can show the empty states + social discovery.

### Browser setup

- **Tab 1**: Alex signed in at `/dashboard` (member experience)
- **Tab 2**: Sam signed in at `/dashboard` (second member, for social demo)
- **Tab 3**: Testadmin signed in at `/admin` (admin console)
- **Mailtrap inbox** open in a background tab (https://mailtrap.io →
  Email Testing → your sandbox) to show the password-reset email flow

### One-line sanity check
Open `http://localhost:5000/api/health` in a new tab — should respond
`{"status":"OK","db":"connected"}` within a second. If not, restart the
dev backend before continuing.

---

## 3. The demo (15-20 min, click-by-click)

### Act 1 — First impression (1 min)

**Tab 1 (Alex) — start on the public homepage `/`**

> "Before someone is a user, they're a visitor. The landing page is
> intentionally focused — there's the hero, the social proof strip, and
> the feature grid. No pricing dance, no signup bait-and-switch — sign
> up's free, that's the entire pitch."

Click **Start Training Free →** to send them to `/register`.

---

### Act 2 — Registration and onboarding (1.5 min)

**Show the password strength meter.**

> "Security feels intrusive when it's just rules; we make it a real-time
> coach. As I type, the meter and the checklist update — length, letter,
> number, symbol. Submit stays disabled until the password actually meets
> the policy. Same policy is enforced on the server, so the frontend
> can't lie."

Type a deliberately weak password, then a strong one, to show both states.

Submit. They land on `/onboarding`, then `/dashboard`.

> "The user is now in. Notice we don't ask for credit card, age, weight,
> goals — anything optional happens later, not in the way of value."

---

### Act 3 — The Dashboard, where engagement lives (3 min)

**Tab 1 (Alex), now on `/dashboard`**

Point out, in order, each section:

#### 3a. The streak pill
> "Top of the dashboard. Alex has a 3-day streak — small, celebratory,
> in volt-orange. This is the engagement loop in 4 pixels of pill.
> Tomorrow if he hasn't logged a workout by mid-evening, that pill becomes
> a yellow 'streak at risk' banner with a count-down. If he misses
> entirely, it becomes a rose 'streak broken' banner that names the
> exact day he missed and the days he had built up. Loss aversion at the
> right moment, not a generic guilt email."

#### 3b. The welcome banner
> "Personalised greeting, framed by training imagery. Sets the tone."

#### 3c. The stat row
> "Sessions, minutes, calories, average — all computed from his actual
> workout log. Real numbers, not vanity placeholders."

#### 3d. The detail cards
> "Workout Mix breaks down the types he's logged. Recent Workouts is a
> log feed. Upcoming Goals is the deadline radar."

---

### Act 4 — Logging a workout (1 min)

Click **Workouts** in the header → **＋ Log Workout**.

> "Logging is intentionally fast: type, date, duration, calories.
> Five fields, twenty seconds. Notice the form validates inline — the
> moment the user can submit, the button enables."

Submit. The new workout appears on the grid.

> "And immediately the dashboard's stats are richer. Every action
> reinforces the loop — log, see progress, log again."

---

### Act 5 — Goals (1 min)

Click **Goals** in header.

> "Goals are the longer-term commitment. Alex has a 10K running target.
> Progress bar updates as he logs cardio workouts. He sees how close he
> is at a glance."

If you want extra emphasis: create a second goal live to show the form,
then return to the list to show both.

---

### Act 6 — Routines (1 min)

Click **Routines** in header.

> "Routines are weekly templates — 'Push-Pull-Legs', 'Marathon Prep', etc.
> The user picks days of the week and assigns workout types. The system
> then knows what 'should' happen on each day. If a scheduled workout
> doesn't get logged, it surfaces as a 'missed session' in the
> notification bell — another nudge in the engagement loop."

(Show one existing routine; mention you can create public ones that
other members can discover, just like communities.)

---

### Act 7 — Exercise library (45 sec)

Click **Exercises** in header.

> "Pre-loaded library of categorised exercises with descriptions.
> Filter by muscle group or difficulty. Users without a coach get
> structured guidance; users with a coach get a shared vocabulary."

---

### Act 8 — Communities (3 min) ← *the social moat*

Click **Community** in header. Alex is on the **My Communities** tab.

> "Communities are where retention compounds. Users who join a community
> stay 3-4× longer than solo users — that's industry baseline, and
> we expect the same. Alex created 'Sunday Long Runs' earlier. Let's
> open it."

Click **Open chat →** on the card.

#### 8a. Community detail + chat panel

> "Each community is a small, persistent space. Member count, owner,
> description up top. Below it, a live chat that's gated to active
> members — non-members can't read or post. Privacy is per-community."

Type a message → "Beautiful weather for a long run tomorrow." → Send.

#### 8b. Real-time chat (switch tabs)

**Switch to Tab 2 (Sam).** Click **Community** → **Explore** tab.

> "Sam is a different user, in a separate browser session. Notice
> 'Sunday Long Runs' showed up in his Explore tab automatically —
> that's our fan-out notification system. We'll see that in a moment."

Click **Join** on Sunday Long Runs. Switch to **My Communities** → click
the community.

> "He's in. Now watch:"

(Type a message in Sam's tab: *"I'm in! What's the route?"*)

**Switch back to Tab 1 (Alex).** Sam's message appears within ~50ms,
no refresh.

> "That's Server-Sent Events under the hood. No polling, no socket.io
> tax. The infrastructure is in place to add typing indicators and
> presence without changing the data model."

Show that **Alex (the community owner) can delete any message**;
**Sam (a regular member) can only delete his own**.

---

### Act 9 — Notifications (1.5 min)

Stay on **Tab 2 (Sam)**. Click the 🔔 **bell** in the header.

> "Sam's notification bell. He has multiple signals in here, ranked
> by importance:"

Point out, top-down:

1. **"New community" entry** — *"This is automatic. When ANY user
   creates a public community, every active user gets this notification
   — title, creator name, community name, deep link. Sam didn't have to
   subscribe; the platform connects him to growth happening around him."*
2. **Streak entry** (if applicable) — *"If a streak is at risk or
   broken, it shows here too."*
3. **Missed-workout entries** — *"And if Sam had a routine, missed
   sessions would land here with a 'Log now' shortcut."*

Click **Open →** on the community notification — it takes him to the
community list. The bell badge clears 1.5 seconds after opening (so he
sees what changed, then it goes quiet).

> "One unified surface for everything that needs the user's attention,
> with explicit dismiss controls. We're not the app that pings you 30
> times a day."

---

### Act 10 — Password recovery (1 min, optional — only if asked about security)

Sign Sam out → click **Forgot?** next to the password field.

> "Standard recovery flow. The system says 'if an account exists, a
> link has been sent' — same response for real and fake emails, so
> attackers can't enumerate valid accounts."

Type Sam's email, submit. (In dev mode, the reset link is shown inline
on the page — in production, this only goes by email.)

Click the **Mailtrap tab** → show the real email arriving in the inbox.

> "Real email infrastructure — nodemailer over SMTP. Swappable to any
> provider; we're using Mailtrap for dev, SendGrid/Resend for production.
> The reset link expires in 30 minutes, is single-use, and the moment
> someone resets, every existing JWT for that account is invalidated.
> That's defence against the stolen-token-survives-reset class of bug."

(Click the link, set a new password, sign back in.)

---

### Act 11 — Admin Operations Console (5 min) ← *the operator story*

**Switch to Tab 3 (testadmin)**. They're already on `/admin`.

> "This is what we show partners, regulators, and our own operators.
> Every signal we need to run the platform — in one place, live."

#### 11a. KPI tiles (top row)
> "Six KPIs with embedded sparklines so you see *trend* alongside
> *value*. Total users, active in last 30 days, deactivated, admins,
> communities, workouts logged. Each tile's accent colour ties to the
> matching chart below."

#### 11b. Analytics charts (six of them, 2×3 grid)

Walk through each briefly:

| Chart | What it tells you |
|---|---|
| **Signups (30d)** | Area chart, daily new accounts. Growth shape at a glance. |
| **Daily Active Users (30d)** | Line chart with avg and peak. The engagement signal. |
| **Workouts logged (30d)** | Bars, today highlighted. Independent activity proxy. |
| **User roles** | Donut: admins vs regular users, total in centre. |
| **Most active users (lifetime)** | Horizontal bars by session minutes — power users in volt, admins in rose. |
| **Communities** | Daily creations + top 10 communities by size. Two views, one panel. |

> "Hover any chart for exact numbers. The activity time tracking is
> automatic — every authenticated request bumps the user's session
> with smart throttling, so we know who's actually using the platform
> without making them install anything or join any beacon program."

#### 11c. Users table

> "All users, searchable. Per-row: Promote / Demote (role change),
> Deactivate / Reactivate (lock or restore login), Delete (cascade-removes
> all owned data). I literally can't do any of these to my own account —
> the buttons are disabled — so I can't accidentally lock myself out."

Search for a test user → demo Deactivate → switch to **Tab 1 (Alex)** if
you deactivated his account, refresh — he's signed out with a clear
'account deactivated, contact support' message. Switch back to admin
console → Reactivate.

> "And we enforce a 'no zero admins' invariant — the system refuses to
> demote or delete the last active admin. Self-recovery built in."

#### 11d. Communities table

> "Every community, public AND private — admin override on the
> visibility rules that gate regular users. Click any to drill in."

Click any community.

#### 11e. Community detail (admin view)

> "Full member roster, including pending join requests for private
> communities. Per-member kick action; the owner is protected with
> a disabled 'Owner' label and a tooltip explaining how to remove
> them properly. Audit trail of who joined when."

---

### Act 12 — Wrap (30 sec)

Back to the admin dashboard top.

> "Everything we just showed — registration, password recovery, dashboard,
> streaks, workouts, goals, routines, communities, real-time chat,
> notifications, admin console with analytics — runs on the same
> infrastructure, with one unified user model, RBAC, and a 65-test
> end-to-end suite that runs every commit. The product is operational
> from day one, not a prototype with admin tools coming later."

---

## 4. Full feature catalogue

### Authentication & account
- Email/password registration with **strong-password policy** (8+ chars, letter, number) enforced on both client and server.
- **Live password strength meter** with per-rule checklist (length, letter, number, symbol) and gated submit.
- Login with **JWT** + role-based access (`user` / `admin`).
- **Forgot-password** flow: single-use 64-char hex token, hashed at rest, 30-minute expiry, generic-response anti-enumeration.
- **Reset-password** flow: validates token, mirrors register password policy, invalidates all old JWTs by bumping `passwordChangedAt`.
- **Deactivation** flow: admin-driven, blocks both login and existing tokens with a distinct 403 message.

### Email delivery
- **Nodemailer over SMTP** — works with any provider (Mailtrap, Gmail App Password, SendGrid, Resend).
- Console-logging fallback when no SMTP configured (zero-setup dev).
- HTML + plain-text bodies; user-controlled content HTML-escaped.
- `npm run mail:test` CLI to verify SMTP credentials.

### Profile & training
- **Workout log**: type, date, duration, calories — with inline validation.
- **Goals**: target + deadline + progress bar.
- **Routines**: weekly templates with public/private visibility.
- **Exercise library**: searchable, categorised reference.
- **Calendar view** of workouts logged.

### Dashboard
- Personalised welcome banner with hero imagery.
- Stat row: sessions, minutes, calories, average.
- Workout-mix breakdown (per-type counts).
- Recent workouts feed.
- Upcoming goals card.
- **Missed-workouts banner** for routine-scheduled sessions not done.

### Streak tracking
- Computed server-side from workout dates (UTC day boundaries).
- Four statuses: **never-started**, **active**, **at-risk** (today missed, intact through yesterday), **broken**.
- Pre-built user-facing messages with exact dates and day counts.
- Dashboard banner (rose for broken, amber for at-risk) + small celebratory pill for active streaks.
- LocalStorage dismissal keyed to the specific missed-date (won't reappear until status changes).

### Communities (social layer)
- **Create** with name, description, type (public/private), banner URL.
- **Discover** via Explore tab; public-only.
- **Join**: instant for public; request-to-approve for private (pending state).
- **Leave** (members) / **Delete** (owners, cascades all memberships).
- Strict privacy: private communities invisible to non-members in any list.

### Per-community chat
- **Real-time** via Server-Sent Events — no polling, no socket.io.
- Posting via standard REST `POST /messages`; receipt via EventSource stream.
- **Soft-delete** with tombstones — preserves row for future threading/quoting.
- Permission policy: author, community owner, OR platform admin can delete any message.
- 1-2000 character limit, validated.
- Auto-scroll on new messages when user is near the bottom of the chat history.
- Member-only gating — non-members see "join to chat" messaging.

### Notifications (the bell)
- **Server-pushed**: `Notification` collection with TTL (90-day auto-prune).
- **Fan-out trigger**: public community creation → notification to every active non-creator user.
- **Privacy preserved**: private creations do NOT fan out.
- Bell badge counts: server unread + streak alert + missed-workouts.
- Mark-read fires 1.5s after open (visible badge → cleared state).
- Per-entry **Open** deep-link + **Dismiss** action; **Mark all read** in header.
- Type-aware icons (community → 👥, future routine → 📅, etc.).

### Admin Operations Console
- **Bootstrap**: `npm run admin:promote -- email@example.com` CLI (single-source-of-truth, no env or self-signup paths).
- **KPI tiles** (6) with embedded 30-day sparklines for trend at a glance.
- **Six analytics charts** built with Recharts:
  - Signups area chart
  - Daily Active Users line chart
  - Workouts-logged bars (today highlighted)
  - User-roles donut (total in centre)
  - Most-active-users horizontal bar
  - Communities: daily-creations area + top-10 sizes bar
- **Users table**: search by name/email; per-row Promote / Demote / Deactivate / Reactivate / Hard-delete with confirmation dialogs.
- **Communities table**: bypasses public/private visibility; click to drill in.
- **Community detail**: member roster (active + pending) with per-member Kick; owner protected.
- **Self-protection invariants**: cannot self-deactivate; cannot demote/delete the last active admin; cannot hard-delete the caller.
- **Distinct chrome**: rose-tinted header so admins know which mode they're in.

### Activity tracking (powers the analytics)
- `UserSession` collection records start time and continuous-activity windows.
- **Throttled writes**: in-memory cache makes the write cost ~1 update/min/user, not 1-per-request.
- Auto-opens new session after 15 minutes of silence.
- Used for DAU, top-active-users, and the "Active (30d)" KPI.

### Engineering quality
- **65 end-to-end Playwright tests** covering auth, dashboard, workouts, goals, routines, calendar, communities, chat, admin, password reset, streak alerts, notifications fan-out.
- **Dual-database setup**: separate `fitness_tracking_dev` and `fitness_tracking_test` databases, fully isolated.
- **Per-environment config**: `.env.development` / `.env.test` loaded on top of `.env`.
- **Cleanup CLIs**: `npm run clean:test-db -- --apply` to reset; targeted Playwright-only delete by email pattern.
- **In-app role-based authorisation** enforced at the router level — every admin endpoint is gated by `protect + adminOnly` at the router level, not per-route (eliminates "forgot to add the guard" bugs).

---

## 5. Tech-investor cheat sheet (for the engineer in the room)

| Concern | Answer |
|---|---|
| **Stack** | Node.js 20, Express 5, MongoDB (Mongoose), React 19, Vite, Tailwind, Recharts. |
| **Auth** | JWT with `passwordChangedAt` invalidation; bcrypt password hashing; account-enumeration-safe forgot flow. |
| **Real-time** | SSE for chat (no socket.io / Redis dependency). EventBus is in-process; horizontally scalable by swapping to Redis pub/sub. |
| **Email** | Provider-agnostic SMTP via nodemailer. Console fallback for dev. |
| **Testing** | 65 Playwright tests, full pass; backend has smoke tests. Test DB isolated. |
| **Database schema** | 9 collections: User, Workout, WorkoutDetail, Goal, Exercise, Routine, Community, CommunityMember, Message, Notification, PasswordReset, UserSession. All indexed for the actual query patterns. |
| **Operational maturity** | Admin console, role-based access, deactivation, audit-ready (every action goes through tracked endpoints), email recovery, session-invalidation. |
| **What's NOT in yet** | Mobile app (web is responsive but native isn't built); payment/Stripe; AI-driven workout suggestions; wearable integrations. All on roadmap. |

---

## 6. Anticipated investor Q&A

**Q: How do you keep users coming back?**
> Three layers: streaks (loss-aversion mechanics), communities (social
> accountability), notifications (timely nudges). Each layer compounds the
> next — solo users stay weeks, community users stay months, streak users
> open the app daily.

**Q: How does this scale?**
> The hot paths — activity tracking, chat fan-out, notifications — are all
> designed for the swap-in pattern: in-process today, Redis-backed for
> horizontal scale tomorrow, no API changes. MongoDB Atlas handles the
> storage tier.

**Q: What's your moat?**
> Engagement infrastructure. Most fitness apps are tracking apps — you log,
> you leave. Ours combines tracking with persistent social structure
> (communities, chat) and discipline mechanics (streaks). That's hard to
> retrofit once you've built a tracking-only app.

**Q: How do you make money?**
> [Whatever your business model is.] Foundation supports both ad-free
> subscription tiers (premium analytics, advanced AI suggestions) and a
> creator economy on public routines/communities.

**Q: What about safety / moderation?**
> Admin can deactivate any user (instantly invalidates their sessions),
> kick from any community, hard-delete with cascading cleanup of all owned
> data. Soft-deletes on messages keep the audit trail. Reporting / block
> flows are next on the roadmap.

**Q: Are you GDPR-ready?**
> Hard-delete cascades user data across all collections; soft-deletes wipe
> content. Email opt-in is implicit at signup. A formal data-export
> endpoint and consent management are the remaining gaps before EU launch.

**Q: How many tests do you have?**
> 65 end-to-end browser tests passing on every commit, plus backend smoke
> tests. Every commit goes through the suite — we don't ship broken builds.

---

## 7. Roadmap teasers (what's next)

Keep these vague enough to leave investors curious; concrete enough to feel
inevitable:

- **Wearable integrations** (Apple Watch, Garmin, Fitbit) — auto-log workouts.
- **AI-driven workout suggestions** based on goals + history.
- **Mobile native apps** (the web is already responsive; native is for push notifications and offline logging).
- **Community challenges & leaderboards** — turn communities into competitive surfaces.
- **Marketplace for coaches** — verified creators selling routines and 1:1 programs.
- **Real-time chat enhancements**: typing indicators, presence, reactions.
- **Geographic and demographic admin analytics** (cohort retention, funnel analysis).

---

## 8. Killer one-liners (for closing)

Pick one or two and use them as bookends.

- *"Every other fitness app is a tracker. We're an accountability platform."*
- *"We don't ping you 30 times a day. We ping you when it matters — and it works."*
- *"You can run this platform from day one. The admin console isn't an
  afterthought; it shipped with v1."*
- *"Sixty-five end-to-end tests pass on every commit. We don't ship broken
  builds."*

---

**Total walkthrough length: 15-20 minutes.**
**Recovery time if anything breaks: refresh the page, the SPA handles it.**

Good luck. 🔥
