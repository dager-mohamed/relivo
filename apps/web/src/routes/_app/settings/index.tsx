import { createFileRoute } from "@tanstack/react-router";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";

export const Route = createFileRoute("/_app/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <PageShell title="Settings">
      <EmptyState
        icon={Cog6ToothIcon}
        title="Nothing to configure yet"
        description="Pipeline stages, members and integrations will live here."
      />
    </PageShell>
  );
}
