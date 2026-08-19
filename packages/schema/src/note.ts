import { z } from "zod";

/**
 * A note body as the editor writes it — TipTap/ProseMirror JSON.
 *
 * Structural rather than an enumeration of node types. The editor ships
 * bullets, headings, tables, task lists and code blocks, and pinning that list
 * here would mean a schema change every time one is switched on. This rejects
 * the shapes that are actually wrong — a bare string, a missing `type`, a root
 * that is not a doc — and leaves the node vocabulary to the editor.
 */
export type NoteNode = {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
  content?: NoteNode[];
};

const noteMark = z.object({
  type: z.string().min(1),
  attrs: z.record(z.string(), z.unknown()).optional(),
});

export const noteNode: z.ZodType<NoteNode> = z.lazy(() =>
  z.object({
    type: z.string().min(1),
    attrs: z.record(z.string(), z.unknown()).optional(),
    marks: z.array(noteMark).optional(),
    text: z.string().optional(),
    content: z.array(noteNode).optional(),
  }),
);

export const noteDoc = z.object({
  type: z.literal("doc"),
  content: z.array(noteNode).default([]),
});
export type NoteDoc = z.infer<typeof noteDoc>;

// Anything that ends a line when the document is flattened.
const blockNodes = new Set([
  "paragraph",
  "heading",
  "listItem",
  "taskItem",
  "blockquote",
  "codeBlock",
  "tableRow",
  "horizontalRule",
]);

/**
 * Flattened plain text for `notes.bodyText`, which is what tsvector search and
 * embedding chunking read — neither can walk JSON in SQL. Kept beside the
 * document so the two can never drift apart.
 */
export function noteText(doc: NoteDoc): string {
  const out: string[] = [];

  const walk = (node: NoteNode) => {
    if (node.type === "hardBreak") out.push("\n");
    if (node.text) out.push(node.text);
    node.content?.forEach(walk);
    if (blockNodes.has(node.type)) out.push("\n");
  };

  doc.content.forEach(walk);
  return out
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The empty document, which is what an untouched editor holds. */
export const emptyNoteDoc: NoteDoc = { type: "doc", content: [] };

export function isNoteEmpty(doc: NoteDoc): boolean {
  return noteText(doc) === "";
}
