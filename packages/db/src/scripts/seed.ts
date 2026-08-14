import { client, db } from "../client";
import { companies, type NewCompany } from "../schema";

const seed: NewCompany = {
  name: "Relivo",
  domain: "relivo.dev",
};

async function main() {
  // Idempotent — re-running against an existing volume is a no-op.
  const inserted = await db
    .insert(companies)
    .values(seed)
    .onConflictDoNothing({ target: companies.domain })
    .returning();

  const row = inserted[0];

  if (row) {
    console.log(`inserted company ${row.id} (${row.domain})`);
  } else {
    console.log(`company ${seed.domain} already present — nothing to do`);
  }
}

try {
  await main();
} finally {
  await client.end();
}
