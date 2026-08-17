import {
  ArrowsPointingOutIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent } from "@repo/ui/components/sheet";

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
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        // Must match SheetContent's own variant chain. It caps width with
        // `data-[side=right]:sm:max-w-sm`; a plain `sm:max-w-*` is a different
        // chain, so tailwind-merge keeps both and the attribute-scoped rule
        // wins on specificity — which pinned this at 384px.
        className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-5xl"
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
                <Button variant="ghost" size="icon-sm" aria-label="Favourite">
                  <StarIcon className="size-4" />
                </Button>
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
