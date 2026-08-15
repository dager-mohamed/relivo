import { embeddingSources } from "@repo/schema";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

import { timestamps } from "./columns";
import { companies } from "./company";
import { deals } from "./deal";
import { workspaces } from "./workspace";

export const embeddingSourceEnum = pgEnum("embedding_source", embeddingSources);

// Storage only — generating and searching embeddings is the AI retrieval
// epic. 384 dims: bge-small-en-v1.5, running locally. Not sized for 1536
// (API embeddings).
export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    // Most queries are deal-scoped; filtering to ~200 rows before similarity
    // search is what makes retrieval fast, not index tuning.
    dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    source: embeddingSourceEnum("source").notNull(),
    // No FK: the row it points at lives in one of several tables.
    sourceId: uuid("source_id").notNull(),
    content: text("content").notNull(),
    // Lets a reindex skip unchanged text.
    contentHash: text("content_hash").notNull(),
    // Recorded per row, not assumed globally — switching models means a
    // full reindex, and without this there's no way to tell which rows are
    // stale.
    model: text("model").notNull(),
    dimensions: integer("dimensions").notNull(),
    embedding: vector("embedding", { dimensions: 384 }).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("embeddings_source_model_idx").on(
      t.source,
      t.sourceId,
      t.model,
    ),
    index("embeddings_workspace_id_deal_id_idx").on(t.workspaceId, t.dealId),
  ],
  // HNSW index intentionally not declared here — see the hand-written
  // migration. drizzle-kit regenerates it without the operator class.
);

export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
