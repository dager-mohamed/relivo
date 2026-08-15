import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth";
import { timestamps } from "./columns";
import { workspaces } from "./workspace";

// One row per AI call, successes and failures alike — written from inside
// defineTask, never at a call site.
export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    // e.g. suggest_next_steps, deal_coaching. Free text — features are
    // added constantly.
    feature: text("feature").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    // Counted separately from inputTokens — cached tokens are far cheaper,
    // and blending them hides real cost.
    cachedInputTokens: integer("cached_input_tokens").notNull().default(0),
    // Millionths of a dollar, computed at call time rather than derived
    // later — provider pricing changes, and a derived cost would rewrite
    // history.
    costMicroUsd: bigint("cost_micro_usd", { mode: "number" })
      .notNull()
      .default(0),
    latencyMs: integer("latency_ms").notNull().default(0),
    success: boolean("success").notNull(),
    errorReason: text("error_reason"),
    // Calls served from the local dev cache cost nothing; without this flag
    // they drag every average toward zero.
    cacheHit: boolean("cache_hit").notNull().default(false),
    createdAt: timestamps.createdAt,
  },
  (t) => [
    index("ai_usage_workspace_id_feature_created_at_idx").on(
      t.workspaceId,
      t.feature,
      t.createdAt,
    ),
  ],
);

export type AiUsage = typeof aiUsage.$inferSelect;
export type NewAiUsage = typeof aiUsage.$inferInsert;
