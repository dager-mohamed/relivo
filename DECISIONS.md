# Relivo — Decisions

Why things are the way they are. If you're about to suggest changing one of these, read the entry first — the alternative was probably already considered and rejected for a reason that still holds.

Format: decision, reasoning, what was rejected, and what would change our mind.

---

## Product

### Scope: qualified → closed only

Pipeline starts at _qualified_ and ends at _closed_. No lead capture, no lead scoring, no marketing automation, no email sequencing.

**Why:** The user is a founder with 5–40 deals doing sales themselves. Their problem is not generating leads, it's not dropping the ones they have. Every feature outside this range makes the product harder to learn and competes with tools that do it better.

**Rejected:** Full-funnel CRM. It's what makes HubSpot and Salesforce unusable for this user, which is the whole reason Relivo exists.

**Would change our mind:** Repeated churn where users say they left for a tool that also did X. Not one user asking.

### Feedback as a first-class object with revenue attached

Feedback sits alongside Deals/Companies/People, not inside them. Each item shows the summed value of deals linked to it, and the board sorts by that.

**Why:** This is the actual differentiator. CRMs don't track feature requests; feedback tools (Canny, Productboard) don't know your pipeline. The combination answers "what should I build next" with money instead of upvote counts. Everything else in Relivo is table stakes — this isn't.

**Consequence:** The loop must close. When a feature ships, Relivo surfaces the deals that were blocked on it. Skipping that step reduces this to a worse Canny.

### Deferred: playbooks, momentum view, agent orchestration, custom fields, public API, CSV import, Arabic/RTL

**Why:** All only matter once a user has real pipeline in the system. A solo student developer building all of them ships nothing. Custom fields in particular are a trap — they push complexity into every screen and query for a user who has 30 deals and doesn't need them.

### Market: US/EU first, Gulf later

**Why:** Self-serve credit-card purchase is the only sales motion compatible with the founder's available time (a few hours a week, student). Gulf B2B expects relationship selling — calls, demos, WhatsApp threads. Also avoids Arabic/RTL work in V1, and sidesteps Saudi PDPL restrictions on cold outbound.

**Note:** Gulf remains a real later wedge — the founder is regionally based and understands the market. Revisit once V1 ships. A WhatsApp-native timeline would be the entry feature, since WhatsApp is the dominant B2B channel there and no founder CRM handles it.

---

## Architecture

### Drizzle over Prisma

**Why:** Native `vector` column type and `cosineDistance` in the query builder. Prisma requires `Unsupported("vector(N)")` plus `$queryRaw` escape hatches for every vector operation, and `prisma migrate dev` emits `DROP INDEX` on HNSW indexes — silently destroying retrieval performance.

**Rejected:** Prisma (originally chosen, then reversed). Better DX in general; worse for this specific project because vector search is core.

### pgvector, not a dedicated vector database

**Why:** Same Postgres instance, one extension, no new service for self-hosters to run. Metadata filtering (`WHERE dealId = ...`) happens in the same query as similarity search, which is the access pattern for most Relivo queries.

**Rejected:** Pinecone/Qdrant/Weaviate. Better at billion-scale; irrelevant here and adds an operational dependency to an open-source project.

**Note:** The original recommendation was to skip vectors entirely at V1, since a single deal's history fits in one context window. Overruled deliberately — the expectation is customers with large histories, and retrofitting retrieval later means rewriting every context builder. Reasonable call; recording the tradeoff.

### BullMQ over pg-boss

**Why:** Built-in rate limiter and concurrency groups, which map directly onto LLM provider rate limits. Flows handle multi-step jobs.

**Rejected:** pg-boss (Postgres-backed, no Redis — one less service for self-hosters). Real cost: Redis becomes required infrastructure. Accepted because AI job control matters more.

**Rejected:** Inngest, Trigger.dev. Hosted dependencies that self-hosters can't easily run.

### Single AI provider, no BYOM

**Why:** BYOM means designing for the lowest common denominator. Local models via Ollama frequently can't do reliable structured output or tool calling, so every feature needs capability gating and every prompt needs to work on a 7B model. Dropping it means tuning prompts to one model and shipping better features.

**Rejected:** Bring-your-own-model (originally proposed for the open-source story). Self-hosters still supply their own API key via env var, which covers the practical need.

**Open question:** Whether self-hosted builds get degraded AI or no AI. Undecided.

### tRPC for CRUD, server routes for streaming

**Why:** tRPC v11 can stream over SSE, but the AI SDK's `useChat` expects its own protocol and fighting that is miserable. Clean split: TanStack Start server routes (`/api/ai/*`) for streaming, tRPC for everything else including non-streaming `generateObject`.

### Vite, not Rsbuild

**Why:** Ecosystem depth. TanStack Start is release-candidate software and the developer is solo with limited hours — every problem should be one someone else has already hit and written about. Rsbuild's build-speed advantage is irrelevant at this codebase size.

