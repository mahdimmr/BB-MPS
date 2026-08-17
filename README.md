# BB-PMS — Bimeh Bazar Performance Management System

سامانه مدیریت عملکرد بیمه بازار — a bilingual (Persian RTL / English LTR) performance
management application built around the handbook's four-month performance cycle.

This first slice delivers the **complete data model** plus **working API routes for the
performance cycle and the performance agreement (Phase 1)**. The remaining phases are
modelled in the schema and ready to be wired up.

## Stack

| Layer    | Choice                                                          |
| -------- | --------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn-style UI primitives |
| Backend  | Next.js route handlers, Zod validation, localized error envelopes |
| Database | PostgreSQL 17 + Prisma 7 (`prisma-client` generator, `@prisma/adapter-pg`) |
| Auth     | Session cookie signed with HMAC-SHA256, scrypt password hashing, RBAC |

Tailwind v4 ships RTL/LTR support natively (logical utilities such as `ps-*`, `ms-*`,
`text-start`, plus `rtl:` / `ltr:` variants), so the unmaintained `tailwindcss-rtl`
plugin is not needed — direction is switched by the `dir` attribute on `<html>`.

## Getting started

**Full stack (app + PostgreSQL) with Docker:**

```bash
cp .env.example .env          # optional; Compose has defaults. Set SESSION_SECRET in production.
npm run docker:up             # build, migrate, seed, then serve on http://localhost:3000
```

Stop with `npm run docker:down`. Follow app logs with `npm run docker:logs`.

## GitHub Pages

The interactive UI demo is published as a static site (no API or database) at:

**https://mahdimmr.github.io/BB-MPS/**

GitHub only serves the site root `https://mahdimmr.github.io/` from a repository named `mahdimmr.github.io`. This project lives in `BB-MPS`, so Pages uses the `/BB-MPS/` path. The demo is the client-side handbook UI; login APIs stay on Docker.

A push to `main` runs `.github/workflows/pages.yml`. In the repo, set **Settings → Pages → Source** to **GitHub Actions**. If the repository is private, GitHub Pages needs a public repo or GitHub Pro.

## Production deploy (GitHub Actions)

Pushes to `main` (and manual **Run workflow**) build `linux/amd64` images, publish them to GitHub Container Registry, then SSH to the server and run `scripts/deploy.sh` (pull → migrate → recreate app). Pull requests only build the images; they are not pushed or deployed. Production never seeds demo accounts.

### One-time server setup

1. Install Docker Engine and the Compose plugin.
2. Create the deploy directory and env file:

```bash
sudo mkdir -p /opt/bb-pms
sudo cp .env.production.example /opt/bb-pms/.env   # then edit secrets
```

`SESSION_SECRET` and `POSTGRES_PASSWORD` must be strong. `DATABASE_URL` must use host `postgres` (the Compose service name).

### GitHub repository settings

Create a **production** environment and add these secrets:

| Secret | Purpose |
| ------ | ------- |
| `DEPLOY_HOST` | Server hostname or IP |
| `DEPLOY_USER` | SSH user (needs Docker permission) |
| `DEPLOY_SSH_KEY` | Private key for that user |
| `DEPLOY_PATH` | App directory, e.g. `/opt/bb-pms` |
| `DEPLOY_PORT` | Optional, defaults to `22` |

The workflow already has `packages: write` so `GITHUB_TOKEN` can push to `ghcr.io/<owner>/<repo>/app` and `.../migrate`.

**Local Next.js + Postgres in Docker:**

```bash
cp .env.example .env          # adjust DATABASE_URL and SESSION_SECRET
npm install
npm run db:up                 # PostgreSQL 17 in Docker
npm run db:migrate            # apply migrations
npm run db:seed               # demo org chart, cycle 1405-Q2 and an agreement
npm run dev
```

Demo accounts (password `Bimeh@1405`):

| Role                       | Email                       |
| -------------------------- | --------------------------- |
| HR / Admin + Committee     | hr@bimehbazar.test          |
| Solid Lead (direct manager)| lead@bimehbazar.test        |
| Dotted Lead (tech lead)    | tech-lead@bimehbazar.test   |
| Committee Member           | committee@bimehbazar.test   |
| Employee                   | employee@bimehbazar.test    |

Verify the whole Phase 1 workflow and its guardrails (needs a freshly seeded
database, since it drives the seeded agreement from `DRAFT` to `APPROVED`):

```bash
npm run db:reset      # migrate reset + seed
bash scripts/smoke-api.sh
```

## Roles and authority

Roles grant a *capability class*; authority over a **specific** employee comes from the
reporting lines (`solidLeadId`, `dottedLeadId`) on `User`. A Solid Lead can only approve
for their own reports, never for someone else's.

- **HR / Admin** — owns cycles and company OKRs, administers calibration and the PIP committee.
- **Employee** — drafts goals, self-evaluates, logs 1:1s.
- **Solid Lead** — approves agreements, runs mid-term reviews, grades, leads PIPs.
- **Dotted Lead** — consultative: comments on goals, co-evaluates technical skill, inputs to calibration.
- **Committee Member** — independent PIP approval, calibration and termination review.

## The four-month cycle

A cycle is exactly four months; the API rejects any other duration
(`CYCLE_DURATION_INVALID`) and derives the milestones automatically:

