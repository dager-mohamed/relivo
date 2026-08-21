import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";

import { useTableContext } from "#/components/data-table/table-hook";

/**
 * Show/hide columns. `labels` is passed rather than read from column meta —
 * v9 has no ColumnMeta interface to augment, and deriving a label from a
 * column id gives you "totalDealValue".
 *
 * Columns a row cannot be identified without should set `enableHiding: false`.
 */
export function ViewOptions({ labels }: { labels: Record<string, string> }) {
  const table = useTableContext();
  const hideable = table
    .getAllColumns()
    .filter((column) => column.getCanHide());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
          />
        }
      >
        <AdjustmentsHorizontalIcon className="size-4" />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground">
            Show columns
          </DropdownMenuLabel>
          {hideable.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
            >
              {labels[column.id] ?? column.id}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
