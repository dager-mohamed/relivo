import * as React from "react";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

import { Button } from "@repo/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";

import type { NoteDoc } from "@repo/schema";

import { CompanyHeader } from "#/components/companies/company-header";
import {
  CompanyProperties,
  type CompanyPatch,
} from "#/components/companies/company-properties";
import { CompanyRelations } from "#/components/companies/company-relations";
import { EmptyState } from "#/components/empty-state";
import { ActivityFeed } from "#/components/record-page/activity-feed";
import { NoteComposer } from "#/components/record-page/note-composer";
import { RecordLayout } from "#/components/record-page/record-layout";
import {
  companyFeed,
  draftNote,
  now,
  type FeedItem,
} from "#/mocks/company-activity";
import type { CompanyListRow } from "#/mocks/company-rows";

/**
 * The record page body. Mount with `key={company.id}` — the feed is seeded
 * once from the company so that editing a field does not discard notes written
 * in this session.
 *
 * Overview leads rather than the raw feed: what is linked here and what it is
 * worth answers more questions than the event log does, and the last three
 * events ride along underneath so the landing view still shows what happened.
 */
export function CompanyRecord({
  company,
  onEdit,
}: {
  company: CompanyListRow;
  onEdit: (patch: CompanyPatch) => void;
}) {
  const [tab, setTab] = React.useState("overview");
  const [feed, setFeed] = React.useState<FeedItem[]>(() =>
    companyFeed(company),
  );

  const notes = feed.filter((item) => item.kind === "note");
  const addNote = (body: NoteDoc) =>
    setFeed((current) => [draftNote(company, body), ...current]);

  return (
    <RecordLayout
      panel={<CompanyProperties company={company} now={now} onEdit={onEdit} />}
    >
      <CompanyHeader
        company={company}
        lastTouch={feed[0]?.at ?? null}
        now={now}
        onEdit={onEdit}
      />

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="flex flex-1 flex-col gap-0"
      >
        {/* Sticky, so scrolling the masthead away never costs you the tabs.
            The height has to match TabsList's own variant chain — a plain
            `h-11` loses to `group-data-horizontal/tabs:h-8` on specificity and
            silently does nothing. */}
        <TabsList
          variant="line"
          className="sticky top-0 z-10 w-full shrink-0 justify-start gap-5 border-b border-border bg-background px-6 group-data-horizontal/tabs:h-11"
        >
          <TabsTrigger value="overview" className="flex-none px-0">
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-none px-0">
            Activity
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex-none gap-1.5 px-0">
            Notes
            {notes.length > 0 ? <Count value={notes.length} /> : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-8 px-6 py-6">
          <CompanyRelations company={company} now={now} />

          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Recent activity</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTab("activity")}
                className="ml-auto text-muted-foreground"
              >
                View all
              </Button>
            </div>
            <ActivityFeed items={feed.slice(0, 3)} now={now} anchor={false} />
          </section>
        </TabsContent>

        <TabsContent value="activity" className="flex flex-col gap-5 px-6 py-6">
          <NoteComposer onSubmit={addNote} />
          <ActivityFeed items={feed} now={now} />
        </TabsContent>

        <TabsContent value="notes" className="flex flex-col gap-5 px-6 py-6">
          <NoteComposer onSubmit={addNote} />
          {notes.length === 0 ? (
            <EmptyState
              icon={DocumentTextIcon}
              title="No notes yet"
              description="Write down what was said on a call and it stays attached to this company."
            />
          ) : (
            <ActivityFeed items={notes} now={now} />
          )}
        </TabsContent>
      </Tabs>
    </RecordLayout>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="rounded-full bg-muted px-1.5 text-[0.6875rem] leading-4 font-medium text-muted-foreground tabular-nums">
      {value}
    </span>
  );
}
