import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

import type { CompanyPatch } from "#/components/companies/company-properties";
import { EditableText } from "#/components/record-panel/editable-field";
import type { CompanyListRow } from "#/mocks/company-rows";
import { formatMoney, relativeTime } from "#/text-maps";

/**
 * The masthead, and the reason the full page is worth opening over the drawer:
 * identity on the left, the four figures a founder actually came for on the
 * right, filling the width instead of stacking down it.
 *
 * Figures are typographic, not boxed — a metric card grid would compete with
 * the name for the eye, and the name is what tells you where you are. No
 * colour on any of them either; colour is reserved for record state.
 */
export function CompanyHeader({
  company,
  lastTouch,
  now,
  onEdit,
}: {
  company: CompanyListRow;
  /** Newest feed entry, or null on a record nothing has happened to yet. */
  lastTouch: Date | null;
  now: Date;
  onEdit: (patch: CompanyPatch) => void;
}) {
  const open = sum(company.deals, "open");
  const won = sum(company.deals, "won");

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 border-b border-border px-6 py-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar className="size-11 shrink-0 rounded-xl">
          <AvatarImage src={company.logoUrl ?? undefined} />
          <AvatarFallback className="rounded-xl bg-muted text-base font-semibold">
            {company.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col">
          {/* Rename in place — the same field the rail exposes, at the size the
              page can afford. */}
          <EditableText
            value={company.name}
            onCommit={(name) => onEdit({ name: name ?? company.name })}
            className="text-[1.375rem] leading-8 font-semibold tracking-tight"
          />
          <a
            href={`https://${company.domain}`}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex w-fit max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="truncate">{company.domain}</span>
            <ArrowTopRightOnSquareIcon className="size-3.5 shrink-0" />
          </a>
        </div>
      </div>

      <dl className="flex flex-wrap items-start gap-x-9 gap-y-4">
        <Stat
          label="Open pipeline"
          value={open === null ? "—" : formatMoney(open)}
        />
        <Stat
          label="Closed won"
          value={won === null ? "—" : formatMoney(won)}
        />
        <Stat label="People" value={String(company.people.length)} />
        <Stat
          label="Last touch"
          value={lastTouch === null ? "—" : relativeTime(lastTouch, now)}
        />
      </dl>
    </header>
  );
}

/** `dt` before `dd` is the only legal order; the value still reads first. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse gap-0.5">
      <dt className="text-[0.6875rem] leading-4 font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="text-lg leading-6 font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/** null, not 0 — "no won deals" and "$0 won" are different facts. */
function sum(
  deals: CompanyListRow["deals"],
  stageType: CompanyListRow["deals"][number]["stageType"],
): number | null {
  const matching = deals.filter((deal) => deal.stageType === stageType);
  if (matching.length === 0) return null;
  return matching.reduce((total, deal) => total + (deal.value ?? 0), 0);
}
