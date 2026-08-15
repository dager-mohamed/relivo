import type { NextStepSource } from "@repo/schema";

export const nextStepSourceText: Record<NextStepSource, string> = {
  manual: "Added manually",
  ai_suggested: "Suggested by AI",
  playbook: "From a playbook",
};
