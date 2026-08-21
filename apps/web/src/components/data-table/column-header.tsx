import {
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

/** Structural so any feature's column can be passed without generics. */
type SortableColumn = {
  getCanSort: () => boolean;
  getIsSorted: () => false | "asc" | "desc";
  toggleSorting: (desc?: boolean) => void;
};

/**
 * A leading icon per column is what stops a wide CRM table reading as a
 * spreadsheet — it gives the eye an anchor before the label.
 */
export function ColumnHeader({
  column,
  label,
  icon: Icon,
  align = "start",
}: {
  column: SortableColumn;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  align?: "start" | "end";
}) {
  const content = (
    <>
      {Icon ? <Icon className="size-3.5 text-muted-foreground/70" /> : null}
      <span>{label}</span>
    </>
  );

  if (!column.getCanSort()) {
    return (
      <span
        className={`flex items-center gap-1.5 ${align === "end" ? "justify-end" : ""}`}
      >
        {content}
      </span>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={`-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-muted hover:text-foreground ${
        align === "end" ? "justify-end" : ""
      }`}
    >
      {content}
      {sorted === "asc" ? (
        <ChevronUpIcon className="size-3.5" />
      ) : sorted === "desc" ? (
        <ChevronDownIcon className="size-3.5" />
      ) : (
        // Reserved space, so the row does not shift when sorting is applied.
        <ChevronUpDownIcon className="size-3.5 opacity-0 transition-opacity group-hover/header:opacity-40" />
      )}
    </button>
  );
}
