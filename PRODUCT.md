# Relivo — Product Specification

What Relivo _is_, screen by screen and object by object. Read this before implementing any feature. Architecture and conventions live in `CLAUDE.md`.

---

## Who it's for

A founder selling their own product. They have 5–40 open deals, no sales team, no ops person, and no patience for configuration. They currently use a spreadsheet, Notion, or a free HubSpot account they've abandoned.

**Design consequences:**

- Zero setup. A new workspace is immediately usable with sensible defaults.
- Every screen answers "what do I do next," not "what data do I have."
- No feature requires more than two clicks from anywhere.
- Never show an empty form with 20 fields. Enrich, infer, default.

**Non-goals:** lead scoring, marketing automation, email sequencing/blasting, forecasting dashboards, territory management, quota tracking, call recording.

---

## Objects

### Company

The organization you're selling to. Created by typing a domain — everything else enriches automatically.

| Field         | Type       | Notes                                          |
| ------------- | ---------- | ---------------------------------------------- |
| `name`        | text       |                                                |
| `domain`      | text       | Primary key for enrichment. Drives logo fetch. |
| `logoUrl`     | text       | Auto-fetched from domain                       |
| `location`    | text       | e.g. "SF"                                      |
| `description` | text       | Enriched, truncates in panel                   |
| `employees`   | range enum | e.g. `251-1K`. Never a free number.            |
| `revenue`     | range enum | e.g. `$1B-5B`                                  |
| `funding`     | money      | e.g. `$0`                                      |
| `phone`       | text       |                                                |
| `socials`     | json       | LinkedIn, X, etc. Panel shows first + "+N"     |

Linked: deals, people, feedback, notes, activity.

### Person

| Field       | Type |
| ----------- | ---- |
| `name`      | text |
| `email`     | text |
| `phone`     | text |
| `role`      | text |
| `companyId` | fk   |
| `avatarUrl` | text |

Linked to deals as contacts. Quick action: email icon opens mail client.

### Deal

| Field              | Type      | Notes                                              |
| ------------------ | --------- | -------------------------------------------------- |
| `identifier`       | text      | `DEAL-10`. Sequential per workspace, never reused. |
| `companyId`        | fk        | required                                           |
| `value`            | money     |                                                    |
| `closeDate`        | date      | Displayed as "Sep 09"                              |
| `stageId`          | fk        |                                                    |
| `ownerId`          | fk user   | Shown as avatar                                    |
| `primaryContactId` | fk person |                                                    |

Deals have a URL: `/deal/{uuid}`.

### Next Step

A single action on a deal. The most important secondary object — it's what makes the pipeline actionable.

| Field          | Type                                           |
| -------------- | ---------------------------------------------- |
| `dealId`       | fk                                             |
| `title`        | text                                           |
| `dueDate`      | date                                           |
| `completedAt`  | timestamp nullable                             |
| `snoozedUntil` | timestamp nullable                             |
| `assigneeId`   | fk user nullable                               |
| `source`       | enum: `manual` \| `ai_suggested` \| `playbook` |

Exactly one next step is surfaced per deal card (the soonest incomplete one).

### Feedback

A feature request or complaint. **First-class object, not a sub-record.**

| Field              | Type          | Notes                                               |
| ------------------ | ------------- | --------------------------------------------------- |
| `title`            | text          | e.g. "Audit Log Export to CSV"                      |
| `description`      | text          | Truncates with ellipsis in list                     |
| `status`           | enum          | `backlog` \| `planned` \| `in_progress` \| `closed` |
| `requestCount`     | int           | Derived: number of linked requests                  |
| `prioritizedCount` | int           | Internal upvotes                                    |
| `externalIssueKey` | text nullable | e.g. Plane `RELIV-42`                               |
| `externalIssueUrl` | text nullable |                                                     |

Linked to companies and deals via a join table. **`dealValue` is always derived, never stored** — it's the sum of linked deals' values.

### Note

Rich text, authored by a user, attached to any record. Supports bold, bullets, nested bullets, and auto-linked URLs.

### Activity Event

System-generated. `"Moe Amaya created the phone number"`, `"moved deal to Proposal"`. Immutable. Interleaved with notes in one feed.

---

## Screens

### Sidebar (persistent)

```
[Workspace switcher ▾]        ← multi-workspace, includes a Sandbox
[+ New Deal]           [⌘K]
[Search]

FAVORITES ▾
  Atari                        ← company
  General Magic      $28.5K    ← deal, shows value inline
  Akio Morita                  ← person
  Silicon Graphics
  VMware             $125K

SALES ▾
  Deals
  Next Steps

RECORDS ▾
  People
  Companies
  Feedback

────────────────
[Settings]
[User avatar + name]
```

Behavior:

- Every section header collapses independently; state persists.
- **Favorites accept any record type.** Deals display their value inline; other types don't.
- Hover a favorite → drag handle appears left, `X` to unpin appears right.
- Favorites reorder by drag.
- `New Deal` is the single primary action in the whole app.

### Company record page

Three columns: breadcrumb header, activity feed (center), properties panel (right).

**Header:** `Companies > [logo] Atari` + star (toggles favorite) + `...` overflow.

**Activity feed** — reverse chronological, mixing:

- System events, single line with icon: `[icon] Moe Amaya created the phone number · 1 week ago`
- Notes, in a bordered card: avatar, author, relative timestamp, then rich body.

Notes render full markdown: nested bullets, bold, auto-linked URLs.

**Right panel** — stacked collapsible sections:

