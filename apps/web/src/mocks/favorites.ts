import type { FavoriteRef } from "#/lib/favorites/cookies";

import { companyRows } from "./company-rows";
import { personRows } from "./person-rows";

/**
 * What the sidebar shows before anyone has pinned anything — a mixed list, on
 * purpose, because the flat ordering of unlike records is the feature.
 *
 * References the list fixtures rather than the raw tables so the ids match the
 * ones the record routes look up; a favourite that cannot navigate is worse
 * than no favourite. Delete this the moment `favorites.list` exists.
 */
const firstDeal = companyRows.find((row) => row.deals.length > 0);
const secondDeal = companyRows.find(
  (row) => row.deals.length > 0 && row.id !== firstDeal?.id,
);

export const defaultFavorites: FavoriteRef[] = [
  companyRows[0] ? { kind: "company" as const, id: companyRows[0].id } : null,
  firstDeal?.deals[0]
    ? { kind: "deal" as const, id: firstDeal.deals[0].id }
    : null,
  personRows[1] ? { kind: "person" as const, id: personRows[1].id } : null,
  companyRows[3] ? { kind: "company" as const, id: companyRows[3].id } : null,
  secondDeal?.deals[0]
    ? { kind: "deal" as const, id: secondDeal.deals[0].id }
    : null,
].filter((ref) => ref !== null);
