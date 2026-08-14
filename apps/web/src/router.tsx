import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { routeTree } from "./routeTree.gen";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { getTrpcContext } from "./integrations/trpc/root-provider";
import { TRPCProvider } from "./integrations/trpc/react";

export function getRouter() {
  const { queryClient } = getContext();
  const { trpc, trpcClient } = getTrpcContext(queryClient);

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient, trpc, trpcClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    // Don't add a QueryClientProvider here — setupRouterSsrQueryIntegration
    // composes one around this Wrap already.
    Wrap: ({ children }) => (
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    ),
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
