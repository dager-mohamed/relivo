import type { FavoriteRef } from "#/lib/favorites/cookies";
import { companyRows } from "#/mocks/company-rows";
import { personLabel, personRows } from "#/mocks/person-rows";

/**
 * A favourite with everything the sidebar draws, looked up fresh.
 *
 * `value` exists only on deals, and that asymmetry is the point: the figure is
 * what a founder wants at a glance for a deal, and nothing a company or a
 * person has belongs in that column.
 */
export type FavoriteRow =
  | { kind: "company"; id: string; label: string; imageUrl: string | null }
  | { kind: "person"; id: string; label: string; imageUrl: string | null }
  | { kind: "deal"; id: string; label: string; value: number | null };

/**
 * Pointers in, rows out. A reference that resolves to nothing is dropped
 * rather than rendered blank — deleting a favourited record has to take its
 * sidebar row with it, and this is the only place that can decide.
 *
 * Reads the list fixtures, so the ids match what the record routes look up.
 * This becomes one query when the routers land.
 */
export function resolveFavorites(refs: FavoriteRef[]): FavoriteRow[] {
  return refs.flatMap((ref): FavoriteRow[] => {
    switch (ref.kind) {
      case "company": {
        const company = companyRows.find((row) => row.id === ref.id);
        return company
          ? [
              {
                kind: "company",
                id: company.id,
                label: company.name,
                imageUrl: company.logoUrl,
              },
            ]
          : [];
      }

      case "person": {
        const person = personRows.find((row) => row.id === ref.id);
        return person
          ? [
              {
                kind: "person",
                id: person.id,
                label: personLabel(person),
                imageUrl: person.avatarUrl,
              },
            ]
          : [];
      }

      case "deal": {
        // Deals hang off companies in the fixtures, and the company's name is
        // what the row shows — "General Magic $28.5K" reads faster in 200px
        // than the deal's own "General Magic — platform licence".
        for (const company of companyRows) {
          const deal = company.deals.find((row) => row.id === ref.id);
          if (deal) {
            return [
              {
                kind: "deal",
                id: deal.id,
                label: company.name,
                value: deal.value,
              },
            ];
          }
        }
        return [];
      }
    }
  });
}
