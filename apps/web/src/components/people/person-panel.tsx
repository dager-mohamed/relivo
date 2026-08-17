import * as React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

import {
  PersonProperties,
  type PersonPatch,
} from "#/components/people/person-properties";
import { EmptyState } from "#/components/empty-state";
import { ActivityFeed } from "#/components/record-page/activity-feed";
import { NoteComposer } from "#/components/record-page/note-composer";
import { RecordPanel } from "#/components/record-page/record-panel";
import { draftNote, now, personFeed } from "#/mocks/person-activity";
import type { FeedItem } from "#/mocks/feed";
import type { PersonListRow } from "#/mocks/person-rows";

/**
 * A person in the drawer: the fields lead, the feed is a tab behind them.
 *
 * The record page mounts `PersonRecord` instead — same components, laid out
 * for the room it has. Both read `PersonProperties`, so the two surfaces
 * cannot disagree about what a person has.
 *
 * Mount with `key={person.id}` — the feed is seeded once, so editing a field
 * does not discard notes written in this session.
 */
export function PersonPanel({
  person,
  onEdit,
}: {
  person: PersonListRow;
  onEdit: (patch: PersonPatch) => void;
}) {
  const [feed, setFeed] = React.useState<FeedItem[]>(() => personFeed(person));

  const notes = feed.filter((item) => item.kind === "note");
  const addNote = (body: string) =>
    setFeed((current) => [draftNote(person, body), ...current]);

  return (
    <RecordPanel
      home={<PersonProperties person={person} now={now} onEdit={onEdit} />}
      activity={
        <>
          <NoteComposer onSubmit={addNote} />
          <ActivityFeed items={feed} now={now} />
        </>
      }
      notes={
        <>
          <NoteComposer onSubmit={addNote} />
          {notes.length === 0 ? (
            <EmptyState
              icon={DocumentTextIcon}
              title="No notes yet"
              description="Write down what was said on a call and it stays attached to this person."
            />
          ) : (
            <ActivityFeed items={notes} now={now} notes="full" />
          )}
        </>
      }
    />
  );
}
