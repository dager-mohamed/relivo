/**
 * The top of a record page, and the reason the full page is worth opening over
 * the drawer: identity on the left, the figures the founder actually came for
 * on the right, filling the width instead of stacking down it.
 *
 * Figures are typographic, not boxed — a metric card grid would compete with
 * the name for the eye, and the name is what tells you where you are. No
 * colour on any of them either; colour is reserved for record state.
 */
export function RecordMasthead({
  avatar,
  title,
  subtitle,
  stats,
}: {
  avatar: React.ReactNode;
  /** Usually an editable field — renaming happens here, not in a form. */
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  stats: { label: string; value: string }[];
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6 border-b border-border px-6 py-5">
      <div className="flex min-w-0 items-center gap-2.5">
        {avatar}
        <div className="flex min-w-0 flex-col">
          {title}
          {subtitle}
        </div>
      </div>

      {stats.length > 0 ? (
        <dl className="flex flex-wrap items-start gap-x-9 gap-y-4">
          {stats.map((stat) => (
            <Stat key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </dl>
      ) : null}
    </header>
  );
}

/** `dt` before `dd` is the only legal order; the value still reads first. */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse gap-0.5">
      <dt className="text-[0.6875rem] leading-4 font-medium text-muted-foreground">
        {label}
      </dt>
      <dd className="text-lg leading-6 font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/** Title styling for the masthead, so the two record pages can't disagree. */
export const mastheadTitleClass =
  "text-[1.375rem] leading-8 font-semibold tracking-tight";
