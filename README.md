<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a id="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/dager-mohamed/relivo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="packages/assets/icons/lockup-h-white.svg">
      <img src="packages/assets/icons/lockup-h-black.svg" alt="Relivo" width="260">
    </picture>
  </a>

  </br>

  <p align="center">
    Open-source CRM for founders who sell their own product. Every feature request carries the revenue riding on it.
    <br />
    <a href="https://github.com/dager-mohamed/relivo/blob/main/PRODUCT.md"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/dager-mohamed/relivo/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/dager-mohamed/relivo/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://github.com/dager-mohamed/relivo)

You're a founder, and you're the one selling. Five to forty live deals, no sales team, nobody to keep a CRM tidy.

So you're using a spreadsheet. Or a Notion board you update on Fridays. Or a HubSpot account you set up once and abandoned the moment it asked you to configure lead scoring.

**Relivo is a CRM for that.** Not a scaled-down sales platform — a tool built from the start for one person who has to remember what they promised, to whom, and by when.

### What makes it different

**It tells you what to do next.** Every deal on the board shows its next step right on the card, so the pipeline reads as a to-do list instead of a filing cabinet. A single screen collects every open next step across every deal, sorted by when it's due. That's your morning.

**Your feature requests carry the money riding on them.** This is the part no other tool does. When a prospect says "we'd need audit log export before we could sign," you log it against their deal — and the request now shows the combined value of every deal waiting on it.

> `Configurable Retention Policy — $288.0K` outranks the thing twelve people upvoted but nobody would pay for.

When you ship it, Relivo hands you back the list of deals that were blocked, so you actually go and close them. Your CRM knows your roadmap; your roadmap knows your pipeline.

**The AI has read every note on the deal.** Ask _"why did this stall?"_ or _"who owns implementation on their side?"_ and get an answer with a link to the note it came from. It drafts your next steps from what actually happened on the last call, and it spots when a new piece of feedback is the one you already logged three weeks ago in different words.

**It gets out of your way.** `⌘K` from anywhere. Type a domain and the company fills itself in. No required fields, no setup wizard, no forty-column table.

### Why not HubSpot or Zoho

They're built for sales _teams_ — forecasting, lead scoring, quota tracking, reporting, and a settings page for each. All of it assumes someone whose job is keeping the CRM clean. You don't have that person; you're the one on the calls, and admin is the first thing to go. Two months later the CRM is a graveyard of half-filled fields and the deals are back in your head.

Relivo does less on purpose. No lead scoring, no marketing automation, no email sequencer, no forecasting dashboards, no quota tracking. The pipeline starts at _qualified_ and ends at _closed_. Everything outside that competes with tools that already do it better, and every one of them is a settings page you'd have to learn.

The trade cuts both ways, so plainly: **if you hire a sales team, go use one of them.** Relivo isn't trying to be your CRM at forty people. Import from HubSpot and Attio is on the roadmap, and the data underneath is a Postgres you own — moving in or out is a database, not a negotiation.

What none of them do, at any price or team size, is tell you which feature request has $288K of pipeline waiting on it. A CRM doesn't know your roadmap; a feedback tool doesn't know your pipeline. You're the one holding both.

Self-hosted, AGPL-3.0, your data in your own Postgres.

