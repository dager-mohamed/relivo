import type { Person } from "@repo/db";

import { companies } from "./companies";
import { workspace } from "./workspace";

const now = new Date("2026-08-15T09:00:00Z");

const base = {
  workspaceId: workspace.id,
  avatarUrl: null,
  createdAt: now,
  updatedAt: now,
} satisfies Partial<Person>;

export const people: Person[] = [
  {
    ...base,
    id: "3f1c0a2e-0002-4000-8000-000000000001",
    companyId: companies[0]!.id,
    name: "Nolan Bushnell",
    email: "nolan@atari.com",
    phone: "+1 408 555 0163",
    role: "Founder",
  },
  {
    ...base,
    id: "3f1c0a2e-0002-4000-8000-000000000002",
    companyId: companies[1]!.id,
    name: "Akio Morita",
    email: "akio@generalmagic.com",
    phone: null,
    role: "Head of Platform",
  },
  {
    ...base,
    id: "3f1c0a2e-0002-4000-8000-000000000003",
    companyId: companies[2]!.id,
    name: "Diane Greene",
    email: "diane@vmware.com",
    phone: null,
    role: "VP Engineering",
  },
  {
    // The schema allows a person with no company and no name, as long as an
    // email exists — email sync creates these. Kept here so screens handle it.
    ...base,
    id: "3f1c0a2e-0002-4000-8000-000000000004",
    companyId: null,
    name: null,
    email: "procurement@sgi.com",
    phone: null,
    role: null,
  },
];
