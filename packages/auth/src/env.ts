import { z } from "zod";

// A key left blank in .env arrives as "" rather than undefined, and "" is not
// what any of these mean.
const blankAsMissing = (value: unknown) => (value === "" ? undefined : value);

// Server-only, validated at import time: a missing secret should stop the
// process at boot, not on someone's first sign-in.
const authEnv = z
  .object({
    // 32 chars is Better Auth's own floor — it derives encryption and signing
    // keys from this. Generate one with `openssl rand -base64 32`.
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.preprocess(
      blankAsMissing,
      z.url().default("http://localhost:3000"),
    ),
    // Optional on purpose: a deployment without a Google project still boots,
    // and the sign-in page explains itself instead of 500ing.
    GOOGLE_CLIENT_ID: z.preprocess(blankAsMissing, z.string().optional()),
    GOOGLE_CLIENT_SECRET: z.preprocess(blankAsMissing, z.string().optional()),
  })
  // One of the two set is always a mistake, and a silently disabled Google
  // button is worse to debug than a boot error.
  .refine(
    (v) => Boolean(v.GOOGLE_CLIENT_ID) === Boolean(v.GOOGLE_CLIENT_SECRET),
    "Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither.",
  );

const parsed = authEnv.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    "Auth environment is invalid. See .env.example at the repo root.\n" +
      z.prettifyError(parsed.error),
  );
}

export const env = parsed.data;

export const googleCredentials =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
    : undefined;
