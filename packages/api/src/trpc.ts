import { initTRPC } from "@trpc/server"
import superjson from "superjson"

import type { Context } from "./context"

// superjson from the first procedure on purpose: without it Dates arrive as
// strings while the inferred type still says Date. Adding it later means
// touching every procedure and both ends of the wire at once.
const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure
