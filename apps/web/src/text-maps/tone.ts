/**
 * Names a semantic token, never a colour — see `--info` / `--warning` /
 * `--success` / `--destructive` in packages/ui/src/styles/globals.css.
 * Shared, because deal stages, feedback statuses and step urgency all use it.
 */
export type Tone = "neutral" | "info" | "warning" | "success" | "destructive";

// One map per role rather than one per component. Tailwind only sees classes
// written out in full, so these have to be literals — and `Record<Tone, …>`
// means adding a tone breaks here rather than falling through to no colour.

/** Icons and text that carry the state themselves. */
export const toneText: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  info: "text-info",
  warning: "text-warning",
  success: "text-success",
  destructive: "text-destructive",
};

/** Hollow ring — a state in progress, as on a deal chip. */
export const toneRing: Record<Tone, string> = {
  neutral: "border-muted-foreground",
  info: "border-info",
  warning: "border-warning",
  success: "border-success",
  destructive: "border-destructive",
};

/** Filled dot — a state that simply is, as on a feedback chip. */
export const toneDot: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  info: "bg-info",
  warning: "bg-warning",
  success: "bg-success",
  destructive: "bg-destructive",
};
