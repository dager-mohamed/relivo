import type { CompanyListRow } from "#/mocks/company-rows";

/**
 * Kept deliberately narrow. The task calls a builder with nested conditions
 * "the wrong direction — that is Salesforce", and ⌘K owns search, so there is
 * no query field here.
 *
 * This lives outside the table because these become tRPC inputs the day the
 * real router lands. Sorting and selection stay in table state; filtering does
 * not, or it would have to be torn back out.
 */
export type CompanyFilters = {
  /** null = any; true = has at least one open deal; false = has none. */
  hasOpenDeals: boolean | null;
  /** Empty = any. */
  locations: string[];
};

export const emptyCompanyFilters: CompanyFilters = {
  hasOpenDeals: null,
  locations: [],
};

export function isFiltered(filters: CompanyFilters): boolean {
  return filters.hasOpenDeals !== null || filters.locations.length > 0;
}

export function filterCompanies(
  rows: CompanyListRow[],
  filters: CompanyFilters,
): CompanyListRow[] {
  return rows.filter((row) => {
    if (filters.hasOpenDeals !== null) {
      if (filters.hasOpenDeals !== row.openDealCount > 0) return false;
    }
    if (filters.locations.length > 0) {
      if (!row.location || !filters.locations.includes(row.location)) {
        return false;
      }
    }
    return true;
  });
}

/** Locations actually present, so the filter never offers an empty result. */
export function locationOptions(rows: CompanyListRow[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) if (row.location) seen.add(row.location);
  return [...seen].sort((a, b) => a.localeCompare(b));
}
