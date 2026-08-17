import { Link } from "@tanstack/react-router";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

import { PersonPanel } from "#/components/people/person-panel";
import type { PersonPatch } from "#/components/people/person-properties";
import { RecordDrawer } from "#/components/record-page/record-drawer";
import {
  personInitials,
  personLabel,
  type PersonListRow,
} from "#/mocks/person-rows";

/** A person in the drawer. The body is the same panel the record page mounts. */
export function PersonDrawer({
  person,
  onClose,
  onEdit,
}: {
  person: PersonListRow | null;
  onClose: () => void;
  onEdit: (id: string, patch: PersonPatch) => void;
}) {
  return (
    <RecordDrawer
      open={person !== null}
      onClose={onClose}
      avatar={
        <Avatar className="size-5 shrink-0">
          <AvatarImage src={person?.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-muted text-[0.625rem] font-medium">
            {person ? personInitials(person) : ""}
          </AvatarFallback>
        </Avatar>
      }
      title={person ? personLabel(person) : null}
      meta={person?.role ?? person?.company?.name ?? null}
      expandLink={
        <Link to="/people/$personId" params={{ personId: person?.id ?? "" }} />
      }
    >
      {person ? (
        <PersonPanel
          key={person.id}
          person={person}
          onEdit={(patch) => onEdit(person.id, patch)}
        />
      ) : null}
    </RecordDrawer>
  );
}
