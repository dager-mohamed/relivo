import { Link } from "@tanstack/react-router";
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  Squares2X2Icon,
  UserIcon,
} from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

import {
  EditablePhone,
  EditableText,
} from "#/components/record-panel/editable-field";
import { FieldRow, StaticValue } from "#/components/record-panel/field-row";
import { PanelSection } from "#/components/record-panel/panel-section";
import {
  RelationEmpty,
  RelationRow,
} from "#/components/record-panel/relation-card";
import type { PersonListRow } from "#/mocks/person-rows";
import {
  dealStageTypeText,
  formatDate,
  formatDateString,
  formatMoney,
  toneText,
} from "#/text-maps";

/** Only the fields a user owns — the company link and deals are not patchable. */
export type PersonPatch = Partial<
  Pick<PersonListRow, "name" | "email" | "phone" | "role">
>;

/**
 * The person rail, carrying the relations too. Unlike a company's, a person is
 * a light record: three short sections split across two columns would leave
 * both looking unfinished, so they stack in the rail and the centre is nothing
 * but the feed.
 *
 * A person with no company gets no Company section at all. "None" in a field
 * row states an absence nobody asked about; leaving the section out says the
 * same thing and takes no space.
 */
export function PersonProperties({
  person,
  now,
  onEdit,
}: {
  person: PersonListRow;
  now: Date;
  onEdit: (patch: PersonPatch) => void;
}) {
  return (
    <div className="flex flex-col">
      <PanelSection id="person-general" title="Person">
        <FieldRow label="Name" icon={UserIcon}>
          <EditableText
            value={person.name}
            onCommit={(name) => onEdit({ name })}
            placeholder="Add name"
          />
        </FieldRow>
        <FieldRow label="Role" icon={BriefcaseIcon}>
          <EditableText
            value={person.role}
            onCommit={(role) => onEdit({ role })}
            placeholder="Add role"
          />
        </FieldRow>
        <FieldRow
          label="Email"
          icon={EnvelopeIcon}
          action={person.email ? <MailLink email={person.email} /> : undefined}
        >
          <EditableText
            value={person.email}
            onCommit={(email) => onEdit({ email })}
            placeholder="name@company.com"
          />
        </FieldRow>
        <FieldRow label="Phone" icon={PhoneIcon}>
          <EditablePhone
            value={person.phone}
            onCommit={(phone) => onEdit({ phone })}
            placeholder="Add phone"
          />
        </FieldRow>
      </PanelSection>

      <PanelSection
        id="person-deals"
        title="Deals"
        icon={Squares2X2Icon}
        count={person.deals.length}
      >
        {person.deals.length === 0 ? (
          <RelationEmpty>Not the contact on any deal yet.</RelationEmpty>
        ) : (
          person.deals.map((deal) => {
            const stage = dealStageTypeText[deal.stageType];
            return (
              <RelationRow key={deal.id}>
                <stage.icon
                  className={`size-4 shrink-0 ${toneText[stage.tone]}`}
                  aria-label={stage.label}
                />
                <span className="shrink-0 font-medium tabular-nums">
                  DEAL-{deal.number}
                </span>
                <span className="truncate tabular-nums">
                  {deal.value === null ? "—" : formatMoney(deal.value)}
                </span>
                {deal.closeDate ? (
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatDateString(deal.closeDate, now)}
                  </span>
                ) : null}
              </RelationRow>
            );
          })
        )}
      </PanelSection>

      {/* Omitted entirely when there is no company — see the docblock. */}
      {person.company ? (
        <PanelSection
          id="person-company"
          title="Company"
          icon={BuildingOffice2Icon}
        >
          <Link
            to="/companies/$companyId"
            params={{ companyId: person.company.id }}
            className="flex h-10 items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 text-sm transition-colors hover:bg-muted/40"
          >
            <Avatar className="size-5 shrink-0 rounded-sm">
              <AvatarImage src={person.company.logoUrl ?? undefined} />
              <AvatarFallback className="rounded-sm bg-muted text-[0.5rem] font-medium">
                {person.company.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium">{person.company.name}</span>
          </Link>
        </PanelSection>
      ) : null}

      <PanelSection id="person-system" title="System" defaultOpen={false}>
        <FieldRow label="Added" icon={CalendarIcon}>
          <StaticValue>{formatDate(person.createdAt, now)}</StaticValue>
        </FieldRow>
        <FieldRow label="Updated" icon={CalendarIcon}>
          <StaticValue>{formatDate(person.updatedAt, now)}</StaticValue>
        </FieldRow>
      </PanelSection>
    </div>
  );
}

/** The same mailto the list row offers, so the two surfaces behave alike. */
function MailLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      aria-label={`Email ${email}`}
      className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <EnvelopeIcon className="size-3.5" />
    </a>
  );
}
