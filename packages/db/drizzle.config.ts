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
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