1. `Company` with field count badge (`9`) — all company fields, each with a type icon. Long values truncate.
2. `Deals` with count + `+` button — rows show `DEAL-10  $34.5K  Sep 09  [owner avatar]`
3. `People` with count + `+` — name, avatar, email quick-action icon
4. `Feedback Ranking` with count + `+` — empty state: _"No feedback yet. Ready to add?"_

### Deals — Kanban (default view)

Header: `Deals` + filter icon + view toggle (table | board) + `New Deal`. Supports full-screen mode (Esc to exit).

Columns are pipeline stages. Default stages: **Qualified → Demo → Proposal → Closed Won → Closed Lost**.

Column header: `[stage icon] Demo  $119.5K  2` — name, summed value of deals in stage, count.

**Full deal card:**

```
DEAL-10                    [owner avatar]
[logo] Atari
🏷 $34.5K        📅 Sep 09
👤 Nolan Bushnell
─────────────────────────
📋 Send proposal & pricing bre...
```

The next-step row at the bottom is the point of the card — every card answers "what do I do next." Truncate with ellipsis.

**Compact card:** the first stage (Qualified) shows logo + company name only. Early deals have no value or contact yet; don't render empty fields.

Behavior: drag between columns with optimistic update; column totals recompute live.

### Deals — Table view

Same data, sortable columns, configurable visibility. Toggle persists per user.

### Deal detail page

Same three-column shape as the company page: activity feed center; right panel with deal properties, linked company, people, next steps, and linked feedback.

### Next Steps hub

Every incomplete next step across all deals, sorted by due date. Groups: Overdue / Today / This week / Later. Each row shows the step, its deal, and the company. Actions: complete, snooze, reschedule.

This is the "what do I do today" screen.

### Feedback board

Header: `Feedback` + `Open` / `Closed` tabs + filter + `New Feedback`.

Table columns: `Title · Description` | `Deal Value` | `Prioritized` | `Linked issue` | `Status`

Rows group by status, each group header showing rolled-up value and count:

```
🔄 In progress   $476.5K   1
⏱ Planned       $265.0K   2
⭕ Backlog       $451.5K   4
```

Row anatomy:

```
[6]  Audit Log Export to CSV              $476.5K   ⬆5   [RELIV-245 Add audit log ex...]   🔄
     Customers want the ability to export audit logs directly to CSV for compliance and...
```

- Left badge = request count (how many customers asked)
- `Deal Value` = **summed value of all linked deals**
- `Prioritized` = internal upvotes
- Linked issue = chip linking to the external tracker
- Status icon right-aligned, matching the group

Sort by Deal Value descending by default. That ordering _is_ the product — it answers "what should I build next" with money instead of opinion.

---

## The feedback → revenue loop

The core differentiator. The full cycle:

1. On a call, founder adds feedback from the deal page — or AI extracts it from a note.
2. Feedback links to that deal. Deal value flows into the feedback item's total.
3. Feedback board sorts by money. `Configurable Retention Policy — $288.0K` outranks a request 12 people upvoted but worth $2K.
4. Founder pushes the item to their issue tracker; status syncs back.
5. When it ships, Relivo surfaces every deal that was blocked on it → follow-up next steps.

Step 5 closes the loop and is what makes this a CRM feature rather than a feedback tool. Don't skip it.

---

## AI features (product behavior)

Implementation patterns are in `CLAUDE.md`. This is what the user sees.

**Suggested next steps.** On a deal with no open next step, or after new activity, a subtle prompt offers 1–5 suggestions. Each shows the action, a reason grounded in deal history, and a proposed due date. Bulk `Add all` / `Dismiss all`. Accepted steps are marked `source: ai_suggested`.

Never auto-create without confirmation. Never suggest for closed deals.

**Deal coaching.** Chat panel scoped to one deal. Answers from that deal's notes, emails, and activity — _"who owns implementation?"_, _"what did they say about pricing?"_, _"why did this stall?"_. Answers cite the note or email they came from, and citations are clickable. Says "I don't know" rather than inventing.

**Feedback matching.** When creating feedback, AI surfaces likely duplicates from existing items with a one-click merge. Catches "CLI times out on large restores" ≈ "CLI Tool for Job Status" despite near-zero word overlap.

**Deal summary / weekly digest.** A short "what changed" for a deal or across the pipeline. Facts only, no cheerleading.

**Momentum (deferred).** Deals ranked by attention needed rather than stage — days since contact, stage age, value, overdue steps.

**Playbooks (deferred).** Named templates of next steps with relative timing (`+3 days`) and conditional automations. Mostly date arithmetic, not AI.

---

## Cross-cutting behavior

**Command palette (⌘K).** Jump to any record by name, create any object, run actions on the current record. Fuzzy search. Keyboard-only end to end.

**Global search.** Across all record types and note bodies, grouped by type.

**Enrichment.** Typing a domain populates logo, description, employees, revenue, funding, socials. Every enriched field stays user-editable, and manual edits are never overwritten.

**Empty states.** Always propose the next action, never just report absence. _"No feedback yet. Ready to add?"_ — not _"No results."_

**Money and dates.** Values abbreviate (`$34.5K`, `$1.2M`). Dates show as `Sep 09`; relative time for activity (`6 days ago`).

**Optimistic updates everywhere.** Never spin on drag, complete, or edit.

---

## Tone

Terse and factual. Labels are nouns, actions are verbs. No exclamation marks, no "Awesome!", no emoji in product copy. The user is busy and selling something.
