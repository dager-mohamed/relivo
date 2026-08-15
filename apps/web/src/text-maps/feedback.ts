import {
  ArrowPathIcon,
  CheckCircleIcon,
  InboxIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

import type { FeedbackStatus } from "@repo/schema";

import type { Tone } from "./tone";

export const feedbackStatusText: Record<
  FeedbackStatus,
  {
    label: string;
    tone: Tone;
    icon: React.ComponentType<{ className?: string; "aria-label"?: string }>;
  }
> = {
  backlog: { label: "Backlog", tone: "neutral", icon: InboxIcon },
  planned: { label: "Planned", tone: "info", icon: MapIcon },
  in_progress: { label: "In progress", tone: "warning", icon: ArrowPathIcon },
  closed: { label: "Closed", tone: "success", icon: CheckCircleIcon },
};
