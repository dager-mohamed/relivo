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

export function WorkspaceSwitcher({ name }: { name: string }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {/* `render`, not `asChild` — Base UI. */}
          <DropdownMenuTrigger
            render={<SidebarMenuButton className="gap-2.5" />}
          >
            <WorkspaceAvatar name={name} />
            <span className="truncate font-medium">{name}</span>
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
                <WorkspaceAvatar name={name} />
                {name}
                <CheckIcon className="ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <WorkspaceAvatar name="Sandbox" />
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

/**
 * An initial, not the Relivo mark — the lockup already sits directly above
 * this, and a workspace is not the product.
 */
function WorkspaceAvatar({ name }: { name: string }) {
  return (
    <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-sidebar-foreground/10 text-[0.5625rem] font-semibold">
      {name.slice(0, 1)}
    </span>
  );
}
