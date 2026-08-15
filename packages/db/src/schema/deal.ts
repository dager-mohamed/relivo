import { dealStageTypes } from "@repo/schema";
import {
  bigint,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "./columns";
import { users } from "./auth";
import { companies } from "./company";
import { people } from "./person";
import { workspaces } from "./workspace";

export const dealStageTypeEnum = pgEnum("deal_stage_type", dealStageTypes);

// A table, not an enum — stages are user-configurable later.
export const dealStages = pgTable(
  "deal_stages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: dealStageTypeEnum("type").notNull().default("open"),
    // Board order. Not unique — reordering swaps positions.
    position: integer("position").notNull(),
    ...timestamps,
  },
  (t) => [
    index("deal_stages_workspace_id_position_idx").on(
      t.workspaceId,
      t.position,
    ),
  ],
);

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    // DEAL-{number}; claimed from workspaces.dealCounter — see
    // queries/dealNumber.ts.
    number: integer("number").notNull(),
    name: text("name").notNull(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    value: bigint("value", { mode: "number" }),
    // Date string, not a Date — a Date at midnight UTC renders as the
    // previous day west of Greenwich.
    closeDate: date("close_date", { mode: "string" }),
    // restrict: a stage still holding deals must be reassigned, not deleted
    // out from under them.
    stageId: uuid("stage_id")
      .notNull()
      .references(() => dealStages.id, { onDelete: "restrict" }),
    ownerId: text("owner_id").references(() => users.id, {
      onDelete: "set null",
    }),
    primaryContactId: uuid("primary_contact_id").references(() => people.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("deals_workspace_id_number_idx").on(t.workspaceId, t.number),
    index("deals_workspace_id_stage_id_idx").on(t.workspaceId, t.stageId),
    index("deals_company_id_idx").on(t.companyId),
  ],
);

// Everyone else on the deal — the card shows only deals.primaryContactId.
export const dealContacts = pgTable(
  "deal_contacts",
  {
    dealId: uuid("deal_id")
      .notNull()
      .references(() => deals.id, { onDelete: "cascade" }),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "cascade" }),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    primaryKey({ columns: [t.dealId, t.personId] }),
    index("deal_contacts_person_id_idx").on(t.personId),
  ],
);

export type DealStage = typeof dealStages.$inferSelect;
export type NewDealStage = typeof dealStages.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
