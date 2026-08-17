import { normalizeDomain } from "@repo/schema";
import { z } from "zod";

/**
 * What the create dialog collects.
 *
 * `name` and `companyId` are both nullable-meaning-derived, the same trick the
 * company draft uses for its name: the field follows the address until you
 * override it, and clearing your override hands it back. A separate "touched"
 * flag beside each would let the two disagree.
 */
export type PersonDraft = {
  email: string;
  /** null = derive from the address. */
  name: string | null;
  /** null = match from the address domain. */
  companyId: string | null;
  role: string | null;
  phone: string | null;
};

export const emptyPersonDraft: PersonDraft = {
  email: "",
  name: null,
  companyId: null,
  role: null,
  phone: null,
};

/** The resolved values, which is what actually gets filed. */
export type NewPerson = {
  name: string | null;
  email: string | null;
  companyId: string | null;
  role: string | null;
  phone: string | null;
};

const email = z.email();

/**
 * "nolan.bushnell@atari.com" → "Nolan Bushnell".
 *
 * A guess, and sometimes a wrong one — "procurement@" becomes "Procurement".
 * That is why the name line stays editable: the guess is a head start, not a
 * decision.
 */
export function nameFromEmail(address: string): string {
  const local = address.split("@")[0] ?? "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function draftPersonName(draft: PersonDraft): string {
  if (draft.name !== null) return draft.name;
  const address = draft.email.trim();
  return address.includes("@") ? nameFromEmail(address) : "";
}

/**
 * The company whose domain matches the address. This is what email sync does
 * on every message it ingests, so doing it here means a person typed by hand
 * and a person discovered in the inbox land in the same place.
 */
export function companyFromEmail<T extends { domain: string }>(
  address: string,
  companies: readonly T[],
): T | null {
  const at = address.lastIndexOf("@");
  if (at < 0) return null;

  const host = normalizeDomain(address.slice(at + 1));
  if (host === "") return null;

  return companies.find((row) => normalizeDomain(row.domain) === host) ?? null;
}

/** The company on the draft — chosen if you chose one, matched if you didn't. */
export function draftPersonCompany<T extends { id: string; domain: string }>(
  draft: PersonDraft,
  companies: readonly T[],
): T | null {
  if (draft.companyId !== null) {
    return companies.find((row) => row.id === draft.companyId) ?? null;
  }
  return companyFromEmail(draft.email.trim(), companies);
}

/**
 * Whether the draft can be filed, and if not, what to say about it.
 *
 * A name alone is enough, and so is an address alone — `people` has a check
 * constraint saying exactly that, because email sync creates people who have
 * nothing but an address. `duplicate` guards the unique index on email.
 */
export type PersonDraftStatus<T> =
  | { kind: "empty" }
  | { kind: "invalid"; message: string }
  | { kind: "duplicate"; person: T }
  | { kind: "ready"; email: string | null; name: string | null };

export function personDraftStatus<T extends { email: string | null }>(
  draft: PersonDraft,
  // Everyone, never the filtered view — an address hidden by a filter is
  // still taken.
  existing: readonly T[],
): PersonDraftStatus<T> {
  const address = draft.email.trim().toLowerCase();
  const name = draftPersonName(draft).trim();

  if (address === "" && name === "") return { kind: "empty" };

  if (address !== "") {
    if (!email.safeParse(address).success) {
      return {
        kind: "invalid",
        message: "Enter an address like name@company.com",
      };
    }

    const clash = existing.find((row) => row.email?.toLowerCase() === address);
    if (clash) return { kind: "duplicate", person: clash };
  }

  return {
    kind: "ready",
    email: address === "" ? null : address,
    name: name === "" ? null : name,
  };
}
