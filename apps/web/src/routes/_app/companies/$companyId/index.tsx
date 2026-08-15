import { createFileRoute } from "@tanstack/react-router";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";

import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";
import { companyRows } from "#/mocks/company-rows";

export const Route = createFileRoute("/_app/companies/$companyId/")({
  component: CompanyPage,
});

// Stub. RELIV-44 builds the record page; this exists so row click-through in
// the list is a real, type-checked destination.
function CompanyPage() {
  const { companyId } = Route.useParams();
  const company = companyRows.find((row) => row.id === companyId);

  return (
    <PageShell
      title={company?.name ?? "Company"}
      parent={{ label: "Companies", to: "/companies" }}
    >
      <EmptyState
        icon={BuildingOffice2Icon}
        title="Record page not built yet"
        description="Activity, properties and linked records land here in RELIV-44."
      />
    </PageShell>
  );
}