> **Status:** early, and honest about it. The monorepo, database, API, job queue and component library are in place; most of what's described above is not built yet. See the [Roadmap](#roadmap) for exactly where things stand.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![TypeScript][TypeScript]][TypeScript-url]
- [![React][React.js]][React-url]
- [![TanStack][TanStack]][TanStack-url]
- [![Vite][Vite]][Vite-url]
- [![tRPC][tRPC]][tRPC-url]
- [![Drizzle][Drizzle]][Drizzle-url]
- [![Postgres][Postgres]][Postgres-url]
- [![Redis][Redis]][Redis-url]
- [![Tailwind][Tailwind]][Tailwind-url]
- [![Turborepo][Turborepo]][Turborepo-url]
- [![Docker][Docker]][Docker-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

Relivo is a Turborepo monorepo. Everything runs locally: a Postgres container with pgvector, a Redis container for the job queue, the web app, and a worker process.

### Prerequisites

- **Node.js** 18 or newer
- **pnpm 9** — the version is pinned in `packageManager`, so Corepack is enough
  ```sh
  corepack enable
  ```
- **Docker** — for Postgres and Redis

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/dager-mohamed/relivo.git
   cd relivo
   ```
2. Install dependencies
   ```sh
   pnpm install
   ```
3. Create your environment file from the example
   ```sh
   cp .env.example .env
   ```
4. Start Postgres and Redis
   ```sh
   docker compose up -d
   ```
5. Create the schema and insert a sample row
   ```sh
   pnpm --filter @repo/db db:migrate
   pnpm --filter @repo/db db:seed
   ```
6. Start the app and the job worker together
   ```sh
   pnpm dev
   ```

The app runs on [http://localhost:3000](http://localhost:3000). Postgres is published on host port **5434** and Redis on **6379** — the Postgres port is deliberately not 5432, to avoid colliding with a local install.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

`pnpm dev` starts two long-running processes: the TanStack Start app and the BullMQ worker. Run everything else from the repo root.

```sh
pnpm dev            # app on :3000 + jobs worker
pnpm build          # build every package
pnpm check-types    # typecheck the whole workspace
pnpm format         # prettier
```

Changing the database schema means editing [`packages/db/src/schema.ts`](packages/db/src/schema.ts), then generating and applying a migration. Generated SQL is committed and reviewed like any other change.

```sh
cd packages/db
pnpm db:generate    # diff the schema, write drizzle/NNNN_*.sql
pnpm db:migrate     # apply pending migrations
pnpm db:studio      # browse the data
```

> Use `generate` + `migrate`, not `push`, on any database that matters. Push rewrites schema without recording a snapshot, so a later `generate` diffs against a stale baseline — and it regenerates HNSW index DDL without the operator class pgvector requires.

The API is end-to-end typed: a column renamed in the Drizzle schema surfaces as a type error in the React component that reads it, with no type wiring in between.

```tsx
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "#/integrations/trpc/react";

const trpc = useTRPC();
const { data } = useQuery(trpc.companies.list.queryOptions());
```

Adding a UI component uses the shadcn CLI from inside the component package, which is built on Base UI primitives rather than Radix.

```sh
cd packages/ui
pnpm dlx shadcn@latest add <component>
```

_Architecture and conventions live in [CLAUDE.md](CLAUDE.md). Product behaviour lives in [PRODUCT.md](PRODUCT.md). The reasoning behind each technical choice — and what was rejected — lives in [DECISIONS.md](DECISIONS.md)._

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

Grouped the same way the work is tracked. Checked items are merged and working.

### Foundation and project setup

- [x] Turborepo monorepo with pnpm workspaces
- [x] TanStack Start app scaffold
- [x] shadcn/ui, Tailwind and design tokens
- [x] tRPC server and client with TanStack Query
- [x] Drizzle ORM and Postgres with pgvector
- [x] Redis and BullMQ worker process
- [x] Shared zod schema package
- [x] ESLint, Prettier, TypeScript strict mode and CI

### Auth, workspaces and members

- [ ] Email and OAuth authentication
- [ ] Workspace model and multi-workspace switching
- [ ] Member invites and roles
- [ ] Workspace-scoped tRPC middleware and row-level access checks
- [ ] Seeded demo sandbox workspace for new signups

### Core data model

- [ ] Company schema and enrichment fields
- [ ] Person schema and company relations
- [ ] Deal schema with stages, value, close date and owner
- [ ] Feedback schema with upvotes and deal links
- [ ] Next Step schema
- [ ] Note and Activity event schema for the unified timeline
- [ ] pgvector embeddings table with HNSW index migration
- [ ] AI usage metering table for token and cost logging

### Records — Companies, People, Activity

- [ ] App shell layout with collapsible sidebar sections
- [ ] Companies list view with filters
- [ ] Company record page with properties panel
- [ ] People list view and person record page
- [ ] Unified activity timeline mixing system events and user notes
- [ ] Rich text note editor with bullets, mentions and link detection
- [ ] Favorites sidebar with pinning and drag reorder for any record type

### Deals and pipeline

- [ ] Deal CRUD router with sequential deal IDs
- [ ] Kanban board grouped by stage
- [ ] Deal card showing value, close date, contact and next step
- [ ] Drag and drop between stages with optimistic updates
- [ ] Per-stage value rollups and deal counts in column headers
- [ ] Deals table view with sorting and column config
- [ ] Deal detail page with timeline and linked records
- [ ] Configurable pipeline stages in settings

### Next Steps

- [ ] Next Step CRUD router with due dates and completion
- [ ] Next Steps hub across all deals, sorted by due date
- [ ] Snooze and overdue surfacing

### Feedback and revenue loop

- [ ] Feedback CRUD router with status workflow
- [ ] Feedback board grouped by status with Open and Closed tabs
- [ ] Link feedback to deals and companies
- [ ] Deal value rollup per feedback item and per status group
- [ ] Upvote and request count tracking
- [ ] Feedback panel on company and deal record pages

### Navigation, search and command palette

- [ ] Command palette with jump-to and create actions
- [ ] Global full text search across all record types
- [ ] Keyboard shortcut system and shortcuts help dialog

### AI layer — foundations

- [ ] `packages/ai` with AI SDK 7 and provider setup
- [ ] `defineTask` abstraction for all AI features
- [ ] Deal context builder
- [ ] On-disk response cache for local development
- [ ] Eval harness with fixture deals and Vitest assertions
- [ ] Token and cost logging on every AI call
- [ ] Rate limiting, retry policy and spend guardrails for AI jobs

### AI layer — retrieval and embeddings

- [ ] Local embedding model via fastembed
- [ ] Chunking by semantic unit with content hashing
- [ ] BullMQ embedding job triggered on note and email writes
- [ ] Hybrid search combining `tsvector` and vector similarity with RRF
- [ ] Metadata filtering by deal, company and date before vector search
- [ ] Backfill and reindex command for existing records

### AI layer — features

- [ ] Suggested next steps with structured output
- [ ] Suggested next steps UI with bulk accept and reject
- [ ] Deal coaching streaming endpoint
- [ ] Deal coaching chat UI with citations
- [ ] AI tools to query deals, people and next steps
- [ ] Feedback matching to suggest links to existing requests
- [ ] Deal summary and "what changed this week" digest
- [ ] Momentum view ranking deals by attention needed
- [ ] Playbooks with relative timing and conditional automations

### Integrations

- [ ] Gmail and Outlook sync onto the deal timeline
- [ ] BCC-to-Relivo address for email-first deal capture
- [ ] Calendar integration for meetings on the timeline
- [ ] Company enrichment by domain with logo fetching
- [ ] Bidirectional Plane sync for feedback items
- [ ] Slack notifications

### Open source and deployment

- [ ] Production Docker Compose for self-hosting
- [ ] Environment variable reference
- [ ] Deployment guide
- [ ] Contributing guide and code of conduct
- [ ] CSV, HubSpot and Attio import

Deferred until the core is real: custom fields, public API and webhooks, Arabic/RTL support.

See the [open issues](https://github.com/dager-mohamed/relivo/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/dager-mohamed/relivo/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=dager-mohamed/relivo" alt="contrib.rocks image" />
</a>

<!-- LICENSE -->

## License

Distributed under the GNU Affero General Public License v3.0. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/dager-mohamed/relivo.svg?style=for-the-badge
[contributors-url]: https://github.com/dager-mohamed/relivo/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/dager-mohamed/relivo.svg?style=for-the-badge
[forks-url]: https://github.com/dager-mohamed/relivo/network/members
[stars-shield]: https://img.shields.io/github/stars/dager-mohamed/relivo.svg?style=for-the-badge
[stars-url]: https://github.com/dager-mohamed/relivo/stargazers
[issues-shield]: https://img.shields.io/github/issues/dager-mohamed/relivo.svg?style=for-the-badge
[issues-url]: https://github.com/dager-mohamed/relivo/issues
[license-shield]: https://img.shields.io/github/license/dager-mohamed/relivo.svg?style=for-the-badge
[license-url]: https://github.com/dager-mohamed/relivo/blob/main/LICENSE
[product-screenshot]: packages/assets/images/screenshot.png

<!-- Shields.io badges. You can a comprehensive list with many more badges at: https://github.com/inttter/md-badges -->

[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TanStack]: https://img.shields.io/badge/TanStack-FF4154?style=for-the-badge&logo=reactquery&logoColor=white
[TanStack-url]: https://tanstack.com/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vite.dev/
[tRPC]: https://img.shields.io/badge/tRPC-2596BE?style=for-the-badge&logo=trpc&logoColor=white
[tRPC-url]: https://trpc.io/
[Drizzle]: https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black
[Drizzle-url]: https://orm.drizzle.team/
[Postgres]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[Redis]: https://img.shields.io/badge/Redis-FF4438?style=for-the-badge&logo=redis&logoColor=white
[Redis-url]: https://redis.io/
[Tailwind]: https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Turborepo]: https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white
[Turborepo-url]: https://turborepo.com/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
