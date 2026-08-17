import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

import type { CompanyPatch } from "#/components/companies/company-properties";
import {
  mastheadTitleClass,
  RecordMasthead,
} from "#/components/record-page/record-masthead";
import { EditableText } from "#/components/record-panel/editable-field";
import type { CompanyListRow } from "#/mocks/company-rows";
import { formatMoney, relativeTime } from "#/text-maps";

/** The four figures a founder opens a company for, over the shared masthead. */
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
    <RecordMasthead
      avatar={
        <Avatar className="size-11 shrink-0 rounded-xl">
          <AvatarImage src={company.logoUrl ?? undefined} />
          <AvatarFallback className="rounded-xl bg-muted text-base font-semibold">
            {company.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
      }
      title={
        // Rename in place — the same field the rail exposes, at the size the
        // page can afford.
        <EditableText
          value={company.name}
          onCommit={(name) => onEdit({ name: name ?? company.name })}
          className={mastheadTitleClass}
        />
      }
      subtitle={
        <a
          href={`https://${company.domain}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex w-fit max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <span className="truncate">{company.domain}</span>
          <ArrowTopRightOnSquareIcon className="size-3.5 shrink-0" />
        </a>
      }
      stats={[
        {
          label: "Open pipeline",
          value: open === null ? "—" : formatMoney(open),
        },
        { label: "Closed won", value: won === null ? "—" : formatMoney(won) },
        { label: "People", value: String(company.people.length) },
        {
          label: "Last touch",
          value: lastTouch === null ? "—" : relativeTime(lastTouch, now),
        },
      ]}
    />
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
