import { z } from "zod";

// Integer minor units (cents). The feedback board sums deal values on every
// render, and float addition drifts.
export const money = z.int().min(0);
export type Money = z.infer<typeof money>;

// A bare hostname — no protocol, no path, at least one dot. This only decides
// what is accepted; `normalizeDomain` below turns input into that shape.
export const domain = z
  .string()
  .trim()
  .toLowerCase()
  .max(253)
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/,
    "Must be a domain like example.com",
  );
export type Domain = z.infer<typeof domain>;

/**
 * Turns what people actually paste — a full URL, a `www.` host, a trailing
 * slash — into the bare hostname `domain` accepts.
 *
 * Runs before validation, not after. A create form has to answer "is this
 * one already here?" while you type, and the normalize-domain job only runs
 * once a row exists.
 */
export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#].*$/, "")
    .replace(/\.$/, "");
}

// "Acme" from "acme.com" — the placeholder until enrichment returns, which
// is why name is NOT NULL rather than nullable with a `?? domain` at every
// render site.
export function companyNameFromDomain(value: string): string {
  const label = value.split(".")[0] ?? value;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Keyed by platform rather than fixed columns — providers disagree on
// coverage. Insertion order is the panel's "+N" display order.
export const socials = z.record(z.string().trim().min(1), z.url());
export type Socials = z.infer<typeof socials>;
