import * as React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Switch } from "@repo/ui/components/switch";
import { cn } from "@repo/ui/lib/utils";

import { EditableText } from "#/components/record-panel/editable-field";

/**
 * The frame every create dialog shares: one hero field, a row of chips for
 * everything optional, and a footer that can keep itself open.
 *
 * Records are made from one fact — a domain, an address — and enriched after,
 * so the shape is a headline plus optional extras rather than a column of
 * labelled inputs. What the headline *is* belongs to the record type; this
 * owns only the chrome around it.
 *
 * A native `<form>` so Enter submits from any field. The chip popovers are
 * portalled out of it, so Enter inside one closes the chip instead.
 */
export function CreateRecordDialog({
  open,
  onOpenChange,
  title,
  identity,
  chips,
  submit,
  onSubmit,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Eyebrow. The hero input inside `identity` is the headline, not this. */
  title: string;
  identity: React.ReactNode;
  chips: React.ReactNode;
  /** The primary control — a duplicate swaps it for a link to the record. */
  submit: React.ReactNode;
  /** Files the record. Returns whether it actually did. */
  onSubmit: (createMore: boolean) => boolean;
  /** Clears the draft. `true` when another one is about to be typed. */
  onReset: (createMore: boolean) => void;
}) {
  const [createMore, setCreateMore] = React.useState(false);
  const [added, setAdded] = React.useState(0);
  const switchId = React.useId();

  const close = (next: boolean) => {
    if (!next) {
      onReset(false);
      setAdded(0);
    }
    onOpenChange(next);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!onSubmit(createMore)) return;

    if (createMore) {
      // Staying open is the point of the toggle, so the running count in the
      // footer is the confirmation — a toast per record would stack up.
      onReset(true);
      setAdded((count) => count + 1);
      return;
    }

    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent showCloseButton={false} className="gap-0 sm:max-w-xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader className="gap-0">
            <DialogTitle className="text-xs text-muted-foreground">
              {title}
            </DialogTitle>
          </DialogHeader>

          {identity}

          <div className="flex flex-wrap items-center gap-1.5">{chips}</div>

          <DialogFooter className="flex-row items-center px-4 py-3">
            <div className="mr-auto flex items-center gap-3">
              <Switch
                id={switchId}
                size="sm"
                checked={createMore}
                onCheckedChange={setCreateMore}
              />
              <label
                htmlFor={switchId}
                className="cursor-pointer text-sm text-muted-foreground"
              >
                Create more
              </label>
              {added > 0 ? (
                <span className="text-sm text-muted-foreground tabular-nums">
                  {added} added
                </span>
              ) : null}
            </div>

            <DialogClose render={<Button type="button" variant="ghost" />}>
              Cancel
            </DialogClose>

            {submit}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Avatar and hero field. The monogram is empty until enough is typed to name
 * the record, and the slot holds its size either way so recognising what you
 * typed swaps the glyph instead of shifting the field.
 */
export function CreateIdentity({
  monogram,
  shape = "square",
  children,
}: {
  monogram: string;
  /** Square for organisations, round for humans — as everywhere else. */
  shape?: "square" | "round";
  children: React.ReactNode;
}) {
  const rounded = shape === "square" ? "rounded-xl" : "rounded-full";

  return (
    <div className="flex items-center gap-3">
      {monogram === "" ? (
        <div
          className={cn(
            "size-10 shrink-0 border border-dashed border-input",
            rounded,
          )}
        />
      ) : (
        <Avatar className={cn("size-10 shrink-0", rounded)}>
          <AvatarFallback
            className={cn("bg-muted text-sm font-semibold", rounded)}
          >
            {monogram}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

/** Shared styling for the hero input, so the two dialogs cannot disagree. */
export const heroInputClass =
  "w-full bg-transparent text-xl leading-8 font-semibold tracking-tight outline-none placeholder:font-normal placeholder:text-muted-foreground/40";

/**
 * The line under the hero, which is where the field reports back: the name it
 * derived, the record you already have, or what is wrong with what you typed.
 * Fixed height so none of the four shifts the chips below.
 *
 * Clearing the name restores the derived one — `null` is what "derive it"
 * means, so emptying the field is the way back.
 */
export function CreateNameLine({
  kind,
  message,
  hint,
  nameAlone = false,
  name,
  placeholder,
  onRename,
}: {
  kind: "empty" | "invalid" | "duplicate" | "ready";
  /** Shown for `invalid` and `duplicate`. */
  message?: string;
  /** Shown for `empty` — what will happen once they type. */
  hint: string;
  /**
   * Whether the record can exist on a name alone. A person can — `people` has
   * a name-or-email check — so the field has to stay reachable with the hero
   * empty, or that half of the constraint has no way in. A company cannot: its
   * domain is required, so an editable name there would only mislead.
   */
  nameAlone?: boolean;
  name: string;
  placeholder?: string;
  onRename: (next: string | null) => void;
}) {
  return (
    <div className="flex min-h-7 items-center gap-1.5 text-sm">
      {kind === "duplicate" ? (
        <>
          <ExclamationTriangleIcon className="size-3.5 shrink-0 text-warning" />
          <span className="truncate text-muted-foreground">{message}</span>
        </>
      ) : kind === "invalid" ? (
        <span className="px-1.5 text-destructive">{message}</span>
      ) : kind === "empty" && !nameAlone ? (
        <span className="px-1.5 text-muted-foreground/40">{hint}</span>
      ) : (
        <>
          <span className="shrink-0 text-muted-foreground">Name</span>
          <EditableText
            value={name === "" ? null : name}
            onCommit={onRename}
            placeholder={placeholder ?? "Add a name"}
            className="w-auto max-w-full font-medium"
          />
        </>
      )}
    </div>
  );
}
