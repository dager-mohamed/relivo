import { Link } from "@tanstack/react-router";
import {
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  EnvelopeIcon,
  Squares2X2Icon,
  UserIcon,
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
import {
  personInitials,
  personLabel,
  type PersonListRow,
} from "#/mocks/person-rows";
import { dealStageTypeText, toneRing } from "#/text-maps";

const helper = createAppColumnHelper<PersonListRow>();

export const personColumnLabels: Record<string, string> = {
  role: "Role",
  company: "Company",
  deals: "Deal",
  createdAt: "Added",
  email: "Email",
};

/**
 * Deliberately the flattest table in the app. A person has no status enum, so
 * nothing here is tinted — the only colour on the screen is borrowed from the
 * stage of the deal they are the contact on.
 */
export function createPersonColumns(onOpen: (person: PersonListRow) => void) {
  return helper.columns([
    helper.display({
      id: "select",
      header: () => <SelectAllCheckbox />,
      cell: ({ row }) => <SelectRowCheckbox row={row} />,
      enableHiding: false,
    }),

    helper.accessor("name", {
      header: ({ column }) => (
        <ColumnHeader column={column} label="Person" icon={UserIcon} />
      ),
      // Nameless people are real — email sync creates them from an address
      // alone — so the address stands in as the name rather than "Unnamed",
      // in secondary weight because it is a fallback, not a chosen label.
      cell: ({ row }) => {
        const person = row.original;
        return (
          <button
            type="button"
            onClick={() => onOpen(person)}
            className="-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Avatar className="size-5 shrink-0">
              <AvatarImage src={person.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-muted text-[0.625rem] font-medium">
                {personInitials(person)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`truncate ${person.name ? "font-medium" : "text-muted-foreground"}`}
            >
              {personLabel(person)}
            </span>
          </button>
        );
      },
      enableHiding: false,
    }),

    helper.accessor("role", {
      header: ({ column }) => (
        <ColumnHeader column={column} label="Role" icon={BriefcaseIcon} />
      ),
      cell: ({ row }) =>
        row.original.role ? (
          <span className="truncate text-muted-foreground">
            {row.original.role}
          </span>
        ) : (
          <Empty />
        ),
    }),

    helper.display({
      id: "company",
      header: () => <PlainHeader label="Company" icon={BuildingOffice2Icon} />,
      // Links through to the company rather than opening this person: from
      // here, the company name is a destination, not a description.
      cell: ({ row }) => {
        const company = row.original.company;
        if (!company) return <Empty />;

        return (
          <Link
            to="/companies/$companyId"
            params={{ companyId: company.id }}
            className="-mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-muted"
          >
            <Avatar className="size-4 shrink-0 rounded-sm">
              <AvatarImage src={company.logoUrl ?? undefined} />
              <AvatarFallback className="rounded-sm bg-muted text-[0.5rem] font-medium">
                {company.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{company.name}</span>
          </Link>
        );
      },
      enableSorting: false,
    }),

    helper.display({
      id: "deals",
      header: () => <PlainHeader label="Deal" icon={Squares2X2Icon} />,
      cell: ({ row }) => {
        const deals = row.original.deals;
        if (deals.length === 0) return <Empty />;

        const [first] = deals;
        const tone = dealStageTypeText[first!.stageType].tone;

        return (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border py-0.5 pr-2.5 pl-2">
              <span
                className={`size-2.5 shrink-0 rounded-full border-[1.5px] ${toneRing[tone]}`}
              />
              <span className="text-xs font-medium tabular-nums">
                DEAL-{first!.number}
              </span>
            </span>
            {deals.length > 1 ? <Overflow count={deals.length - 1} /> : null}
          </div>
        );
      },
      enableSorting: false,
    }),

    helper.accessor("createdAt", {
      header: ({ column }) => (
        <ColumnHeader column={column} label="Added" icon={CalendarIcon} />
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

    helper.display({
      id: "email",
      header: () => <span className="sr-only">Email</span>,
      // The one action this screen exists for. A real mailto — Relivo is not
      // an email client, so there is no compose modal behind it. No address
      // means no icon: a disabled envelope would still read as a control.
      cell: ({ row }) => <EmailAction person={row.original} />,
      enableSorting: false,
    }),
  ]);
}

function EmailAction({ person }: { person: PersonListRow }) {
  if (!person.email) return null;

  return (
    <a
      href={`mailto:${person.email}`}
      title={person.email}
      aria-label={`Email ${personLabel(person)}`}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <EnvelopeIcon className="size-4" />
    </a>
  );
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
