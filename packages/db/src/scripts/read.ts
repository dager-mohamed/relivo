import { client, db } from "../client"
import { companies, type Company } from "../schema"

async function main() {
  // Annotation is deliberate: asserts the query builder infers exactly Company.
  const rows: Company[] = await db.select().from(companies)

  console.log(`read ${rows.length} company row(s)`)

  for (const row of rows) {
    console.log({
      id: row.id,
      name: row.name,
      domain: row.domain,
      // Compiles only because createdAt is inferred as Date, not string.
      createdAt: row.createdAt.toISOString(),
    })
  }
}

try {
  await main()
} finally {
  await client.end()
}
