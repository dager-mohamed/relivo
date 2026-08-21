import { Link } from "@tanstack/react-router";
import { Bars2Icon, XMarkIcon } from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@repo/ui/components/reui/sortable";
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

import { useFavorites } from "#/components/favorites/favorites-provider";
import { NavSection } from "#/components/sidebar/nav-section";
import type { FavoriteRow } from "#/lib/favorites/resolve";
import { formatMoney } from "#/text-maps";

// Four text tiers, all one hue: active item / label / value / section header.
const LABEL = "text-sidebar-foreground/75";
const VALUE = "text-sidebar-foreground/50";

/** Unique across kinds — a deal and a company can hold the same fixture id. */
function key(row: FavoriteRow): string {
  return `${row.kind}:${row.id}`;
}

/**
 * One flat list of unlike records, ordered by hand.
 *
 * The flatness is the feature: a founder thinks "things I care about right
 * now", not "companies, then people". Grouping by type would sort the list by
 * something they never asked about. Shape carries the type instead — square
 * logo, round avatar, open ring — which is what keeps a mixed list readable.
 *
 * Owns its own section header, because whether the section exists at all is a
 * question only this component can answer. The other two are fixed lists.
 */
export function NavFavorites({
  defaultOpen,
  onOpenChange,
}: {
  defaultOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { rows, reorder, remove } = useFavorites();

  // Header and all. A lone "Favorites ▾" over nothing is a promise the sidebar
  // is not keeping — the section earns its line only once something is in it,
  // and the star is what brings it back.
  if (rows.length === 0) return null;

  return (
    <NavSection
      label="Favorites"
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {/* The sortable *is* the list element, so the tree stays ul > li. */}
      <Sortable
        value={rows}
        onValueChange={reorder}
        getItemValue={key}
        render={<SidebarMenu />}
      >
        {rows.map((row) => (
          <FavoriteItem
            key={key(row)}
            row={row}
            onRemove={() => remove(row.kind, row.id)}
          />
        ))}
      </Sortable>
    </NavSection>
  );
}

function FavoriteItem({
  row,
  onRemove,
}: {
  row: FavoriteRow;
  onRemove: () => void;
}) {
  return (
    <SortableItem
      value={key(row)}
      render={<SidebarMenuItem />}
      // dnd-kit stamps `role="button"` and `tabIndex={0}` on whatever carries
      // its attributes. On an `<li>` that announces every favourite as a button
      // and puts a second tab stop in front of each link. The handle below is a
      // real button, so the drag stays reachable without either.
      role="listitem"
      tabIndex={-1}
    >
      <SidebarMenuButton
        render={<FavoriteLink row={row} />}
        className={`gap-2.5 ${LABEL}`}
      >
        {/* Hidden under the handle rather than pushed aside by it: inserting a
            handle would shove a 200px row's label right and truncate it
            mid-hover, which is worse than losing the icon while pointing. */}
        <span className="shrink-0 transition-opacity group-hover/menu-item:opacity-0">
          <FavoriteIcon row={row} />
        </span>

        <span className="truncate">{row.label}</span>

        {/* Deals only. A company has no one figure worth this slot, and
            filling it with something would cost the asymmetry its meaning. */}
        {row.kind === "deal" && row.value !== null ? (
          <span className={`ml-auto shrink-0 text-xs tabular-nums ${VALUE}`}>
            {formatMoney(row.value)}
          </span>
        ) : null}
      </SidebarMenuButton>

      {/* Outside the link, over the icon. A button inside an anchor is invalid,
          and a span would be neither focusable nor announced — which is the
          whole of keyboard reordering. */}
      <SortableItemHandle
        render={<button type="button" />}
        aria-label={`Reorder ${row.label}`}
        className="absolute top-1/2 left-2 z-10 flex size-4 -translate-y-1/2 items-center justify-center rounded-sm opacity-0 transition-opacity group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
      >
        <Bars2Icon className="size-3.5 text-sidebar-foreground/60" />
      </SortableItemHandle>

      {/* No confirm: unpinning costs one click to undo. */}
      <SidebarMenuAction
        showOnHover
        onClick={onRemove}
        aria-label={`Unpin ${row.label}`}
      >
        <XMarkIcon />
      </SidebarMenuAction>
    </SortableItem>
  );
}

/**
 * Split out so each kind keeps its typed route. `to` as a plain string would
 * compile, and then a renamed route would break silently at runtime instead of
 * at build time.
 */
function FavoriteLink({
  row,
  ...props
}: { row: FavoriteRow } & React.ComponentProps<"a">) {
  switch (row.kind) {
    case "company":
      return (
        <Link
          to="/companies/$companyId"
          params={{ companyId: row.id }}
          {...props}
        />
      );
    case "person":
      return (
        <Link to="/people/$personId" params={{ personId: row.id }} {...props} />
      );
    case "deal":
      // The board, until deals get a record route of their own.
      return <Link to="/deals" {...props} />;
  }
}

/**
 * Companies, people and deals have to be told apart at a glance in a mixed
 * list. Shape carries that, not colour: square logo, round avatar, open ring.
 */
function FavoriteIcon({ row }: { row: FavoriteRow }) {
  if (row.kind === "deal") {
    // Stage ring. Left neutral until it reflects a real stage — spending a
    // semantic colour on placeholder data would make it mean nothing.
    return (
      <span className="flex size-4 items-center justify-center">
        <span className="size-3 rounded-full border-[1.5px] border-sidebar-foreground/40 border-r-transparent" />
      </span>
    );
  }

  return (
    <Avatar
      className={`size-4 ${row.kind === "person" ? "rounded-full" : "rounded-sm"}`}
    >
      <AvatarImage src={row.imageUrl ?? undefined} />
      <AvatarFallback className="bg-sidebar-foreground/10 text-[0.5625rem] font-medium">
        {row.label.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}
