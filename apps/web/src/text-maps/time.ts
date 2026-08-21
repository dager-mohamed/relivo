/**
 * PRODUCT.md: dates read `Sep 09`, activity reads relative (`6 days ago`).
 *
 * `now` is a parameter rather than `Date.now()` because these render during
 * SSR and again on hydration — a clock that moved between the two produces a
 * text mismatch React has to repair.
 */
export function relativeTime(date: Date, now: Date): string {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${plural(minutes, "minute")} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${plural(hours, "hour")} ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${plural(days, "day")} ago`;

  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${plural(weeks, "week")} ago`;

  const months = Math.round(days / 30);
  if (months < 12) return `${plural(months, "month")} ago`;

  return `${plural(Math.round(days / 365), "year")} ago`;
}

/** `Sep 09` — the year only when it isn't the current one. */
export function formatDate(date: Date, now: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

/**
 * `deals.closeDate` is a date-only string, not a timestamp. `new Date("2026-09-09")`
 * parses as UTC midnight and renders as the 8th west of Greenwich — the exact
 * bug the column's own comment warns about. Build a local date instead.
 */
export function formatDateString(iso: string, now: Date): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return formatDate(new Date(year, month - 1, day), now);
}

/** Full form, for the title attribute behind a relative timestamp. */
export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}
