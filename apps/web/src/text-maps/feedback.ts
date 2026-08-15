import type { FeedbackStatus } from "@repo/schema";

import type { Tone } from "./tone";

export const feedbackStatusText: Record<
  FeedbackStatus,
  { label: string; tone: Tone }
> = {
  backlog: { label: "Backlog", tone: "neutral" },
  planned: { label: "Planned", tone: "info" },
  in_progress: { label: "In progress", tone: "warning" },
  closed: { label: "Closed", tone: "success" },
};
