import type { Company, Deal, Person } from "@repo/db";
import type { DealStageType } from "@repo/schema";

import type { NewPerson } from "#/lib/people/new-person";

import { companyRows } from "./company-rows";
import { workspace } from "./workspace";

/**
 * The shape `people.list` will return, not the `people` table.
 *
 * Company is a join and deals is `deals.primaryContactId` resolved back — the
 * two things this screen exists to show that an address book cannot.
 */
export type PersonListRow = Person & {
  company: Pick<Company, "id" | "name" | "logoUrl"> | null;
  /** Deals where this person is the primary contact. */
  deals: (Pick<Deal, "id" | "number" | "value" | "closeDate"> & {
    stageType: DealStageType;
  })[];
};

const now = new Date("2026-08-15T09:00:00Z");

// Titles, keyed by name, because the company fixtures only carry names. A
// derived role would be noise — this screen is largely about reading titles.
const roles: Record<string, string> = {
  "Justin Frankel": "Founder",
  "Shawn Fanning": "Founder",
  "Tom Leighton": "CEO",
  "Akio Morita": "CEO",
  "Rob Burgess": "CEO",
  "Marc Andreessen": "Co-founder",
  "Diane Greene": "CEO",
  "Mendel Rosenblum": "Chief Scientist",
  "Carol Bartz": "CEO",
  "Andy Hertzfeld": "Software Lead",
  "Steve Wozniak": "Co-founder",
  "Alan Kay": "Research Fellow",
  "Bill Joy": "Chief Scientist",
  "Jim Clark": "Founder",
  "Nolan Bushnell": "Founder",
  "Al Alcorn": "Head of Engineering",
  "Avie Tevanian": "VP Engineering",
  "Andy Rubin": "Co-founder",
  "Jeff Hawkins": "Founder",
  "Donna Dubinsky": "CEO",
};

// Someone you only ever met in person. No email means no envelope, and the
// list has to say that by leaving the cell empty rather than disabling it.
const noEmail = new Set(["Al Alcorn", "Alan Kay"]);

const phones: Record<string, string> = {
  "Nolan Bushnell": "+1 408 555 0163",
  "Diane Greene": "+1 650 555 0119",
  "Tom Leighton": "+1 617 555 0148",
};

function emailFor(name: string, domain: string): string {
  const first = name.split(" ")[0]?.toLowerCase() ?? "hello";
  return `${first}@${domain}`;
}

const base = {
  workspaceId: workspace.id,
  avatarUrl: null,
  createdAt: now,
  updatedAt: now,
} satisfies Partial<Person>;

const linked: PersonListRow[] = companyRows.flatMap((company) =>
  company.people.map((person, index) => ({
    ...base,
    id: person.id,
    companyId: company.id,
    name: person.name,
    email:
      person.name && !noEmail.has(person.name)
        ? emailFor(person.name, company.domain)
        : null,
    phone: (person.name && phones[person.name]) ?? null,
    role: (person.name && roles[person.name]) ?? null,
    company: {
      id: company.id,
      name: company.name,
      logoUrl: company.logoUrl,
    },
    // First contact named on a company owns its first deal; the rest are on
    // the deal without being the one it is addressed to.
    deals:
      index === 0
        ? company.deals.slice(0, 1).map((deal) => ({
            id: deal.id,
            number: deal.number,
            value: deal.value,
            closeDate: deal.closeDate,
            stageType: deal.stageType,
          }))
        : [],
  })),
);

const sgi = companyRows.find((row) => row.domain === "sgi.com") ?? null;

export const personRows: PersonListRow[] = [
  ...linked,
  {
    // No name. `people.name` is nullable because email sync creates people
    // from an address alone, so the address has to be able to stand in for
    // one — see the check constraint on the table.
    ...base,
    id: "3f1c0a2e-0200-4000-8000-000000000901",
    companyId: sgi?.id ?? null,
    name: null,
    email: "procurement@sgi.com",
    phone: null,
    role: null,
    company: sgi ? { id: sgi.id, name: sgi.name, logoUrl: sgi.logoUrl } : null,
    deals: [],
  },
  {
    // No company at all — `people.companyId` is nullable and set-null on
    // delete, so this outlives whoever they used to work for.
    ...base,
    id: "3f1c0a2e-0200-4000-8000-000000000902",
    companyId: null,
    name: "Dave Winer",
    email: "dave@scripting.com",
    phone: null,
    role: "Advisor",
    company: null,
    deals: [],
  },
  {
    // Neither company nor email: name only, which the check constraint allows.
    ...base,
    id: "3f1c0a2e-0200-4000-8000-000000000903",
    companyId: null,
    name: "Ted Nelson",
    email: null,
    phone: "+1 415 555 0187",
    role: null,
    company: null,
    deals: [],
  },
];

/**
 * What `people.create` will hand back. It files the row as well as returning
 * it: the list and record screens each read this array into their own state,
 * so a person created on one has to exist for the other.
 */
let created = 0;
export function addPersonRow(input: NewPerson): PersonListRow {
  created += 1;
  const company = input.companyId
    ? (companyRows.find((row) => row.id === input.companyId) ?? null)
    : null;

  const row: PersonListRow = {
    ...base,
    id: `3f1c0a2e-0200-4000-8000-${String(950 + created).padStart(12, "0")}`,
    companyId: company?.id ?? null,
    name: input.name,
    email: input.email,
    phone: input.phone,
    role: input.role,
    company: company
      ? { id: company.id, name: company.name, logoUrl: company.logoUrl }
      : null,
    // Nobody is the contact on a deal the moment they are created.
    deals: [],
  };

  personRows.unshift(row);
  return row;
}

/** What the row calls itself. A nameless person is their address. */
export function personLabel(person: {
  name: string | null;
  email: string | null;
}): string {
  return person.name ?? person.email ?? "Unnamed";
}

/** Initials for the avatar fallback — never a silhouette. */
export function personInitials(person: {
  name: string | null;
  email: string | null;
}): string {
  if (person.name) {
    const [first, second] = person.name.split(" ");
    return `${first?.[0] ?? ""}${second?.[0] ?? ""}`.toUpperCase();
  }
  return (person.email?.[0] ?? "?").toUpperCase();
}
