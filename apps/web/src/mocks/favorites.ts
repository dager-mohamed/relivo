import { companies } from "./companies";
import { deals } from "./deals";
import { people } from "./people";

/**
 * Favorites hold any record type in one ordered list, so they are a view over
 * the other fixtures rather than a table of their own — the real one arrives
 * with RELIV-48.
 */
export type Favorite =
  | { kind: "company"; id: string; label: string }
  | { kind: "person"; id: string; label: string }
  | { kind: "deal"; id: string; label: string; value: number | null };

export const favorites: Favorite[] = [
  { kind: "company", id: companies[0]!.id, label: companies[0]!.name },
  {
    kind: "deal",
    id: deals[0]!.id,
    label: companies[1]!.name,
    value: deals[0]!.value,
  },
  {
    kind: "person",
    id: people[1]!.id,
    // name is nullable on people; email is the documented fallback.
    label: people[1]!.name ?? people[1]!.email!,
  },
  { kind: "company", id: companies[3]!.id, label: companies[3]!.name },
  {
    kind: "deal",
    id: deals[1]!.id,
    label: companies[2]!.name,
    value: deals[1]!.value,
  },
];
