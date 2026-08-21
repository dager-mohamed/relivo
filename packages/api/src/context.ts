import { auth } from "@repo/auth/server";
import { db } from "@repo/db";

import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

// Built per request. One session lookup here, not one per procedure — a batch
// of ten queries arrives as a single HTTP request and shares this context.
export async function createContext(opts: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({ headers: opts.req.headers });

  return {
    db,
    headers: opts.req.headers,
    // null when signed out. protectedProcedure narrows it; see trpc.ts.
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
