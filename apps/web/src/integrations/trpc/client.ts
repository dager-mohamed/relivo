import { createTRPCClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

import { env } from '#/env'

// Type-only — this erasure is what keeps the router implementation, and with
// it postgres/drizzle, out of the client bundle.
import type { AppRouter } from '@repo/api'

function getUrl() {
  // SSR has no origin to be relative to.
  if (typeof window !== 'undefined') return '/api/trpc'
  return `${env.SERVER_URL ?? 'http://localhost:3000'}/api/trpc`
}

export function createTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: getUrl(),
        // Must match the server's transformer or Dates arrive as strings.
        transformer: superjson,
      }),
    ],
  })
}
