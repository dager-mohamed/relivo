import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BuildingOffice2Icon, PlusIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";

import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";
import { useTRPC } from "#/integrations/trpc/react";

export const Route = createFileRoute("/_app/companies/")({
  // Prefetch on the server; the component then reads from cache.
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.trpc.companies.list.queryOptions(),
    ),
  component: CompaniesPage,
});

function CompaniesPage() {
  const trpc = useTRPC();
  const { data, isPending, error } = useQuery(
    trpc.companies.list.queryOptions(),
  );

  return (
    <PageShell
      title="Companies"
      actions={
        <Button variant="outline">
          <PlusIcon />
          New company
        </Button>
      }
    >
      {isPending ? (
        <div className="space-y-2">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={BuildingOffice2Icon}
          title="Couldn't load companies"
          description={error.message}
        />
      ) : data.length === 0 ? (
        <EmptyState
          icon={BuildingOffice2Icon}
          title="No companies yet"
          description="Type a domain and the rest fills itself in — logo, location, size."
          action={
            <Button variant="outline">
              <PlusIcon />
              New company
            </Button>
          }
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {data.map((company) => (
            <li key={company.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{company.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {company.domain}
                </div>
              </div>
              {/* A Date, not a string, because superjson runs on both ends. */}
              <div className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                {company.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