**Would change our mind:** Build times becoming a real bottleneck, a year out. Switching then is contained.

### Better Auth in its own package

**Why:** Dependency graph. `packages/api` needs the session on every request; if auth config lived in `apps/web`, a package would import from an app. Auth _tables_ stay in `packages/db` so there's one schema and one migration history, and so `deals.ownerId` can foreign-key to `user.id`.

### Local embeddings over API embeddings

**Why:** `bge-small-en-v1.5` via fastembed runs on CPU, costs nothing, has no rate limit, and is adequate for CRM-length text. Given a genuinely tight budget, this removes an entire cost category.

**Consequence:** Store model name + dimension per row. Changing embedding models means a full reindex.

### Hybrid search is mandatory, not an optimization

**Why:** CRM text is dense with proper nouns — person names, company names, deal IDs. Embeddings are bad at exact-name matching. Pure semantic search fails on "who is Nolan Bushnell" in a way that feels broken. Postgres `tsvector` + vector similarity fused with RRF.

### `defineTask` as the single AI abstraction

**Why:** The developer has no prior AI experience. Making every feature the same four things — context builder, prompt, zod schema, capability requirements — means adding a feature is copying a file, not making architectural decisions. Cross-cutting concerns (retries, logging, caching, capability checks) get solved once.

**Rejected:** LangChain, LangGraph, agent frameworks. Heavy abstraction over something the AI SDK already handles.

### Response cache and evals are load-bearing, not nice-to-have

**Why:** Budget is ~$20–50/month for AI development. An on-disk cache keyed by `hash(model + messages + schema)` makes re-running evals after code-only changes free. Evals — fixtures plus assertions on shape and invariants — are the only thing that makes prompt iteration not a coin flip. Both are cheap to build now and painful to retrofit after five features exist.

---

## Implementation decisions

Made while building, not planned in advance. Recorded because each one is invisible in the code and easy to "fix" wrongly.

### shadcn: Base UI with the **Nova** preset

`packages/ui/components.json` is `style: base-nova`, `baseColor: neutral`, `iconLibrary: lucide`.

**Why:** Nova is what the current CLI offers by default (`Nova — Lucide / Geist`). Presets are `nova, vega, maia, lyra, mira, luma, sera, rhea`; the choice sets icon library and font.

**Consequence:** Components are built on `@base-ui/react`, not Radix. Nearly all shadcn material online is Radix-based and will not drop in. The preset also ships components with no Radix equivalent (`attachment`, `bubble`, `message`, `questionnaire`, `marker`).

### The Nova preset's font and palette are overridden, the components are not

`packages/ui/src/styles/globals.css` replaces Geist with Inter and the neutral greyscale with the brand's own two colours: ink `#1A1613` and paper `#FAF7F2`, both already fixed by `packages/assets/README.md` ("Don't — recolour outside ink `#1A1613` and white"). Secondary text is `#989A9D`. Everything else derives from those.

**Why:** Neutral grey is the shadcn default, not a choice. The marks were already ink-on-paper, so the app matching them costs nothing but token values — no component was touched.

**Consequence:** `#989A9D` is faintly _cool_ (hue ~258) against a warm background. That mismatch is deliberate, copied from the reference rather than "corrected" — it keeps secondary text from looking sepia.

**Radii are pinned, not derived.** The scale was `0.6× / 0.8× / 1.0×` of `--radius`, which cannot land on the three sizes we design to (8/12/16px) from any single base. `--radius-sm…4xl` are now literal. The three sizes map to `md` / `lg` / `xl` because that is how Nova spends them: `md` on menu items, `lg` on buttons, inputs and popovers, `xl` on cards, dialogs and the command palette. `--radius` itself stays — components use it directly in `calc()` for small elements.

### Colour encodes record state, and nothing else

Chrome is built from ink, paper and white alone — including `--primary`, which stays near-white on dark rather than taking a brand hue. The only chromatic tokens are `--info`, `--warning`, `--success` and `--destructive`, plus `--muted-foreground` as the neutral. `--chart-1…5` are drawn from the same five so charts and badges cannot drift apart.

**Why:** The brand book forbids recolouring outside ink and white, so a chromatic primary was never available. That constraint turns out to be the right product answer anyway: PRODUCT.md has five deal stages, four feedback statuses and four next-step urgency buckets, and a pure greyscale cannot express any of them. Reserving colour for state means the only thing that catches the eye on a dense screen is the state itself.

**Five treatments cover all three vocabularies:** neutral (Qualified · Backlog · Later), info (Demo · Planned · This week), warning (Proposal · In progress · Today), success (Closed Won · shipped), destructive (Closed Lost · Overdue).

**Rejected:** a brand accent applied to primary buttons. It would contradict the asset guidelines, and it would compete with the state colours for attention on exactly the screens where state matters most.

