# Study Planner for CS Students — System Design Spec

**Date:** 2026-10-07
**Status:** Approved (Sections 1-5 reviewed in chat)
**Stack:** Next.js full-stack (App Router) + Prisma + Postgres (Neon) + Auth.js v5
**Repo:** `C:\Users\user\Desktop\website` (greenfield)

## 1. Intent (agreed brief)

- **Outcome:** Website that helps CS students organize time, save study resources per subject, and get an auto-generated personalized weekly plan.
- **Planner input (Choice B):** available hours + subjects + deadlines + priority + estimated hours per task.
- **Resources (Choice B):** user-saved links only. No curated library in v1.
- **Persistence (Choice A):** accounts + login, multi-user, cloud DB with sync.
- **Stack (Choice B):** Next.js full-stack monolith.
- **Success for v1:** student can sign up → add subjects/tasks/resources/availability → click Generate → see a feasible week → mark done/skip → regenerate.

## 2. Architecture Decision

### 2.1 Options considered

**Option 1 — Next.js monolith + Prisma + Postgres + Auth.js (CHOSEN)**
Single Vercel deploy: UI + API + ORM + Postgres (Neon/Supabase free tier). Relational model fits `users → subjects → tasks → slots → plan_items`. Auth.js for credentials/OAuth.
Pros: fewest parts, type-safe, SQL handles deadline/priority sorting. Cons: must learn Prisma basics.

**Option 2 — Next.js + Supabase BaaS (Auth + DB via SDK)**
Faster auth UI, no Prisma. Cons: logic leaks into UI, planner harder to unit-test, RLS learning curve. Use when realtime collaboration is needed.

**Option 3 — Next.js + Mongo + custom JWT**
Flexible docs for links. Cons: hand-rolled auth, no FK integrity, app-side sorting. Rejected for v1.

### 2.2 Container architecture (CHOSEN)

```
Browser (React Server + Client Components)
  -> HTTPS
Next.js (Vercel): /app (UI) + /api (Route Handlers + Server Actions)
  -> Prisma
Postgres (Neon): users, subjects, tasks, resources, availability, weekly_plans
```

- `app/(auth)` public, `app/(dashboard)` protected by `middleware.ts`.
- Server Components for reads; Client Components only for calendar + forms.
- All writes: UI -> `lib/services/*` -> `lib/repositories/*` -> Prisma. UI never imports Prisma.
- `lib/db.ts` exports Singleton PrismaClient (prevents hot-reload connection storms).
- Auth session injects `userId` server-side for every call.

### 2.3 Design patterns (global)

- **Singleton:** PrismaClient instance.
- **Repository:** one per entity, isolates persistence.
- **Facade/Service:** `planService`, `taskService` orchestrate repos + planner.
- **Decorator/Middleware:** auth guard.
- **Strategy:** swappable planner algorithms.
- **Factory:** `PlanItemFactory` builds validated slots.
- **DTO:** planner uses plain structs, never Prisma models.

## 3. Data Model

All tables scoped by `userId`. Prisma schema is source of truth.

- `User(id, email UNIQUE, passwordHash, createdAt)`
- `Subject(id, userId FK, name, color, examDate?, createdAt)` — e.g. OS, DSA, DB. Index `(userId, name)`.
- `Task(id, subjectId FK, userId FK, title, deadline DateTime?, priority LOW|MED|HIGH, estimatedMin INT 15..480, status TODO|DOING|DONE|SKIPPED, createdAt)` — Index `(userId, deadline, priority)`.
- `Resource(id, subjectId FK, userId FK, title, url, type VIDEO|DOC|COURSE|REPO|OTHER, createdAt)` — validate `url` is http(s). Index `(userId, subjectId)`.
- `Availability(id, userId FK, weekday 0..6, startMin 0..1439, endMin 0..1439)` — constraint `startMin < endMin`. UI submits whole-week matrix in one PUT.
- `WeeklyPlan(id, userId FK, weekStart Date, createdAt)` + `PlanItem(id, planId FK, taskId FK, weekday, startMin, endMin)` — regenerating a week overwrites items in a transaction.

Rules:
- FK deletes: `Subject` delete cascades to `Task`, `Resource`; `WeeklyPlan` delete cascades to `PlanItem`.
- No curated-resources tables in v1 (explicit non-goal).

## 4. API Contracts (REST, Route Handlers)

Base: `/api`. All require session except `/api/auth/*`. Validation via Zod in `lib/validators/*`. Errors: `401` unauth, `403` cross-user, `422` validation/over-capacity, `404` missing.

```
POST   /api/subjects            { name, color, examDate? } -> Subject
GET    /api/subjects            -> Subject[] with task counts
POST   /api/tasks               { subjectId, title, deadline?, priority, estimatedMin } -> Task
GET    /api/tasks?status=TODO   -> Task[]
PATCH  /api/tasks/[id]          { status | title | deadline | priority | estimatedMin } -> Task
POST   /api/resources           { subjectId, title, url, type } -> Resource
GET    /api/resources?subjectId -> Resource[]
DELETE /api/resources/[id]      -> 204
PUT    /api/availability        { slots: [{ weekday, startMin, endMin }] } -> Availability[]
POST   /api/plans/generate      { weekStart: "2026-10-12" } -> { plan: WeeklyPlan, items: PlanItem[], unfit: [{ taskId, shortMin }] }
GET    /api/plans/current?weekStart -> { plan, items } | 404
```

