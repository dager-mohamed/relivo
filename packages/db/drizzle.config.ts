import { defineConfig } from "drizzle-kit";

// Run via the `db:*` scripts — they load the root .env with dotenv-cli.
const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Use the package scripts (pnpm db:generate, " +
      "pnpm db:migrate, ...).",
  );
}

export default defineConfig({
  dialect: "postgresql",
  // The barrel, not a glob: every table reaches migrations through this
  // re-export, so a file nobody exports is a file drizzle-kit never sees.
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
