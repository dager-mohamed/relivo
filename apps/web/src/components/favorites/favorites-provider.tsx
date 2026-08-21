import * as React from "react";

import {
  persistFavorites,
  type FavoriteKind,
  type FavoriteRef,
} from "#/lib/favorites/cookies";
import { resolveFavorites, type FavoriteRow } from "#/lib/favorites/resolve";
import { defaultFavorites } from "#/mocks/favorites";

type FavoritesContextValue = {
  rows: FavoriteRow[];
  isFavorite: (kind: FavoriteKind, id: string) => boolean;
  toggle: (kind: FavoriteKind, id: string) => void;
  remove: (kind: FavoriteKind, id: string) => void;
  reorder: (rows: FavoriteRow[]) => void;
};

const FavoritesContext = React.createContext<FavoritesContextValue | null>(
  null,
);

/**
 * One list, read by the sidebar and written from every record surface.
 *
 * State lives here rather than in each screen because the star and the sidebar
 * row are the same fact seen twice, and the spec is explicit that the row must
 * appear the instant the star is clicked. A round trip cannot be fast enough
 * for that, so the write is local and the cookie follows.
 *
 * Mounted once in the `_app` layout, which never remounts.
 */
export function FavoritesProvider({
  initial,
  children,
}: {
  /** `null` when the cookie was never set — a first visit gets the fixtures. */
  initial: FavoriteRef[] | null;
  children: React.ReactNode;
}) {
  const [refs, setRefs] = React.useState<FavoriteRef[]>(
    initial ?? defaultFavorites,
  );

  // Persisting inside the setter keeps the cookie in step with a functional
  // update, which is the only way to be sure it reflects what actually landed.
  const commit = React.useCallback(
    (next: (current: FavoriteRef[]) => FavoriteRef[]) => {
      setRefs((current) => {
        const value = next(current);
        persistFavorites(value);
        return value;
      });
    },
    [],
  );

  const value = React.useMemo<FavoritesContextValue>(() => {
    const has = (kind: FavoriteKind, id: string) =>
      refs.some((ref) => ref.kind === kind && ref.id === id);

    return {
      rows: resolveFavorites(refs),
      isFavorite: has,
      // Newest at the bottom: the list is manually ordered, so dropping a new
      // pin at the top would shove everything the founder arranged down a row.
      toggle: (kind, id) =>
        commit((current) =>
          has(kind, id)
            ? current.filter((ref) => !(ref.kind === kind && ref.id === id))
            : [...current, { kind, id }],
        ),
      remove: (kind, id) =>
        commit((current) =>
          current.filter((ref) => !(ref.kind === kind && ref.id === id)),
        ),
      // Rows in, refs out — the sortable owns display objects and knows
      // nothing about what is stored.
      reorder: (next) =>
        commit(() => next.map((row) => ({ kind: row.kind, id: row.id }))),
    };
  }, [refs, commit]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const value = React.useContext(FavoritesContext);
  if (!value) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return value;
}
