import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BuildingOffice2Icon, PlusIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";

import { CompaniesTable } from "#/components/companies/companies-table";
import { PageShell } from "#/components/page-shell";
import {
  emptyCompanyFilters,
  filterCompanies,
  isFiltered,
  locationOptions,
  type CompanyFilters,
} from "#/lib/companies/filters";
import { companyRows } from "#/mocks/company-rows";

export const Route = createFileRoute("/_app/companies/")({
  component: CompaniesPage,
});

function CompaniesPage() {
  const [filters, setFilters] =
    React.useState<CompanyFilters>(emptyCompanyFilters);

  const locations = React.useMemo(() => locationOptions(companyRows), []);
  const rows = React.useMemo(
    () => filterCompanies(companyRows, filters),
    [filters],
  );

  return (
    <PageShell
      title="Companies"
      icon={BuildingOffice2Icon}
      actions={
        <Button variant="outline">
          <PlusIcon />
          New company
        </Button>
      }
    >
      <CompaniesTable
        rows={rows}
        filters={filters}
        locations={locations}
        filtered={isFiltered(filters)}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters(emptyCompanyFilters)}
      />
    </PageShell>
  );
}
