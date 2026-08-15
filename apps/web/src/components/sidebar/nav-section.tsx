import { ChevronDownIcon } from "@heroicons/react/24/outline";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@repo/ui/components/sidebar";

/**
 * A sidebar group that collapses on its own. Shape follows the shadcn docs:
 * Collapsible wraps SidebarGroup, the label *is* the trigger.
 */
export function NavSection({
  label,
  defaultOpen,
  onOpenChange,
  children,
}: {
  label: string;
  defaultOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      className="group/collapsible"
    >
      <SidebarGroup className="gap-0.5 py-1">
        <SidebarGroupLabel
          render={<CollapsibleTrigger />}
          className="h-6 gap-1 px-2 text-xs font-medium text-sidebar-foreground/45 hover:text-sidebar-foreground/70"
        >
          {label}
          <ChevronDownIcon className="ml-auto size-3! transition-transform duration-200 group-data-open/collapsible:rotate-180" />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>{children}</SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
