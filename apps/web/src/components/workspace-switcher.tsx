import {
  CheckIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  PlusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

import { RelivoMark } from "#/components/relivo-mark";

export function WorkspaceSwitcher({ name }: { name: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {/* `render`, not `asChild` — Base UI. */}
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="gap-2.5" />}
          >
            <RelivoMark className="size-5 shrink-0" />
            <span className="truncate font-heading font-semibold">{name}</span>
            <ChevronUpDownIcon className="ml-auto text-sidebar-foreground/50" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-(--sidebar-width) min-w-56"
          >
            {/* DropdownMenuLabel is Base UI's Menu.GroupLabel — it throws
                outside a Group. */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              <DropdownMenuItem>
                <RelivoMark className="size-4" />
                {name}
                <CheckIcon className="ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RelivoMark className="size-4 opacity-40" />
                Sandbox
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PlusIcon />
              New workspace
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlusIcon />
              Invite people
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Cog6ToothIcon />
              Workspace settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
