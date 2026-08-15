import { Link } from "@tanstack/react-router";
import {
  ArrowsPointingOutIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
  Squares2X2Icon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { Sheet, SheetContent } from "@repo/ui/components/sheet";

import type { CompanyListRow } from "#/mocks/company-rows";
import {
  dealStageTypeText,
  feedbackStatusText,
  formatMoney,
} from "#/text-maps";

/**
 * Opens from the company cell. Read-only for now: this is the shape the
 * record page (RELIV-44) will share, so both surfaces stay one design rather
 * than diverging into a panel and a page that disagree.
 */
export function CompanyDrawer({
  company,
  onClose,
}: {
  company: CompanyListRow | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={company !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl"
      >
        {company ? (
          <>
            <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-4">
              <Avatar className="size-5 shrink-0 rounded-sm">
                <AvatarImage src={company.logoUrl ?? undefined} />
                <AvatarFallback className="rounded-sm bg-muted text-[0.625rem] font-medium">
                  {company.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-heading font-semibold">
                {company.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                Created {formatDate(company.createdAt)}
              </span>

              <div className="ml-auto flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open full record"
                  render={
                    <Link
                      to="/companies/$companyId"
                      params={{ companyId: company.id }}
                    />
                  }
                >
                  <ArrowsPointingOutIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close"
                  onClick={onClose}
                >
                  <span aria-hidden>✕</span>
                </Button>
              </div>
            </header>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
              <Section title="General">
                <Field icon={GlobeAltIcon} label="Domain">
                  {company.domain}
                </Field>
                <Field icon={MapPinIcon} label="Location">
                  {company.location}
                </Field>
                <Field icon={PhoneIcon} label="Phone">
                  {company.phone}
                </Field>
              </Section>

              <Section title="Firmographics">
                <Field icon={UserGroupIcon} label="Employees">
                  {company.employees}
                </Field>
                <Field icon={BanknotesIcon} label="Revenue">
                  {company.revenue}
                </Field>
                <Field icon={BanknotesIcon} label="Funding">
                  {company.funding === null
                    ? null
                    : formatMoney(company.funding)}
                </Field>
              </Section>

              <Section title="System">
                <Field icon={CalendarIcon} label="Created">
                  {formatDate(company.createdAt)}
                </Field>
                <Field icon={BuildingOffice2Icon} label="Workspace">
                  Relivo
                </Field>
              </Section>

              <Related
                icon={UsersIcon}
                title="People"
                count={company.people.length}
              >
                {company.people.map((person) => (
                  <Chip key={person.id}>
                    <Avatar className="size-4 shrink-0">
                      <AvatarImage src={person.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-muted text-[0.5rem] font-medium">
                        {person.name?.slice(0, 1) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    {person.name ?? "Unnamed"}
                  </Chip>
                ))}
              </Related>

              <Related
                icon={Squares2X2Icon}
                title="Deals"
                count={company.deals.length}
              >
                {company.deals.map((deal) => (
                  <Chip key={deal.id}>
                    <span
                      className={`size-2.5 shrink-0 rounded-full border-[1.5px] ${
                        TONE_RING[dealStageTypeText[deal.stageType].tone]
                      }`}
                    />
                    <span className="font-medium tabular-nums">
                      DEAL-{deal.number}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {deal.value === null ? "—" : formatMoney(deal.value)}
                    </span>
                  </Chip>
                ))}
              </Related>

              <Related
                icon={ChatBubbleLeftRightIcon}
                title="Priority feedback"
                count={company.feedback.length}
              >
                {company.feedback.map((item) => (
                  <Chip key={item.id}>
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${
                        TONE_DOT[feedbackStatusText[item.status].tone]
                      }`}
                    />
                    {item.title}
                  </Chip>
                ))}
              </Related>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

const TONE_RING: Record<string, string> = {
  info: "border-info",
  success: "border-success",
  destructive: "border-destructive",
  warning: "border-warning",
  neutral: "border-muted-foreground",
};

const TONE_DOT: Record<string, string> = {
  info: "bg-info",
  success: "bg-success",
  destructive: "bg-destructive",
  warning: "bg-warning",
  neutral: "bg-muted-foreground",
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-0.5">
      <h2 className="px-1 pb-1 text-xs font-medium text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Label column is fixed so values line up down the panel. */
function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md px-1 py-1.5 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate">
        {children ?? <span className="text-muted-foreground/40">Empty</span>}
      </span>
    </div>
  );
}

function Related({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-1.5">
      <h2 className="flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
        <Icon className="size-4" />
        {title}
        <span className="tabular-nums">{count}</span>
      </h2>
      {count === 0 ? (
        <p className="px-1 text-sm text-muted-foreground/40">None yet</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 px-1">{children}</div>
      )}
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-border px-2 py-1 text-xs">
      {children}
    </span>
  );
}
