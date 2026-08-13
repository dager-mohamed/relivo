# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working style

**Keep shell usage to a minimum — it is the main source of wasted tokens here.**

- Inspect files with Read/Glob/Grep, never by shelling out (`cat`, `ls`, `find`, `node -e "require(...)"` to print a `package.json`, etc.).
- Batch related shell work into **one** command rather than a sequence of small ones.
- Never poll in a loop (container health, port checks, retry-until-ready). Use a single bounded wait, or just run the next command and read its error if it isn't ready.
- Don't re-verify something a tool already confirmed — an `Edit`/`Write` that returned success does not need a follow-up `Read`.

## Repo shape

Turborepo + pnpm workspace (`pnpm@9.0.0`, Node >= 18). Workspace globs: `apps/*`, `packages/*`.

Three live packages:

- [apps/web/](apps/web/) — **TanStack Start** app (React 19, Vite 8, Nitro server adapter).
- [packages/ui/](packages/ui/) (`@repo/ui`) — shadcn/ui component library on Base UI primitives.
- [packages/db/](packages/db/) (`@repo/db`) — Drizzle + Postgres. **Dependencies installed, no code yet** (no schema, no `drizzle.config.ts`, scripts are still `echo` placeholders).

The rest is residue from the `create-turbo` starter:

- [packages/eslint-config/](packages/eslint-config/) and [packages/typescript-config/](packages/typescript-config/) — still Next.js-oriented (`next-js` eslint export, `nextjs.json` tsconfig). **No package extends them.** `apps/web` and `packages/ui` have standalone bundler-mode tsconfigs; the shared presets use `moduleResolution: NodeNext`, incompatible with how both are actually compiled. There is no ESLint setup anywhere in the repo.
- Root [README.md](README.md) describes a two-Next.js-app monorepo (`web` + `docs`). Untrue — `docs` was deleted and `web` is not Next.js.
- Root [vite.config.ts](vite.config.ts) is a stray byte-identical copy of [apps/web/vite.config.ts](apps/web/vite.config.ts). Nothing loads it. Edit the one in `apps/web`.

## pnpm gotchas (read before running installs)

**Path casing will break `pnpm add`.** On Windows, `pnpm add` inside a workspace member fails with:

```text
ERROR  Cannot destructure property 'manifest' of 'manifestsByPath[rootDir]' as it is undefined.
```

whenever the shell's cwd casing differs from the real on-disk path — e.g. `C:\Users\...\documents\...` vs the actual `Documents`. pnpm keys its manifest map by real paths but looks it up with the cwd string, and that lookup is case-sensitive even though the filesystem is not. `pnpm install` does **not** hit this lookup, so install can succeed while every `add` fails — which makes it look like a package-specific problem when it isn't. Fix by correcting the cwd (`cd $HOME\Documents\projects\relivo`), not by touching the manifests.

**esbuild is deliberately excluded from install scripts.** Root [package.json](package.json) sets `pnpm.onlyBuiltDependencies: ["lightningcss"]`. `esbuild` is off that list on purpose: `tsx` pulls esbuild 0.25.x while Vite 8 uses 0.28.2, only one `@esbuild/win32-x64` platform binary gets hoisted, and 0.28.2's postinstall self-check then runs the 0.25.12 binary and throws `Expected "0.28.2" but got "0.25.12"`. That postinstall only *validates*; real binaries arrive via the `@esbuild/*` optional deps, so skipping it is safe. Adding `esbuild` back to the list re-breaks every install. This field must stay at the **root** — pnpm ignores it in a workspace member (it was originally in `apps/web`, where it did nothing).

## Commands

Root (turbo fan-out):

```sh
pnpm dev      # turbo run dev  -> apps/web on :3000
pnpm build    # turbo run build
pnpm format   # prettier --write "**/*.{ts,tsx,md}"
pnpm lint         # no-op: no package defines a real lint script
pnpm check-types  # effectively @repo/ui only (see below)
```

`pnpm check-types` fans out to 5 packages but only `@repo/ui` has a real implementation — `apps/web` defines no such script, and `@repo/db`'s is an `echo` placeholder. **`apps/web` is not covered by any root command that would catch type errors.**

In `apps/web`:

```sh
pnpm dev              # vite dev --port 3000
pnpm build            # vite build -> dist/ (self-contained Node server)
pnpm preview
pnpm generate-routes  # tsr generate — regenerate src/routeTree.gen.ts by hand
pnpm exec tsc --noEmit       # the only way to typecheck; no script wraps it
node dist/server/index.mjs   # run the production build
```

There is **no test framework** — no runner, no config, no test files. `turbo.json` defines only `build`, `lint`, `check-types`, `dev`. One has to be set up before any test can be run.

