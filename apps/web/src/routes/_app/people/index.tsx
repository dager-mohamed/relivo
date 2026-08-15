import { createFileRoute } from "@tanstack/react-router";
import { UsersIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";

import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";

export const Route = createFileRoute("/_app/people/")({
  component: PeoplePage,
});

function PeoplePage() {
  return (
    <PageShell
      title="People"
      actions={<Button variant="outline">New person</Button>}
    >
      <EmptyState
        icon={UsersIcon}
        title="No people yet"
        description="Add a contact from a company, or let email sync pick them up for you."
        action={<Button variant="outline">New person</Button>}
      />
    </PageShell>
  );
}
