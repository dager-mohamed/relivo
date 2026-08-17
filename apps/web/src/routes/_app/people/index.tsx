import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon, UsersIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";

import { NewPersonDialog } from "#/components/people/new-person-dialog";
import { PeopleTable } from "#/components/people/people-table";
import type { PersonPatch } from "#/components/people/person-properties";
import { PageShell } from "#/components/page-shell";
import {
  companyOptions,
  emptyPersonFilters,
  filterPeople,
  isFiltered,
  type PersonFilters,
} from "#/lib/people/filters";
import type { NewPerson } from "#/lib/people/new-person";
import { companyRows } from "#/mocks/company-rows";
import { addPersonRow, personRows } from "#/mocks/person-rows";

export const Route = createFileRoute("/_app/people/")({
  component: PeoplePage,
});

function PeoplePage() {
  // Edits are local until the router lands. A mutation plus a query
  // invalidation replaces exactly this state and nothing else.
  const [all, setAll] = React.useState(personRows);
  const [creating, setCreating] = React.useState(false);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [filters, setFilters] =
    React.useState<PersonFilters>(emptyPersonFilters);

  const companies = React.useMemo(() => companyOptions(all), [all]);
  const rows = React.useMemo(() => filterPeople(all, filters), [all, filters]);

  const handleEdit = React.useCallback((id: string, patch: PersonPatch) => {
    setAll((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }, []);

  // Re-read rather than prepend: `addPersonRow` has already filed the row, and
  // state holds a reference to that same array — prepending it again puts the
  // row in twice, under one key. A fresh copy is what makes React re-render.
  const handleCreate = React.useCallback(
    (person: NewPerson, createMore: boolean) => {
      const row = addPersonRow(person);
      setAll([...personRows]);
      // The drawer rather than the record page — see the companies list.
      if (!createMore) setOpenId(row.id);
    },
    [],
  );

  return (
    <PageShell
      title="People"
      icon={UsersIcon}
      actions={
        <Button variant="outline" onClick={() => setCreating(true)}>
          <PlusIcon />
          New person
        </Button>
      }
    >
      <PeopleTable
        rows={rows}
        filters={filters}
        companies={companies}
        filtered={isFiltered(filters)}
        openId={openId}
        onOpenChange={setOpenId}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters(emptyPersonFilters)}
        onEdit={handleEdit}
      />

      {/* `all`, not `rows` — an address hidden by a filter is still taken.
          Companies come from the full fixture list, not the filter options,
          which only carry the ones somebody already works at. */}
      <NewPersonDialog
        open={creating}
        onOpenChange={setCreating}
        existing={all}
        companies={companyRows}
        onCreate={handleCreate}
      />
    </PageShell>
  );
}
