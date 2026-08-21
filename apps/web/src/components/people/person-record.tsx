import * as React from "react";

import type { NoteDoc } from "@repo/schema";

import {
  PersonProperties,
  type PersonPatch,
} from "#/components/people/person-properties";
import { ActivityFeed } from "#/components/record-page/activity-feed";
import { NoteComposer } from "#/components/record-page/note-composer";
import { RecordLayout } from "#/components/record-page/record-layout";
import {
  draftNote,
  editFeedNote,
  now,
  personFeed,
} from "#/mocks/person-activity";
import type { FeedItem } from "#/mocks/feed";
import type { PersonListRow } from "#/mocks/person-rows";

/**
 * A person on the record page. No tabs here: the page has room for the rail
 * and the feed at once, and tabbing between a feed and nothing is chrome
 * pretending to be structure. The drawer tabs because 400px has room for one
 * of them, not both.
 *
 * Mount with `key={person.id}`, as in the drawer.
 */
export function PersonRecord({
  person,
  header,
  onEdit,
}: {
  person: PersonListRow;
  /** The masthead, which the drawer's own header bar stands in for. */
  header?: React.ReactNode;
  onEdit: (patch: PersonPatch) => void;
}) {
  const [feed, setFeed] = React.useState<FeedItem[]>(() => personFeed(person));

  const addNote = (body: NoteDoc) =>
    setFeed((current) => [draftNote(person, body), ...current]);
  const editNote = (id: string, body: NoteDoc) =>
    setFeed((current) => editFeedNote(current, id, body));

  return (
    <RecordLayout
      panel={<PersonProperties person={person} now={now} onEdit={onEdit} />}
    >
      {header}
      <div className="flex flex-col gap-5 px-6 py-6">
        <NoteComposer onSubmit={addNote} />
        <ActivityFeed items={feed} now={now} onEditNote={editNote} />
      </div>
    </RecordLayout>
  );
}
