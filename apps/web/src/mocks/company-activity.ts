import type { ActivityAction } from "@repo/schema";

import type { CompanyListRow } from "./company-rows";
import {
  feedDraftNote,
  feedEvent,
  feedNote,
  newestFirst,
  now,
  type FeedItem,
  type FeedOwner,
} from "./feed";

/**
 * Derived rather than hand-written, so all eighteen fixtures have a feed —
 * including the ones with no deals and no people, which are the rows a record
 * page is most likely to break on.
 */
export function companyFeed(company: CompanyListRow): FeedItem[] {
  const owner: FeedOwner = { kind: "company", id: company.id };
  const created = company.createdAt.getTime();
  const span = now.getTime() - created;
  // Events sit just after creation; notes at fractions of the life so far, so
  // a company created three days ago and one created in June both read right.
  const after = (minutes: number) => new Date(created + minutes * 60_000);
  const into = (fraction: number) => new Date(created + span * fraction);

  const event = (
    slug: string,
    action: ActivityAction,
    data: Record<string, unknown> | null,
    at: Date,
  ) => feedEvent(owner, slug, action, data, at);

  const items: FeedItem[] = [
    event("created", "record_created", null, after(0)),
    event(
      "domain",
      "field_set",
      { field: "Domain", to: company.domain },
      after(5),
    ),
  ];

  if (company.location) {
    items.push(
      event(
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
      feedNote(
        owner,
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
      feedNote(
        owner,
        "blocked",
        `${contact} raised “${blocked.title}” again. It is the last open item before they can sign — worth pulling forward.`,
        into(0.9),
      ),
    );
  }

  return newestFirst(items);
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

export function draftNote(company: CompanyListRow, body: string): FeedItem {
  return feedDraftNote({ kind: "company", id: company.id }, body);
}

export { now, type FeedActor, type FeedItem } from "./feed";
