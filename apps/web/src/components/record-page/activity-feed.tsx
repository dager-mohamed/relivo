import type { ActivityAction } from "@repo/schema";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

import type { FeedActor, FeedItem } from "#/mocks/company-activity";
import { activityActionText, formatDateTime, relativeTime } from "#/text-maps";

/**
 * One feed, two kinds of row. System events are a single quiet line — chrome
 * that says the record moved; notes are what a person actually wrote.
 *
 * `notes` decides which the note gets. On Activity a note is one more thing
 * that happened, so it collapses to "Moe Amaya added a note" and the log stays
 * scannable; on Notes it is the content, so it gets a card and its full body.
 * Same data, two jobs.
 *
 * Shared with deals and people, which render the same union.
 */
export function ActivityFeed({
  items,
  now,
  notes = "line",
}: {
  items: FeedItem[];
  /** Fixture clock today; `new Date()` once the data is live. */
  now: Date;
  notes?: "line" | "full";
}) {
  if (items.length === 0) return null;

  return (
    <ol className="relative flex flex-col">
      {/* The thread every marker sits on — inset so it stops at the first and
          last rows rather than running off the ends. */}
      <span aria-hidden className="absolute inset-y-4 left-3 w-px bg-border" />

      {items.map((item) => {
        if (item.kind === "note" && notes === "full") {
          return (
            <li key={item.id} className="flex items-start gap-3 py-1.5">
              <ActorAvatar actor={item.actor} />
              <article className="min-w-0 flex-1 rounded-xl border border-border bg-card">
                <header className="flex items-baseline gap-2 px-3.5 pt-2.5">
                  <span className="truncate text-sm font-medium">
                    {item.actor?.name ?? "Someone"}
                  </span>
                  <time
                    dateTime={item.at.toISOString()}
                    title={formatDateTime(item.at)}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {relativeTime(item.at, now)}
                  </time>
                </header>
                <p className="px-3.5 pt-1 pb-3 text-sm leading-6 text-pretty whitespace-pre-line">
                  {item.note.bodyText}
                </p>
              </article>
            </li>
          );
        }

        // A note on the Activity tab reads as the event it is: `note_added`
        // exists in the schema for exactly this, so the sentence comes from the
        // same map as every other event rather than being special-cased text.
        const action: ActivityAction =
          item.kind === "note" ? "note_added" : item.event.action;
        const data = item.kind === "note" ? null : item.event.data;

        return (
          <li key={item.id} className="flex items-start gap-3 py-1.5">
            <EventMarker action={action} />
            <p className="pt-px text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">
                {item.actor?.name ?? "Someone"}
              </span>{" "}
              {activityActionText[action].phrase(data)}
              <Timestamp at={item.at} now={now} />
            </p>
          </li>
        );
      })}
    </ol>
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
