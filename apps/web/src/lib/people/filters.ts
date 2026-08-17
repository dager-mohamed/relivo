import type { PersonListRow } from "#/mocks/person-rows";

/**
 * Same shape and reasoning as the company filters: narrow, no query field
 * (⌘K owns search), and outside the table because these become tRPC inputs
 * the day the router lands.
 *
 * The three questions a founder actually asks this screen: who is at this
 * company, who can I email, and who is attached to a deal.
 */
export type PersonFilters = {
  /** Empty = any. Company ids, not names — two companies may share a name. */
  companies: string[];
  /** null = any; true = has an address; false = has none. */
  hasEmail: boolean | null;
  /** null = any; true = named on at least one deal. */
  onDeal: boolean | null;
};

export const emptyPersonFilters: PersonFilters = {
  companies: [],
  hasEmail: null,
  onDeal: null,
};

export function isFiltered(filters: PersonFilters): boolean {
  return (
    filters.companies.length > 0 ||
    filters.hasEmail !== null ||
    filters.onDeal !== null
  );
}

export function filterPeople(
  rows: PersonListRow[],
  filters: PersonFilters,
): PersonListRow[] {
  return rows.filter((row) => {
    if (filters.companies.length > 0) {
      if (!row.companyId || !filters.companies.includes(row.companyId)) {
        return false;
      }
    }
    if (filters.hasEmail !== null) {
      if (filters.hasEmail !== (row.email !== null)) return false;
    }
    if (filters.onDeal !== null) {
      if (filters.onDeal !== row.deals.length > 0) return false;
    }
    return true;
  });
}

/** Companies actually represented, so the filter never offers an empty result. */
export function companyOptions(
  rows: PersonListRow[],
): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (row.company) seen.set(row.company.id, row.company.name);
  }
  return [...seen]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
