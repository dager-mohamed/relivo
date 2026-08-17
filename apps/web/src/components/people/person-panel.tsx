import * as React from "react";

import {
  PersonProperties,
  type PersonPatch,
} from "#/components/people/person-properties";
import { ActivityFeed } from "#/components/record-page/activity-feed";
import { NoteComposer } from "#/components/record-page/note-composer";
import { RecordLayout } from "#/components/record-page/record-layout";
import { draftNote, now, personFeed } from "#/mocks/person-activity";
import type { FeedItem } from "#/mocks/feed";
import type { PersonListRow } from "#/mocks/person-rows";

/**
 * A person's body, in the drawer and on the page both.
 *
 * No tabs. The company page splits Overview / Activity / Notes because it has
 * three screens' worth of linked records; a person has one short rail and a
 * feed, and tabbing between a feed and nothing is chrome pretending to be
 * structure.
 *
 * Mount with `key={person.id}` — the feed is seeded once, so editing a field
 * does not discard notes written in this session.
 */
export function PersonPanel({
  person,
  header,
  onEdit,
}: {
  person: PersonListRow;
  /** The masthead, on the page; the drawer has its own header bar instead. */
  header?: React.ReactNode;
  onEdit: (patch: PersonPatch) => void;
}) {
  const [feed, setFeed] = React.useState<FeedItem[]>(() => personFeed(person));

  const addNote = (body: string) =>
    setFeed((current) => [draftNote(person, body), ...current]);

  return (
    <RecordLayout
      panel={<PersonProperties person={person} now={now} onEdit={onEdit} />}
    >
      {header}
      <div className="flex flex-col gap-5 px-6 py-6">
        <NoteComposer onSubmit={addNote} />
        <ActivityFeed items={feed} now={now} />
      </div>
    </RecordLayout>
  );
}
