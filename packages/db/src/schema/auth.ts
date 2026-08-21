import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { timestamps } from "./columns";

// Better Auth owns these four tables — it writes every row. Shape checked
// against `pnpm auth:generate` (packages/auth) for 1.7, not written from
// memory; re-run it after a Better Auth upgrade and diff. The drizzle adapter
// resolves fields by the property key here, not by the SQL column name, so the
// camelCase keys are load-bearing while the snake_case names are ours.
// Timestamps come from ./columns, so these are timestamptz where the generator
// emits a bare timestamp — wider, and the adapter passes Date objects either
// way. No drizzle `relations()`: those only matter for the adapter's
// `advanced.database.joins` optimisation, which is off.

// id is text because Better Auth generates its own ids.
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  ...timestamps,
});

export const sessions = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // The value in the session cookie; looked up on every request.
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const accounts = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Added in Better Auth 1.7 and NOT NULL: the provider's issuer URL, or
    // "credential" for email and password. Identity is (issuer, accountId).
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    // Hashed, and only ever set for the email and password provider.
    password: text("password"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("account_issuer_account_id_idx").on(t.issuer, t.accountId),
    index("account_user_id_idx").on(t.userId),
  ],
);

// Short-lived tokens: email verification, password reset, OAuth state.
export const verifications = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
