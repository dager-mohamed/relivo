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
  emptyCompanyFilters,
  isFiltered,
  type CompanyFilters,
} from "#/lib/companies/filters";

export function CompaniesFilters({
  filters,
  locations,
  onChange,
}: {
  filters: CompanyFilters;
  locations: string[];
  onChange: (filters: CompanyFilters) => void;
}) {
  const active = isFiltered(filters);
  const count =
    (filters.hasOpenDeals === null ? 0 : 1) + filters.locations.length;

  const toggleLocation = (location: string, checked: boolean) =>
    onChange({
      ...filters,
      locations: checked
        ? [...filters.locations, location]
        : filters.locations.filter((item) => item !== location),
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

      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground">
            Deals
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.hasOpenDeals === true}
            onCheckedChange={(checked) =>
              onChange({ ...filters, hasOpenDeals: checked ? true : null })
            }
          >
            Has open deals
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.hasOpenDeals === false}
            onCheckedChange={(checked) =>
              onChange({ ...filters, hasOpenDeals: checked ? false : null })
            }
          >
            No open deals
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground">
            Location
          </DropdownMenuLabel>
          {locations.map((location) => (
            <DropdownMenuCheckboxItem
              key={location}
              checked={filters.locations.includes(location)}
              onCheckedChange={(checked) => toggleLocation(location, !!checked)}
            >
              {location}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>

        {active ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange(emptyCompanyFilters)}>
              Clear filters
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
