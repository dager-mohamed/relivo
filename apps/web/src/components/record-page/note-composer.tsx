import * as React from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import type { NoteDoc } from "@repo/schema";

import { NoteEditorFrame } from "#/components/record-page/note-editor-frame";

/**
 * Writing down what was said is the one thing a founder does *to* a record
 * rather than reads off it, so it sits at the top of the feed rather than
 * behind a button in the header.
 *
 * Collapsed it reads as an input — an inset, slightly darker surface — which
 * says "type here" without a second border competing with the feed.
 *
 * Open, it is the real editor, and what it produces is what the feed renders:
 * one document shape, written and read by the same schema.
 */
export function NoteComposer({
  onSubmit,
  placeholder = "Write a note…",
}: {
  onSubmit: (body: NoteDoc) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  // Bumped on close to remount the editor, which is how its content clears —
  // EditorProvider owns the instance, so there is nothing here to call reset on.
  const [generation, setGeneration] = React.useState(0);

  const close = () => {
    setGeneration((n) => n + 1);
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
    <NoteEditorFrame
      key={generation}
      saveLabel="Add note"
      onSave={(body) => {
        onSubmit(body);
        close();
      }}
      onDiscard={close}
    />
  );
}
