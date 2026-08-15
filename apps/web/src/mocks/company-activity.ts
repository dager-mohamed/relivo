import type { ActivityEvent, Note, User } from "@repo/db";

import type { CompanyListRow } from "./company-rows";
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

/** Fixture clock. Every relative timestamp on the record page reads from it. */
export const now = new Date("2026-08-15T09:00:00Z");

const actor: FeedActor = {
  id: currentUser.id,
  name: currentUser.name,
  image: currentUser.image,
};

/**
 * Derived rather than hand-written, so all eighteen fixtures have a feed —
 * including the ones with no deals and no people, which are the rows a record
 * page is most likely to break on.
 */
export function companyFeed(company: CompanyListRow): FeedItem[] {
  const created = company.createdAt.getTime();
  const span = now.getTime() - created;
  // Events sit just after creation; notes at fractions of the life so far, so
  // a company created three days ago and one created in June both read right.
  const after = (minutes: number) => new Date(created + minutes * 60_000);
  const into = (fraction: number) => new Date(created + span * fraction);

  const items: FeedItem[] = [
    event(company, "created", "record_created", null, after(0)),
    event(company, "domain", "field_set", {
      field: "Domain",
      to: company.domain,
    }),
  ];

  if (company.location) {
    items.push(
      event(
        company,
        "location",
        "field_set",
        { field: "Location", to: company.location },
        after(12),
      ),
    );
  }

  company.people.forEach((person, i) => {
    items.push(
      event(
        company,
        `person-${person.id}`,
        "person_linked",
        { target: person.name ?? "a contact" },
        after(60 + i * 45),
      ),
    );
  });

  company.feedback.forEach((item, i) => {
    items.push(
      event(
        company,
        `feedback-${item.id}`,
        "feedback_linked",
        { target: `“${item.title}”` },
        after(180 + i * 30),
      ),
    );
  });

  if (company.employees) {
    items.push(
      event(
        company,
        "employees",
        "field_changed",
        { field: "Employees", to: company.employees },
        into(0.3),
      ),
    );
  }

  const contact = company.people[0]?.name ?? "their team";
  if (company.deals.length > 0) {
    items.push(
      note(
        company,
        "intro",
        intros[pick(company, intros.length)]!(contact),
        into(0.55),
      ),
    );
  }

  // The differentiator, stated in the feed: a request with a deal behind it.
  const blocked = company.feedback[0];
  if (blocked && company.openDealCount > 0) {
    items.push(
      note(
        company,
        "blocked",
        `${contact} raised “${blocked.title}” again. It is the last open item before they can sign — worth pulling forward.`,
        into(0.9),
      ),
    );
  }

  return items.sort((a, b) => b.at.getTime() - a.at.getTime());
}

const intros: ((contact: string) => string)[] = [
  (contact) =>
    `Intro call with ${contact}. They are stitching three tools together by hand and lose the thread between calls. Wants the pipeline view in front of their team before procurement gets involved.`,
  (contact) =>
    `${contact} walked us through their current setup. Everything lives in a spreadsheet that only one person maintains, and it breaks the week she is on leave. Deadline is the end of the quarter.`,
  (contact) =>
    `Second call, this time with ${contact} and two of the people who would actually use it. Positive on the product, cautious on migration — they asked twice about getting their history out.`,
];

// Stable per company: the same record always reads the same way.
function pick(company: CompanyListRow, length: number): number {
  return company.name.length % length;
}

function event(
  company: CompanyListRow,
  slug: string,
  action: ActivityEvent["action"],
  data: Record<string, unknown> | null,
  at = new Date(company.createdAt.getTime() + 5 * 60_000),
): FeedItem {
  return {
    id: `${company.id}:${slug}`,
    at,
    actor,
    kind: "event",
    event: {
      id: `${company.id}:${slug}`,
      workspaceId: workspace.id,
      companyId: company.id,
      dealId: null,
      personId: null,
      actorId: actor.id,
      action,
      targetType: null,
      targetId: null,
      data,
      createdAt: at,
    },
  };
}

function note(
  company: CompanyListRow,
  slug: string,
  body: string,
  at: Date,
): FeedItem {
  return {
    id: `${company.id}:note-${slug}`,
    at,
    actor,
    kind: "note",
    note: {
      id: `${company.id}:note-${slug}`,
      workspaceId: workspace.id,
      companyId: company.id,
      dealId: null,
      personId: null,
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
export function draftNote(company: CompanyListRow, body: string): FeedItem {
  drafts += 1;
  return note(company, `draft-${drafts}`, body, now);
}