`turbo.json`'s `build.outputs` still lists `.next/**`, which matches nothing; Vite writes to `dist/`. Update it if build caching matters.

## apps/web architecture

**Router assembly.** [src/router.tsx](apps/web/src/router.tsx) exports `getRouter()`, the factory TanStack Start calls on both server and client. It builds a fresh `QueryClient` per request via `getContext()` from [src/integrations/tanstack-query/root-provider.tsx](apps/web/src/integrations/tanstack-query/root-provider.tsx), passes it as router `context`, then calls `setupRouterSsrQueryIntegration` — that wiring is what dehydrates/rehydrates query cache across SSR, so route loaders can `ensureQueryData` and the client picks it up without refetching. The `declare module '@tanstack/react-router' { interface Register }` block at the bottom is what makes `Link`/`useParams`/etc. type-safe app-wide; it must stay.

**Root route.** [src/routes/\_\_root.tsx](apps/web/src/routes/__root.tsx) uses `createRootRouteWithContext<MyRouterContext>()` and defines `shellComponent`, not `component` — it renders the entire `<html>` document including `<HeadContent />` and `<Scripts />`. Route content lands where `{children}` is rendered. Adding a field to the router context means widening `MyRouterContext` here **and** returning it from `getContext()`.

**Routing.** File-based, `src/routes/`. [src/routeTree.gen.ts](apps/web/src/routeTree.gen.ts) is generated — never hand-edit it (`.vscode/settings.json` marks it read-only and excludes it from search). The Vite plugin regenerates it during `dev`/`build`; `pnpm generate-routes` is the out-of-band escape hatch.

**Vite plugin order matters.** In [apps/web/vite.config.ts](apps/web/vite.config.ts): `devtools()` must stay first, and `nitro()` externalizes `@sentry/*` from the server bundle. `resolve: { tsconfigPaths: true }` is what makes the tsconfig `paths` aliases resolve at build time.

**Import aliases.** Two exist and they are not equivalent:

- `#/*` → `./src/*` — declared in both `package.json` `imports` and tsconfig `paths`. The real, Node-native one; prefer it.
- `@/*` → `./src/*` — tsconfig `paths` only. Works because of `tsconfigPaths: true`, but has no `package.json` backing.

**Env vars.** [src/env.ts](apps/web/src/env.ts) uses `@t3-oss/env-core` + Zod over `import.meta.env`, with `emptyStringAsUndefined: true`. Client-exposed vars must be prefixed `VITE_` — enforced at both type and runtime level, so a client var without it throws. Server-only vars go in the `server` block. No `.env` file exists yet.

**Styling.** Tailwind v4 via `@tailwindcss/vite` — configured by `@import "tailwindcss"` in [src/styles.css](apps/web/src/styles.css). No `tailwind.config.js`; v4 doesn't need one.

## packages/ui (`@repo/ui`) — shadcn/ui

Source-only package, **no build step**: the `exports` map points at raw `.ts`/`.tsx` and consumers compile it. Layout is `src/components/` (flat — *not* `components/ui/`), `src/hooks/`, `src/lib/`, `src/styles/globals.css`. ~61 components are installed.

Configured in [packages/ui/components.json](packages/ui/components.json) as `style: base-nova`, `baseColor: neutral`, `iconLibrary: lucide`.

**Primitives are Base UI (`@base-ui/react`), not Radix.** Components import e.g. `@base-ui/react/button` and type props as `ButtonPrimitive.Props`. The overwhelming majority of shadcn material online is Radix-based and will **not** drop in. The `base-nova` preset also ships components with no Radix-era equivalent (`attachment`, `bubble`, `message`, `message-scroller`, `questionnaire`, `marker`, `direction`) — check `src/components/` before assuming something doesn't exist.

Add components by running the CLI **from `packages/ui`** so it reads that `components.json`:

```sh
cd packages/ui && pnpm dlx shadcn@latest add <component>
```

The aliases in `components.json` are self-referential (`@repo/ui/components`, `@repo/ui/lib/utils`), so generated files import through the package's own name. That resolves via the `paths` entry in [packages/ui/tsconfig.json](packages/ui/tsconfig.json) — keep it in sync with the `exports` map if either changes.

`shadcn` is a **runtime dependency**, not just a CLI: `globals.css` does `@import "shadcn/tailwind.css"`, resolved through that package's `exports`. Removing it breaks the stylesheet.

`globals.css` owns the theme — `@theme inline` tokens, `:root`/`.dark` oklch palettes, `@layer base` resets — plus `@source "../**/*.{ts,tsx}"`, which is what makes Tailwind scan this package from a consuming app. An app importing it must **not** also `@import "tailwindcss"`, or the base layer is emitted twice.

