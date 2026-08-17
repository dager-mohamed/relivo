import type { ActivityAction } from "@repo/schema";

import {
  feedDraftNote,
  feedEvent,
  feedNote,
  newestFirst,
  type FeedItem,
  type FeedOwner,
} from "./feed";
import { personLabel, type PersonListRow } from "./person-rows";

/**
 * Shorter than a company's, on purpose. A person accumulates far less history
 * than the account around them — most of what happens, happens on the company
 * or the deal — and the empty-ish feed is the honest picture until email sync
 * lands and drops every message to and from them in here.
 */
export function personFeed(person: PersonListRow): FeedItem[] {
  const owner: FeedOwner = { kind: "person", id: person.id };
  const created = person.createdAt.getTime();
  const after = (minutes: number) => new Date(created + minutes * 60_000);

  const event = (
    slug: string,
    action: ActivityAction,
    data: Record<string, unknown> | null,
    at: Date,
  ) => feedEvent(owner, slug, action, data, at);

  const items: FeedItem[] = [
    event("created", "record_created", null, after(0)),
  ];

  if (person.email) {
    items.push(
      event(
        "email",
        "field_set",
        { field: "Email", to: person.email },
        after(2),
      ),
    );
  }

  if (person.role) {
    items.push(
      event("role", "field_set", { field: "Role", to: person.role }, after(8)),
    );
  }

  if (person.company) {
    items.push(
      event(
        "company",
        "person_linked",
        { target: person.company.name },
        after(15),
      ),
    );
  }

  person.deals.forEach((deal, i) => {
    items.push(
      event(
        `deal-${deal.id}`,
        "person_linked",
        { target: `DEAL-${deal.number}` },
        after(45 + i * 30),
      ),
    );
    items.push(
      feedNote(
        owner,
        `deal-${deal.id}`,
        `${personLabel(person)} is the one who replies. Everything on DEAL-${deal.number} goes through them — copy anyone else and it stalls.`,
        after(120 + i * 30),
      ),
    );
  });

  return newestFirst(items);
}

export function draftNote(person: PersonListRow, body: string): FeedItem {
  return feedDraftNote({ kind: "person", id: person.id }, body);
}

export { now, type FeedItem } from "./feed";
