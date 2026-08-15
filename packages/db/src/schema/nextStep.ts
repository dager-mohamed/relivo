import { nextStepSources } from "@repo/schema";
import { sql } from "drizzle-orm";
import {
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { timestamps } from "./columns";
import { deals } from "./deal";
import { workspaces } from "./workspace";

export const nextStepSourceEnum = pgEnum("next_step_source", nextStepSources);

// No subtasks, no checklists, no recurrence — one line of text with a date.
export const nextSteps = pgTable(
  "next_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    // Distinct from dueDate: snoozing drops a step from the hub without
    // losing its original date.
    snoozedUntil: timestamp("snoozed_until", { withTimezone: true }),
    assigneeId: text("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    source: nextStepSourceEnum("source").notNull().default("manual"),
    ...timestamps,
  },
  (t) => [
    // Partial: completed steps are dead weight here and eventually outnumber
    // open ones. Backs both "soonest step per deal" and "deals with no open
    // step".
    index("next_steps_deal_id_due_date_idx")
      .on(t.dealId, t.dueDate)
      .where(sql`${t.completedAt} IS NULL`),
    index("next_steps_workspace_id_due_date_idx")
      .on(t.workspaceId, t.dueDate)
      .where(sql`${t.completedAt} IS NULL`),
  ],
);

export type NextStep = typeof nextSteps.$inferSelect;
export type NewNextStep = typeof nextSteps.$inferInsert;
