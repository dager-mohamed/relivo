import * as React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

import type { CompanyPatch } from "#/components/companies/company-properties";
import { CompanyProperties } from "#/components/companies/company-properties";
import { CompanyPanelRelations } from "#/components/companies/company-relations";
import { EmptyState } from "#/components/empty-state";
import { ActivityFeed } from "#/components/record-page/activity-feed";
import { NoteComposer } from "#/components/record-page/note-composer";
import { RecordPanel } from "#/components/record-page/record-panel";
import {
  companyFeed,
  draftNote,
  now,
  type FeedItem,
} from "#/mocks/company-activity";
import type { CompanyListRow } from "#/mocks/company-rows";

/**
 * A company in the drawer: fields, then what is linked to them, then the feed
 * behind a tab. The record page mounts `CompanyRecord` instead — same
 * components, laid out for the room it has, so the two surfaces cannot show
 * different fields.
 *
 * Mount with `key={company.id}`; the feed is seeded once, as on the page.
 */
export function CompanyPanel({
  company,
  onEdit,
}: {
  company: CompanyListRow;
  onEdit: (patch: CompanyPatch) => void;
}) {
  const [feed, setFeed] = React.useState<FeedItem[]>(() =>
    companyFeed(company),
  );

  const notes = feed.filter((item) => item.kind === "note");
  const addNote = (body: string) =>
    setFeed((current) => [draftNote(company, body), ...current]);

  return (
    <RecordPanel
      home={
        <CompanyProperties
          company={company}
          now={now}
          onEdit={onEdit}
          relations={<CompanyPanelRelations company={company} now={now} />}
        />
      }
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
              description="Write down what was said on a call and it stays attached to this company."
            />
          ) : (
            <ActivityFeed items={notes} now={now} notes="full" />
          )}
        </>
      }
    />
  );
}
