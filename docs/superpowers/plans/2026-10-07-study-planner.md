# Study Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build v1 study planner MVP where a student signs up → adds subjects/tasks/resources/availability → generates a feasible week → marks done/skip → regenerates.

**Architecture:** Next.js monolith (App Router); UI → services → repositories → Prisma → Postgres. Pure `lib/planner` with swappable Strategy, Factory-validated slots.

**Tech Stack:** Next.js (App Router, TS), Prisma + Postgres (Neon), Auth.js v5 credentials+bcrypt, Zod, vitest.

**Spec:** `docs/superpowers/specs/2026-10-07-study-planner-design.md`

## Global Constraints

- Stack is Next.js full-stack monolith + Prisma + Postgres (Neon) + Auth.js v5.
- All tables scoped by `userId`; repos always filter by `session.userId`, never trust client-sent `userId`.
- Validation via Zod in `lib/validators/*`; errors `401` unauth, `403` cross-user, `422` validation/over-capacity, `404` missing.
- Planner is pure domain in `lib/planner/*` with no framework imports.
- `lib/db.ts` exports Singleton PrismaClient.
- UI never imports Prisma; writes go UI -> `lib/services/*` -> `lib/repositories/*` -> Prisma.
- Minutes-since-midnight for all slots; week = Mon..Sun from `weekStart`; `weekday 0=Monday`; null deadline sorts last.
- Pre-push: `next build`, `tsc --noEmit`, `vitest run`.
- Env: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`; no secrets in repo.

## Review Focus

- Overlap / double-booking: back-to-back splits must not overlap and must stay within the source free block — expect no overlapping items on the same weekday.
- Over-capacity honesty: demand > supply must not crash — expect `unfit[]` with `shortMin` and UI warning "9h available, 12h demanded".
- Cross-user isolation: fetching another user's taskId must return 403/404, never data.
- Invalid URL accepted as resource: expect 422 when `url` is not http(s).
- `startMin < endMin` violation in availability: expect 422, no partial save.
- Idempotent regenerate: POST generate twice for same `weekStart` must not duplicate items.

---

### Task 1: Scaffold + Prisma schema + Auth skeleton

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `middleware.ts`, `.env.example`
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`, `lib/auth.ts`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: none
- Produces: `db: PrismaClient` from `lib/db.ts`; `auth(): Promise<{userId}|null>` from `lib/auth.ts`; Prisma models `User, Subject, Task, Resource, Availability, WeeklyPlan, PlanItem` per spec §3.

- [ ] **Step 1: Scaffold Next.js + TS + Prisma + Auth.js + Zod + vitest**

Run: `& "C:\Program Files\nodejs\npm.cmd" init -y` then install `next react react-dom prisma @prisma/client next-auth@beta bcryptjs zod vitest` + dev `typescript @types/* vitest`.
Expected: `package.json` with `next build`, `tsc --noEmit`, `vitest run` scripts.

- [ ] **Step 2: Write `prisma/schema.prisma` per spec §3 (User/Subject/Task/Resource/Availability/WeeklyPlan/PlanItem, indexes, cascades)**

Run: `& "C:\Program Files\nodejs\npx.cmd" prisma validate`
Expected: PASS.

- [ ] **Step 3: Implement `lib/db.ts` singleton + `lib/auth.ts` credentials stub + `middleware.ts` protecting `/dashboard/:path*`**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Smoke `next build`**

