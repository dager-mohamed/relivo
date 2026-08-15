import * as React from "react";
import {
  BuildingOffice2Icon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";

import type { CompanyPatch } from "#/components/companies/company-properties";
import { CompanyProperties } from "#/components/companies/company-properties";
import { CompanyRelations } from "#/components/companies/company-relations";
import { EmptyState } from "#/components/empty-state";
import { ActivityFeed } from "#/components/record-page/activity-feed";
import { NoteComposer } from "#/components/record-page/note-composer";
import {
  companyFeed,
  draftNote,
  now,
  type FeedItem,
} from "#/mocks/company-activity";
import type { CompanyListRow } from "#/mocks/company-rows";

/**
 * The drawer's body: tabbed content on the left, the properties rail on the
 * right. Both halves are the record page's components, so opening a company
 * from the list and opening it full-screen can never show different fields.
 *
 * The rail hides on a container query, not `lg:` — the drawer's width has
 * nothing to do with the viewport's.
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
    <div className="@container flex min-h-0 flex-1">
      <Tabs
        defaultValue="home"
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-0"
      >
        <TabsList
          variant="line"
          className="w-full shrink-0 justify-start gap-5 border-b border-border px-4 group-data-horizontal/tabs:h-10"
        >
          <TabsTrigger value="home" className="flex-none gap-1.5 px-0">
            <BuildingOffice2Icon />
            Home
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-none gap-1.5 px-0">
            <ClockIcon />
            Activity
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex-none gap-1.5 px-0">
            <DocumentTextIcon />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="home"
          className="min-h-0 flex-1 overflow-y-auto p-4"
        >
          <CompanyRelations company={company} now={now} />
        </TabsContent>

        <TabsContent
          value="activity"
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
        >
          <NoteComposer onSubmit={addNote} />
          <ActivityFeed items={feed} now={now} />
        </TabsContent>

        <TabsContent
          value="notes"
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
        >
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
        </TabsContent>
      </Tabs>

      {/* Stays put while the content scrolls — properties are reference, not
          reading material. */}
      <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-border @3xl:block">
        <CompanyProperties company={company} now={now} onEdit={onEdit} />
      </aside>
    </div>
  );
}
