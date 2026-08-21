import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";

import { PanelSection } from "#/components/record-panel/panel-section";
import {
  DealRelationRow,
  RelationEmpty,
  RelationRow,
  RelationSection,
} from "#/components/record-panel/relation-card";
import type { CompanyListRow } from "#/mocks/company-rows";
import { feedbackStatusText, formatMoney, toneText } from "#/text-maps";

export function PersonRelationRow({
  person,
}: {
  person: CompanyListRow["people"][number];
}) {
  return (
    <RelationRow>
      <Avatar className="size-5 shrink-0">
        <AvatarImage src={person.avatarUrl ?? undefined} />
        <AvatarFallback className="text-[0.5rem] font-medium">
          {person.name?.slice(0, 1) ?? "?"}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{person.name ?? "Unnamed"}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Email ${person.name ?? "person"}`}
        className="ml-auto shrink-0 text-muted-foreground"
      >
        <EnvelopeIcon className="size-3.5" />
      </Button>
    </RelationRow>
  );
}

/** The number on the right is revenue waiting on this request, not a vote. */
export function FeedbackRelationRow({
  item,
}: {
  item: CompanyListRow["feedback"][number];
}) {
  const status = feedbackStatusText[item.status];
  return (
    <RelationRow>
      <status.icon
        className={`size-4 shrink-0 ${toneText[status.tone]}`}
        aria-label={status.label}
      />
      <span className="truncate">{item.title}</span>
      <span className="ml-auto shrink-0 font-medium tabular-nums">
        {item.dealValue === 0 ? "—" : formatMoney(item.dealValue)}
      </span>
    </RelationRow>
  );
}

/**
 * Everything linked to the company, on the record page. The grid is a container
 * query, so it goes two-up when the centre column is wide and stacks when it is
 * not, without the page passing a layout flag.
 *
 * Deals stay full-width at every size: they carry money, and money wants room.
 */
export function CompanyRelations({
  company,
  now,
}: {
  company: CompanyListRow;
  now: Date;
}) {
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-5 @2xl:grid-cols-2">
        <div className="@2xl:col-span-2">
          <RelationSection
            title="Deals"
            icon={Squares2X2Icon}
            count={company.deals.length}
            onAdd={() => undefined}
            empty="No deals yet. Ready to add?"
          >
            {company.deals.map((deal) => (
              <DealRelationRow key={deal.id} deal={deal} now={now} />
            ))}
          </RelationSection>
        </div>

        <RelationSection
          title="People"
          icon={UsersIcon}
          count={company.people.length}
          onAdd={() => undefined}
          empty="Nobody here yet. Add the person you spoke to."
        >
          {company.people.map((person) => (
            <PersonRelationRow key={person.id} person={person} />
          ))}
        </RelationSection>

        <RelationSection
          title="Feedback"
          suffix="Ranking"
          icon={ChatBubbleLeftRightIcon}
          count={company.feedback.length}
          onAdd={() => undefined}
          empty="No feedback yet. Ready to add?"
        >
          {company.feedback.map((item) => (
            <FeedbackRelationRow key={item.id} item={item} />
          ))}
        </RelationSection>
      </div>
    </div>
  );
}

/**
 * The same relations in the drawer, as collapsible sections rather than a grid.
 *
 * `PanelSection`, not `RelationSection`: in one narrow column the fields and
 * the relations sit end to end, and two section idioms stacked on each other
 * read as two systems bolted together.
 */
export function CompanyPanelRelations({
  company,
  now,
}: {
  company: CompanyListRow;
  now: Date;
}) {
  return (
    <>
      <PanelSection
        id="company-deals"
        title="Deals"
        icon={Squares2X2Icon}
        count={company.deals.length}
        onAdd={() => undefined}
      >
        {company.deals.length === 0 ? (
          <RelationEmpty>No deals yet. Ready to add?</RelationEmpty>
        ) : (
          company.deals.map((deal) => (
            <DealRelationRow key={deal.id} deal={deal} now={now} />
          ))
        )}
      </PanelSection>

      <PanelSection
        id="company-people"
        title="People"
        icon={UsersIcon}
        count={company.people.length}
        onAdd={() => undefined}
      >
        {company.people.length === 0 ? (
          <RelationEmpty>
            Nobody here yet. Add the person you spoke to.
          </RelationEmpty>
        ) : (
          company.people.map((person) => (
            <PersonRelationRow key={person.id} person={person} />
          ))
        )}
      </PanelSection>

      <PanelSection
        id="company-feedback"
        title="Feedback"
        icon={ChatBubbleLeftRightIcon}
        count={company.feedback.length}
        onAdd={() => undefined}
      >
        {company.feedback.length === 0 ? (
          <RelationEmpty>No feedback yet. Ready to add?</RelationEmpty>
        ) : (
          company.feedback.map((item) => (
            <FeedbackRelationRow key={item.id} item={item} />
          ))
        )}
      </PanelSection>
    </>
  );
}
