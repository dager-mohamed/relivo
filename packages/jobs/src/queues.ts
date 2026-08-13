import { Queue } from "bullmq"
import { z } from "zod"

import { connection } from "./connection"

export const COMPANIES_QUEUE = "companies" as const

// Payloads carry IDs, never rows — a serialised row goes stale and inflates
// Redis memory. The worker refetches from Postgres.
export const normalizeDomainPayload = z.object({
  companyId: z.uuid(),
})
export type NormalizeDomainPayload = z.infer<typeof normalizeDomainPayload>

export const simulateFailurePayload = z.object({
  reason: z.string().min(1),
})
export type SimulateFailurePayload = z.infer<typeof simulateFailurePayload>

export const JOB_NAMES = {
  normalizeDomain: "normalize-domain",
  simulateFailure: "simulate-failure",
} as const

export type CompaniesJobs = {
  [JOB_NAMES.normalizeDomain]: NormalizeDomainPayload
  [JOB_NAMES.simulateFailure]: SimulateFailurePayload
}

export const companiesQueue = new Queue(COMPANIES_QUEUE, {
  connection,
  defaultJobOptions: {
    // Unbounded history grows Redis forever, and noeviction turns that into
    // failed writes.
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },

    // No retries by default: a schema violation fails identically every time,
    // and each AI attempt is billed again. Transient failures opt in below.
    attempts: 1,
  },
})

export async function enqueueNormalizeDomain(payload: NormalizeDomainPayload) {
  return companiesQueue.add(
    JOB_NAMES.normalizeDomain,
    normalizeDomainPayload.parse(payload)
  )
}

export async function enqueueSimulateFailure(payload: SimulateFailurePayload) {
  return companiesQueue.add(
    JOB_NAMES.simulateFailure,
    simulateFailurePayload.parse(payload),
    // Stands in for a network/rate-limit failure — the only kind worth retrying.
    { attempts: 3, backoff: { type: "exponential", delay: 1000 } }
  )
}
