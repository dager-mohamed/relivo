import { companyNameFromDomain, domain, money, socials } from "@repo/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { companies } from "../schema";

// Lives in @repo/schema so a browser form can derive the same name without
// pulling drizzle-orm/pg-core in with it. Re-exported here because this is
// where callers expect a company's schema helpers to be.
export { companyNameFromDomain };

// manualFields is omitted — written by whatever applies an edit, not sent
// with it, so a client can't tell enrichment to skip a field.
const companyInsertBase = createInsertSchema(companies, {
  domain,
  name: (s) => s.trim().min(1).max(200),
  description: (s) => s.max(5000),
  socials: socials.nullish(),
  funding: money.nullish(),
}).omit({ id: true, manualFields: true, createdAt: true, updatedAt: true });

// Creatable from a domain alone. The transform lives here, not in a router,
// so every caller gets it — including enrichment and email sync.
export const companyInsert = companyInsertBase
  .extend({ name: companyInsertBase.shape.name.optional() })
  .transform((v) => ({
    ...v,
    name: v.name ?? companyNameFromDomain(v.domain),
  }));
export type CompanyInsertInput = z.input<typeof companyInsert>;
export type CompanyInsert = z.output<typeof companyInsert>;

export const companySelect = createSelectSchema(companies);
export type CompanySelect = z.infer<typeof companySelect>;

// Derived from the base, not the transformed schema — a transform produces
// a pipe, which has no .partial().
export const companyUpdate = companyInsertBase
  .partial()
  .extend({ id: companySelect.shape.id });
export type CompanyUpdate = z.infer<typeof companyUpdate>;
