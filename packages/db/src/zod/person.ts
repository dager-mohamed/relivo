import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { people } from "../schema";

const personInsertBase = createInsertSchema(people, {
  name: (s) => s.trim().min(1).max(200),
  email: z.email().toLowerCase().nullish(),
  phone: (s) => s.trim().max(50),
  role: (s) => s.trim().max(200),
  avatarUrl: z.url().nullish(),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Mirrors people_name_or_email_check so the failure lands on the form field
// instead of a database error.
const hasNameOrEmail = <T extends { name?: unknown; email?: unknown }>(v: T) =>
  v.name != null || v.email != null;

const nameOrEmailMessage = "A person needs at least a name or an email";

export const personInsert = personInsertBase.refine(hasNameOrEmail, {
  message: nameOrEmailMessage,
  path: ["name"],
});
export type PersonInsert = z.infer<typeof personInsert>;

export const personSelect = createSelectSchema(people);
export type PersonSelect = z.infer<typeof personSelect>;

// Checks for explicit nulls, not absence — a patch may omit both fields,
// it's only clearing them that must be rejected.
export const personUpdate = personInsertBase
  .partial()
  .extend({ id: personSelect.shape.id })
  .refine((v) => v.name !== null || v.email !== null, {
    message: nameOrEmailMessage,
    path: ["name"],
  });
export type PersonUpdate = z.infer<typeof personUpdate>;
