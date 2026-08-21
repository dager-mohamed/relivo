/**
 * Icon and label on the left in a fixed column, value to the right and
 * left-aligned so every value starts on the same axis down the rail. A ragged
 * right edge is what made the first version read as a receipt.
 *
 * `stacked` drops the label above instead, handing the value the rail's whole
 * width — for editors that need room to be a form rather than a line.
 */
export function FieldRow({
  label,
  icon: Icon,
  align = "center",
  stacked = false,
  action,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** `start` for values that grow past one line. */
  align?: "center" | "start";
  stacked?: boolean;
  /** Sits on the label line — for fields whose editor is a list, not a value. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (stacked) {
    return (
      <div className="flex flex-col gap-1 py-1 text-sm">
        <div className="flex min-h-6 items-center gap-2">
          <Label label={label} icon={Icon} />
          {action ? <span className="ml-auto shrink-0">{action}</span> : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-7 gap-2 text-sm ${
        align === "start" ? "items-start pt-1" : "items-center"
      }`}
    >
      <Label label={label} icon={Icon} className="w-24 shrink-0" />
      <span className="min-w-0 flex-1">{children}</span>
      {action ? <span className="shrink-0">{action}</span> : null}
    </div>
  );
}

function Label({
  label,
  icon: Icon,
  className = "",
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <span
      className={`flex items-center gap-2 pl-1 text-muted-foreground ${className}`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}

/** Read-only counterpart, for values the user does not own. */
export function StaticValue({ children }: { children?: React.ReactNode }) {
  return (
    <span className="block truncate px-1.5 py-1">
      {children ?? <span className="text-muted-foreground/40">Empty</span>}
    </span>
  );
}
