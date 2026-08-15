import {
  BuildingOffice2Icon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/outline";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

import { ColumnHeader } from "#/components/data-table/column-header";
import {
  SelectAllCheckbox,
  SelectRowCheckbox,
} from "#/components/data-table/select-checkbox";
import { createAppColumnHelper } from "#/components/data-table/table-hook";
import type { CompanyListRow } from "#/mocks/company-rows";
import {
  dealStageTypeText,
  feedbackStatusText,
  formatMoney,
} from "#/text-maps";

const helper = createAppColumnHelper<CompanyListRow>();

export const companyColumnLabels: Record<string, string> = {
  domain: "Domain",
  people: "People",
  totalDealValue: "Deals",
  feedback: "Priority feedback",
  createdAt: "Created",
};

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

export function createCompanyColumns(
  onOpen: (company: CompanyListRow) => void,
) {
  return helper.columns([
    helper.display({
      id: "select",
      header: () => <SelectAllCheckbox />,
      cell: ({ row }) => <SelectRowCheckbox row={row} />,
      enableHiding: false,
    }),

    helper.accessor("name", {
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          label="Company"
          icon={BuildingOffice2Icon}
        />
      ),
      // The company cell is the row's handle: clicking it opens the drawer.
      // Logos carry the visual weight here — plain text rows read as a
      // spreadsheet — and AvatarFallback covers the null logoUrl every row
      // has until enrichment runs.
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onOpen(row.original)}
          className="-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Avatar className="size-5 shrink-0 rounded-sm">
            <AvatarImage src={row.original.logoUrl ?? undefined} />
            <AvatarFallback className="rounded-sm bg-muted text-[0.625rem] font-medium">
              {row.original.name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate font-medium">{row.original.name}</span>
        </button>
      ),
      enableHiding: false,
    }),

    helper.accessor("domain", {
      header: ({ column }) => (
        <ColumnHeader column={column} label="Domain" icon={GlobeAltIcon} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.domain}</span>
      ),
    }),

    helper.display({
      id: "people",
      header: () => <PlainHeader label="People" icon={UsersIcon} />,
      cell: ({ row }) => {
        const people = row.original.people;
        if (people.length === 0) return <Empty />;

        return (
          <div className="flex items-center -space-x-1.5">
            {people.slice(0, 3).map((person) => (
              <Avatar
                key={person.id}
                className="size-5 shrink-0 ring-2 ring-background"
              >
                <AvatarImage src={person.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-muted text-[0.625rem] font-medium">
                  {person.name?.slice(0, 1) ?? "?"}
                </AvatarFallback>
              </Avatar>
            ))}
            {people.length > 3 ? <Overflow count={people.length - 3} /> : null}
          </div>
        );
      },
      enableSorting: false,
    }),

    helper.accessor("totalDealValue", {
      header: ({ column }) => (
        <ColumnHeader column={column} label="Deals" icon={Squares2X2Icon} />
      ),
      cell: ({ row }) => {
        const deals = row.original.deals;
        if (deals.length === 0) return <Empty />;

        const [first] = deals;
        const tone = dealStageTypeText[first!.stageType].tone;

        return (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border py-0.5 pr-2.5 pl-2">
              <span
                className={`size-2.5 shrink-0 rounded-full border-[1.5px] ${TONE_RING[tone]}`}
              />
              <span className="text-xs font-medium tabular-nums">
                DEAL-{first!.number}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {first!.value === null ? "—" : formatMoney(first!.value)}
              </span>
            </span>
            {deals.length > 1 ? <Overflow count={deals.length - 1} /> : null}
          </div>
        );
      },
    }),

    helper.display({
      id: "feedback",
      header: () => (
        <PlainHeader label="Priority feedback" icon={ChatBubbleLeftRightIcon} />
      ),
      cell: ({ row }) => {
        const feedback = row.original.feedback;
        if (feedback.length === 0) return <Empty />;

        const [first] = feedback;
        const tone = feedbackStatusText[first!.status].tone;

        return (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border py-0.5 pr-2.5 pl-2">
              <span
                className={`size-1.5 shrink-0 rounded-full ${TONE_DOT[tone]}`}
              />
              <span className="text-xs">{first!.title}</span>
            </span>
            {feedback.length > 1 ? (
              <Overflow count={feedback.length - 1} />
            ) : null}
          </div>
        );
      },
      enableSorting: false,
    }),

    helper.accessor("createdAt", {
      header: ({ column }) => (
        <ColumnHeader column={column} label="Created" icon={CalendarIcon} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
          })}
        </span>
      ),
    }),
  ]);
}

function PlainHeader({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="size-3.5 text-muted-foreground/70" />
      <span>{label}</span>
    </span>
  );
}

function Empty() {
  return <span className="text-muted-foreground/40">—</span>;
}

function Overflow({ count }: { count: number }) {
  return (
    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
      +{count}
    </span>
  );
}
