import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { nextSteps } from "../schema";

const nextStepInsertBase = createInsertSchema(nextSteps, {
  title: (s) => s.trim().min(1).max(300),
  dueDate: z.iso.date(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const nextStepInsert = nextStepInsertBase;
export type NextStepInsert = z.infer<typeof nextStepInsert>;

export const nextStepSelect = createSelectSchema(nextSteps);
export type NextStepSelect = z.infer<typeof nextStepSelect>;

export const nextStepUpdate = nextStepInsertBase
  .partial()
  .extend({ id: nextStepSelect.shape.id });
export type NextStepUpdate = z.infer<typeof nextStepUpdate>;
