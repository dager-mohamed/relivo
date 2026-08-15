import { createFileRoute } from "@tanstack/react-router";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";

import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";

export const Route = createFileRoute("/_app/feedback/")({
  component: FeedbackPage,
});

function FeedbackPage() {
  return (
    <PageShell
      title="Feedback"
      actions={<Button variant="outline">New feedback</Button>}
    >
      <EmptyState
        icon={ChatBubbleLeftRightIcon}
        title="No feedback yet"
        description="Feature requests land here with the value of every deal blocked on them."
        action={<Button variant="outline">New feedback</Button>}
      />
    </PageShell>
  );
}
