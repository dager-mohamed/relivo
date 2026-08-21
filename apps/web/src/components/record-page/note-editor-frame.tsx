import * as React from "react";

import { emptyNoteDoc, isNoteEmpty, type NoteDoc } from "@repo/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";

import { NoteEditor } from "#/components/record-page/note-editor";

/**
 * The editor plus everything around committing what is in it: the keyboard
 * chord, the save and discard buttons, and the confirm that stands between an
 * unfinished note and losing it.
 *
 * Writing a new note and correcting an old one are the same act with a
 * different starting document, so both mount this.
 */
export function NoteEditorFrame({
  initial,
  saveLabel,
  hint,
  onSave,
  onDiscard,
}: {
  initial?: NoteDoc;
  saveLabel: string;
  hint?: string;
  onSave: (body: NoteDoc) => void;
  onDiscard: () => void;
}) {
  const [body, setBody] = React.useState<NoteDoc>(initial ?? emptyNoteDoc);
  const [rejected, setRejected] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  const empty = isNoteEmpty(body);

  const save = () => {
    if (empty || rejected) return;
    onSave(body);
  };

  // Esc is a reflex — people hit it to dismiss the slash menu and to leave a
  // field. Losing what was written to that reflex is the kind of thing someone
  // stops trusting an app over, so anything written asks first. An untouched
  // note has nothing to lose, so it just closes.
  const discard = () => {
    if (empty || sameAsInitial(body, initial)) onDiscard();
    else setConfirming(true);
  };

  return (
    <div
      className="flex flex-col gap-2"
      // On the wrapper, not the editor: ProseMirror handles its own keymap and
      // Enter belongs to it. Only the modified chord is ours.
      onKeyDown={(event) => {
        if (event.key === "Escape") discard();
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          save();
        }
      }}
    >
      <div className="rounded-lg border border-border bg-card px-3 py-2 focus-within:ring-3 focus-within:ring-ring/50">
        <NoteEditor
          initial={initial}
          className="max-h-80 min-h-20 overflow-y-auto"
          onChange={(next) => {
            setRejected(next === null);
            if (next) setBody(next);
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs ${rejected ? "text-destructive" : "text-muted-foreground"}`}
        >
          {rejected
            ? "This note has something we cannot store yet"
            : (hint ?? "⌘ + Enter to save · / for blocks · @ to mention")}
        </span>
        <Button variant="ghost" size="sm" onClick={discard} className="ml-auto">
          Cancel
        </Button>
        <Button size="sm" onClick={save} disabled={empty || rejected}>
          {saveLabel}
        </Button>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              What you have written will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep writing</AlertDialogCancel>
            <AlertDialogAction onClick={onDiscard}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Cheap enough on a note, and it keeps Esc from nagging about nothing. */
function sameAsInitial(body: NoteDoc, initial: NoteDoc | undefined): boolean {
  return (
    initial !== undefined && JSON.stringify(body) === JSON.stringify(initial)
  );
}
