import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { workspaces } from "../schema";

// dealCounter is off the insert schema entirely: it is bumped by the deal
// create path inside a transaction, never set by a caller.
const workspaceInsertBase = createInsertSchema(workspaces, {
  name: (s) => s.trim().min(1).max(100),
  slug: (s) =>
    s
      .trim()
      .toLowerCase()
      .min(1)
      .max(50)
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "Lowercase letters, digits and dashes",
      ),
}).omit({ id: true, dealCounter: true, createdAt: true, updatedAt: true });

export const workspaceInsert = workspaceInsertBase;
export type WorkspaceInsert = z.infer<typeof workspaceInsert>;

export const workspaceSelect = createSelectSchema(workspaces);
export type WorkspaceSelect = z.infer<typeof workspaceSelect>;

export const workspaceUpdate = workspaceInsertBase
  .partial()
  .extend({ id: workspaceSelect.shape.id });
export type WorkspaceUpdate = z.infer<typeof workspaceUpdate>;
