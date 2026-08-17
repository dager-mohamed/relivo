import {
  ClockIcon,
  DocumentTextIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";

/**
 * The drawer body: one column, tabs across the top.
 *
 * The fields sit *under* Home rather than in a rail beside it. A record opened
 * from a list is read narrow — the feed is a view onto the record, not the
 * record itself, so it earns a tab rather than half the width. The rail-beside-
 * content shape is still right on the full page, where there is room for both.
 *
 * Home gets no padding of its own: its sections carry theirs, and their
 * dividers have to reach both edges to read as one column.
 */
export function RecordPanel({
  home,
  activity,
  notes,
}: {
  home: React.ReactNode;
  activity: React.ReactNode;
  notes: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="home" className="flex min-h-0 flex-1 flex-col gap-0">
      {/* The height has to match TabsList's own variant chain — a plain `h-10`
          loses to `group-data-horizontal/tabs:h-8` on specificity. */}
      <TabsList
        variant="line"
        className="w-full shrink-0 justify-start gap-4 border-b border-border px-3 group-data-horizontal/tabs:h-10"
      >
        <TabsTrigger value="home" className="flex-none gap-1.5 px-0">
          <Squares2X2Icon />
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

      <TabsContent value="home" className="min-h-0 flex-1 overflow-y-auto">
        {home}
      </TabsContent>

      <TabsContent
        value="activity"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4"
      >
        {activity}
      </TabsContent>

      <TabsContent
        value="notes"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4"
      >
        {notes}
      </TabsContent>
    </Tabs>
  );
}
