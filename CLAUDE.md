# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Open-source CRM for founders who sell their own product. Attio/Linear ergonomics, not Salesforce. Inspired by operate.so.

**Three bets:**

1. **Precision over completeness.** Pipeline starts at _qualified_, ends at _closed_. No marketing automation, no lead scoring, no email sequencer.
2. **Feedback is a first-class object** with revenue attached. Each feature request shows the summed value of deals blocked on it. This is the differentiator — no CRM does it, no feedback tool knows your pipeline.
3. **Speed.** Command palette everywhere, minimal cards, no dropdown mazes.

The AI layer is the core product, not a bolt-on.

## Reference docs

- [PRODUCT.md](PRODUCT.md) — every object, field, screen, and behaviour. **Read before implementing any feature**, without being asked: a schema table or column, a tRPC procedure, a route or component in `apps/web`, or anything touching deals, companies, people, next steps, feedback, notes, or activity.
- [DECISIONS.md](DECISIONS.md) — why each technical and product choice was made, and what was rejected. **Read before proposing a stack or architecture change.**

Both live at the repo root, beside this file. PRODUCT.md is the _target_ design — most of it is unbuilt. When it disagrees with the code, PRODUCT.md says where things are going and "Current state" below says what exists today.

## Working with me

Solo developer, 19, engineering student, a few hours a week. Learning as I go — no prior AI/ML experience. I want to understand what I'm shipping, not accept diffs.

- **Explain the approach before writing code.** For anything non-trivial, describe the plan and wait. Two minutes reviewing a plan beats twenty reading a diff I don't understand.
- **Small changes over large ones.** Four reviewable 100-line diffs beat one 400-line diff. Stop at natural checkpoints.
- **Teach the unfamiliar parts**, especially `packages/ai` — retrieval, prompt structure, evals. A sentence on _why_ an approach is standard is worth more than the code.
- **Push back when I'm wrong.** Don't implement something you think is a mistake without saying so first.
- **Say when you're unsure.** TanStack Start is RC, Base UI and the Nova preset are new, AI SDK 7 is recent. Guessing at an API costs more than "I'd check the docs for this one."
- **Don't over-engineer.** No abstraction layers over dependencies, no premature generalization, no config for things that aren't varying yet. Propose the smaller version.
- **Comments stay short.** One line for the non-obvious _why_. No multi-paragraph blocks, no restating what the code says.

## Workflow

Work is tracked in Plane (project `RELIV`) — a Plane MCP server is available. Epics are parent work items; children are tasks. Labels: layer (`infra`/`backend`/`frontend`/`ai`/`database`/`integration`) plus GitHub-convention type labels.

1. I name a task. Read it from Plane — the description carries scope, acceptance criteria, and known traps.
2. Propose a plan. Wait for me.
3. Implement in reviewable steps.
4. Verify against the task's "Done when" list before declaring it finished.
5. **Tick the matching item in the README Roadmap** — `- [ ]` → `- [x]` — in the same change as the feature. That section states "checked items are merged and working," so only tick what is actually both. If nothing there matches what was built, say so rather than inventing a line.
6. One task per session where possible. Suggest `/clear` between tasks.

Some task descriptions begin with "defer this" and explain the trigger for doing it. Respect that; it's deliberate.

## Working style

**Keep shell usage to a minimum — it is the main source of wasted tokens here.**

- Inspect files with Read/Glob/Grep, never by shelling out (`cat`, `ls`, `find`, `node -e` to print a `package.json`).
- Batch related shell work into **one** command rather than a sequence.
- Never poll in a loop (container health, port checks, retry-until-ready). Use a single bounded wait, or run the next command and read its error.
- Don't re-verify what a tool already confirmed — a successful `Edit`/`Write` needs no follow-up `Read`.

## Stack

| Layer      | Choice                                                          |
| ---------- | --------------------------------------------------------------- |
| Monorepo   | Turborepo + pnpm workspaces                                     |
| App        | TanStack Start (React 19, Vite 8, Nitro)                        |
| API        | tRPC v11 + TanStack Query v5                                    |
| DB         | Postgres + pgvector, Drizzle ORM (v1 RC)                        |
| Auth       | Better Auth _(not built)_                                       |
| UI         | shadcn/ui — Base UI primitives, **Nova** preset — + Tailwind v4 |
| Jobs       | BullMQ + Redis                                                  |
| AI         | Vercel AI SDK 7 _(not built)_                                   |
| Validation | zod v4                                                          |