| Milestone              | Default             |
| ---------------------- | ------------------- |
| `goalSettingDeadline`  | start + 1 month     |
| `midTermReviewDate`    | start + 2 months    |
| `finalEvaluationStart` | end − 15 days       |

`derivePhase()` maps "now" onto Phase 1 (goal setting) → Phase 2 (execution & 1:1s) →
Phase 3 (mid-term) → Phase 4 (final evaluation → calibration).

Cycle dates are normalized to the server's local day, so pin `TZ=Asia/Tehran` in
production to keep boundaries aligned with the Iranian working calendar. Persian dates
are rendered on the Jalali calendar through `Intl` (`fa-IR-u-ca-persian`).

## Phase 1 workflow (implemented)

```
DRAFT ──SUBMIT_FOR_REVIEW──▶ DOTTED_LEAD_REVIEW ──EMPLOYEE_SIGN──▶ EMPLOYEE_SIGNED
                                   │                                     │
                          DOTTED_LEAD_REVIEW                      MANAGER_SIGN
                        (records consultation)                          ▼
                                                                 MANAGER_SIGNED
                                                                        │ APPROVE
                                                                        ▼
                                        AMENDMENT_IN_PROGRESS ◀──▶ APPROVED (locked)
                                             REQUEST_AMENDMENT / COMPLETE_AMENDMENT
```

Enforced rules:

- Every agreement carries all three layers — **Strategic**, **Operational KPI**,
  **Developmental** — and weights must total exactly 100 before it can move forward.
- The employee can only sign after the dotted lead's consultation is recorded (when the
  employee has a dotted lead).
- The same person can never sign as both employee and manager.
- `APPROVE` sets `lockedAt`; edits then return `AGREEMENT_LOCKED`.
- Reopening a locked agreement requires a mid-term review flagged `AMENDMENT_NEEDED`
  (HR can override), and every amendment stores a before/after snapshot plus a reason.
- Only strategic goals may carry stretch flags or company-OKR alignment; only
  developmental goals may carry a competency category.

## API

All responses use `{ "data": ... }` or `{ "error": { code, message, details } }`, with
`message` localized from the request locale (`x-bbpms-locale` header → `bbpms_locale`
cookie → `Accept-Language` → Persian).

| Method                  | Path                                            | Who                             |
| ----------------------- | ----------------------------------------------- | ------------------------------- |
| `POST`                  | `/api/auth/login`, `/api/auth/logout`           | anyone                          |
| `GET`                   | `/api/auth/me`                                  | authenticated                   |
| `GET` `POST`            | `/api/cycles`                                   | read: all · write: HR           |
| `GET` `PATCH` `DELETE`  | `/api/cycles/{cycleId}`                         | read: all · write: HR           |
| `POST`                  | `/api/cycles/{cycleId}/status`                  | HR                              |
| `GET` `POST`            | `/api/cycles/{cycleId}/objectives`              | read: all · write: HR           |
| `GET` `POST`            | `/api/agreements`                               | scoped to reporting lines       |
| `GET` `DELETE`          | `/api/agreements/{id}`                          | employee, leads, HR             |
| `GET` `POST` `PUT`      | `/api/agreements/{id}/items`                    | employee, solid lead, HR        |
| `PATCH` `DELETE`        | `/api/agreements/{id}/items/{itemId}`           | employee, solid lead, HR        |
| `POST`                  | `/api/agreements/{id}/transition`               | per state machine               |
| `GET` `POST`            | `/api/agreements/{id}/comments`                 | employee, leads, HR             |

`PUT /items` replaces the full goal set in one transaction — the save action for the
collaborative split-screen goal-setting UI.

## Data model highlights

Beyond cycles and agreements, the schema already covers the rest of the handbook:

- `OneToOneMeeting` + `ActionItem` — Phase 2 logs ("what went well", roadblocks, actions).
- `MidTermReview` — `ON_TRACK` / `AMENDMENT_NEEDED` / `PERFORMANCE_RISK`, with
  `acknowledgedAt` and `evidenceMeetingIds` so a risk flag can never be a surprise.
- `FinalEvaluation` + `EvaluationItemScore` + `MultiLevelFeedback` — self-evaluation,
  per-layer manager scoring traced back to each agreed goal, and matrix input.
- `CalibrationSession` / `CalibrationParticipant` / `CalibrationAdjustment` — committee
  decisions with an immutable rating-change trail.
- `PIP` + `PipObjective` + `PipCoachingLog` + `CommitteeReview` — 1–2 month plans that
  require independent committee approval before they start.
- `ExitCase` — gated behind `EVIDENCE_REVIEW`; the checklist of prior warnings,
  documented 1:1s and shared feedback must be satisfied before termination proceeds.
- `AuditLog` — actor, action, before/after snapshot, IP and user agent for every mutation.

## Localization & tone

`src/lib/i18n/dictionaries/fa.ts` is the source of truth; `en.ts` must satisfy the same
type. The five tiers are translated as عالی / بالاتر از انتظار / در سطح انتظار /
نیازمند بهبود / ضعیف, each with a growth-oriented description — "needs improvement" is
presented as entry into a structured support system, not as a termination notice.

## Not built yet

Phase 2–4 route handlers and the UI screens (goal-setting split view, 1:1 logger,
mid-term form, calibration grid, PIP tracker). The schema, RBAC helpers, localized error
envelope and workflow-engine pattern are in place for them.
