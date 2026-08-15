import * as React from "react";
import { BuildingOffice2Icon, TrashIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";

import { BulkBar } from "#/components/data-table/bulk-bar";
import { DataTable } from "#/components/data-table/data-table";
import { useAppTable } from "#/components/data-table/table-hook";
import { DataTableToolbar } from "#/components/data-table/toolbar";
import { ViewOptions } from "#/components/data-table/view-options";
import { EmptyState } from "#/components/empty-state";
import {
  companyColumnLabels,
  createCompanyColumns,
} from "#/components/companies/companies-columns";
import { CompanyDrawer } from "#/components/companies/company-drawer";
import { CompaniesFilters } from "#/components/companies/companies-filters";
import type { CompanyFilters } from "#/lib/companies/filters";
import type { CompanyListRow } from "#/mocks/company-rows";

export function CompaniesTable({
  rows,
  filters,
  locations,
  filtered,
  onFiltersChange,
  onClearFilters,
}: {
  rows: CompanyListRow[];
  filters: CompanyFilters;
  locations: string[];
  filtered: boolean;
  onFiltersChange: (filters: CompanyFilters) => void;
  onClearFilters: () => void;
}) {
  const [open, setOpen] = React.useState<CompanyListRow | null>(null);

  const columns = React.useMemo(() => createCompanyColumns(setOpen), []);

  const table = useAppTable({
    data: rows,
    columns,
    // Sorted by money by default: the list answers "is this relationship worth
    // anything" before anyone touches a header.
    initialState: { sorting: [{ id: "totalDealValue", desc: true }] },
  });

  const toolbar = (
    <DataTableToolbar
      left={
        <CompaniesFilters
          filters={filters}
          locations={locations}
          onChange={onFiltersChange}
        />
      }
      right={<ViewOptions labels={companyColumnLabels} />}
    />
  );

  return (
    <table.AppTable>
      <div className="relative flex min-h-0 flex-1 flex-col">
        {rows.length === 0 ? (
          <div className="flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-border">
            {toolbar}
            <EmptyState
              icon={BuildingOffice2Icon}
              title={filtered ? "No matches" : "No companies yet"}
              description={
                filtered
                  ? "No company matches these filters."
                  : "Type a domain and the rest fills itself in — logo, location, size."
              }
              action={
                filtered ? (
                  <Button variant="outline" onClick={onClearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <DataTable<CompanyListRow> toolbar={toolbar} />
        )}

        <BulkBar>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <TrashIcon className="size-4" />
            Delete
          </Button>
        </BulkBar>
      </div>

      <CompanyDrawer company={open} onClose={() => setOpen(null)} />
    </table.AppTable>
  );
}