**Inter ships as the `opsz` build** (`@fontsource-variable/inter/opsz.css`), not the default `wght`-only one, so `font-optical-sizing: auto` can reach Inter Display at large sizes. Same family name (`Inter Variable`) either way. Global `letter-spacing: -0.15px` is set on `html` in the base layer.

### The shadcn CLI runs from `packages/ui`, not `apps/web`

**Why:** It works. `cd packages/ui && pnpm dlx shadcn@latest add <component>` reads that package's `components.json` and writes to `packages/ui/src/components/`. ~61 components were installed this way.

`apps/web` has no `components.json` and does not need one: it consumes `@repo/ui` through the exports map and never runs the CLI itself.

**Note:** This contradicts advice that the CLI fails inside a non-framework package at "Verifying framework." That was not observed with shadcn 4.x. Revisit only if a CLI upgrade actually breaks it.

### Tailwind scanning lives in the library, not the app

`packages/ui/src/styles/globals.css` carries its own `@source "../**/*.{ts,tsx}"`.

**Why:** `@source` resolves relative to the CSS file, so the library declares its own scan path and any consuming app gets correct output from a single `@import "@repo/ui/globals.css"` with no per-app configuration.

**Rejected:** Declaring `@source "../../../packages/ui/src/**/*.{ts,tsx}"` in the app's CSS. Works, but every new app has to remember it, and forgetting produces silently unstyled components with no error.

**Consequence:** An app importing `@repo/ui/globals.css` must **not** also `@import "tailwindcss"` — the base layer would be emitted twice.

### One root `.env`, loaded by `dotenv-cli`

`DATABASE_URL` and `REDIS_URL` live in a single root `.env`, declared in `turbo.json` under `globalEnv`.

**Why:** Explicitly requested. Turborepo's own guidance calls a root `.env` an anti-pattern and recommends `globalEnv` as the escape hatch when variables are shared anyway.

**The part that bites:** Turborepo never _loads_ `.env` files — `globalEnv` only declares which variables join the cache hash and survive strict-mode filtering. Something else must populate `process.env`, which is why every long-running script is prefixed `dotenv -e ../../.env --`. Vite's `envDir` is not sufficient: it fills `import.meta.env` and only exposes `VITE_`-prefixed vars, while server code reads `process.env`.

**Rejected:** A validated `env.ts` module per package. Explicitly rejected in favour of the Turborepo mechanism.

### Postgres on host port 5434

**Why:** 5432 and 5433 were both already bound on the development machine. The container still listens on 5432 internally; only the host mapping moved.

### `@repo/db/orm` re-exports drizzle's query helpers

**Why:** Consumers need `eq`, `desc`, `and`, `sql`. Importing `drizzle-orm` directly in every package means several places to keep on the same version. The subpath keeps `@repo/db` the sole owner of the ORM.

Kept off `index.ts` so drizzle's wide export surface can't collide with schema exports.

### `@tanstack/react-devtools` (the unified shell) removed

**Why:** It depends on `@tanstack/devtools` → `@neodrag/solid@3.0.0-next.11`, whose peer `@neodrag/core` resolves to `0.0.3` — a version with no `./sortable` export. Vite dep pre-bundling fails outright in dev.

`@tanstack/react-router-devtools` and `@tanstack/react-query-devtools` do not depend on that chain and work standalone.

**Rejected:** A `pnpm.overrides` pin on `@neodrag/core`. Forces a version graph-wide to work around one broken package, and masks the cause rather than removing it.

### `esbuild` excluded from `pnpm.onlyBuiltDependencies`

**Why:** `tsx` pulls esbuild 0.25.x while Vite 8 uses 0.28.2. Only one `@esbuild/win32-x64` platform binary gets hoisted, so 0.28.2's postinstall self-check runs the 0.25.12 binary and throws `Expected "0.28.2" but got "0.25.12"`.

That postinstall only _validates_ — real binaries arrive via the `@esbuild/*` optional dependencies — so skipping it is safe. Adding `esbuild` back to the list re-breaks every install.

### `db:push` exists as a script, despite the no-push rule

**Why:** Explicitly requested, alongside the other seven drizzle-kit commands.

**The rule still holds for anything shared or deployed.** Push is the `prisma db push` equivalent: fine on a scratch database you own and can drop, wrong anywhere migrations also run. Mixing them on one database means push mutates schema without writing a snapshot, so a later `generate` diffs against a stale baseline. Production runs `migrate` only.

---

## Open questions

Not yet decided. Flag rather than assume.

1. **Solo founder or small team as the ICP?** Changes permissions, assignment, ownership, and whether "assigned to" appears in V1 at all.
2. **Do self-hosted builds get AI?** Full, degraded, or hosted-tier only.
3. **Is this a business or a portfolio project?** Both are legitimate; they diverge after ~6 months. Affects whether to optimize for GitHub stars or paying users.
4. **TanStack version pinning.** The stated rule is to pin RC versions exactly, with no carets. `apps/web` currently uses `"latest"` for every `@tanstack/*` dependency, which is the opposite. Unresolved.
