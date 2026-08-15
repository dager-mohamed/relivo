import { feedbackStatuses } from "@repo/schema";
import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { timestamps } from "./columns";
import { companies } from "./company";
import { deals } from "./deal";
import { workspaces } from "./workspace";

export const feedbackStatusEnum = pgEnum("feedback_status", feedbackStatuses);

// dealValue and requestCount are never stored — always derived from the join
// tables below, so they can't go stale.
export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: feedbackStatusEnum("status").notNull().default("backlog"),
    externalIssueKey: text("external_issue_key"),
    externalIssueUrl: text("external_issue_url"),
    ...timestamps,
  },
  (t) => [
    index("feedback_workspace_id_status_idx").on(t.workspaceId, t.status),
  ],
);

// Many-to-many both ways: one request from several customers, one customer
// raising several requests.
export const feedbackDeals = pgTable(
  "feedback_deals",
  {
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedback.id, { onDelete: "cascade" }),
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    primaryKey({ columns: [t.feedbackId, t.dealId] }),
    index("feedback_deals_deal_id_idx").on(t.dealId),
  ],
);

export const feedbackCompanies = pgTable(
  "feedback_companies",
  {
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedback.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    primaryKey({ columns: [t.feedbackId, t.companyId] }),
    index("feedback_companies_company_id_idx").on(t.companyId),
  ],
);

// A row per user, not a counter — makes double-voting impossible by
// construction.
export const feedbackVotes = pgTable(
  "feedback_votes",
  {
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedback.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamps.createdAt,
  },
  (t) => [primaryKey({ columns: [t.feedbackId, t.userId] })],
);

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
