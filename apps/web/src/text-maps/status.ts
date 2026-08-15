import type {
  DealStageType,
  FeedbackStatus,
  NextStepSource,
} from "@repo/schema";

/**
 * Enum value to the words a user sees, in one place so two screens can never
 * disagree. `tone` names a semantic token, not a colour — see globals.css.
 */
type Tone = "neutral" | "info" | "warning" | "success" | "destructive";

export const dealStageTypeText: Record<
  DealStageType,
  { label: string; tone: Tone }
> = {
  open: { label: "Open", tone: "info" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "destructive" },
};

export const feedbackStatusText: Record<
  FeedbackStatus,
  { label: string; tone: Tone }
> = {
  backlog: { label: "Backlog", tone: "neutral" },
  planned: { label: "Planned", tone: "info" },
  in_progress: { label: "In progress", tone: "warning" },
  closed: { label: "Closed", tone: "success" },
};

export const nextStepSourceText: Record<NextStepSource, string> = {
  manual: "Added manually",
  ai_suggested: "Suggested by AI",
  playbook: "From a playbook",
};
