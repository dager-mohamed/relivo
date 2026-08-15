import { createFileRoute } from "@tanstack/react-router";
import { HomeIcon } from "@heroicons/react/24/outline";

import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  return (
    <PageShell title="Home">
      <EmptyState
        icon={HomeIcon}
        title="Nothing to do yet"
        description="Overdue next steps and deals that have gone quiet will surface here."
      />
    </PageShell>
  );
}
