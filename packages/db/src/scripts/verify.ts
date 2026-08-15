import { client } from "../client";

// Asserts the hand-written DDL survived — a dropped HNSW index or missing
// trigger fails silently otherwise. Run in CI after migrations; exits
// non-zero on the first failure.

type Check = { name: string; verify: () => Promise<string | null> };

const checks: Check[] = [
  {
    name: "pgvector extension installed",
    verify: async () => {
      const rows = await client<{ extname: string }[]>`
        SELECT extname FROM pg_extension WHERE extname = 'vector'
      `;
      return rows.length > 0 ? null : "extension 'vector' is not installed";
    },
  },
  {
    name: "embeddings HNSW index exists with vector_cosine_ops",
    verify: async () => {
      const rows = await client<{ method: string; opclass: string }[]>`
        SELECT am.amname AS method, op.opcname AS opclass
        FROM pg_index x
        JOIN pg_class i ON i.oid = x.indexrelid
        JOIN pg_class t ON t.oid = x.indrelid
        JOIN pg_am am ON am.oid = i.relam
        JOIN pg_opclass op ON op.oid = x.indclass[0]
        WHERE t.relname = 'embeddings'
          AND i.relname = 'embeddings_embedding_hnsw_idx'
      `;

      const row = rows[0];

      if (!row) return "index 'embeddings_embedding_hnsw_idx' is missing";
      if (row.method !== "hnsw") return `index uses ${row.method}, not hnsw`;
      if (row.opclass !== "vector_cosine_ops") {
        return `index uses ${row.opclass}, not vector_cosine_ops`;
      }

      return null;
    },
  },
  {
    name: "activity_events rejects UPDATE",
    verify: async () => {
      const rows = await client<{ tgname: string }[]>`
        SELECT tgname FROM pg_trigger
        WHERE tgrelid = 'activity_events'::regclass
          AND NOT tgisinternal
          AND tgname = 'activity_events_immutable'
      `;
      return rows.length > 0
        ? null
        : "trigger 'activity_events_immutable' is missing";
    },
  },
];

async function main() {
  let failed = false;

  for (const check of checks) {
    const failure = await check.verify();

    if (failure) {
      failed = true;
      console.error(`FAIL  ${check.name}: ${failure}`);
    } else {
      console.log(`ok    ${check.name}`);
    }
  }

  if (failed) {
    throw new Error("schema verification failed");
  }
}

try {
  await main();
} finally {
  await client.end();
}
