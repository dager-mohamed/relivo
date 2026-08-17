import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BuildingOffice2Icon, PlusIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";

import { CompaniesTable } from "#/components/companies/companies-table";
import type { CompanyPatch } from "#/components/companies/company-properties";
import { NewCompanyDialog } from "#/components/companies/new-company-dialog";
import { PageShell } from "#/components/page-shell";
import {
  emptyCompanyFilters,
  filterCompanies,
  isFiltered,
  locationOptions,
  type CompanyFilters,
} from "#/lib/companies/filters";
import type { CompanyDraft } from "#/lib/companies/new-company";
import { addCompanyRow, companyRows } from "#/mocks/company-rows";

export const Route = createFileRoute("/_app/companies/")({
  component: CompaniesPage,
});

function CompaniesPage() {
  // Edits are local until the router lands. A mutation plus a query
  // invalidation replaces exactly this state and nothing else.
  const [all, setAll] = React.useState(companyRows);
  const [creating, setCreating] = React.useState(false);
  const [filters, setFilters] =
    React.useState<CompanyFilters>(emptyCompanyFilters);

  const locations = React.useMemo(() => locationOptions(all), [all]);
  const rows = React.useMemo(
    () => filterCompanies(all, filters),
    [all, filters],
  );

  const handleEdit = React.useCallback((id: string, patch: CompanyPatch) => {
    setAll((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }, []);

  // Re-read rather than prepend: `addCompanyRow` has already filed the row, and
  // state holds a reference to that same array — prepending it again puts the
  // row in twice, under one key. A fresh copy is what makes React re-render.
  const handleCreate = React.useCallback((draft: CompanyDraft) => {
    const row = addCompanyRow(draft);
    setAll([...companyRows]);
    return row.id;
  }, []);

  return (
    <PageShell
      title="Companies"
      icon={BuildingOffice2Icon}
      actions={
        <Button variant="outline" onClick={() => setCreating(true)}>
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
        onEdit={handleEdit}
      />

      {/* `all`, not `rows` — a domain hidden by a filter is still taken. */}
      <NewCompanyDialog
        open={creating}
        onOpenChange={setCreating}
        existing={all}
        onCreate={handleCreate}
      />
    </PageShell>
  );
}
