import type { RowData } from "@tanstack/react-table";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

import { useTableContext } from "#/components/data-table/table-hook";

// The first two columns stay put while the grid scrolls sideways, so a row is
// still identifiable at the far right. The offset has to be a real number,
// hence the fixed select width.
const SELECT_W = "w-10 min-w-10";
const STICKY = "sticky z-10 bg-background";

/**
 * Shared render loop. Uses the shadcn table parts but supplies its own scroll
 * container: `Table`'s wrapper hard-codes `overflow-x-auto` and does not
 * expose a className, and a grid scrolling both ways with a sticky header
 * needs one element owning both axes.
 *
 * Sizing: `w-full` on the table with the browser's automatic layout. Columns
 * take their content width and the spare space is shared between them, so the
 * grid fills the panel without any one column being stretched.
 *
 * Do not reintroduce a `w-full` filler cell alongside `min-w-max`: a cell
 * asking for 100% of a table whose min-width is its own max-content width is
 * circular, and the container scrolls forever. `whitespace-nowrap` is what
 * makes the table overflow — and therefore scroll — only when the columns
 * genuinely cannot fit.
 *
 * `border-separate` is deliberate — under `border-collapse` browsers drop
 * borders on sticky cells, so every rule is drawn on the cell.
 */
export function DataTable<TData extends RowData>({
  toolbar,
}: {
  toolbar?: React.ReactNode;
}) {
  const table = useTableContext<TData>();

  return (
    <div className="flex max-h-full w-full flex-col overflow-hidden rounded-xl border border-border">
      {toolbar}

      <div className="min-h-0 overflow-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <TableHeader className="[&_tr]:border-b-0">
            {table.getHeaderGroups().map((group) => (
              <TableRow
                key={group.id}
                className="border-b-0 hover:bg-transparent"
              >
                {group.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className={`group/header sticky top-0 z-20 h-9 border-r border-b border-border bg-background px-3 text-xs font-medium whitespace-nowrap last:border-r-0 ${
                      index === 0 ? `left-0 z-30 ${SELECT_W}` : ""
                    } ${index === 1 ? "left-10 z-30 min-w-56" : ""}`}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className="group/row border-b-0"
              >
                {/* Visible, not all: getAllCells ignores column visibility, so
                    hiding a column dropped its header and kept its cells. */}
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell
                    key={cell.id}
                    // A fixed height on every cell is what holds rows to one
                    // line and uniform, which the task calls for explicitly.
                    className={`h-10 border-r border-b border-border px-3 py-0 whitespace-nowrap group-hover/row:bg-muted/50 group-data-[state=selected]/row:bg-muted last:border-r-0 ${
                      index < 2 ? STICKY : ""
                    } ${index === 0 ? `left-0 ${SELECT_W}` : ""} ${
                      index === 1 ? "left-10 min-w-56" : ""
                    }`}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
    </div>
  );
}
