import { Checkbox } from "@repo/ui/components/checkbox";

import { useTableContext } from "#/components/data-table/table-hook";

/**
 * Structural, not generic: selection needs nothing about the row's shape, so
 * these stay usable from any feature's column defs.
 */
type SelectableRow = {
  getIsSelected: () => boolean;
  toggleSelected: (value?: boolean) => void;
};

export function SelectAllCheckbox() {
  const table = useTableContext();
  const all = table.getIsAllRowsSelected();
  const some = table.getIsSomeRowsSelected();

  return (
    <Checkbox
      checked={all}
      indeterminate={some && !all}
      onCheckedChange={(checked) => table.toggleAllRowsSelected(!!checked)}
      aria-label="Select all rows"
    />
  );
}

export function SelectRowCheckbox({ row }: { row: SelectableRow }) {
  return (
    // Without this the click also fires the row's navigation handler.
    <span onClick={(event) => event.stopPropagation()}>
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select row"
      />
    </span>
  );
}
