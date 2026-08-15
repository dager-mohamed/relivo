import { z } from "zod";

// Shared enums. packages/db builds pgEnum from these tuples so the Postgres
// and zod types can't drift apart. Labels double as display strings.

// Ranges, never a free number — a precise-looking headcount invites false
// confidence nobody actually has.
export const employeeRanges = [
  "1-10",
  "11-50",
  "51-250",
  "251-1K",
  "1K-5K",
  "5K-10K",
  "10K+",
] as const;
export const employeeRange = z.enum(employeeRanges);
export type EmployeeRange = z.infer<typeof employeeRange>;

export const revenueRanges = [
  "<$1M",
  "$1M-10M",
  "$10M-50M",
  "$50M-100M",
  "$100M-500M",
  "$500M-1B",
  "$1B-5B",
  "$5B+",
] as const;
export const revenueRange = z.enum(revenueRanges);
export type RevenueRange = z.infer<typeof revenueRange>;

// Separate from the stage name so reporting can tell won from lost without
// string-matching a user-renamed stage.
export const dealStageTypes = ["open", "won", "lost"] as const;
export const dealStageType = z.enum(dealStageTypes);
export type DealStageType = z.infer<typeof dealStageType>;

export const feedbackStatuses = [
  "backlog",
  "planned",
  "in_progress",
  "closed",
] as const;
export const feedbackStatus = z.enum(feedbackStatuses);
export type FeedbackStatus = z.infer<typeof feedbackStatus>;

// Lets us measure whether AI suggestions are any good — if founders delete
// 90% of them, the prompt is wrong.
export const nextStepSources = ["manual", "ai_suggested", "playbook"] as const;
export const nextStepSource = z.enum(nextStepSources);
export type NextStepSource = z.infer<typeof nextStepSource>;

// Not a Postgres enum like the others: this set grows with every feature, and
// ALTER TYPE ... ADD VALUE can't be used in the same transaction that adds it.
export const activityActions = [
  "record_created",
  "field_set",
  "field_changed",
  "field_cleared",
  "stage_changed",
  "next_step_created",
  "next_step_completed",
  "person_linked",
  "person_unlinked",
  "feedback_linked",
  "feedback_unlinked",
  "note_added",
] as const;
export const activityAction = z.enum(activityActions);
export type ActivityAction = z.infer<typeof activityAction>;

export const embeddingSources = ["note", "activity_event", "email"] as const;
export const embeddingSource = z.enum(embeddingSources);
export type EmbeddingSource = z.infer<typeof embeddingSource>;