Run: `npm.cmd run build`
Expected: PASS (DB not required at build).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold nextjs prisma auth foundation"
```

### Task 2: Pure planner engine (no framework imports)

**Files:**
- Create: `lib/planner/types.ts`, `lib/planner/strategy.ts`, `lib/planner/urgencyPlanner.ts`, `lib/planner/factory.ts`
- Test: `lib/planner/urgencyPlanner.test.ts`

**Interfaces:**
- Consumes: none
- Produces: `generatePlan(tasks: PlanTask[], blocks: FreeBlock[], strategy?: PlannerStrategy): { items: PlanItemDTO[]; unfit: {taskId; shortMin}[] }`; `PlanTask{taskId,deadline:Date|null,priority:0|1|2,estimatedMin}`; `FreeBlock{weekday,startMin,endMin}`.

- [ ] **Step 1: Write failing test — sorts by deadline ASC nulls-last then priority DESC**

```ts
// urgencyPlanner.test.ts
test("schedules HIGH Wed before LOW no-deadline when over capacity", () => {
  const { items, unfit } = generatePlan([dbTask, osLab, dsa], nineHourBlocks);
  expect(items.map(i=>i.taskId)).toContain("os-lab");
  expect(unfit).toEqual([{ taskId: "db", shortMin: 180 }]);
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run lib/planner/urgencyPlanner.test.ts`
Expected: FAIL with "not defined".

- [ ] **Step 3: Implement `UrgencyPlanner` greedy earliest-block + split + `PlanItemFactory.fromAllocation` validation (start<end, no overlap, within block)**

Run: `npx vitest run lib/planner/urgencyPlanner.test.ts`
Expected: PASS (3 tests: sort, split-across-days, unfit).

- [ ] **Step 4: Add split + unfit + overlap-guard tests, run full suite**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/planner vitest.config.* 2>/dev/null; git add -A
git commit -m "feat: add urgency planner engine"
```

### Task 3: Validators + repositories + services

**Files:**
- Create: `lib/validators/{subject,task,resource,availability}.ts`
- Create: `lib/repositories/{subjectRepo,taskRepo,resourceRepo,availabilityRepo,planRepo}.ts`
- Create: `lib/services/{subjectService,taskService,planService}.ts`

**Interfaces:**
- Consumes: `db` from Task 1, planner `generatePlan` from Task 2.
- Produces: `planService.generate(userId, weekStart): Promise<{plan,items,unfit}>` (idempotent per weekStart, transaction overwrite); `taskService.setStatus(userId,taskId,status)`; repos `listByUser(userId,…)`, all throw `DomainError(code)` mapped to 404/403/422.

- [ ] **Step 1: Write Zod validators (url http(s), estimatedMin 15..480, weekday 0..6, startMin<endMin)**

Run: `npx vitest run lib/validators`
Expected: PASS (reject bad url, reject start>=end, reject estimatedMin 0).

- [ ] **Step 2: Implement repos (all `where:{userId,…}`) + services (planService does TODO-filter → generatePlan → tx delete+insert)**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add validators repos services"
```

### Task 4: Route handlers (REST per spec §4)

**Files:**
- Create: `app/api/subjects/route.ts`, `app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts`, `app/api/resources/route.ts`, `app/api/availability/route.ts`, `app/api/plans/generate/route.ts`, `app/api/plans/current/route.ts`

**Interfaces:**
- Consumes: services from Task 3, session `userId`.
- Produces: REST per spec §4; `POST /generate {weekStart}` → `{plan,items,unfit}`, idempotent; `GET /current?weekStart` → 404 when missing.

- [ ] **Step 1: Implement handlers with Zod entry + DomainError→status mapping (401/403/422/404)**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 2: Integration check — seeded `POST /api/plans/generate` asserts `sum(items) <= supply`**

Run: `npx vitest run tests/plans.generate.test.ts` (or manual `curl` if no DB configured)
Expected: PASS / documented skip when `DATABASE_URL` unset.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add api routes"
```

### Task 5: Dashboard UI (planner flow end-to-end)

**Files:**
- Create: `app/(dashboard)/planner/page.tsx`, `app/(dashboard)/subjects/page.tsx`, `app/(dashboard)/resources/page.tsx`
- Create: `components/{PlannerGrid,TaskForm,ResourceCard,AvailabilityEditor}.tsx`

**Interfaces:**
- Consumes: APIs from Task 4.
- Produces: Login → 2 subjects + 3 tasks + availability → Generate → grid with `unfit` warning → done/skip → regenerate works.

- [ ] **Step 1: Build Server-Component reads + Client forms/calendar only where needed; show "9h available, 12h demanded — 3h unscheduled" from `unfit`**

Run: `npm.cmd run build`
Expected: PASS.

- [ ] **Step 2: Manual script: login → add subjects/tasks/resources/availability → generate → done/skip → regenerate, no duplicates**

Run: manual + `npx tsc --noEmit`
Expected: PASS, idempotent regenerate verified.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add dashboard planner UI"
```
