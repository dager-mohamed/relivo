import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { cn } from "@repo/ui/lib/utils";

import { formatMoney } from "#/text-maps";

type Icon = React.ComponentType<{ className?: string }>;

/**
 * A property as a chip: its label while empty, its value once filled. A row of
 * these leaves one input as the form's focus while keeping every optional
 * field a key away — which is what a create dialog needs and a column of
 * labelled inputs cannot give you.
 *
 * Dashed while empty, solid once filled: a slot you could fill reads
 * differently from a fact that is on the record.
 *
 * Clearing lives inside each editor rather than on the chip. A clear button
 * inside a trigger button is a button inside a button, and there is nowhere
 * else on a 28px chip for it to sit.
 */
export function FieldChip({
  icon: Icon,
  label,
  value,
  className,
  ...props
}: {
  icon: Icon;
  label: string;
  value: string | null;
  // `value` on a button means something else entirely, and its type would
  // intersect with ours rather than replace it.
} & Omit<React.ComponentProps<"button">, "value">) {
  const filled = value !== null && value !== "";

  return (
    <button
      type="button"
      data-filled={filled || undefined}
      className={cn(
        "inline-flex h-7 max-w-64 items-center gap-1.5 rounded-md border border-dashed border-input px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-expanded:bg-muted aria-expanded:text-foreground data-filled:border-solid data-filled:border-border data-filled:text-foreground",
        className,
      )}
      {...props}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{filled ? value : label}</span>
    </button>
  );
}

/**
 * Text chips write on every keystroke rather than on a commit. Nothing here is
 * saved yet — the draft is state inside an unsubmitted dialog — so there is no
 * cost to writing eagerly, and it removes the whole Enter/Escape/blur question
 * along with the chance of the chip disagreeing with its own popover.
 */
export function ChipText({
  icon,
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  icon: Icon;
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const write = (next: string) => onChange(next === "" ? null : next);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<FieldChip icon={icon} label={label} value={value} />}
      />
      <PopoverContent
        align="start"
        className={cn("gap-0 p-1.5", multiline ? "w-80" : "w-64")}
      >
        {multiline ? (
          <textarea
            autoFocus
            rows={4}
            value={value ?? ""}
            onChange={(event) => write(event.target.value)}
            placeholder={placeholder ?? label}
            aria-label={label}
            className="w-full resize-none bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground/50"
          />
        ) : (
          <input
            autoFocus
            value={value ?? ""}
            onChange={(event) => write(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                setOpen(false);
              }
            }}
            placeholder={placeholder ?? label}
            aria-label={label}
            className="h-7 w-full bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground/50"
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Enum chips — a range, never a free number. The first item clears it. */
export function ChipSelect<T extends string>({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon: Icon;
  label: string;
  value: T | null;
  options: readonly T[];
  onChange: (next: T | null) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<FieldChip icon={icon} label={label} value={value} />}
      />
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup
          value={value ?? ""}
          onValueChange={(next) => onChange(next === "" ? null : (next as T))}
        >
          <DropdownMenuRadioItem value="">
            <span className="text-muted-foreground">
              No {label.toLowerCase()}
            </span>
          </DropdownMenuRadioItem>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Money is stored in minor units but nobody types cents, so this reads and
 * writes dollars and does the ×100 — same contract as the record rail's
 * editor, so "5000" can never be filed as $50.
 *
 * Unlike the text chips this does keep a draft: "12." is a state you pass
 * through on the way to "12.5" and is not a number yet.
 */
export function ChipMoney({
  icon,
  label,
  value,
  onChange,
}: {
  icon: Icon;
  label: string;
  value: number | null;
  onChange: (next: number | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => {
    if (!open) setDraft(value === null ? "" : String(value / 100));
  }, [value, open]);

  const write = (next: string) => {
    setDraft(next);
    const cleaned = next.replace(/[$,\s]/g, "");
    if (cleaned === "") return onChange(null);
    const dollars = Number(cleaned);
    if (Number.isFinite(dollars) && dollars >= 0) {
      onChange(Math.round(dollars * 100));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <FieldChip
            icon={icon}
            label={label}
            value={value === null ? null : formatMoney(value)}
          />
        }
      />
      <PopoverContent align="start" className="w-48 gap-0 p-1.5">
        <input
          autoFocus
          inputMode="decimal"
          value={draft}
          onChange={(event) => write(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              setOpen(false);
            }
          }}
          placeholder="0"
          aria-label={label}
          className="h-7 w-full bg-transparent px-1 text-sm tabular-nums outline-none placeholder:text-muted-foreground/50"
        />
      </PopoverContent>
    </Popover>
  );
}
