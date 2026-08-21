import * as React from "react";
import { Link, useMatchRoute, type LinkProps } from "@tanstack/react-router";
import {
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import lockupBlack from "@repo/assets/icons/lockup-h-black.svg";
import lockupWhite from "@repo/assets/icons/lockup-h-white.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

import { NavFavorites } from "#/components/sidebar/nav-favorites";
import { NavSection } from "#/components/sidebar/nav-section";
import { NavUser } from "#/components/sidebar/nav-user";
import { WorkspaceSwitcher } from "#/components/sidebar/workspace-switcher";
import {
  persistSections,
  type SidebarSection,
  type SidebarSectionState,
} from "#/lib/sidebar/cookies";
import { workspace } from "#/mocks";

const sales = [
  { label: "Deals", to: "/deals", icon: Squares2X2Icon },
  { label: "Next Steps", to: "/next-steps", icon: CheckCircleIcon },
] as const;

const records = [
  { label: "People", to: "/people", icon: UsersIcon },
  { label: "Companies", to: "/companies", icon: BuildingOffice2Icon },
  { label: "Feedback", to: "/feedback", icon: ChatBubbleLeftRightIcon },
] as const;

// Four text tiers, all one hue: active item / label / value / section header.
const LABEL = "text-sidebar-foreground/75";

export function AppSidebar({
  defaultSections,
}: {
  defaultSections: SidebarSectionState;
}) {
  const matchRoute = useMatchRoute();
  const sections = React.useRef(defaultSections);

  const toggle = (section: SidebarSection) => (open: boolean) => {
    sections.current = { ...sections.current, [section]: open };
    persistSections(sections.current);
  };

  return (
    // `inset` floats the content as a rounded panel and drops the sidebar's
    // right border — the ground becomes chrome, the panel becomes the page.
    <Sidebar variant="inset">
      <SidebarHeader className="gap-0 pb-2">
        <div className="flex items-center px-2 pt-2 pb-5">
          <img
            src={lockupBlack}
            alt="Relivo"
            className="h-auto w-20 dark:hidden"
          />
          <img
            src={lockupWhite}
            alt="Relivo"
            className="hidden h-auto w-24 dark:block"
          />
        </div>
        <WorkspaceSwitcher name={workspace.name} />
      </SidebarHeader>

      <SidebarContent>
        <NavSection
          label="Sales"
          defaultOpen={defaultSections.sales}
          onOpenChange={toggle("sales")}
        >
          <SidebarMenu>
            {sales.map((item) => (
              <NavItem key={item.to} {...item} matchRoute={matchRoute} />
            ))}
          </SidebarMenu>
        </NavSection>

        <NavSection
          label="Records"
          defaultOpen={defaultSections.records}
          onOpenChange={toggle("records")}
        >
          <SidebarMenu>
            {records.map((item) => (
              <NavItem key={item.to} {...item} matchRoute={matchRoute} />
            ))}
          </SidebarMenu>
        </NavSection>

        {/* Below the fixed destinations: this list grows, they don't — and it
            brings its own header, since it disappears entirely when empty. */}
        <NavFavorites
          defaultOpen={defaultSections.favorites}
          onOpenChange={toggle("favorites")}
        />
      </SidebarContent>

      <SidebarFooter className="gap-0 pt-0">
        <SidebarGroup className="p-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to="/settings" />}
                isActive={!!matchRoute({ to: "/settings", fuzzy: true })}
                className={`gap-2.5 ${LABEL}`}
              >
                <Cog6ToothIcon />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavUser name="Moe Amaya" />
      </SidebarFooter>
    </Sidebar>
  );
}

function NavItem({
  label,
  to,
  icon: Icon,
  matchRoute,
}: {
  label: string;
  // Not `string` — this keeps a typo'd route a compile error.
  to: LinkProps["to"];
  icon: React.ComponentType<{ className?: string }>;
  matchRoute: ReturnType<typeof useMatchRoute>;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        // `render`, not Radix's `asChild`. No `nativeButton` here — that is a
        // Base UI Button prop, and this builds on `useRender` directly.
        render={<Link to={to} />}
        isActive={!!matchRoute({ to, fuzzy: true })}
        className={`gap-2.5 ${LABEL}`}
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
