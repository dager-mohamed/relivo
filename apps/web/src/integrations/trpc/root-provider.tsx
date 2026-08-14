import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { createTrpcClient } from "./client";

import type { QueryClient } from "@tanstack/react-query";
import type { AppRouter } from "@repo/api";

// Reuses the router context's QueryClient so a loader can prefetch on the
// server and the component reads cache instead of refetching.
export function getTrpcContext(queryClient: QueryClient) {
  const trpcClient = createTrpcClient();

  const trpc = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
  });

  return { trpcClient, trpc };
}

export type TrpcContext = ReturnType<typeof getTrpcContext>;
