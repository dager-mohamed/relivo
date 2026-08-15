import type { Company, Deal, Feedback, Person } from "@repo/db";
import type { DealStageType } from "@repo/schema";

import { workspace } from "./workspace";

/**
 * The shape `companies.list` will return, not the `companies` table.
 *
 * Every column on the list screen is a join — people, deals, feedback — plus
 * two derived figures. Building the fixture as the procedure's *output* means
 * swapping to tRPC changes the data source and nothing else.
 */
export type CompanyListRow = Company & {
  people: Pick<Person, "id" | "name" | "avatarUrl">[];
  deals: (Pick<Deal, "id" | "number" | "value"> & {
    stageType: DealStageType;
  })[];
  feedback: Pick<Feedback, "id" | "title" | "status">[];
  /** Derived server-side; never stored. */
  openDealCount: number;
  totalDealValue: number;
};

const now = new Date("2026-08-15T09:00:00Z");
let seq = 0;

type Seed = {
  name: string;
  domain: string;
  location: string | null;
  employees: Company["employees"];
  deals: { number: number; value: number | null; stageType: DealStageType }[];
  people: string[];
  feedback: { title: string; status: Feedback["status"] }[];
  createdAt: string;
};

function build(seed: Seed): CompanyListRow {
  seq += 1;
  const id = `3f1c0a2e-0100-4000-8000-${String(seq).padStart(12, "0")}`;

  const deals = seed.deals.map((deal, i) => ({
    id: `3f1c0a2e-0400-4000-8000-${String(seq * 10 + i).padStart(12, "0")}`,
    number: deal.number,
    value: deal.value,
    stageType: deal.stageType,
  }));

  return {
    id,
    workspaceId: workspace.id,
    domain: seed.domain,
    name: seed.name,
    logoUrl: null,
    location: seed.location,
    description: null,
    employees: seed.employees,
    revenue: null,
    funding: null,
    phone: null,
    socials: null,
    manualFields: [],
    createdAt: new Date(seed.createdAt),
    updatedAt: now,
    people: seed.people.map((name, i) => ({
      id: `3f1c0a2e-0200-4000-8000-${String(seq * 10 + i).padStart(12, "0")}`,
      name,
      avatarUrl: null,
    })),
    deals,
    feedback: seed.feedback.map((item, i) => ({
      id: `3f1c0a2e-0500-4000-8000-${String(seq * 10 + i).padStart(12, "0")}`,
      title: item.title,
      status: item.status,
    })),
    openDealCount: deals.filter((deal) => deal.stageType === "open").length,
    // Minor units, summed across every deal — see text-maps/money.ts.
    totalDealValue: deals.reduce((sum, deal) => sum + (deal.value ?? 0), 0),
  };
}

