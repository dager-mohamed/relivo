import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  LinkIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

import { FavoriteStar } from "#/components/favorites/favorite-star";
import { PersonHeader } from "#/components/people/person-header";
import type { PersonPatch } from "#/components/people/person-properties";
import { PersonRecord } from "#/components/people/person-record";
import { EmptyState } from "#/components/empty-state";
import { PageShell } from "#/components/page-shell";
import { now, personFeed } from "#/mocks/person-activity";
import { personLabel, personRows } from "#/mocks/person-rows";

export const Route = createFileRoute("/_app/people/$personId/")({
  component: PersonPage,
});

function PersonPage() {
  const { personId } = Route.useParams();
  // Local until `people.byId` exists, same as the list screen — a query plus
  // a mutation replaces this state and nothing else on the page.
  const [rows, setRows] = React.useState(personRows);

  const person = rows.find((row) => row.id === personId);

  const handleEdit = React.useCallback(
    (patch: PersonPatch) => {
      setRows((current) =>
        current.map((row) =>
          row.id === personId ? { ...row, ...patch } : row,
        ),
      );
    },
    [personId],
  );

  if (!person) {
    return (
      <PageShell title="Person" parent={{ label: "People", to: "/people" }}>
        <EmptyState
          icon={UsersIcon}
          title="This person is gone"
          description="They may have been deleted, or the link may be out of date."
          action={
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/people" />}
            >
              Back to people
            </Button>
          }
        />
      </PageShell>
    );
  }

  const label = personLabel(person);
  // The masthead needs the newest entry, which only the feed knows. Cheap to
  // rebuild — it is derived from the person, not stored.
  const lastTouch = personFeed(person)[0]?.at ?? null;

  return (
    <PageShell
      title={label}
      parent={{ label: "People", to: "/people" }}
      bleed
      actions={
        <>
          {person.email ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Email ${label}`}
              nativeButton={false}
              render={<a href={`mailto:${person.email}`} />}
            >
              <EnvelopeIcon className="size-4" />
            </Button>
          ) : null}

          <FavoriteStar kind="person" id={person.id} />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More actions"
                />
              }
            >
              <EllipsisHorizontalIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    void navigator.clipboard.writeText(window.location.href)
                  }
                >
                  <LinkIcon />
                  Copy record link
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    >
      <PersonRecord
        key={person.id}
        person={person}
        header={
          <PersonHeader
            person={person}
            lastTouch={lastTouch}
            now={now}
            onEdit={handleEdit}
          />
        }
        onEdit={handleEdit}
      />
    </PageShell>
  );
}
