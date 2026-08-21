import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth, enabledSocialProviders } from "@repo/auth/server";

// `@repo/auth/server` is only ever touched inside these handlers, and Start
// strips handler bodies (and the imports only they use) from the client
// build. Client code calls these as RPCs.

// null when signed out; { user, session } otherwise.
export const fetchSession = createServerFn({ method: "GET" }).handler(() =>
  auth.api.getSession({ headers: getRequestHeaders() }),
);

// Which sign-in buttons the login page is allowed to render. Derived from env
// on the server, so a deployment without Google credentials shows a hint
// instead of a button that fails at the redirect.
export const fetchAuthProviders = createServerFn({ method: "GET" }).handler(
  () => enabledSocialProviders,
);

// Route guards read this through queryClient.ensureQueryData, so the session
// is fetched once per page load, not once per navigation, and rides the SSR
// dehydration to the client. Nothing invalidates the cookie behind our back —
// sign-in and sign-out both clear this key.
export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: ["auth", "session"] as const,
    queryFn: () => fetchSession(),
    staleTime: Infinity,
  });
