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

import {
  RelationRow,
  RelationSection,
} from "#/components/record-panel/relation-card";
import type { CompanyListRow } from "#/mocks/company-rows";
import {
  dealStageTypeText,
  feedbackStatusText,
  formatDateString,
  formatMoney,
} from "#/text-maps";

/**
 * Everything linked to the company. The grid is a container query, so the same
 * component stacks in the drawer and goes two-up on the record page without
 * either surface passing a layout flag.
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
            {company.deals.map((deal) => {
              const stage = dealStageTypeText[deal.stageType];
              return (
                <RelationRow key={deal.id}>
                  <stage.icon
                    className={`size-4 shrink-0 ${TONE_TEXT[stage.tone]}`}
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
                  <Avatar
                    className={`size-5 shrink-0 ${deal.closeDate ? "" : "ml-auto"}`}
                  >
                    <AvatarImage src={deal.owner?.image ?? undefined} />
                    <AvatarFallback className="text-[0.5rem] font-medium">
                      {deal.owner?.name.slice(0, 1) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </RelationRow>
              );
            })}
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
            <RelationRow key={person.id}>
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
          ))}
        </RelationSection>

        {/* The whole point of the product: the number on the right is the
            revenue waiting on this request, not a vote count. */}
        <RelationSection
          title="Feedback"
          suffix="Ranking"
          icon={ChatBubbleLeftRightIcon}
          count={company.feedback.length}
          onAdd={() => undefined}
          empty="No feedback yet. Ready to add?"
        >
          {company.feedback.map((item) => {
            const status = feedbackStatusText[item.status];
            return (
              <RelationRow key={item.id}>
                <status.icon
                  className={`size-4 shrink-0 ${TONE_TEXT[status.tone]}`}
                  aria-label={status.label}
                />
                <span className="truncate">{item.title}</span>
                <span className="ml-auto shrink-0 font-medium tabular-nums">
                  {item.dealValue === 0 ? "—" : formatMoney(item.dealValue)}
                </span>
              </RelationRow>
            );
          })}
        </RelationSection>
      </div>
    </div>
  );
}

const TONE_TEXT: Record<string, string> = {
  info: "text-info",
  success: "text-success",
  destructive: "text-destructive",
  warning: "text-warning",
  neutral: "text-muted-foreground",
};
