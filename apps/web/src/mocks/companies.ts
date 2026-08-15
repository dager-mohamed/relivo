import type { Company } from "@repo/db";

import { workspace } from "./workspace";

const now = new Date("2026-08-15T09:00:00Z");

const base = {
  workspaceId: workspace.id,
  logoUrl: null,
  manualFields: [],
  createdAt: now,
  updatedAt: now,
} satisfies Partial<Company>;

// funding is minor units — $18.5M is 1_850_000_000 cents, not 18_500_000.
export const companies: Company[] = [
  {
    ...base,
    id: "3f1c0a2e-0001-4000-8000-000000000001",
    domain: "atari.com",
    name: "Atari",
    location: "Sunnyvale",
    description: "Arcade hardware and home console maker.",
    employees: "251-1K",
    revenue: "$50M-100M",
    funding: 1_850_000_000,
    phone: "+1 408 555 0142",
    socials: { linkedin: "https://linkedin.com/company/atari" },
  },
  {
    ...base,
    id: "3f1c0a2e-0001-4000-8000-000000000002",
    domain: "generalmagic.com",
    name: "General Magic",
    location: "Mountain View",
    description: "Handheld communicators and personal intelligent agents.",
    employees: "51-250",
    revenue: "$10M-50M",
    funding: 640_000_000,
    phone: null,
    socials: null,
  },
  {
    ...base,
    id: "3f1c0a2e-0001-4000-8000-000000000003",
    domain: "vmware.com",
    name: "VMware",
    location: "Palo Alto",
    description: "Virtualisation and cloud infrastructure.",
    employees: "1K-5K",
    revenue: "$100M-500M",
    funding: 9_200_000_000,
    phone: "+1 650 555 0119",
    socials: { linkedin: "https://linkedin.com/company/vmware" },
  },
  {
    ...base,
    id: "3f1c0a2e-0001-4000-8000-000000000004",
    domain: "sgi.com",
    name: "Silicon Graphics",
    location: "Mountain View",
    description: "High-performance graphics workstations.",
    employees: "1K-5K",
    revenue: "$100M-500M",
    funding: null,
    phone: null,
    socials: null,
  },
];