`POST /generate` is idempotent per `weekStart`: deletes existing items for that week in same transaction before inserting.

## 5. Auto-Planner Engine (`lib/planner/*`, no framework imports)

Pure domain module. Signature:

```ts
interface PlanTask { taskId: string; deadline: Date | null; priority: 0|1|2; estimatedMin: number; }
interface FreeBlock { weekday: number; startMin: number; endMin: number; }
generatePlan(tasks: PlanTask[], blocks: FreeBlock[], strategy?: PlannerStrategy): { items: PlanItemDTO[], unfit: { taskId: string; shortMin: number }[] }
```

**v1 algorithm (`UrgencyPlanner`):**
1. Filter to TODO tasks with `estimatedMin > 0`.
2. Sort by `deadline ASC (nulls last), priority DESC`.
3. Expand availability into sorted free blocks for Mon..Sun of `weekStart`.
4. Greedily allocate earliest blocks, splitting a task across days if needed.
5. If demand > supply, lowest-score tasks go to `unfit[]` with `shortMin` remaining.
6. `PlanItemFactory.fromAllocation()` validates `start < end`, no overlap, within block.

**Example:** 9h supply; OS Lab (HIGH, Wed, 4h) + DSA (MED, Fri, 5h) + DB (LOW, no deadline, 3h) → first two scheduled, DB → `unfit: 3h short`.

Future strategies (`BalancedPlanner`, `ExamPlanner`) implement same `PlannerStrategy` interface; `POST /generate` picks via param without API change.

## 6. Auth, Validation, Errors

- **Auth:** Auth.js v5 credentials + bcrypt (OAuth-ready). `middleware.ts` protects `/dashboard/:path*`. Repos always filter by `session.userId`; never trust client-sent `userId`.
- **Validation:** Zod at handler entry. UI shows field errors from `422`.
- **Errors:** services throw `DomainError(code)`; handler maps: `NotFound->404`, `OverCapacity->422+unfit`, `Forbidden->403`. Planner over-capacity is NOT a crash: UI shows "9h available, 12h demanded — 3h unscheduled".
- **Logging:** `console.error` + Vercel logs in v1. No Sentry.

## 7. Project Structure

```
app/(auth)/login/page.tsx
app/(dashboard)/planner/page.tsx
app/(dashboard)/subjects/page.tsx
app/(dashboard)/resources/page.tsx
app/api/subjects/route.ts
app/api/tasks/route.ts
app/api/tasks/[id]/route.ts
app/api/resources/route.ts
app/api/availability/route.ts
app/api/plans/generate/route.ts
app/api/plans/current/route.ts
lib/db.ts
lib/auth.ts
lib/validators/{subject,task,resource,availability}.ts
lib/services/{planService,taskService,subjectService}.ts
lib/repositories/{taskRepo,subjectRepo,resourceRepo,availabilityRepo,planRepo}.ts
lib/planner/{strategy.ts,urgencyPlanner.ts,factory.ts,types.ts}
components/{PlannerGrid,TaskForm,ResourceCard,AvailabilityEditor}
prisma/schema.prisma
middleware.ts
```

Conventions: one service per aggregate, one repo per table, no generic base classes in v1.

## 8. Testing

- Unit (`vitest`): `urgencyPlanner.test.ts` — (a) sorts by deadline+priority, (b) splits task across days, (c) returns `unfit` when over capacity.
- Integration: `POST /api/plans/generate` with seeded user asserts `sum(items) <= supply`.
- Manual script: login → 2 subjects + 3 tasks + availability → generate → done/skip → regenerate.
- OUT: Playwright/Cypress, coverage gates. Add on regression.

## 9. Deploy & Config

- Vercel (app) + Neon Postgres. `prisma migrate deploy` on release.
- Env: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`. No secrets in repo.
- Pre-push: `next build`, `tsc --noEmit`, `vitest run`. No Docker/CI in v1.

## 10. MVP Scope

**IN:** auth, CRUD subjects/tasks/resources/availability, generate/view/regenerate week, mark done/skip, `unfit` warning.
**OUT (future extensions, not rewrites):** curated library, reminders/notifications (Observer), drag-rebalance, mobile app, AI estimation, sharing, energy-level matching. Each maps to a new Strategy/Observer.

## 11. Self-Review

- Placeholders: none — all entities, routes, and algorithm steps are concrete.
- Consistency: planner DTOs match API `unfit` shape; repos always carry `userId`; idempotent generate matches Section 5.
- Scope: single-spec size; OUT list prevents creep.
- Ambiguity resolved: week = Mon..Sun from `weekStart`; `weekday 0=Monday`; minutes-since-midnight for all slots; null deadline sorts last.

## 12. Next Step

Invoke `writing-plans` skill to break this spec into implementable tasks. Do NOT start coding until implementation plan is approved.
