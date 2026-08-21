/**
 * A record page is its content plus a properties rail — the shape PRODUCT.md
 * gives companies, deals and people alike, so this frame is shared rather than
 * rebuilt per entity.
 *
 * Container queries, not `lg:`. The centre column's width depends on whether
 * the sidebar is open, which a viewport breakpoint cannot see. Below the
 * threshold the rail moves *under* the content instead of disappearing, so no
 * field on the record is ever unreachable.
 */
export function RecordLayout({
  panel,
  children,
}: {
  panel: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="@container flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto @4xl:flex-row @4xl:overflow-hidden">
        <div className="flex min-w-0 flex-col @4xl:min-h-0 @4xl:flex-1 @4xl:overflow-y-auto">
          {children}
        </div>

        {/* Left of the content, at 340 against a fluid rest: the fields are what
            the record *is*, and the tabs beside them are views onto it.

            `order`, not DOM order — stacked, the masthead has to come first or
            you land on a list of fields with nothing saying whose they are. */}
        <aside className="shrink-0 border-t border-border @4xl:order-first @4xl:w-[340px] @4xl:overflow-y-auto @4xl:border-t-0 @4xl:border-r">
          {panel}
        </aside>
      </div>
    </div>
  );
}
