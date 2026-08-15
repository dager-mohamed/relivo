import { money } from "@repo/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { dealStages, deals } from "../schema";

// number is claimed from the workspace counter inside the insert transaction
// — see queries/dealNumber.ts.
const dealInsertBase = createInsertSchema(deals, {
  name: (s) => s.trim().min(1).max(200),
  value: money.nullish(),
  closeDate: z.iso.date().nullish(),
}).omit({ id: true, number: true, createdAt: true, updatedAt: true });

export const dealInsert = dealInsertBase;
export type DealInsert = z.infer<typeof dealInsert>;

export const dealSelect = createSelectSchema(deals);
export type DealSelect = z.infer<typeof dealSelect>;

export const dealUpdate = dealInsertBase
  .partial()
  .extend({ id: dealSelect.shape.id });
export type DealUpdate = z.infer<typeof dealUpdate>;

const dealStageInsertBase = createInsertSchema(dealStages, {
  name: (s) => s.trim().min(1).max(60),
  position: (s) => s.int().min(0),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const dealStageInsert = dealStageInsertBase;
export type DealStageInsert = z.infer<typeof dealStageInsert>;

export const dealStageSelect = createSelectSchema(dealStages);
export type DealStageSelect = z.infer<typeof dealStageSelect>;

export const dealStageUpdate = dealStageInsertBase
  .partial()
  .extend({ id: dealStageSelect.shape.id });
export type DealStageUpdate = z.infer<typeof dealStageUpdate>;
