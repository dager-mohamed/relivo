import { boolean, pgTable, text } from "drizzle-orm/pg-core";

import { timestamps } from "./columns";

// Better Auth's core user model. Only `user` is defined — session, account and
// verification arrive with the auth epic. id is text because Better Auth
// generates its own ids. Written from the documented model, not a running
// install — verify against Better Auth's docs before wiring the adapter.
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
