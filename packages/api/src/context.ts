import { db } from "@repo/db";

import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

// Built per request. `session` lands here once Better Auth is in.
export function createContext(opts: FetchCreateContextFnOptions) {
  return {
    db,
    headers: opts.req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
