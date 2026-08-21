import { Link } from "@tanstack/react-router";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";

import type { PersonPatch } from "#/components/people/person-properties";
import {
  mastheadTitleClass,
  RecordMasthead,
} from "#/components/record-page/record-masthead";
import { EditableText } from "#/components/record-panel/editable-field";
import {
  personInitials,
  personLabel,
  type PersonListRow,
} from "#/mocks/person-rows";
import { formatMoney, relativeTime } from "#/text-maps";

/**
 * Identity, then the two figures a person is worth opening for: what is riding
 * on them, and how long since anyone spoke to them.
 *
 * The email button sits in the subtitle rather than among the figures — it is
 * the action, and actions do not belong in a row of read-only numbers.
 */
export function PersonHeader({
  person,
  lastTouch,
  now,
  onEdit,
}: {
  person: PersonListRow;
  lastTouch: Date | null;
  now: Date;
  onEdit: (patch: PersonPatch) => void;
}) {
  const pipeline = person.deals
    .filter((deal) => deal.stageType === "open")
    .reduce((total, deal) => total + (deal.value ?? 0), 0);

  return (
    <RecordMasthead
      avatar={
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={person.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-muted text-base font-semibold">
            {personInitials(person)}
          </AvatarFallback>
        </Avatar>
      }
      title={
        person.name === null ? (
          // Nothing to rename yet — the address is standing in for a name, and
          // an editable field here would invite typing over their email.
          <span className={`${mastheadTitleClass} px-1.5`}>
            {personLabel(person)}
          </span>
        ) : (
          <EditableText
            value={person.name}
            onCommit={(name) => onEdit({ name })}
            className={mastheadTitleClass}
          />
        )
      }
      subtitle={
        <div className="flex min-w-0 items-center gap-1 px-1.5 text-sm text-muted-foreground">
          {person.role ? <span className="truncate">{person.role}</span> : null}
          {person.role && person.company ? <span>·</span> : null}
          {person.company ? (
            <Link
              to="/companies/$companyId"
              params={{ companyId: person.company.id }}
              className="truncate rounded-md transition-colors hover:text-foreground hover:underline"
            >
              {person.company.name}
            </Link>
          ) : null}
          {person.email ? (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Email ${personLabel(person)}`}
              className="ml-1 shrink-0"
              nativeButton={false}
              render={<a href={`mailto:${person.email}`} />}
            >
              <EnvelopeIcon className="size-3.5" />
            </Button>
          ) : null}
        </div>
      }
      stats={[
        {
          label: "Open pipeline",
          value: pipeline === 0 ? "—" : formatMoney(pipeline),
        },
        { label: "Deals", value: String(person.deals.length) },
        {
          label: "Last touch",
          value: lastTouch === null ? "—" : relativeTime(lastTouch, now),
        },
      ]}
    />
  );
}
