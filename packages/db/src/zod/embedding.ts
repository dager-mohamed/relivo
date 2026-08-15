import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { embeddings } from "../schema";

// bge-small-en-v1.5. Catches a model swap that forgot its reindex here,
// rather than as a Postgres dimension error mid-batch.
export const embeddingDimensions = 384;

const embeddingInsertBase = createInsertSchema(embeddings, {
  content: (s) => s.min(1),
  contentHash: (s) => s.length(64),
  model: (s) => s.trim().min(1).max(100),
  embedding: z.array(z.number()).length(embeddingDimensions),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const embeddingInsert = embeddingInsertBase;
export type EmbeddingInsert = z.infer<typeof embeddingInsert>;

export const embeddingSelect = createSelectSchema(embeddings);
export type EmbeddingSelect = z.infer<typeof embeddingSelect>;

export const embeddingUpdate = embeddingInsertBase
  .partial()
  .extend({ id: embeddingSelect.shape.id });
export type EmbeddingUpdate = z.infer<typeof embeddingUpdate>;
