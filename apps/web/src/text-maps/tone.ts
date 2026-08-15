/**
 * Names a semantic token, never a colour — see `--info` / `--warning` /
 * `--success` / `--destructive` in packages/ui/src/styles/globals.css.
 * Shared, because deal stages, feedback statuses and step urgency all use it.
 */
export type Tone = "neutral" | "info" | "warning" | "success" | "destructive";
