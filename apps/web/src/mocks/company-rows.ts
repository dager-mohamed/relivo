import type { Company, Deal, Feedback, Person, User } from "@repo/db";
import type { DealStageType } from "@repo/schema";

import { draftName, type CompanyDraft } from "#/lib/companies/new-company";

import { currentUser } from "./user";
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
  deals: (Pick<Deal, "id" | "number" | "value" | "closeDate"> & {
    stageType: DealStageType;
    owner: Pick<User, "id" | "name" | "image"> | null;
  })[];
  feedback: (Pick<Feedback, "id" | "title" | "status"> & {
    /** Summed value of every deal blocked on it — derived, never stored. */
    dealValue: number;
  })[];
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
  socials?: Record<string, string>;
  createdAt: string;
};

/**
 * Workspace-wide, not per company: a request blocks whatever deals are linked
 * to it, wherever they sit. Keyed by title so the same request shows the same
 * figure on every company that raised it.
 */
const blockedRevenue: Record<string, number> = {
  "Audit log export to CSV": 41_200_000,
  "SAML single sign-on": 35_600_000,
  "Checksum validation": 23_850_000,
  "Scheduled snapshots": 19_400_000,
  "Configurable retention policy": 12_750_000,
  "Bulk edit from the table": 8_600_000,
  "Weekly digest email": 4_150_000,
  "CLI for job status": 2_900_000,
};

const owner: CompanyListRow["deals"][number]["owner"] = {
  id: currentUser.id,
  name: currentUser.name,
  image: currentUser.image,
};

function build(seed: Seed): CompanyListRow {
  seq += 1;
  const id = `3f1c0a2e-0100-4000-8000-${String(seq).padStart(12, "0")}`;
  const deals = seed.deals.map((deal, i) => ({
    id: `3f1c0a2e-0400-4000-8000-${String(seq * 10 + i).padStart(12, "0")}`,
    number: deal.number,
    value: deal.value,
    // Date-only string, matching the column — see schema/deal.ts. An open deal
    // closes ahead of today; a won or lost one already did.
    closeDate: addDays(
      now,
      deal.stageType === "open" ? 20 + i * 30 : -14 - i * 9,
    ),
    stageType: deal.stageType,
    owner,
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
    socials: seed.socials ?? null,
    manualFields: [],
    createdAt: new Date(seed.createdAt),
    updatedAt: now,
    people: seed.people.map((name, i) => ({
      id: `3f1c0a2e-0200-4000-8000-${String(seq * 10 + i).padStart(12, "0")}`,
      name,
      avatarUrl: null,
    })),
    deals,
    feedback: seed.feedback
      .map((item, i) => ({
        id: `3f1c0a2e-0500-4000-8000-${String(seq * 10 + i).padStart(12, "0")}`,
        title: item.title,
        status: item.status,
        dealValue: blockedRevenue[item.title] ?? 0,
      }))
      // The section is a ranking: most revenue blocked first.
      .sort((a, b) => b.dealValue - a.dealValue),
    openDealCount: deals.filter((deal) => deal.stageType === "open").length,
    // Minor units, summed across every deal — see text-maps/money.ts.
    totalDealValue: deals.reduce((sum, deal) => sum + (deal.value ?? 0), 0),
  };
}

// The fields the create dialog collects that enrichment is also allowed to
// write — see enrichableCompanyFields in packages/db.
const manualCandidates = [
  "name",
  "location",
  "description",
  "employees",
  "revenue",
  "funding",
  "phone",
] as const satisfies readonly (keyof CompanyDraft)[];

/**
 * What `companies.create` will hand back. A company created by hand has no
 * deals, no people and no feedback — the same shape as `Be Incorporated`
 * below, which is why that fixture is there.
 *
 * It files the row as well as returning it: the list and record screens each
 * read this array into their own state, so a company created on one has to
 * exist for the other. A mutation plus a query invalidation replaces exactly
 * this.
 */
export function addCompanyRow(draft: CompanyDraft): CompanyListRow {
  seq += 1;

  const row: CompanyListRow = {
    id: `3f1c0a2e-0100-4000-8000-${String(seq).padStart(12, "0")}`,
    workspaceId: workspace.id,
    domain: draft.domain,
    name: draftName(draft),
    logoUrl: null,
    location: draft.location,
    description: draft.description,
    employees: draft.employees,
    revenue: draft.revenue,
    funding: draft.funding,
    phone: draft.phone,
    socials: null,
    // Typed by hand, so a later enrich must not overwrite them. A derived
    // name is not manual, which is why draft.name is null until you edit it.
    manualFields: manualCandidates.filter((field) => draft[field] !== null),
    createdAt: now,
    updatedAt: now,
    people: [],
    deals: [],
    feedback: [],
    openDealCount: 0,
    totalDealValue: 0,
  };

  companyRows.unshift(row);
  return row;
}

function addDays(from: Date, days: number): string {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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
    socials: {
      LinkedIn: "https://linkedin.com/company/sony",
      X: "https://x.com/sony",
      YouTube: "https://youtube.com/@sony",
    },
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
    socials: {
      LinkedIn: "https://linkedin.com/company/vmware",
      GitHub: "https://github.com/vmware",
      X: "https://x.com/vmware",
      Website: "https://blogs.vmware.com",
    },
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
    socials: {
      LinkedIn: "https://linkedin.com/company/general-magic",
      GitHub: "https://github.com/generalmagic",
    },
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
