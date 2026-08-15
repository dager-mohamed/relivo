import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "./columns";
import { companies } from "./company";
import { workspaces } from "./workspace";

export const people = pgTable(
  "people",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    // set null, not cascade: a person outlives their company and may
    // resurface at the next one.
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    // Both nullable — the check below requires at least one. Lets the
    // company page create from a name alone, and email sync from an address
    // alone.
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    role: text("role"),
    avatarUrl: text("avatar_url"),
    ...timestamps,
  },
  (t) => [
    check(
      "people_name_or_email_check",
      sql`${t.name} IS NOT NULL OR ${t.email} IS NOT NULL`,
    ),
    // Postgres unique indexes treat NULLs as distinct, so any number of
    // people may have no email — this only dedupes ones that do.
    uniqueIndex("people_workspace_id_email_idx").on(t.workspaceId, t.email),
    index("people_workspace_id_company_id_idx").on(t.workspaceId, t.companyId),
    index("people_workspace_id_name_idx").on(t.workspaceId, t.name),
  ],
);

export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
