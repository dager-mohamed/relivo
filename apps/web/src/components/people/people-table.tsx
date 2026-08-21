import * as React from "react";
import { TrashIcon, UsersIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";

import { BulkBar } from "#/components/data-table/bulk-bar";
import { DataTable } from "#/components/data-table/data-table";
import { useAppTable } from "#/components/data-table/table-hook";
import { DataTableToolbar } from "#/components/data-table/toolbar";
import { ViewOptions } from "#/components/data-table/view-options";
import { EmptyState } from "#/components/empty-state";
import {
  createPersonColumns,
  personColumnLabels,
} from "#/components/people/people-columns";
import { PeopleFilters } from "#/components/people/people-filters";
import { PersonDrawer } from "#/components/people/person-drawer";
import type { PersonPatch } from "#/components/people/person-properties";
import type { PersonFilters } from "#/lib/people/filters";
import type { PersonListRow } from "#/mocks/person-rows";

export function PeopleTable({
  rows,
  filters,
  companies,
  filtered,
  openId,
  onOpenChange,
  onFiltersChange,
  onClearFilters,
  onEdit,
}: {
  rows: PersonListRow[];
  filters: PersonFilters;
  companies: { id: string; name: string }[];
  filtered: boolean;
  /** See `CompaniesTable` — controlled so a fresh record can open itself. */
  openId: string | null;
  onOpenChange: (id: string | null) => void;
  onFiltersChange: (filters: PersonFilters) => void;
  onClearFilters: () => void;
  onEdit: (id: string, patch: PersonPatch) => void;
}) {
  const open = openId ? (rows.find((row) => row.id === openId) ?? null) : null;

  const columns = React.useMemo(
    () => createPersonColumns((person) => onOpenChange(person.id)),
    [onOpenChange],
  );

  const table = useAppTable({
    data: rows,
    columns,
    // Alphabetical, not by money: people have no value of their own, and the
    // question this screen answers is "where is Nolan", which is a lookup.
    initialState: { sorting: [{ id: "name", desc: false }] },
  });

  const toolbar = (
    <DataTableToolbar
      left={
        <PeopleFilters
          filters={filters}
          companies={companies}
          onChange={onFiltersChange}
        />
      }
      right={<ViewOptions labels={personColumnLabels} />}
    />
  );

  return (
    <table.AppTable>
      <div className="relative flex min-h-0 flex-1 flex-col">
        {rows.length === 0 ? (
          <div className="flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-border">
            {toolbar}
            <EmptyState
              icon={UsersIcon}
              title={filtered ? "No matches" : "No people yet"}
              description={
                filtered
                  ? "Nobody matches these filters."
                  : "Add the person you spoke to, or let email sync pick them up for you."
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
          <DataTable<PersonListRow> toolbar={toolbar} />
        )}

        <BulkBar>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <TrashIcon className="size-4" />
            Delete
          </Button>
        </BulkBar>
      </div>

      <PersonDrawer
        person={open}
        onClose={() => onOpenChange(null)}
        onEdit={onEdit}
      />
    </table.AppTable>
  );
}
