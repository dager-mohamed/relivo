import { parsePhoneNumberFromString } from "libphonenumber-js";
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

/**
 * Where a number with no country code is assumed to be from.
 *
 * Only bare local input depends on this — anything starting with `+` is read
 * as written, and a local number from elsewhere fails validation rather than
 * being silently filed as the wrong country. Replace with the workspace's
 * locale the day there is one.
 */
export const defaultPhoneCountry = "US" as const;

/**
 * Canonical E.164, or null when the input is not a real number.
 *
 * Phone columns are free text, so without this a field takes "call me maybe"
 * and nothing downstream can dial it. The extension rides along when there is
 * one: the column is a single text field, and an extension is often the only
 * way to reach a desk.
 */
export function normalizePhone(input: string): string | null {
  const parsed = parsePhoneNumberFromString(input.trim(), defaultPhoneCountry);
  if (!parsed?.isValid()) return null;
  return parsed.ext ? `${parsed.number} ext. ${parsed.ext}` : parsed.number;
}

/** How a stored number reads: `+1 408 555 0163`. Unparseable input passes through. */
export function formatPhone(value: string): string {
  const parsed = parsePhoneNumberFromString(value, defaultPhoneCountry);
  return parsed?.isValid() ? parsed.formatInternational() : value;
}

export function isPhone(value: string): boolean {
  return normalizePhone(value) !== null;
}

export const phoneMessage = "Enter a number like +1 408 555 0163";

export const phone = z.string().trim().max(50).refine(isPhone, phoneMessage);
export type Phone = z.infer<typeof phone>;
