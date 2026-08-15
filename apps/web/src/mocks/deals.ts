import type { Deal, DealStage } from "@repo/db";

import { companies } from "./companies";
import { people } from "./people";
import { workspace } from "./workspace";

const now = new Date("2026-08-15T09:00:00Z");

const base = { workspaceId: workspace.id, createdAt: now, updatedAt: now };

// Matches the default pipeline in packages/db/src/queries/defaultStages.ts.
export const dealStages: DealStage[] = [
  {
    ...base,
    id: "3f1c0a2e-0003-4000-8000-000000000001",
    name: "Qualified",
    type: "open",
    position: 0,
  },
  {
    ...base,
    id: "3f1c0a2e-0003-4000-8000-000000000002",
    name: "Demo",
    type: "open",
    position: 1,
  },
  {
    ...base,
    id: "3f1c0a2e-0003-4000-8000-000000000003",
    name: "Proposal",
    type: "open",
    position: 2,
  },
  {
    ...base,
    id: "3f1c0a2e-0003-4000-8000-000000000004",
    name: "Closed Won",
    type: "won",
    position: 3,
  },
  {
    ...base,
    id: "3f1c0a2e-0003-4000-8000-000000000005",
    name: "Closed Lost",
    type: "lost",
    position: 4,
  },
];

// value is minor units — $28.5K is 2_850_000 cents.
export const deals: Deal[] = [
  {
    ...base,
    id: "3f1c0a2e-0004-4000-8000-000000000001",
    number: 10,
    name: "General Magic — platform licence",
    companyId: companies[1]!.id,
    value: 2_850_000,
    closeDate: "2026-09-09",
    stageId: dealStages[2]!.id,
    ownerId: null,
    primaryContactId: people[1]!.id,
  },
  {
    ...base,
    id: "3f1c0a2e-0004-4000-8000-000000000002",
    number: 11,
    name: "VMware — infrastructure rollout",
    companyId: companies[2]!.id,
    value: 12_500_000,
    closeDate: "2026-10-02",
    stageId: dealStages[1]!.id,
    ownerId: null,
    primaryContactId: people[2]!.id,
  },
  {
    // First stage, so no value or contact yet — PRODUCT.md's compact card.
    ...base,
    id: "3f1c0a2e-0004-4000-8000-000000000003",
    number: 12,
    name: "Atari — pilot",
    companyId: companies[0]!.id,
    value: null,
    closeDate: null,
    stageId: dealStages[0]!.id,
    ownerId: null,
    primaryContactId: null,
  },
];
