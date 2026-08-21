/**
 * A note is drawn twice — live inside the editor while it is written, and from
 * stored JSON in the feed afterwards. The scale has to be identical in both, or
 * a heading changes size the moment you press save.
 *
 * Two spellings of one decision, because Tailwind only sees classes written out
 * in full: `noteHeadingClass` styles an element `NoteBody` builds itself, while
 * `noteEditorProse` has to reach ProseMirror's own `<h1>`–`<h3>` through
 * descendant variants. Change one, change the other.
 *
 * Compressed on purpose. A note sits inside a record, so its headings must not
 * out-shout the record's own title — and each level separates on a lever the
 * 14px/400 body copy does not use, since 14px/600 beside it reads as no change
 * at all.
 */
export const noteHeadingClass: Record<number, string> = {
  1: "mt-1 text-[1.0625rem] leading-6 font-semibold tracking-tight first:mt-0",
  2: "mt-1 text-[0.9375rem] leading-6 font-semibold first:mt-0",
  3: "mt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase first:mt-0",
};

export const noteEditorProse =
  "[&_h1]:text-[1.0625rem] [&_h1]:leading-6 [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:text-[0.9375rem] [&_h2]:leading-6 [&_h2]:font-semibold [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:tracking-wide [&_h3]:text-muted-foreground [&_h3]:uppercase";

/**
 * Protocols a pasted link is allowed to carry. Notes are where someone pastes
 * a URL they were sent, so `javascript:` has to fail here rather than at the
 * point somebody clicks it.
 *
 * Sits beside `social.ts` for the same reason it does: URL handling is one
 * concern, and the app should have one place that decides what a link is.
 */
/**
 * What an empty block says about itself while the note is being written.
 *
 * A slash command drops the caret into a block that may have nothing in it, and
 * an empty heading is a blank line — indistinguishable from the paragraph it
 * replaced, so the command reads as having done nothing. Naming it fixes that.
 *
 * Lists, to-dos and quotes are left silent on purpose: each paints a marker the
 * moment it exists, so it already says what it is, and a ghost on every empty
 * bullet is noise in a list someone is halfway through typing.
 */
export function noteBlockPlaceholder({
  node,
  pos,
}: {
  node: { type: { name: string }; attrs: Record<string, unknown> };
  pos: number;
}): string {
  if (node.type.name === "heading") {
    return `Heading ${String(node.attrs.level ?? 1)}`;
  }
  // The opening block only. Repeating the prompt on every empty paragraph of a
  // half-written note turns an invitation into nagging.
  return pos === 0 ? "What did they say?" : "";
}

const safeProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

export function safeNoteHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    return safeProtocols.has(new URL(value).protocol) ? value : null;
  } catch {
    return null;
  }
}

/**
 * Where a mention is allowed to point. Unlike a pasted link this is always one
 * of our own routes, so anything absolute is either a mistake or an injection
 * — including protocol-relative `//host`, which a browser reads as external.
 */
export function noteMentionHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}
