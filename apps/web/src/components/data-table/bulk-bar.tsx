import { Button } from "@repo/ui/components/button";

import { useTableContext } from "#/components/data-table/table-hook";

/**
 * Appears only when something is selected, so it costs no space at rest.
 * Actions are a slot — Companies passes Delete, People will pass its own.
 */
export function BulkBar({ children }: { children?: React.ReactNode }) {
  const table = useTableContext();
  const count = table.getSelectedRowModel().rows.length;

  if (count === 0) return null;

  return (
    <div className="sticky bottom-4 z-10 mx-auto flex w-fit items-center gap-3 rounded-xl border border-border bg-popover px-3 py-2 shadow-lg">
      <span className="text-sm font-medium tabular-nums">{count} selected</span>
      <div className="flex items-center gap-1">{children}</div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => table.toggleAllRowsSelected(false)}
      >
        Clear
      </Button>
    </div>
  );
}
