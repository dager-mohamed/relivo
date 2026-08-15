import { Link, type LinkProps } from "@tanstack/react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { SidebarTrigger } from "@repo/ui/components/sidebar";

/**
 * The frame every page sits in: one 48px band carrying where-you-are on the
 * left and what-you-can-do on the right, then the content.
 *
 * It is sticky and hairline-separated because content scrolls underneath —
 * without the rule the first row collides with the title.
 */
export function PageShell({
  title,
  parent,
  actions,
  children,
}: {
  title: string;
  /** Record pages sit under their list — "Companies / Atari". */
  parent?: { label: string; to: LinkProps["to"] };
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:px-6">
        {/* Below md the sidebar is an off-canvas sheet with no other way in. */}
        <SidebarTrigger className="-ml-1 md:hidden" />

        {parent ? (
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to={parent.to} />}>
                  {parent.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate font-medium text-foreground">
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          <h1 className="truncate font-heading text-base font-semibold">
            {title}
          </h1>
        )}

        {actions ? (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {actions}
          </div>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-5 md:px-6">
        {children}
      </div>
    </>
  );
}
