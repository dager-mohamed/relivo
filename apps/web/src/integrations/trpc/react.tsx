import { createTRPCContext } from '@trpc/tanstack-react-query'

import type { AppRouter } from '@repo/api'

// useTRPC() returns query-options builders, not hooks — pass the result to
// useQuery: useQuery(trpc.companies.list.queryOptions())
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
