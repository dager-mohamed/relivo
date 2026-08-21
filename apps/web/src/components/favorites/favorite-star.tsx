import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

import { Button } from "@repo/ui/components/button";

import { useFavorites } from "#/components/favorites/favorites-provider";
import type { FavoriteKind } from "#/lib/favorites/cookies";

/**
 * The primary way anything gets pinned. Filled when active, and the sidebar row
 * appears on the same tick — the write is local, so there is no state between
 * clicking and seeing it.
 *
 * One component for the record page and the drawer, because the star has to
 * agree with itself when both are open on the same record.
 */
export function FavoriteStar({ kind, id }: { kind: FavoriteKind; id: string }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(kind, id);

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={active}
      onClick={() => toggle(kind, id)}
    >
      {active ? (
        <StarIconSolid className="size-4" />
      ) : (
        <StarIcon className="size-4" />
      )}
    </Button>
  );
}
