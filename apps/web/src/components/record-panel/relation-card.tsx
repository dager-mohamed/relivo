import { PlusIcon } from "@heroicons/react/24/outline";

import type { DealStageType } from "@repo/schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";

import {
  dealStageTypeText,
  formatDateString,
  formatMoney,
  toneText,
} from "#/text-maps";

/**
 * The header sits on the panel and each linked record is its own bordered card
 * beneath it. Boxing the section instead — one card with divided rows — makes
 * the group the object and the records look like table rows; boxing the records
 * makes each one feel like the thing it is, which is what you actually click.
 */
export function RelationSection({
  title,
  suffix,
  icon: Icon,
  count,
  onAdd,
  empty,
  children,
}: {
  title: string;
  /** Demoted second word, as in "Feedback Ranking". */
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  onAdd?: () => void;
  /** Proposes the next action; never reports absence. */
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <header className="flex h-7 items-center gap-2 px-0.5">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <h3 className="text-sm font-medium">{title}</h3>
        {suffix ? (
          <span className="text-sm text-muted-foreground">{suffix}</span>
        ) : null}
        <span className="text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
        {onAdd ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Add to ${title}`}
            onClick={onAdd}
            className="ml-auto"
          >
            <PlusIcon className="size-3.5" />
          </Button>
        ) : null}
      </header>

      {count === 0 ? (
        <RelationEmpty>{empty}</RelationEmpty>
      ) : (
        <div className="flex flex-col gap-1.5">{children}</div>
      )}
    </section>
  );
}

/** Proposes the next action; never reports absence. */
export function RelationEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

/** One linked record. Fixed height so a list of them reads as a stack. */
export function RelationRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-10 items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 text-sm transition-colors hover:bg-muted/40">
      {children}
    </div>
  );
}

/**
 * A deal as it appears on some other record — a company's, a person's.
 *
 * Typed on what it draws rather than on either row type, so the one component
 * serves both: a person's deals arrive without an owner, which is why `owner`
 * is optional rather than nullable.
 */
export function DealRelationRow({
  deal,
  now,
}: {
  deal: {
    number: number;
    value: number | null;
    closeDate: string | null;
    stageType: DealStageType;
    owner?: { name: string; image: string | null } | null;
  };
  now: Date;
}) {
  const stage = dealStageTypeText[deal.stageType];
  return (
    <RelationRow>
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
      {deal.owner ? (
        <Avatar
          className={`size-5 shrink-0 ${deal.closeDate ? "" : "ml-auto"}`}
        >
          <AvatarImage src={deal.owner.image ?? undefined} />
          <AvatarFallback className="text-[0.5rem] font-medium">
            {deal.owner.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
      ) : null}
    </RelationRow>
  );
}
