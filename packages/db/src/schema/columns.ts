import { timestamp } from "drizzle-orm/pg-core";

// updatedAt is maintained by Drizzle on .update(), not a Postgres trigger —
// raw SQL updates won't touch it.
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
