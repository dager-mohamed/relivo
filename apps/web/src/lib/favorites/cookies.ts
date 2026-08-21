import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

/**
 * A favourite is a pointer, never a copy. Storing the label would leave the
 * sidebar showing a company's old name after a rename and a dead row after a
 * delete — the two failures the spec calls out. Everything shown is looked up
 * from the record itself at render time.
 */
export const FAVORITE_KINDS = ["company", "person", "deal"] as const;

export type FavoriteKind = (typeof FAVORITE_KINDS)[number];
export type FavoriteRef = { kind: FavoriteKind; id: string };

const COOKIE = "favorites";
const MAX_AGE = 60 * 60 * 24 * 365;

/** `kind:id` joined by commas. Ids are uuids, so neither separator can appear. */
function serialize(refs: FavoriteRef[]): string {
  return refs.map((ref) => `${ref.kind}:${ref.id}`).join(",");
}

function parse(raw: string | undefined): FavoriteRef[] | null {
  if (raw === undefined) return null;

  return raw
    .split(",")
    .filter(Boolean)
    .flatMap((entry) => {
      const [kind, id] = entry.split(":");
      // A hand-edited or half-written cookie drops the bad entry rather than
      // taking the whole sidebar down with it.
      return kind && id && isKind(kind) ? [{ kind, id }] : [];
    });
}

function isKind(value: string): value is FavoriteKind {
  return (FAVORITE_KINDS as readonly string[]).includes(value);
}

/**
 * `null` means "never set", which is what lets the seeded fixtures show on a
 * first visit while an empty list stays empty after someone unpins everything.
 *
 * Read on the server for the same reason the sidebar sections are: favourites
 * are above the fold, and resolving them on the client would paint the sidebar
 * once without them.
 */
export const getFavorites = createServerFn({ method: "GET" }).handler(() =>
  parse(getCookie(COOKIE)),
);

/** Written the way `persistSections` is; see lib/sidebar/cookies.ts. */
export function persistFavorites(refs: FavoriteRef[]) {
  document.cookie = `${COOKIE}=${serialize(refs)}; path=/; max-age=${MAX_AGE}`;
}
