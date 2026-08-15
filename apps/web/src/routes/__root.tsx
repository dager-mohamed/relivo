import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import faviconIco from "@repo/assets/icons/favicon.ico";
import faviconSvg from "@repo/assets/icons/favicon.svg";
import appleTouchIcon from "@repo/assets/icons/png/icon-ink-180.png";

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
        title: "Relivo",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // .ico first as the fallback; browsers that understand SVG take it and
      // get the mark's own light/dark switch for free.
      { rel: "icon", href: faviconIco, sizes: "48x48" },
      { rel: "icon", type: "image/svg+xml", href: faviconSvg },
      // Opaque tile — Apple rejects alpha on touch icons.
      { rel: "apple-touch-icon", href: appleTouchIcon },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // Dark is the designed default; removing this class gives the light theme.
    <html lang="en" className="dark">
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
