import { companies } from "@repo/db/schema";
import { desc } from "@repo/db/orm";
import {
  enqueueNormalizeDomain,
  enqueueSimulateFailure,
  normalizeDomainPayload,
  simulateFailurePayload,
} from "@repo/jobs";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const companiesRouter = createTRPCRouter({
  // No explicit return type — the row shape flows from the Drizzle schema all
  // the way to the React component.
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(companies).orderBy(desc(companies.createdAt));
  }),

  // Enqueue only, never process inline: keeps request latency off the external
  // call and survives the request being cancelled.
  normalizeDomain: publicProcedure
    .input(normalizeDomainPayload)
    .mutation(async ({ input }) => {
      const job = await enqueueNormalizeDomain(input);
      return { jobId: job.id };
    }),

  simulateFailure: publicProcedure
    .input(simulateFailurePayload)
    .mutation(async ({ input }) => {
      const job = await enqueueSimulateFailure(input);
      return { jobId: job.id };
    }),
});
