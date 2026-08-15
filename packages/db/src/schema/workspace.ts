import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "./columns";

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  // Counter behind DEAL-10, bumped via row lock in claimDealNumber — a
  // Postgres sequence can't be scoped per workspace.
  dealCounter: integer("deal_counter").notNull().default(0),
  ...timestamps,
});

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
