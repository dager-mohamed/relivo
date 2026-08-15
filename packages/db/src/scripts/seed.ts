import { eq } from "drizzle-orm";

import { client, db } from "../client";
import { seedDefaultStages } from "../queries";
import { companies, dealStages, workspaces, type NewCompany } from "../schema";

const seedWorkspace = { name: "Relivo", slug: "relivo" };

const seedCompany: Omit<NewCompany, "workspaceId"> = {
  name: "Relivo",
  domain: "relivo.dev",
};

async function main() {
  // Idempotent throughout — re-running against an existing volume is a no-op.
  await db
    .insert(workspaces)
    .values(seedWorkspace)
    .onConflictDoNothing({ target: workspaces.slug });

  // onConflictDoNothing returns no rows on the second run, hence re-select.
  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.slug, seedWorkspace.slug));

  if (!workspace) {
    throw new Error("seed workspace missing immediately after insert");
  }

  // Guarded rather than upserted — stages have no natural key to conflict on.
  const existingStages = await db
    .select({ id: dealStages.id })
    .from(dealStages)
    .where(eq(dealStages.workspaceId, workspace.id))
    .limit(1);

  if (existingStages.length === 0) {
    const stages = await seedDefaultStages(db, workspace.id);
    console.log(`seeded ${String(stages.length)} default deal stages`);
  }

  const inserted = await db
    .insert(companies)
    .values({ ...seedCompany, workspaceId: workspace.id })
    .onConflictDoNothing({
      target: [companies.workspaceId, companies.domain],
    })
    .returning();

  const company = inserted[0];

  if (company) {
    console.log(`inserted company ${company.id} (${company.domain})`);
  } else {
    console.log(
      `company ${seedCompany.domain} already present — nothing to do`,
    );
  }
}

try {
  await main();
} finally {
  await client.end();
}
