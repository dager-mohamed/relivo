import type { ActivityAction } from "@repo/schema";
import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { timestamps } from "./columns";
import { companies } from "./company";
import { deals } from "./deal";
import { people } from "./person";
import { workspaces } from "./workspace";

// Notes and activity events are separate tables that render as one feed (a
// UNION ALL by created_at) — split because a note is edited and deleted by a
// person while an event never changes, and because embeddings need a real
// foreign key to point at.

// Exactly one of company/deal/person, enforced below. Nullable FKs rather
// than a (subjectType, subjectId) pair, which can't be a real foreign key.
const subjectColumns = {
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),
  personId: uuid("person_id").references(() => people.id, {
    onDelete: "cascade",
  }),
};

const oneSubject = (t: {
  companyId: unknown;
  dealId: unknown;
  personId: unknown;
}) =>
  sql`(${t.companyId} IS NOT NULL)::int + (${t.dealId} IS NOT NULL)::int + (${t.personId} IS NOT NULL)::int = 1`;

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    ...subjectColumns,
    // Nullable: a note extracted by the AI layer has no human author.
    authorId: text("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    // The editor's own JSON, so rich text round-trips without loss.
    body: jsonb("body").notNull(),
    // Flattened plain text for tsvector search and embedding chunking,
    // neither of which can extract text from body in SQL.
    bodyText: text("body_text").notNull(),
    ...timestamps,
  },
  (t) => [
    check("notes_one_subject_check", oneSubject(t)),
    index("notes_deal_id_created_at_idx").on(t.dealId, t.createdAt),
    index("notes_company_id_created_at_idx").on(t.companyId, t.createdAt),
    index("notes_person_id_created_at_idx").on(t.personId, t.createdAt),
  ],
);

// Immutable: the migration adds a trigger rejecting UPDATE. DELETE stays
// legal so the cascades above still work.
export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    ...subjectColumns,
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    // Structured, not the rendered sentence — composed at display time so
    // wording can change later.
    action: text("action").$type<ActivityAction>().notNull(),
    targetType: text("target_type"),
    targetId: uuid("target_id"),
    data: jsonb("data").$type<Record<string, unknown>>(),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    check("activity_events_one_subject_check", oneSubject(t)),
    index("activity_events_deal_id_created_at_idx").on(t.dealId, t.createdAt),
    index("activity_events_company_id_created_at_idx").on(
      t.companyId,
      t.createdAt,
    ),
    index("activity_events_person_id_created_at_idx").on(
      t.personId,
      t.createdAt,
    ),
  ],
);

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type ActivityEvent = typeof activityEvents.$inferSelect;
export type NewActivityEvent = typeof activityEvents.$inferInsert;
