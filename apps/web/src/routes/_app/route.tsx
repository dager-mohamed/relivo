import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";

import { FavoritesProvider } from "#/components/favorites/favorites-provider";
import { AppSidebar } from "#/components/sidebar/app-sidebar";
import { getFavorites } from "#/lib/favorites/cookies";
import { getSidebarState } from "#/lib/sidebar/cookies";

export const Route = createFileRoute("/_app")({
  // Pathless layout: runs once on entry and stays mounted, so the sidebar does
  // not remount (and cannot flicker) when navigating between child routes.
  // Both read cookies, so both must run on the server or the sidebar paints
  // once with defaults and then corrects itself.
  loader: async () => ({
    sidebar: await getSidebarState(),
    favorites: await getFavorites(),
  }),
  component: AppLayout,
});

function AppLayout() {
  const { sidebar, favorites } = Route.useLoaderData();
  const { open, sections } = sidebar;

  return (
    // Pinned to the viewport so the panel scrolls, not the document — that is
    // what keeps its rounded corners and the sticky page header in frame.
    <FavoritesProvider initial={favorites}>
      <SidebarProvider defaultOpen={open} className="h-svh overflow-hidden">
        <AppSidebar defaultSections={sections} />
        {/* overflow-x-hidden clips content to the radius; the border carries
            the panel edge, since shadow-sm does not read on a dark ground. */}
        <SidebarInset className="overflow-x-hidden overflow-y-auto md:border md:border-border">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </FavoritesProvider>
  );
}
