import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

export function NavUser({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton className="gap-2.5">
          <Avatar className="size-5 shrink-0">
            <AvatarFallback className="text-[0.625rem]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
