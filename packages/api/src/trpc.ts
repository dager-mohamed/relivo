import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

import type { Context } from "./context";

// superjson from the first procedure on purpose: without it Dates arrive as
// strings while the inferred type still says Date. Adding it later means
// touching every procedure and both ends of the wire at once.
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

// Everything that touches workspace data should end up here. The routers are
// still public while RELIV-32 (workspace-scoped middleware) is outstanding —
// that task extends this middleware with the workspace lookup rather than
// adding a second one.
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Re-passing session is what narrows it to non-null downstream.
  return next({ ctx: { session: ctx.session } });
});
