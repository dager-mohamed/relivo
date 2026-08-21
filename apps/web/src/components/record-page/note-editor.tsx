import * as React from "react";

import { noteDoc, type NoteDoc } from "@repo/schema";
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
import { createMentionExtension } from "@repo/ui/components/kibo-ui/editor/mention";

import { mentionSearch } from "#/lib/notes/mentions";
import { noteBlockPlaceholder, noteEditorProse } from "#/text-maps";

/**
 * The note editor itself, with no chrome around it. Two surfaces mount it —
 * the composer at the top of the feed and an existing note being edited in
 * place — and they must produce the same document, so the extensions, the
 * type scale and the parse boundary all live here rather than at each of them.
 */
export function NoteEditor({
  initial,
  onChange,
  className,
}: {
  initial?: NoteDoc;
  /** `null` when the document holds something the note schema will not store. */
  onChange: (body: NoteDoc | null) => void;
  className?: string;
}) {
  // Once per mount: rebuilding the extension rebuilds the ProseMirror schema,
  // which throws away the editor's history along with it.
  const mention = React.useMemo(
    () => createMentionExtension(mentionSearch),
    [],
  );

  return (
    <EditorProvider
      autofocus="end"
      content={initial}
      extensions={[mention]}
      // Preflight strips heading styles and kibo never restores them, so
      // without this a heading looks exactly like the paragraph it replaced.
      // Shared with the renderer — see text-maps/note.ts.
      className={`text-sm ${noteEditorProse} ${className ?? ""}`}
      placeholder={noteBlockPlaceholder}
      // Parsed, not cast: the editor's JSON is wider than what a note is
      // allowed to be, and this is the boundary where that gets checked.
      onUpdate={({ editor }) => {
        const parsed = noteDoc.safeParse(editor.getJSON());
        onChange(parsed.success ? parsed.data : null);
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
  );
}
