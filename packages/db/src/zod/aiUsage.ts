import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { aiUsage } from "../schema";

const tokenCount = z.int().min(0);

export const aiUsageInsert = createInsertSchema(aiUsage, {
  feature: (s) => s.trim().min(1).max(100),
  model: (s) => s.trim().min(1).max(100),
  inputTokens: tokenCount,
  outputTokens: tokenCount,
  cachedInputTokens: tokenCount,
  costMicroUsd: z.int().min(0),
  latencyMs: z.int().min(0),
  errorReason: (s) => s.max(2000),
}).omit({ id: true, createdAt: true });
export type AiUsageInsert = z.infer<typeof aiUsageInsert>;

export const aiUsageSelect = createSelectSchema(aiUsage);
export type AiUsageSelect = z.infer<typeof aiUsageSelect>;

// Append-only: there is no update schema. A usage row records what a call cost
// at the moment it happened, and a rewritable cost log is not a cost log.
