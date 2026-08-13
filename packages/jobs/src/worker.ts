import { connection } from "./connection"
import { createCompaniesWorker } from "./workers/companies"

// Separate process from the web app. `turbo run dev` starts both.
const workers = [createCompaniesWorker()]

console.log(`[jobs] worker up, ${workers.length} queue(s) listening`)

let shuttingDown = false

async function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true

  console.log(`[jobs] ${signal} received, draining…`)

  // close() waits for in-flight jobs. Skipping it leaves them locked for
  // lockDuration (2 min) before another worker can retry.
  await Promise.all(workers.map((w) => w.close()))
  await connection.quit()

  console.log("[jobs] worker down")
  process.exit(0)
}

process.on("SIGINT", () => void shutdown("SIGINT"))
process.on("SIGTERM", () => void shutdown("SIGTERM"))