export const companyRows: CompanyListRow[] = [
  build({
    name: "Winamp",
    domain: "winamp.com",
    location: "SF",
    employees: "51-250",
    deals: [{ number: 24, value: 1_450_000, stageType: "open" }],
    people: ["Justin Frankel"],
    feedback: [],
    createdAt: "2026-08-12T10:00:00Z",
  }),
  build({
    name: "Napster",
    domain: "napster.com",
    location: "SF",
    employees: "51-250",
    deals: [{ number: 23, value: 3_300_000, stageType: "won" }],
    people: ["Shawn Fanning"],
    feedback: [],
    createdAt: "2026-08-12T09:00:00Z",
  }),
  build({
    name: "Akamai",
    domain: "akamai.com",
    location: "Cambridge",
    employees: "1K-5K",
    deals: [{ number: 22, value: 8_500_000, stageType: "open" }],
    people: ["Tom Leighton"],
    feedback: [{ title: "Audit log export to CSV", status: "in_progress" }],
    createdAt: "2026-08-12T08:00:00Z",
  }),
  build({
    name: "Sony",
    domain: "sony.com",
    location: "Tokyo",
    employees: "10K+",
    deals: [{ number: 21, value: 17_500_000, stageType: "open" }],
    people: ["Akio Morita"],
    feedback: [{ title: "Checksum validation", status: "planned" }],
    createdAt: "2026-06-24T09:00:00Z",
  }),
  build({
    name: "Macromedia",
    domain: "macromedia.com",
    location: "SF",
    employees: "251-1K",
    deals: [{ number: 20, value: 2_450_000, stageType: "won" }],
    people: ["Rob Burgess"],
    feedback: [{ title: "Scheduled snapshots", status: "planned" }],
    createdAt: "2026-06-24T08:00:00Z",
  }),
  build({
    name: "Netscape",
    domain: "netscape.com",
    location: "Mountain View",
    employees: "251-1K",
    deals: [{ number: 19, value: 6_500_000, stageType: "lost" }],
    people: ["Marc Andreessen"],
    feedback: [],
    createdAt: "2026-06-21T12:00:00Z",
  }),
  build({
    name: "VMware",
    domain: "vmware.com",
    location: "Palo Alto",
    employees: "1K-5K",
    deals: [{ number: 18, value: 12_500_000, stageType: "open" }],
    people: ["Diane Greene", "Mendel Rosenblum"],
    feedback: [{ title: "Audit log export to CSV", status: "in_progress" }],
    createdAt: "2026-06-21T11:00:00Z",
  }),
  build({
    name: "Autodesk",
    domain: "autodesk.com",
    location: "SF",
    employees: "10K+",
    deals: [{ number: 17, value: 8_500_000, stageType: "open" }],
    people: ["Carol Bartz"],
    feedback: [{ title: "Audit log export to CSV", status: "in_progress" }],
    createdAt: "2026-06-21T10:00:00Z",
  }),
  build({
    name: "General Magic",
    domain: "generalmagic.com",
    location: "Mountain View",
    employees: "51-250",
    deals: [{ number: 16, value: 2_850_000, stageType: "open" }],
    people: ["Andy Hertzfeld"],
    feedback: [
      { title: "Checksum validation", status: "planned" },
      { title: "Bulk edit from the table", status: "backlog" },
      { title: "Weekly digest email", status: "backlog" },
    ],
    createdAt: "2026-06-21T09:00:00Z",
  }),
  build({
    name: "Apple",
    domain: "apple.com",
    location: "Cupertino",
    employees: "10K+",
    deals: [{ number: 15, value: 5_900_000, stageType: "won" }],
    people: ["Steve Wozniak"],
    feedback: [],
    createdAt: "2026-06-18T14:00:00Z",
  }),
  build({
    name: "Xerox",
    domain: "xerox.com",
    location: "Palo Alto",
    employees: "10K+",
    deals: [{ number: 14, value: 12_200_000, stageType: "open" }],
    people: ["Alan Kay"],
    feedback: [],
    createdAt: "2026-06-18T13:00:00Z",
  }),
  build({
    name: "Sun Microsystems",
    domain: "sun.com",
    location: "Santa Clara",
    employees: "10K+",
    deals: [{ number: 12, value: 8_500_000, stageType: "open" }],
    people: ["Bill Joy"],
    feedback: [
      { title: "Audit log export to CSV", status: "in_progress" },
      { title: "SAML single sign-on", status: "planned" },
    ],
    createdAt: "2026-06-18T12:00:00Z",
  }),
  build({
    name: "Silicon Graphics",
    domain: "sgi.com",
    location: "Mountain View",
    employees: "1K-5K",
    deals: [{ number: 11, value: 6_800_000, stageType: "lost" }],
    people: ["Jim Clark"],
    feedback: [
      { title: "Audit log export to CSV", status: "in_progress" },
      { title: "Configurable retention policy", status: "planned" },
    ],
    createdAt: "2026-06-18T11:00:00Z",
  }),
  build({
    name: "Atari",
    domain: "atari.com",
    location: "Sunnyvale",
    employees: "251-1K",
    deals: [{ number: 10, value: 3_450_000, stageType: "open" }],
    people: ["Nolan Bushnell", "Al Alcorn"],
    feedback: [],
    createdAt: "2026-06-18T10:00:00Z",
  }),
  build({
    name: "NeXT",
    domain: "next.com",
    location: "Redwood City",
    employees: "51-250",
    deals: [{ number: 9, value: 1_850_000, stageType: "won" }],
    people: ["Avie Tevanian"],
    feedback: [
      { title: "Checksum validation", status: "planned" },
      { title: "CLI for job status", status: "backlog" },
    ],
    createdAt: "2026-06-18T09:00:00Z",
  }),
  build({
    // No deals, no people — the row every list screen forgets to design for.
    name: "Be Incorporated",
    domain: "be.com",
    location: "Menlo Park",
    employees: "11-50",
    deals: [],
    people: [],
    feedback: [],
    createdAt: "2026-06-15T09:00:00Z",
  }),
  build({
    // First-stage deal: no value yet, so the money column must handle null.
    name: "Danger",
    domain: "danger.com",
    location: "Palo Alto",
    employees: "51-250",
    deals: [{ number: 8, value: null, stageType: "open" }],
    people: ["Andy Rubin"],
    feedback: [],
    createdAt: "2026-06-14T09:00:00Z",
  }),
  build({
    name: "Handspring",
    domain: "handspring.com",
    location: "Mountain View",
    employees: "251-1K",
    deals: [
      { number: 7, value: 4_200_000, stageType: "open" },
      { number: 6, value: 1_100_000, stageType: "won" },
    ],
    people: ["Jeff Hawkins", "Donna Dubinsky"],
    feedback: [],
    createdAt: "2026-06-12T09:00:00Z",
  }),
];
