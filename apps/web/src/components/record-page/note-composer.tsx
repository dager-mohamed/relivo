import * as React from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";

/**
 * Writing down what was said is the one thing a founder does *to* a record
 * rather than reads off it, so it sits at the top of the feed rather than
 * behind a button in the header.
 *
 * Collapsed it reads as an input — an inset, slightly darker surface — which
 * says "type here" without a second border competing with the feed.
 */
export function NoteComposer({
  onSubmit,
  placeholder = "Write a note…",
}: {
  onSubmit: (body: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [body, setBody] = React.useState("");

  const submit = () => {
    const next = body.trim();
    if (next === "") return;
    onSubmit(next);
    setBody("");
    setOpen(false);
  };

  const cancel = () => {
    setBody("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <PencilSquareIcon className="size-4 shrink-0" />
        {placeholder}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        autoFocus
        rows={3}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") cancel();
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            submit();
          }
        }}
        placeholder="What did they say?"
        className="min-h-24 resize-none"
      />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">⌘ + Enter to save</span>
        <Button variant="ghost" size="sm" onClick={cancel} className="ml-auto">
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={body.trim() === ""}>
          Add note
        </Button>
      </div>
    </div>
  );
}
