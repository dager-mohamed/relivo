import type { MentionItem } from "@repo/ui/components/kibo-ui/editor/mention";

import { companies, deals, people } from "#/mocks";

/**
 * What `@` offers inside a note: the three things a founder names when
 * describing a call.
 *
 * Reading fixtures directly is the temporary half — this becomes a search
 * procedure against the workspace. The shape it returns is the contract, so
 * only the body of `mentionSearch` changes when it does.
 */
const MAX_RESULTS = 8;

function catalogue(): MentionItem[] {
  const companyName = new Map(companies.map((c) => [c.id, c.name]));

  return [
    // `people.name` is nullable — a contact scraped from an email thread may
    // only have an address until someone fills the rest in.
    ...people.map((person) => ({
      id: person.id,
      label: person.name ?? person.email ?? "Unnamed",
      kind: "person",
      hint: person.companyId
        ? (companyName.get(person.companyId) ?? undefined)
        : undefined,
      href: `/people/${person.id}`,
    })),
    ...companies.map((company) => ({
      id: company.id,
      label: company.name,
      kind: "company",
      hint: company.domain ?? undefined,
      href: `/companies/${company.id}`,
    })),
    // A deal may be unnamed; `DEAL-10` is what it is called until then.
    ...deals.map((deal) => ({
      id: deal.id,
      label: deal.name ?? `DEAL-${String(deal.number)}`,
      kind: "deal",
      hint: `DEAL-${String(deal.number)}`,
      href: `/deals?deal=${deal.id}`,
    })),
  ];
}

/**
 * Substring, not fuzzy. CRM names are proper nouns — someone typing `@nol`
 * means Nolan, and a fuzzy matcher that also surfaces "Netscape Holdings"
 * makes the first keystroke less useful than no menu at all. The deal number
 * is searchable too, since `@DEAL-10` is how they are referred to in writing.
 */
export function mentionSearch(query: string): MentionItem[] {
  const items = catalogue();

  // Bare `@` shows a sample of each kind rather than the first eight rows,
  // which would be all people and teach someone that deals are not mentionable.
  if (!query) return roundRobin(items).slice(0, MAX_RESULTS);

  const needle = query.toLowerCase();
  return items
    .filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        (item.hint?.toLowerCase().includes(needle) ?? false),
    )
    .slice(0, MAX_RESULTS);
}

function roundRobin(items: MentionItem[]): MentionItem[] {
  const byKind = new Map<string, MentionItem[]>();
  for (const item of items) {
    const bucket = byKind.get(item.kind) ?? [];
    bucket.push(item);
    byKind.set(item.kind, bucket);
  }

  const buckets = [...byKind.values()];
  const out: MentionItem[] = [];
  for (let i = 0; out.length < items.length; i += 1) {
    const row = buckets.map((bucket) => bucket[i]).filter((item) => !!item);
    if (row.length === 0) break;
    out.push(...row);
  }
  return out;
}
