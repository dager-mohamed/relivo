import { createFileRoute } from "@tanstack/react-router";
import { Squares2X2Icon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";

import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";

export const Route = createFileRoute("/_app/deals/")({
  component: DealsPage,
});

function DealsPage() {
  return (
    // Outline, not filled — the sidebar's New Deal stays the only primary.
    <PageShell
      title="Deals"
      actions={<Button variant="outline">New deal</Button>}
    >
      <EmptyState
        icon={Squares2X2Icon}
        title="No deals yet"
        description="The pipeline starts at qualified. Add the company you spoke to most recently."
        action={<Button variant="outline">New deal</Button>}
      />
    </PageShell>
  );
}
