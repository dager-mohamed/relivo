import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import type { TrpcContext } from "../integrations/trpc/root-provider";

interface MyRouterContext {
  queryClient: QueryClient;
  // `trpc` is the TanStack Query options proxy — route loaders use it for
  // server-side prefetch (see routes/companies.tsx). Both are types only, so
  // no server code reaches the browser through this file.
  trpc: TrpcContext["trpc"];
  trpcClient: TrpcContext["trpcClient"];
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
