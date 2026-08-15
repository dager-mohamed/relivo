import { createFileRoute } from "@tanstack/react-router";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";

export const Route = createFileRoute("/_app/next-steps/")({
  component: NextStepsPage,
});

function NextStepsPage() {
  return (
    <PageShell title="Next Steps">
      {/* No action: next steps are created on a deal, never from here. */}
      <EmptyState
        icon={CheckCircleIcon}
        title="Nothing due"
        description="Open next steps from every deal collect here, sorted by due date."
      />
    </PageShell>
  );
}
