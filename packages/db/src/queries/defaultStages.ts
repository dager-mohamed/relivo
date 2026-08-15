import type { DealStageType } from "@repo/schema";

import type { Database, Transaction } from "../client";
import { dealStages } from "../schema";

export const defaultDealStages: { name: string; type: DealStageType }[] = [
  { name: "Qualified", type: "open" },
  { name: "Demo", type: "open" },
  { name: "Proposal", type: "open" },
  { name: "Closed Won", type: "won" },
  { name: "Closed Lost", type: "lost" },
];

// Call when a workspace is created — a board with no stages isn't usable.
export async function seedDefaultStages(
  tx: Database | Transaction,
  workspaceId: string,
) {
  return tx
    .insert(dealStages)
    .values(
      defaultDealStages.map((stage, position) => ({
        ...stage,
        position,
        workspaceId,
      })),
    )
    .returning();
}
