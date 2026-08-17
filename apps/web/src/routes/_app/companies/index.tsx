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
  const [openId, setOpenId] = React.useState<string | null>(null);
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
  const handleCreate = React.useCallback(
    (draft: CompanyDraft, createMore: boolean) => {
      const row = addCompanyRow(draft);
      setAll([...companyRows]);

      // The drawer, not the record page: you were building a list and should
      // still be on it. It also solves what the old redirect was working
      // around — this list sorts by pipeline value, so a company with no deals
      // lands near the bottom and closing the dialog looked like nothing had
      // happened. With "Create more" on, the dialog is still up and a drawer
      // behind it would only be in the way.
      if (!createMore) setOpenId(row.id);
    },
    [],
  );

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
        openId={openId}
        onOpenChange={setOpenId}
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
