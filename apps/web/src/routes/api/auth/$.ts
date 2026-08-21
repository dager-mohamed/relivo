import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@repo/auth/server";

// Same reason as routes/api/trpc/$.ts — see the note there.
import type {} from "@tanstack/react-start";

// Better Auth owns every path under here: /api/auth/sign-in/social,
// /api/auth/callback/google, /api/auth/sign-out, /api/auth/get-session. The
// Response it returns carries Set-Cookie itself, so nothing else has to.
function handler({ request }: { request: Request }) {
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
});
