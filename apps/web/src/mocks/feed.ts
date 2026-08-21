import type { ActivityEvent, Note, User } from "@repo/db";
import {
  noteText,
  type ActivityAction,
  type NoteDoc,
  type NoteNode,
} from "@repo/schema";

import { currentUser } from "./user";
import { workspace } from "./workspace";

/**
 * `notes` and `activity_events` are separate tables that render as one feed —
 * see packages/db/src/schema/timeline.ts. The API will return the UNION already
 * joined to its author, so that is the shape here: shared display fields on the
 * outside, the row itself inside.
 */
export type FeedActor = Pick<User, "id" | "name" | "image">;

type FeedBase = { id: string; at: Date; actor: FeedActor | null };

export type FeedItem =
  | (FeedBase & { kind: "event"; event: ActivityEvent })
  | (FeedBase & { kind: "note"; note: Note });

/** Fixture clock. Every relative timestamp on a record page reads from it. */
export const now = new Date("2026-08-15T09:00:00Z");

export const actor: FeedActor = {
  id: currentUser.id,
  name: currentUser.name,
  image: currentUser.image,
};

/**
 * Which record the row hangs off. Both timeline tables carry one nullable fk
 * per record type, so a feed is whichever of them is set — the builders below
 * take the owner rather than each caller filling in four nulls.
 */
export type FeedOwner = { kind: "company" | "person"; id: string };

function foreignKeys(owner: FeedOwner) {
  return {
    companyId: owner.kind === "company" ? owner.id : null,
    personId: owner.kind === "person" ? owner.id : null,
    dealId: null,
  };
}

export function feedEvent(
  owner: FeedOwner,
  slug: string,
  action: ActivityAction,
  data: Record<string, unknown> | null,
  at: Date,
): FeedItem {
  const id = `${owner.id}:${slug}`;
  return {
    id,
    at,
    actor,
    kind: "event",
    event: {
      id,
      workspaceId: workspace.id,
      ...foreignKeys(owner),
      actorId: actor.id,
      action,
      targetType: null,
      targetId: null,
      data,
      createdAt: at,
    },
  };
}

/**
 * Note-document builders. The editor emits this shape; fixtures write it by
 * hand, and a plain string is the common case so it gets the short path.
 */
export function text(value: string): NoteNode {
  return { type: "text", text: value };
}

export function bold(value: string): NoteNode {
  return { type: "text", text: value, marks: [{ type: "bold" }] };
}

export function link(value: string, href: string): NoteNode {
  return {
    type: "text",
    text: value,
    marks: [{ type: "link", attrs: { href } }],
  };
}

export function para(...inline: (NoteNode | string)[]): NoteNode {
  return {
    type: "paragraph",
    content: inline.map((n) => (typeof n === "string" ? text(n) : n)),
  };
}

/** A bullet whose children are blocks — pass another `bullets()` to nest. */
export function item(...blocks: NoteNode[]): NoteNode {
  return { type: "listItem", content: blocks };
}

export function bullets(...items: NoteNode[]): NoteNode {
  return { type: "bulletList", content: items };
}

export function doc(...blocks: NoteNode[]): NoteDoc {
  return { type: "doc", content: blocks };
}

export function feedNote(
  owner: FeedOwner,
  slug: string,
  body: string | NoteDoc,
  at: Date,
): FeedItem {
  const id = `${owner.id}:note-${slug}`;
  const document = typeof body === "string" ? doc(para(body)) : body;
  return {
    id,
    at,
    actor,
    kind: "note",
    note: {
      id,
      workspaceId: workspace.id,
      ...foreignKeys(owner),
      authorId: actor.id,
      body: document,
      // Derived, never written by hand: `notes.bodyText` is what search and
      // embeddings read, and it has to be the same document the feed shows.
      bodyText: noteText(document),
      createdAt: at,
      updatedAt: at,
    },
  };
}

/**
 * What the composer produces until `notes.create` exists. Stamped with the
 * fixture clock, not the wall clock, or a note written today would render as
 * "6 hours ago" against a feed anchored to `now`.
 */
let drafts = 0;
export function feedDraftNote(
  owner: FeedOwner,
  body: string | NoteDoc,
): FeedItem {
  drafts += 1;
  return feedNote(owner, `draft-${drafts}`, body, now);
}

/**
 * Rewrite one note in place. `updatedAt` takes the wall clock rather than the
 * fixture one — nothing renders it, and stamping it with `now` would make a
 * note written this session look untouched after being edited.
 */
export function editFeedNote(
  items: FeedItem[],
  id: string,
  body: NoteDoc,
): FeedItem[] {
  return items.map((item) =>
    item.kind === "note" && item.id === id
      ? {
          ...item,
          note: {
            ...item.note,
            body,
            bodyText: noteText(body),
            updatedAt: new Date(),
          },
        }
      : item,
  );
}

/** Newest first, which is the only order a feed is ever read in. */
export function newestFirst(items: FeedItem[]): FeedItem[] {
  return items.sort((a, b) => b.at.getTime() - a.at.getTime());
}
