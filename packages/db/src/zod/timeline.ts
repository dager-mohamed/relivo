import { activityAction } from "@repo/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { activityEvents, notes } from "../schema";

// Mirrors the *_one_subject_check constraints.
const hasOneSubject = (v: {
  companyId?: string | null;
  dealId?: string | null;
  personId?: string | null;
}) =>
  [v.companyId, v.dealId, v.personId].filter((id) => id != null).length === 1;

const oneSubjectMessage = "Attach to exactly one company, deal or person";

// Loose on purpose — the note editor task picks the concrete document shape.
const noteBody = z.record(z.string(), z.unknown());

const noteInsertBase = createInsertSchema(notes, {
  body: noteBody,
  bodyText: (s) => s.max(100_000),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const noteInsert = noteInsertBase.refine(hasOneSubject, {
  message: oneSubjectMessage,
  path: ["dealId"],
});
export type NoteInsert = z.infer<typeof noteInsert>;

export const noteSelect = createSelectSchema(notes);
export type NoteSelect = z.infer<typeof noteSelect>;

// A note's subject never moves, so update only carries the body.
export const noteUpdate = noteInsertBase
  .pick({ body: true, bodyText: true })
  .partial()
  .extend({ id: noteSelect.shape.id });
export type NoteUpdate = z.infer<typeof noteUpdate>;

const activityEventInsertBase = createInsertSchema(activityEvents, {
  action: activityAction,
  targetType: (s) => s.trim().max(50),
  data: z.record(z.string(), z.unknown()).nullish(),
}).omit({ id: true, createdAt: true });

export const activityEventInsert = activityEventInsertBase.refine(
  hasOneSubject,
  { message: oneSubjectMessage, path: ["dealId"] },
);
export type ActivityEventInsert = z.infer<typeof activityEventInsert>;

export const activityEventSelect = createSelectSchema(activityEvents);
export type ActivityEventSelect = z.infer<typeof activityEventSelect>;

// No activityEventUpdate: events are immutable, enforced by the migration's
// trigger.
