import {
  companyNameFromDomain,
  domain as domainSchema,
  normalizeDomain,
  type EmployeeRange,
  type RevenueRange,
} from "@repo/schema";

/**
 * What the create dialog collects.
 *
 * `name: null` means "still derived from the domain" — the field keeps
 * following what you type until you edit it, and once you have, it stops. A
 * string plus a `nameTouched` boolean would let the two disagree.
 */
export type CompanyDraft = {
  domain: string;
  name: string | null;
  location: string | null;
  description: string | null;
  employees: EmployeeRange | null;
  revenue: RevenueRange | null;
  funding: number | null;
  phone: string | null;
};

export const emptyCompanyDraft: CompanyDraft = {
  domain: "",
  name: null,
  location: null,
  description: null,
  employees: null,
  revenue: null,
  funding: null,
  phone: null,
};

/** The name as it will be filed — typed if you typed one, derived if not. */
export function draftName(draft: CompanyDraft): string {
  if (draft.name !== null) return draft.name;
  const host = normalizeDomain(draft.domain);
  return host === "" ? "" : companyNameFromDomain(host);
}

/**
 * Whether the draft can be filed, and if not, what to say about it.
 *
 * `duplicate` is not an error state: `companies` is unique on
 * (workspaceId, domain), so without this the second Sony fails at the
 * database. Catching it in the field turns a 500 into a link.
 */
export type DraftStatus<T> =
  | { kind: "empty" }
  | { kind: "invalid"; message: string }
  | { kind: "duplicate"; company: T }
  | { kind: "ready"; domain: string; name: string };

export function draftStatus<T extends { domain: string }>(
  draft: CompanyDraft,
  // Every company, never the filtered view — a name hidden by a filter is
  // still taken.
  existing: readonly T[],
): DraftStatus<T> {
  const host = normalizeDomain(draft.domain);
  if (host === "") return { kind: "empty" };

  if (!domainSchema.safeParse(host).success) {
    return { kind: "invalid", message: "Enter a domain like acme.com" };
  }

  const clash = existing.find((row) => normalizeDomain(row.domain) === host);
  if (clash) return { kind: "duplicate", company: clash };

  const name = draftName(draft).trim();
  if (name === "") return { kind: "invalid", message: "Give it a name" };

  return { kind: "ready", domain: host, name };
}
