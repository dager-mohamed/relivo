import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";

import { usePanelSection } from "#/lib/record-panel/collapsed";

/**
 * Icon, label, count badge, collapse chevron — the unit every record panel is
 * built from, so Deals and People inherit it rather than reinventing it.
 */
export function PanelSection({
  id,
  title,
  icon: Icon,
  count,
  onAdd,
  defaultOpen = true,
  children,
}: {
  /** Stable across records — collapse state is per section, not per company. */
  id: string;
  title: string;
  /** Field groups go without one; relation sections carry theirs. */
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  onAdd?: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = usePanelSection(id, defaultOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/section border-b border-border last:border-b-0"
    >
      <div className="flex h-10 items-center gap-2 px-2">
        <CollapsibleTrigger className="-mx-1 flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted/50">
          {Icon ? (
            <Icon className="size-4 shrink-0 text-muted-foreground" />
          ) : null}
          <span className="truncate text-sm font-medium">{title}</span>
          {count === undefined ? null : (
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {count}
            </span>
          )}
          <ChevronDownIcon className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-open/section:rotate-180" />
        </CollapsibleTrigger>

        {onAdd ? (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Add to ${title}`}
            onClick={onAdd}
          >
            <PlusIcon className="size-3.5" />
          </Button>
        ) : null}
      </div>

      <CollapsibleContent>
        <div className="space-y-0.5 px-2 pb-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
