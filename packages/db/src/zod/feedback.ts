import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import {
  feedback,
  feedbackCompanies,
  feedbackDeals,
  feedbackVotes,
} from "../schema";

const feedbackInsertBase = createInsertSchema(feedback, {
  title: (s) => s.trim().min(1).max(200),
  description: (s) => s.max(10_000),
  externalIssueKey: (s) => s.trim().max(50),
  externalIssueUrl: z.url().nullish(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const feedbackInsert = feedbackInsertBase;
export type FeedbackInsert = z.infer<typeof feedbackInsert>;

export const feedbackSelect = createSelectSchema(feedback);
export type FeedbackSelect = z.infer<typeof feedbackSelect>;

export const feedbackUpdate = feedbackInsertBase
  .partial()
  .extend({ id: feedbackSelect.shape.id });
export type FeedbackUpdate = z.infer<typeof feedbackUpdate>;

// The link tables carry no payload beyond their two ids, so their insert
// schemas are the link inputs directly.
export const feedbackDealLink = createInsertSchema(feedbackDeals).omit({
  createdAt: true,
});
export type FeedbackDealLink = z.infer<typeof feedbackDealLink>;

export const feedbackCompanyLink = createInsertSchema(feedbackCompanies).omit({
  createdAt: true,
});
export type FeedbackCompanyLink = z.infer<typeof feedbackCompanyLink>;

export const feedbackVote = createInsertSchema(feedbackVotes).omit({
  createdAt: true,
});
export type FeedbackVote = z.infer<typeof feedbackVote>;