## Structure

```text
apps/web/          TanStack Start app
packages/ui/       shadcn components (shared)
packages/db/       Drizzle schema, migrations, client
packages/api/      tRPC routers
packages/jobs/     BullMQ workers
packages/schema/   Shared zod schemas
packages/auth/     Better Auth config only          NOT BUILT
packages/ai/       AI layer                          NOT BUILT
```

`packages/eslint-config` holds the shared flat config (`./base`, `./react`) and `packages/typescript-config` the shared tsconfig presets (`base.json`, `node.json`, `react.json`). Every package extends both — put shared settings there, not in a package.

**Dependency direction is strict:**

```text
db  <-  auth  <-  api  <-  apps/web
db  <-  ai    <-  api
db  <-  jobs  <-  api

schema  <-  db
```

- `packages/schema` sits at the bottom: it depends on **zod and nothing else**, and must never import `packages/db` — that would be a cycle, since `db` imports it for refinements.
- Table-derived zod schemas live in `@repo/db/zod`, not in `packages/schema`. `packages/db` already owns drizzle-orm, and drizzle-zod resolves its `drizzle-orm` peer from the package that depends on it — declaring it anywhere else installs a **second** copy of the ORM (0.45.2 alongside 1.0.0-rc.4), and drizzle-zod then fails to recognise table objects built by the other copy.
- Anything importing `@repo/db/zod` pulls `drizzle-orm/pg-core` with it. That is fine server-side. Before a client form imports it, measure the bundle — `apps/web` gets its types through tRPC inference and may not need the schema at all.

- `packages/ai` must NOT import from `packages/api`, and must not know tRPC or React exist. Plain data in, typed data out, testable in a standalone script.
- `apps/web` imports only the `AppRouter` **type** from `packages/api`. The sole exception is [routes/api/trpc/$.ts](apps/web/src/routes/api/trpc/%24.ts), which mounts the handler and is server-only.
- Auth tables (`user`, `session`, `account`, `verification`) live in `packages/db`, not `packages/auth`. One schema, one migration history.
- `packages/auth` splits exports: `./server` and `./client`. Never one shared module.

## Commands

```sh
pnpm dev          # turbo run dev -> apps/web on :3000 AND the jobs worker
pnpm build        # turbo run build
pnpm check-types  # all packages incl. apps/web
pnpm format       # prettier
pnpm lint         # eslint across all packages
```

`packages/db` (`cd packages/db`): `db:generate`, `db:migrate`, `db:push`, `db:pull`, `db:check`, `db:up`, `db:studio`, `db:export`, plus `db:seed` / `db:read`. All wrapped in `dotenv -e ../../.env --`.

`apps/web`: `pnpm dev`, `build` (→ `.output/`), `preview`, `generate-routes`, `check-types`.

There is **no test framework** — no runner, no config, no test files. `turbo.json` defines only `build`, `lint`, `check-types`, `dev`.

## Environment

One root `.env`, with `DATABASE_URL` and `REDIS_URL` declared in `turbo.json` under `globalEnv`.

**Turborepo never loads `.env` files.** `globalEnv` only declares which variables join the cache hash and survive strict-mode filtering. `dotenv-cli` in the package scripts is what populates `process.env` — that is why every long-running script is prefixed `dotenv -e ../../.env --`.

Vite's `envDir` is **not** sufficient on its own: it fills `import.meta.env` and only exposes `VITE_`-prefixed vars to client code, while server code reads `process.env`. `apps/web`'s dev script is wrapped for this reason.

## pnpm gotchas

**Path casing breaks `pnpm add`.** On Windows, `pnpm add` inside a workspace member fails with:

```text
ERROR  Cannot destructure property 'manifest' of 'manifestsByPath[rootDir]' as it is undefined.
```

whenever the shell's cwd casing differs from the real path (`...\documents\...` vs `...\Documents\...`). pnpm keys manifests by real path but looks up with the cwd string. `pnpm install` doesn't hit that lookup, so install succeeds while every `add` fails. Fix the cwd (`cd $HOME\Documents\projects\relivo`), not the manifests.

**`esbuild` is deliberately off `pnpm.onlyBuiltDependencies`** (root `package.json`). See DECISIONS.md — adding it back re-breaks every install. The field must stay at the **root**; pnpm ignores it in a workspace member.

