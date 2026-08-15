import {
  CheckCircleIcon,
  EllipsisHorizontalCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

import type { DealStageType } from "@repo/schema";

import type { Tone } from "./tone";

export const dealStageTypeText: Record<
  DealStageType,
  {
    label: string;
    tone: Tone;
    icon: React.ComponentType<{ className?: string; "aria-label"?: string }>;
  }
> = {
  open: { label: "Open", tone: "info", icon: EllipsisHorizontalCircleIcon },
  won: { label: "Won", tone: "success", icon: CheckCircleIcon },
  lost: { label: "Lost", tone: "destructive", icon: XCircleIcon },
};
