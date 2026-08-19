import * as React from "react";
import { LinkIcon } from "@heroicons/react/24/outline";

import type { ActivityAction } from "@repo/schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

import { NoteBody } from "#/components/record-page/note-body";
import type { FeedActor, FeedItem } from "#/mocks/feed";
import { activityActionText, formatDateTime, relativeTime } from "#/text-maps";

/**
 * One feed, two kinds of entry, interleaved by time — the story of a record is
 * both things at once, so splitting them into tabs would be tidier and much
 * worse.
 *
 * System events are recessive: a marker on the thread and one muted line.
 * Notes are the content, so they get a card, generous padding, and their
 * document rendered properly. That asymmetry is the whole design; an event
 * collapsed to a line beside a note in a card tells you which is which before
 * you read either.
 *
 * Rhythm follows it. Consecutive events pack tight; a card pushes air above
 * and below itself.
 *
 * Shared with deals, which render the same union.
 */
export function ActivityFeed({
  items,
  now,
  anchor = true,
}: {
  items: FeedItem[];
  /** Fixture clock today; `new Date()` once the data is live. */
  now: Date;
  /**
   * Whether entries are addressable. Off for previews — the Overview tab shows
   * the newest few beside the full feed, and two copies of an entry means two
   * elements with one id, which is exactly the thing a citation cannot land on.
   */
  anchor?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <ol className="relative flex flex-col">
      {/* The thread every entry hangs off — inset so it stops at the first and
          last rows rather than running off the ends. */}
      <span aria-hidden className="absolute inset-y-4 left-3 w-px bg-border" />

      {items.map((item) =>
        item.kind === "note" ? (
          <NoteEntry key={item.id} item={item} now={now} anchor={anchor} />
        ) : (
          <EventEntry key={item.id} item={item} now={now} anchor={anchor} />
        ),
      )}
    </ol>
  );
}

/** `:` is legal in an id but awkward in a selector, and these become fragments. */
function entryId(id: string): string {
  return `entry-${id.replace(/:/g, "-")}`;
}

function EventEntry({
  item,
  now,
  anchor,
}: {
  item: FeedItem;
  now: Date;
  anchor: boolean;
}) {
  const action: ActivityAction =
    item.kind === "note" ? "note_added" : item.event.action;
  const data = item.kind === "note" ? null : item.event.data;

  return (
    <li
      id={anchor ? entryId(item.id) : undefined}
      className="flex items-start gap-3 py-0.5"
    >
      <EventMarker action={action} />
      <p className="pt-0.5 text-sm leading-6 text-muted-foreground">
        <span className="font-medium text-foreground">
          {item.actor?.name ?? "Someone"}
        </span>{" "}
        {activityActionText[action].phrase(data)}
        <Timestamp at={item.at} now={now} />
      </p>
    </li>
  );
}

function NoteEntry({
  item,
  now,
  anchor,
}: {
  item: FeedItem;
  now: Date;
  anchor: boolean;
}) {
  if (item.kind !== "note") return null;
  const id = anchor ? entryId(item.id) : undefined;

  return (
    <li id={id} className="group/note flex items-start gap-3 py-2">
      <ActorAvatar actor={item.actor} />
      <article className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-3">
        <header className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium">
            {item.actor?.name ?? "Someone"}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <time
            dateTime={item.at.toISOString()}
            title={formatDateTime(item.at)}
            className="shrink-0 text-xs text-muted-foreground"
          >
            {relativeTime(item.at, now)}
          </time>
          {id ? <CopyLink id={id} /> : null}
        </header>
        <div className="pt-1.5">
          <NoteBody doc={item.note.body} />
        </div>
      </article>
    </li>
  );
}

/**
 * Every note is individually addressable, because AI answers will cite one and
 * the citation has to land on it. Hidden until the card is hovered — a control
 * on every entry would compete with the writing.
 */
function CopyLink({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    const { origin, pathname } = window.location;
    void navigator.clipboard.writeText(`${origin}${pathname}#${id}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy link to this note"
      className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-[opacity,color,background-color] group-hover/note:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {copied ? (
        <span className="text-[0.625rem] font-medium">✓</span>
      ) : (
        <LinkIcon className="size-3.5" />
      )}
    </button>
  );
}

// `relative` so the marker paints over the thread — the line is absolutely
// positioned, and positioned elements beat static ones regardless of order.
function EventMarker({ action }: { action: ActivityAction }) {
  const Icon = activityActionText[action].icon;
  return (
    <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
      <Icon className="size-3.5" />
    </span>
  );
}

function ActorAvatar({ actor }: { actor: FeedActor | null }) {
  return (
    <Avatar className="relative size-6 shrink-0 ring-3 ring-background">
      <AvatarImage src={actor?.image ?? undefined} />
      <AvatarFallback className="text-[0.625rem] font-medium">
        {actor?.name.slice(0, 1) ?? "?"}
      </AvatarFallback>
    </Avatar>
  );
}

function Timestamp({ at, now }: { at: Date; now: Date }) {
  return (
    <>
      <span className="px-1.5 text-muted-foreground/50">·</span>
      <time
        dateTime={at.toISOString()}
        title={formatDateTime(at)}
        className="whitespace-nowrap"
      >
        {relativeTime(at, now)}
      </time>
    </>
  );
}
