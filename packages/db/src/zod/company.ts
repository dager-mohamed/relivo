import { domain } from "@repo/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { companies } from "../schema";

// id and createdAt are database-generated. Accepting them from a client would
// let it choose its own UUID or backdate a row.
export const companyInsert = createInsertSchema(companies, {
  name: (s) => s.trim().min(1).max(200),
  domain,
}).omit({ id: true, createdAt: true });
export type CompanyInsert = z.infer<typeof companyInsert>;

export const companySelect = createSelectSchema(companies);
export type CompanySelect = z.infer<typeof companySelect>;

// Derived from the insert schema rather than createUpdateSchema, so the
// refinements above are declared once. Passing a bare schema to a refinement
// replaces the generated one outright, which silently drops the .optional()
// that patch semantics need — deriving sidesteps that.
export const companyUpdate = companyInsert
  .partial()
  .extend({ id: companySelect.shape.id });
export type CompanyUpdate = z.infer<typeof companyUpdate>;
