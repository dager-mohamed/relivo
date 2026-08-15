import { eq, sql } from "drizzle-orm";

import type { Database, Transaction } from "../client";
import { workspaces } from "../schema";

// Run inside the same transaction as the deal insert. The UPDATE takes a row
// lock, so concurrent creates queue instead of both reading the same
// counter — unlike `SELECT max(number) + 1`. Never decrements, so a deleted
// deal's number isn't reissued to a different deal.
export async function claimDealNumber(
  tx: Database | Transaction,
  workspaceId: string,
): Promise<number> {
  const [row] = await tx
    .update(workspaces)
    .set({ dealCounter: sql`${workspaces.dealCounter} + 1` })
    .where(eq(workspaces.id, workspaceId))
    .returning({ number: workspaces.dealCounter });

  if (!row) {
    throw new Error(`workspace ${workspaceId} not found`);
  }

  return row.number;
}

export function formatDealIdentifier(number: number): string {
  return `DEAL-${String(number)}`;
}
