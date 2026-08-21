import { ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent } from "@repo/ui/components/sheet";

import { FavoriteStar } from "#/components/favorites/favorite-star";
import type { FavoriteKind } from "#/lib/favorites/cookies";

/**
 * A record opened from a list, without leaving it. The body is whatever panel
 * the record type owns, so the drawer and the full page always show the same
 * fields — the thing RELIV-44 asked for and every record type since inherits.
 *
 * Nothing renders until there is a record: the caller passes `open` derived
 * from its own selection, and children guarded the same way.
 */
export function RecordDrawer({
  open,
  onClose,
  avatar,
  title,
  meta,
  expandLink,
  record,
  children,
}: {
  open: boolean;
  onClose: () => void;
  avatar: React.ReactNode;
  title: React.ReactNode;
  /** One quiet fact beside the title — when it was created, usually. */
  meta?: React.ReactNode;
  /** A bare `<Link>`; the drawer supplies the button chrome around it. */
  expandLink: React.ReactElement;
  /** What the star pins. Null while nothing is open. */
  record: { kind: FavoriteKind; id: string } | null;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        // ~403px at 1920, which is the width a fields column wants; the floor
        // stops it crushing on a laptop and the ceiling stops it sprawling on
        // a 4K display, where 21vw would be over 500.
        //
        // Both utilities must stay in the `data-[side=right]:` chain to match
        // SheetContent's own `w-3/4` and `sm:max-w-sm`. A plain `w-*` is a
        // different chain, so tailwind-merge keeps both and the
        // attribute-scoped rule wins on specificity.
        className="flex flex-col gap-0 p-0 data-[side=right]:w-[min(100vw,clamp(22.5rem,21vw,30rem))] data-[side=right]:sm:max-w-none"
      >
        {open ? (
          <>
            <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-3">
              {avatar}
              <span className="truncate font-heading font-semibold">
                {title}
              </span>
              {meta ? (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {meta}
                </span>
              ) : null}

              <div className="ml-auto flex shrink-0 items-center gap-0.5">
                {record ? (
                  <FavoriteStar kind={record.kind} id={record.id} />
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open full record"
                  // It renders an anchor, and Base UI assumes a native button
                  // unless told otherwise — leaving it on strips the link's
                  // own semantics and warns.
                  nativeButton={false}
                  render={expandLink}
                >
                  <ArrowsPointingOutIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close"
                  onClick={onClose}
                >
                  <XMarkIcon className="size-4" />
                </Button>
              </div>
            </header>

            {children}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
