/**
 * The table's own control bar — filters left, view controls right — sitting
 * inside the table's border rather than in the page header, so the controls
 * travel with the grid they act on. Shared by every list view.
 */
export function DataTableToolbar({
  left,
  right,
}: {
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex h-10 shrink-0 items-center gap-1 border-b border-border px-2">
      <div className="flex min-w-0 items-center gap-1">{left}</div>
      <div className="ml-auto flex shrink-0 items-center gap-1">{right}</div>
    </div>
  );
}
