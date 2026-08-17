import type { ActivityEvent, Note, User } from "@repo/db";
import type { ActivityAction } from "@repo/schema";

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

export function feedNote(
  owner: FeedOwner,
  slug: string,
  body: string,
  at: Date,
): FeedItem {
  const id = `${owner.id}:note-${slug}`;
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
      // The editor's own JSON in production; the feed renders `bodyText`.
      body: { text: body },
      bodyText: body,
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
export function feedDraftNote(owner: FeedOwner, body: string): FeedItem {
  drafts += 1;
  return feedNote(owner, `draft-${drafts}`, body, now);
}

/** Newest first, which is the only order a feed is ever read in. */
export function newestFirst(items: FeedItem[]): FeedItem[] {
  return items.sort((a, b) => b.at.getTime() - a.at.getTime());
}
