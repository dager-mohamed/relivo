import type { DealStageType } from "@repo/schema";

import type { Tone } from "./tone";

export const dealStageTypeText: Record<
  DealStageType,
  { label: string; tone: Tone }
> = {
  open: { label: "Open", tone: "info" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "destructive" },
};
