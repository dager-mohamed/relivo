import * as React from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import { emptyNoteDoc, isNoteEmpty, noteDoc, type NoteDoc } from "@repo/schema";
import { Button } from "@repo/ui/components/button";
import {
  EditorBubbleMenu,
  EditorFormatBold,
  EditorFormatCode,
  EditorFormatItalic,
  EditorFormatStrike,
  EditorNodeBulletList,
  EditorNodeOrderedList,
  EditorProvider,
} from "@repo/ui/components/kibo-ui/editor/index";

import { noteEditorProse } from "#/text-maps";

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
  const [body, setBody] = React.useState<NoteDoc>(emptyNoteDoc);
  // Bumped on submit to remount the editor, which is how its content clears —
  // EditorProvider owns the instance, so there is nothing here to call reset on.
  const [generation, setGeneration] = React.useState(0);
  const [rejected, setRejected] = React.useState(false);

  const empty = isNoteEmpty(body);

  const submit = () => {
    if (empty || rejected) return;
    onSubmit(body);
    reset();
  };

  const reset = () => {
    setBody(emptyNoteDoc);
    setRejected(false);
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
    <div
      className="flex flex-col gap-2"
      // On the wrapper, not the editor: ProseMirror handles its own keymap and
      // Enter belongs to it. Only the modified chord is ours.
      onKeyDown={(event) => {
        if (event.key === "Escape") reset();
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          submit();
        }
      }}
    >
      <div className="rounded-lg border border-border bg-card px-3 py-2 focus-within:ring-3 focus-within:ring-ring/50">
        <EditorProvider
          key={generation}
          autofocus="end"
          placeholder="What did they say?"
          // Preflight strips heading styles and kibo never restores them, so
          // without this a heading looks exactly like the paragraph it
          // replaced. Shared with the renderer — see text-maps/note.ts.
          className={`max-h-80 min-h-20 overflow-y-auto text-sm ${noteEditorProse}`}
          // Parsed, not cast: the editor's JSON is wider than what a note is
          // allowed to be, and this is the boundary where that gets checked.
          onUpdate={({ editor }) => {
            const parsed = noteDoc.safeParse(editor.getJSON());
            setRejected(!parsed.success);
            if (parsed.success) setBody(parsed.data);
          }}
        >
          <EditorBubbleMenu>
            <EditorFormatBold hideName />
            <EditorFormatItalic hideName />
            <EditorFormatStrike hideName />
            <EditorFormatCode hideName />
            <EditorNodeBulletList hideName />
            <EditorNodeOrderedList hideName />
          </EditorBubbleMenu>
        </EditorProvider>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs ${rejected ? "text-destructive" : "text-muted-foreground"}`}
        >
          {rejected
            ? "This note has something we cannot store yet"
            : "⌘ + Enter to save · / for blocks"}
        </span>
        <Button variant="ghost" size="sm" onClick={reset} className="ml-auto">
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={empty || rejected}>
          Add note
        </Button>
      </div>
    </div>
  );
}
