import { createFileRoute } from "@tanstack/react-router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createContext } from "@repo/api";

// Loads the declaration merge that adds `server` to route options. Nothing
// else in src/ imports a Start package, so without this it's a type error.
import type {} from "@tanstack/react-start";

// The only file in apps/web importing the router implementation. Server-only
// (no component), so it's stripped from the client build.
function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    // Must match the client's httpBatchLink url.
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext,
  });
}

export const Route = createFileRoute("/api/trpc/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
});
