import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const SIDEBAR_SECTIONS = ["favorites", "sales", "records"] as const;

export type SidebarSection = (typeof SIDEBAR_SECTIONS)[number];
export type SidebarSectionState = Record<SidebarSection, boolean>;

// SidebarProvider keeps its own open/closed state in this cookie but does not
// export the name. Kept in sync by hand; see packages/ui/src/components/sidebar.tsx.
const PROVIDER_COOKIE = "sidebar_state";
const SECTIONS_COOKIE = "sidebar_sections";
const MAX_AGE = 60 * 60 * 24 * 7;

// Only collapsed sections are stored, so the default (everything open) is an
// empty cookie and an unknown section name can never collapse anything.
function parse(raw: string | undefined): SidebarSectionState {
  const collapsed = new Set(raw?.split(",").filter(Boolean));
  return {
    favorites: !collapsed.has("favorites"),
    sales: !collapsed.has("sales"),
    records: !collapsed.has("records"),
  };
}

/**
 * Read on the server so the first paint already has the right sections open —
 * reading this on the client would flash every section open, then collapse.
 */
export const getSidebarState = createServerFn({ method: "GET" }).handler(
  () => ({
    open: getCookie(PROVIDER_COOKIE) !== "false",
    sections: parse(getCookie(SECTIONS_COOKIE)),
  }),
);

/** Written the same way SidebarProvider writes its own cookie. */
export function persistSections(sections: SidebarSectionState) {
  const collapsed = SIDEBAR_SECTIONS.filter((section) => !sections[section]);
  document.cookie = `${SECTIONS_COOKIE}=${collapsed.join(",")}; path=/; max-age=${MAX_AGE}`;
}