## Hard rules

Non-obvious, each cost real debugging time. Don't violate without discussion.

### Drizzle / pgvector

- Use `drizzle-kit generate` + `migrate`. **Never `push` against a shared or deployed database** — it regenerates HNSW index DDL without the required operator class and Postgres rejects it. A `db:push` script exists for scratch databases only; see DECISIONS.md.
- Vector indexes live in hand-written migrations.
- Postgres image must be `pgvector/pgvector`, not plain `postgres`.
- Drizzle is a **v1 release candidate** and its API differs from the 0.3x material that dominates search results. Two that break copied snippets: `drizzle(client)` positional is not a valid overload (use `drizzle({ client })`), and there is no `{ schema }` option — the pg config type is `Omit<DrizzleConfig, 'schema'>`.

### Row-level security

Postgres RLS is the tenant-isolation model. **Not switched on yet** — there is no auth and one tenant — but the schema is designed for it, and the first rule below is binding today.

- **Every tenant-scoped table carries `workspaceId` from the moment it is created.** Retrofitting the column across eight tables means eight migrations plus a backfill plus every query touched; adding it as each table lands is free. Do not defer this one.
- **Enable RLS with `FORCE`, or have the app connect as a non-owner role.** Policies do not apply to the table owner, and with a single `DATABASE_URL` the app connects as the role that ran the migrations — so every policy silently does nothing while the setup looks correct. This is the usual way RLS ships switched off.
- **Set session context with `set_config('app.workspace_id', $1, true)` inside a transaction** — the trailing `true` scopes it to that transaction. A bare `SET` persists on a pooled postgres.js connection, so the next request to borrow it inherits another tenant's context. That is a cross-tenant leak caused by the isolation feature itself.
- RLS enabled with no policy is **default deny**: tables read as empty rather than erroring.
- Workers have no session. Either they connect as a `BYPASSRLS` role or `workspaceId` travels in the job payload — compatible with the "payloads carry IDs, never rows" rule.
- Procedures still filter explicitly (`where workspaceId = ctx.session.workspaceId`). RLS is the backstop for the day someone forgets, not permission to omit it.
- Policies are DDL — `drizzle-kit generate` + `migrate` like everything else. Roles Drizzle does not manage need `entities.roles` in `drizzle.config.ts`, or generate tries to drop them.

### Zod schemas

- **A new table is not done until its zod schemas exist.** Adding a table means, in the same change: the Drizzle table in `schema.ts`, the migration, a `src/zod/<entity>.ts`, and its line in `src/zod/index.ts`. A table without schemas leaves every caller free to invent its own shape, which is the drift this setup exists to prevent.
- **Never hand-write a shape that a table already describes.** Derive it — `createInsertSchema` / `createSelectSchema`, update derived from insert. tRPC procedures take these via `.input()`; a router defining its own parallel `z.object` for a table is a bug.
- Values that are not one table's business — money, shared enums, AI task outputs — go in `@repo/schema` and get applied as refinements. It depends on zod only; see the dependency rules above.
- See `packages/db` below for the two drizzle-zod refinement traps before writing one.

### BullMQ

- `lockDuration` must exceed max AI call duration (120s is set). The 30s default causes stalled-job re-runs — paying twice and writing duplicates.
- `attempts: 1` on anything that can fail zod validation. Retrying a schema violation burns money on the same bad output. Permanent failures throw `UnrecoverableError`.
- Redis runs `--maxmemory-policy noeviction`. Any eviction policy lets Redis drop job state silently.
- `maxRetriesPerRequest: null` on the ioredis connection is required, or blocking commands abort and kill the worker loop.

### tRPC

- tRPC does NOT carry streaming to `useChat`. Anything streaming goes through a TanStack Start server route (`apps/web/src/routes/api/ai/*`). tRPC handles CRUD and non-streaming `generateObject` only. Both call into `packages/ai`.
- superjson is configured on both ends. Without it Dates arrive as strings while the inferred type still says `Date`.

### Tailwind v4 + monorepo

- No `content` array in v4. Scanning is declared with `@source`, resolved **relative to the CSS file**.
- `packages/ui/src/styles/globals.css` declares its own `@source "../**/*.{ts,tsx}"`, so a consuming app needs no per-app configuration — just `@import "@repo/ui/globals.css"`.
- An app importing that file must **not** also `@import "tailwindcss"`, or the base layer is emitted twice.

