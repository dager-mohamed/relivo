import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { db } from "@repo/db/client";
import { accounts, sessions, users, verifications } from "@repo/db/schema";

import { env, googleCredentials } from "./env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    // Our drizzle instance is built without a schema, so the adapter cannot
    // discover the tables — and Better Auth's model names are singular while
    // ours are plural. Both problems, one mapping.
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  socialProviders: googleCredentials ? { google: googleCredentials } : {},
  // Better Auth's own Start integration: it forwards Set-Cookie through
  // Start's response context, so `auth.api` called from a server function sets
  // the session cookie the same way the mounted handler does. Must stay last
  // in the array — the plugin warns at runtime otherwise.
  plugins: [tanstackStartCookies()],
});

export const enabledSocialProviders = {
  google: Boolean(googleCredentials),
};

export type Auth = typeof auth;

// { user, session } as Better Auth returns it from getSession — the shape the
// tRPC context and route guards pass around.
export type AuthSession = typeof auth.$Infer.Session;
