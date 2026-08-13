import { db } from "@repo/db"
import { companies } from "@repo/db/schema"
import { eq } from "@repo/db/orm"
import { Worker, UnrecoverableError } from "bullmq"

import { connection } from "../connection"
import {
  COMPANIES_QUEUE,
  JOB_NAMES,
  normalizeDomainPayload,
  simulateFailurePayload,
} from "../queues"

async function normalizeDomain(raw: unknown) {
  const parsed = normalizeDomainPayload.safeParse(raw)

  // UnrecoverableError skips remaining attempts — a bad payload stays bad.
  if (!parsed.success) {
    throw new UnrecoverableError(`invalid payload: ${parsed.error.message}`)
  }

  const { companyId } = parsed.data

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1)

  if (!company) {
    throw new UnrecoverableError(`company ${companyId} no longer exists`)
  }

  const normalized = company.domain.trim().toLowerCase()

  if (normalized === company.domain) {
    return { companyId, changed: false }
  }

  await db
    .update(companies)
    .set({ domain: normalized })
    .where(eq(companies.id, companyId))

  return { companyId, changed: true }
}

async function simulateFailure(raw: unknown) {
  const { reason } = simulateFailurePayload.parse(raw)
  throw new Error(`simulated failure: ${reason}`)
}

export function createCompaniesWorker() {
  const worker = new Worker(
    COMPANIES_QUEUE,
    async (job) => {
      switch (job.name) {
        case JOB_NAMES.normalizeDomain:
          return normalizeDomain(job.data)
        case JOB_NAMES.simulateFailure:
          return simulateFailure(job.data)
        default:
          throw new UnrecoverableError(`unknown job name: ${job.name}`)
      }
    },
    {
      connection,

      // 2 min, not the 30s default. AI calls run 60–90s; a job that outlives
      // its lock is re-run as stalled — paid for twice, duplicate rows written.
      lockDuration: 120_000,

      // IO-bound on an external API, so this is "calls in flight", not cores.
      concurrency: 3,
      limiter: { max: 10, duration: 1000 },
    }
  )

  worker.on("completed", (job) => {
    console.log(`[companies] completed ${job.name} (${job.id})`)
  })

  worker.on("failed", (job, err) => {
    const attempts = job ? `${job.attemptsMade}/${job.opts.attempts ?? 1}` : "?"
    console.error(
      `[companies] failed ${job?.name} (${job?.id}) attempt ${attempts}: ${err.message}`
    )
  })

  return worker
}
