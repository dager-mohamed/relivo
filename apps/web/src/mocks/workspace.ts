import type { Workspace } from "@repo/db";

const now = new Date("2026-08-15T09:00:00Z");

export const workspace: Workspace = {
  id: "3f1c0a2e-0000-4000-8000-000000000001",
  name: "Relivo",
  slug: "relivo",
  dealCounter: 12,
  createdAt: now,
  updatedAt: now,
};