### shadcn

- Run the CLI **from `packages/ui`**: `cd packages/ui && pnpm dlx shadcn@latest add <component>`. It reads that package's `components.json` and writes to `src/components/` (flat, _not_ `components/ui/`). This works — see DECISIONS.md.
- Primitives are **Base UI** (`@base-ui/react`), not Radix. Most shadcn material online is Radix-based and will not drop in.
- `shadcn` is a **runtime dependency**: `globals.css` does `@import "shadcn/tailwind.css"`.
- Generated components sometimes ship dead imports that fail `noUnusedLocals`. Strip them.

### ESLint / Prettier

- Rules live **only** in `@repo/eslint-config` (`./base` for Node/TS, `./react` for React). Each package's `eslint.config.js` is a thin re-export — don't define rules there.
- **Type-aware linting is on** (`parserOptions.projectService`). That is what makes `@typescript-eslint/no-floating-promises` and `no-misused-promises` work, and it is the reason lint takes seconds rather than milliseconds. Both are **errors**, not warnings.
- `eslint-plugin-only-warn` was removed deliberately — it downgraded every error to a warning, so lint could never fail.
- `packages/ui/src/components/**` is ignored: the shadcn CLI overwrites it on every `add`.
- Prettier owns formatting; `eslint-config-prettier` is last in the chain so no rule fights it. `prettier-plugin-tailwindcss` sorts class strings, configured against `packages/ui/src/styles/globals.css` (Tailwind v4 has no config file to point at).

### TanStack Start

- Currently v1 RC. The stated rule is to pin versions exactly, no carets — **`apps/web` currently uses `"latest"` for every `@tanstack/*` dep**, which contradicts it. Open question in DECISIONS.md.
- `server` on `createFileRoute` comes from a declaration merge in `@tanstack/start-client-core`. If nothing in `src/` imports a Start package, TypeScript never loads it and `server` is a type error. Fix with `import type {} from '@tanstack/react-start'`.
- `setupRouterSsrQueryIntegration` installs its own `QueryClientProvider` by composing `router.options.Wrap`. Do not add a second one.

## apps/web architecture

**Router assembly.** [src/router.tsx](apps/web/src/router.tsx) exports `getRouter()`, called on both server and client. It builds a `QueryClient` per request, adds the tRPC options proxy, and calls `setupRouterSsrQueryIntegration` — that wiring dehydrates/rehydrates query cache across SSR. The `declare module '@tanstack/react-router'` block makes `Link`/`useParams` type-safe app-wide; it must stay.

**Root route.** [src/routes/\_\_root.tsx](apps/web/src/routes/__root.tsx) uses `createRootRouteWithContext<MyRouterContext>()` and defines `shellComponent`, not `component` — it renders the whole `<html>`. Adding a router-context field means widening `MyRouterContext` here **and** returning it from the context factories.

**Routing.** File-based, `src/routes/`. `src/routeTree.gen.ts` is generated — never hand-edit (`.vscode/settings.json` marks it read-only). `pnpm generate-routes` is the out-of-band escape hatch.

**Vite.** `devtools()` must stay first; `nitro()` externalizes `@sentry/*`. `resolve: { tsconfigPaths: true }` is what makes the `paths` aliases resolve.

**Import aliases.** `#/*` → `./src/*` is declared in both `package.json` `imports` and tsconfig `paths` — prefer it. `@/*` is tsconfig-only.

## packages/db

`schema.ts` (tables + `Company`/`NewCompany` types), `zod/` (drizzle-zod schemas derived from those tables), `client.ts`, `orm.ts` (re-exports drizzle helpers so nothing else depends on `drizzle-orm`), `index.ts`, plus `scripts/seed.ts` and `scripts/read.ts`.

`zod/` is **one file per entity** (`company.ts`, then `deal.ts`, `nextStep.ts`… as tables land) with `zod/index.ts` re-exporting them. Exported as `@repo/db/zod` and deliberately kept off the package's own `index.ts`, same reasoning as `orm.ts`. Two drizzle-zod traps: passing a bare schema as a refinement **replaces** the generated one (losing `.optional()` on update schemas), while the callback form `(s) => s.max(20)` extends it. Derive update schemas from the insert schema instead of calling `createUpdateSchema` separately, so refinements are declared once.

Migrations are committed under `drizzle/`. Postgres runs on **host port 5434** — 5432 and 5433 were taken.

