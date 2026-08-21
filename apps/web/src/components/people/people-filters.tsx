import { FunnelIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

import {
  emptyPersonFilters,
  isFiltered,
  type PersonFilters,
} from "#/lib/people/filters";

export function PeopleFilters({
  filters,
  companies,
  onChange,
}: {
  filters: PersonFilters;
  companies: { id: string; name: string }[];
  onChange: (filters: PersonFilters) => void;
}) {
  const active = isFiltered(filters);
  const count =
    filters.companies.length +
    (filters.hasEmail === null ? 0 : 1) +
    (filters.onDeal === null ? 0 : 1);

  const toggleCompany = (id: string, checked: boolean) =>
    onChange({
      ...filters,
      companies: checked
        ? [...filters.companies, id]
        : filters.companies.filter((item) => item !== id),
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 ${active ? "" : "text-muted-foreground"}`}
          />
        }
      >
        <FunnelIcon className="size-4" />
        Filter
        {active ? (
          <span className="rounded-sm bg-muted px-1 text-xs tabular-nums">
            {count}
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="max-h-96 w-52 overflow-y-auto"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground">
            Contact
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.hasEmail === true}
            onCheckedChange={(checked) =>
              onChange({ ...filters, hasEmail: checked ? true : null })
            }
          >
            Has an email
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.hasEmail === false}
            onCheckedChange={(checked) =>
              onChange({ ...filters, hasEmail: checked ? false : null })
            }
          >
            No email
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground">
            Deals
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.onDeal === true}
            onCheckedChange={(checked) =>
              onChange({ ...filters, onDeal: checked ? true : null })
            }
          >
            On a deal
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.onDeal === false}
            onCheckedChange={(checked) =>
              onChange({ ...filters, onDeal: checked ? false : null })
            }
          >
            Not on a deal
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground">
            Company
          </DropdownMenuLabel>
          {companies.map((company) => (
            <DropdownMenuCheckboxItem
              key={company.id}
              checked={filters.companies.includes(company.id)}
              onCheckedChange={(checked) =>
                toggleCompany(company.id, !!checked)
              }
            >
              {company.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>

        {active ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange(emptyPersonFilters)}>
              Clear filters
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
