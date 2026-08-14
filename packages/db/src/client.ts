import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// No .env loading here — the `db:*` scripts and apps/web's dev script load the
// root .env via dotenv-cli. Deployed environments set it for real.
const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env at the repo root, or " +
      "run this through one of the `db:*` package scripts, which load it.",
  );
}

// Exported so scripts can close it — postgres.js holds the process open.
export const client = postgres(url);

// Drizzle v1: `drizzle(client)` positional is not a valid overload, and there
// is no `{ schema }` option (config type is Omit<DrizzleConfig, 'schema'>).
// 0.3x snippets will not typecheck.
export const db = drizzle({ client });

export type Database = typeof db;