## packages/api

`context.ts` (db per request; `session` lands here when Better Auth arrives), `trpc.ts` (superjson), `routers/`, `root.ts` exporting `appRouter` and `AppRouter`.

## packages/jobs

Two entrypoints and the split matters: `src/index.ts` is **producer-only** (what tRPC imports to enqueue); `src/worker.ts` is the consumer process. Exporting workers from `index.ts` would start job processing inside the web server.

**Job payloads carry IDs, never rows.** The worker refetches from Postgres — a serialised row is stale immediately and inflates Redis memory.

> Self-hosting: Redis is a **required** service. This is where Relivo stops being one container and becomes three.

## AI layer _(not built)_

Not machine learning. API orchestration with typed schemas. Quality is ~90% context assembly, ~10% model choice.

**Every AI feature is a `defineTask`** — context builder + prompt + zod output schema + capability requirements. Adding a feature means copying one file. `defineTask` owns retries, capability checks, token logging, caching, error normalization.

```text
packages/ai/src/
  providers/   model registry
  context/     dealContext(dealId) -> DealContext   (pure SQL, no LLM)
  tasks/       one file per feature
  tools/       tool defs for agentic features
  evals/       fixtures + assertions
```

Three patterns, different infra: _structured generation_ (`generateObject` + zod — start here), _scoped chat_ (`streamText` + tools via server route), _background_ (BullMQ).

**Retrieval.** Local embeddings (`fastembed-js` / `bge-small-en-v1.5`, 384 dims). Store model name + dimension per row — switching models means a full reindex. **Hybrid search is mandatory**: Postgres `tsvector` + vector similarity fused with RRF, because CRM text is full of proper nouns and pure semantic search fails on exact names. Filter by metadata before vector search. Chunk by semantic unit (one note, one email), not fixed windows; store a `contentHash` to skip unchanged rows.

**Cost discipline.** On-disk response cache keyed by `hash(model + messages + schema)`, gitignored at `.ai-cache/` — re-running evals after code-only changes must cost $0. Two fixture tiers: 3 small for the inner loop, 20 realistic pre-merge. Log tokens + cost per call. Iterate prompts on a cheap model, validate on the good one.

**Evals before the second prompt.** Fixtures + assertions on shape and invariants (never suggests steps on a closed-won deal, always ≤5 results, `dueInDays` never negative). Without this every prompt tweak is a coin flip.

## TanStack Intent

[apps/web/AGENTS.md](apps/web/AGENTS.md) indexes ~60 TanStack guidance skills, each with a `run:` command:

```sh
npx @tanstack/intent@latest load @tanstack/router-core#router-core/data-loading
```

Before writing non-trivial TanStack code (server functions, middleware, loaders, search-param validation, table setup, SSR, deployment), scan it for a matching `for:` description and load it. These pin down APIs for the exact versions installed.

**`@tanstack/react-table` is v9** (9.1.2) — `useTable` + explicit `tableFeatures`, not v8's `useReactTable`. Router 1.170.x, Start 1.168.x, Query v5.

## Scope discipline

V1 is: Deals + Companies + People + Next Steps + Feedback-with-revenue + command palette + email sync + suggested next steps + deal coaching.

**Deferred:** playbooks, momentum view, agent orchestration, custom fields, public API, CSV import, Arabic/RTL.

When in doubt, propose the smaller version. Prefer a working vertical slice over a complete layer.

## Current state

Built and typechecking: `apps/web`, `@repo/ui` (~61 components), `@repo/db`, `@repo/api`, `@repo/jobs`, `@repo/schema`.

The database has **one table** — `companies` (`id`, `name`, `domain`, `createdAt`). Everything else in PRODUCT.md is unbuilt. Don't read the spec and assume it is broken.

`@repo/schema` holds only what cannot be derived from a table: `primitives.ts` (`money`, `domain`). Shared enums and AI output schemas go here as they arrive. Entity CRUD schemas do **not** — those are generated by drizzle-zod under `packages/db/src/zod/`, one file per entity, currently just `company.ts` (`companyInsert` / `companyUpdate` / `companySelect`).

Not yet built: `packages/auth`, `packages/ai`, any test setup, email sync, and every screen in PRODUCT.md.

Root `README.md` is current and maintained — it carries the public Roadmap that step 5 of the Workflow keeps in sync. Treat it as accurate.
