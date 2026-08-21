import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

import { authClient } from "@repo/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

export function NavUser({
  user,
}: {
  user: { name: string; email: string; image?: string | null };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  async function signOut() {
    await authClient.signOut();
    // Drop the cached session first, or the guard on /_app reads a stale one
    // and waves the next navigation straight back in.
    queryClient.clear();
    await router.navigate({ to: "/login", search: {} });
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton className="gap-2.5" />}
          >
            <Avatar className="size-5 shrink-0">
              {user.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback className="text-[0.625rem]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{user.name}</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-(--sidebar-width) min-w-56"
          >
            <DropdownMenuItem onClick={() => void signOut()}>
              <ArrowRightStartOnRectangleIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