**Generated code vs. strict flags.** The tsconfig sets `noUnusedLocals`/`noUnusedParameters`, and CLI-generated components occasionally ship dead imports that fail `check-types` (`scroll-area.tsx` had an unused `import * as React`, since removed). Expect this after `shadcn add`; either strip the import or relax the flag.

**Nothing consumes this package yet.** To wire up `apps/web`: add `"@repo/ui": "workspace:*"` to its dependencies, then replace the `@import "tailwindcss"` line in [apps/web/src/styles.css](apps/web/src/styles.css) with `@import "@repo/ui/globals.css"`.

## packages/db (`@repo/db`)

Empty scaffold — only `package.json` and `README.md`. Installed: `drizzle-orm` + `drizzle-kit` **1.0.0-rc.4**, `pg`, `dotenv`, `tsx`, `@types/pg`.

**Drizzle is a v1 release candidate.** Nearly all Drizzle documentation, blog posts, and examples target 0.3x, and the v1 API differs. Verify against the installed version rather than copying 0.x snippets.

Still needed before this package does anything: a `drizzle.config.ts`, a schema, an exports map (it has none, so nothing can import it), and real scripts in place of the `echo` placeholders.

## packages/jobs (`@repo/jobs`) — BullMQ

Two entrypoints, and the split matters:

- `src/index.ts` — **producer only**. What tRPC imports to enqueue. It deliberately does not export workers; importing those from the web process would start consuming jobs inside the server.
- `src/worker.ts` — the consumer, run as its own process. `pnpm dev` starts it alongside the app (turbo runs both persistent `dev` tasks).

**Job payloads carry IDs, never rows.** The worker refetches from Postgres. A serialised row in Redis is stale the moment anything updates it, and it inflates memory per queued job.

Four settings in [workers/companies.ts](packages/jobs/src/workers/companies.ts) and [queues.ts](packages/jobs/src/queues.ts) that look arbitrary and are not — do not "tidy" them:

- **`lockDuration: 120_000`** (default is 30s). A job outliving its lock is treated as stalled and re-run by another worker. An AI call taking 60–90s would be billed twice and write duplicate rows. Most expensive mistake available here.
- **`attempts: 1`** by default. Retrying a payload that failed schema validation re-sends the identical bad input for the identical failure, at full cost. Retries are for network and rate-limit errors only — those opt in per-enqueue. Permanent failures throw `UnrecoverableError`, which stops retries even when `attempts > 1`.
- **`concurrency: 3` + `limiter`**. These jobs are IO-bound on an external API, so concurrency means "provider calls in flight", not cores.
- **`removeOnComplete`/`removeOnFail` bounded**. Unset, completed jobs accumulate in Redis forever — and with `noeviction` that eventually means writes fail outright.

Redis runs with `--maxmemory-policy noeviction` ([docker-compose.yml](docker-compose.yml)). BullMQ requires it: under any eviction policy Redis can drop job state under memory pressure, and jobs vanish with no error and no entry in the failed set.

`maxRetriesPerRequest: null` on the ioredis connection is also required — workers issue blocking commands that ioredis would otherwise abort, killing the worker loop.

> Self-hosting note: Redis is now a **required** service. This is the point where Relivo stops being a one-container deployment and becomes three (app, Postgres, Redis).

## TanStack Intent (important)

[apps/web/AGENTS.md](apps/web/AGENTS.md) is a machine-generated index of ~60 TanStack guidance skills, each with a `run:` command like:

```sh
npx @tanstack/intent@latest load @tanstack/router-core#router-core/data-loading
```

Before writing non-trivial TanStack code (server functions, middleware, loaders, search-param validation, table setup, SSR, deployment), scan that file for a matching `for:` description and load it. These pin down APIs for the exact versions installed here.

Version traps: **`@tanstack/react-table` is v9** (9.1.2) — `useTable` + explicit `tableFeatures`, **not** v8's `useReactTable`. Router is 1.170.x, Start is 1.168.x, Query is v5.

## Current state caveat

`@repo/ui` typechecks clean. `apps/web` does **not**: `pnpm exec tsc --noEmit` there reports three `noUnusedLocals` errors in [src/router.tsx](apps/web/src/router.tsx) — `ReactNode`, `QueryClient`, and `TanstackQueryProvider` imported but unused, left over from the create-tanstack-app scaffold. That is the baseline, not damage you caused.

Two peer-dependency warnings appear on every install (`@neodrag/core` under `@tanstack/react-devtools`, `lru-cache` under nitro's alpha `unstorage`). Both originate inside third-party dependency trees and are not actionable here.

The repo still has only the initial `create-turbo` commit; essentially the whole tree is uncommitted.
