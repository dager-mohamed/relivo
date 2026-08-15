import { employeeRanges, revenueRanges, type Socials } from "@repo/schema";
import {
  bigint,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "./columns";
import { workspaces } from "./workspace";

export const employeeRangeEnum = pgEnum("employee_range", employeeRanges);
export const revenueRangeEnum = pgEnum("revenue_range", revenueRanges);

// Fields enrichment is allowed to write. manualFields records which of these
// a human already touched, so a re-enrich never overwrites an edit.
export const enrichableCompanyFields = [
  "name",
  "logoUrl",
  "location",
  "description",
  "employees",
  "revenue",
  "funding",
  "phone",
  "socials",
] as const;
export type EnrichableCompanyField = (typeof enrichableCompanyFields)[number];

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    name: text("name").notNull(),
    logoUrl: text("logo_url"),
    location: text("location"),
    description: text("description"),
    employees: employeeRangeEnum("employees"),
    revenue: revenueRangeEnum("revenue"),
    // Minor units; bigint because funding runs to billions ($2B = 2e11
    // cents, past int4 range).
    funding: bigint("funding", { mode: "number" }),
    phone: text("phone"),
    socials: jsonb("socials").$type<Socials>(),
    // $type sets the element type after .array(), so the array-of goes here,
    // not in the parameter — EnrichableCompanyField[] gives a text[][].
    manualFields: text("manual_fields")
      .array()
      .$type<EnrichableCompanyField>()
      .notNull()
      .default([]),
    ...timestamps,
  },
  (t) => [
    // Per workspace, not global — two tenants may both sell to stripe.com.
    uniqueIndex("companies_workspace_id_domain_idx").on(
      t.workspaceId,
      t.domain,
    ),
    index("companies_workspace_id_name_idx").on(t.workspaceId, t.name),
  ],
);

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
