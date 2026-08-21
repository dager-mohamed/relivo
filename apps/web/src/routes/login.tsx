import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";

import iconInk from "@repo/assets/icons/icon-ink.svg";
import iconPaper from "@repo/assets/icons/icon-paper.svg";
import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";

import { GoogleIcon } from "#/components/icons/google";
import { sessionQueryOptions } from "#/lib/auth/session";

// Where a fresh sign-in lands. Deals, never a setup wizard.
const AFTER_LOGIN = "/deals";

// `redirect` comes off the URL, so it is attacker-controlled: an absolute or
// protocol-relative value would send the next click to another origin.
function sanitizeRedirect(value: unknown): string | undefined {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : undefined;
}

export const Route = createFileRoute("/login")({
  // The return type is annotated, not inferred: it is what makes `redirect`
  // optional for callers navigating here with no target in mind.
  validateSearch: (search: { redirect?: unknown }): { redirect?: string } => ({
    redirect: sanitizeRedirect(search.redirect),
  }),
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.ensureQueryData(
      sessionQueryOptions(),
    );

    // Already signed in — nothing to show. Straight through to where they
    // were headed.
    if (session) {
      throw redirect({ to: search.redirect ?? AFTER_LOGIN });
    }
  },
  head: () => ({ meta: [{ title: "Sign in · Relivo" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function continueWithGoogle() {
    setPending(true);
    setError(null);

    // On success the browser leaves for Google, so the code below only runs
    // when the handoff itself failed.
    const result = await authClient.signIn.social({
      provider: "google",
      callbackURL: redirectTo ?? AFTER_LOGIN,
    });

    if (result.error) {
      setError(result.error.message ?? "Could not reach Google. Try again.");
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-svh place-items-center px-6 py-10">
      <div className="w-full max-w-[21.5rem] text-center">
        {/* The brand tile, not the bare mark: icon-{ink,paper}.svg exist for
            exactly this — the symbol on its own ground. Rounded here rather
            than in the asset, so the same file still serves square slots. */}
        <img
          src={iconInk}
          alt="Relivo"
          className="mx-auto size-10 rounded-surface dark:hidden"
        />
        <img
          src={iconPaper}
          alt="Relivo"
          className="mx-auto hidden size-10 rounded-surface dark:block"
        />

        <h1 className="mt-6 text-3xl leading-[1.15] font-semibold">Sign in</h1>

        <p className="mt-2 text-sm leading-6 text-pretty text-muted-foreground">
          Your pipeline, the feedback blocking it, and what happens next.
        </p>

        {/* Full width and 44px, matched to the reference: one control, so it
            spans the column rather than floating in it. Outline because the
            default variant is near-white in dark mode — a slab, not a button.
            rounded-surface over rounded-control for the same reason the tile
            above is: nothing is nested here, so the corner can breathe. */}
        <Button
          variant="outline"
          size="lg"
          className="mt-7 h-11 w-full gap-2.5 rounded-surface text-sm"
          aria-busy={pending}
          disabled={pending}
          onClick={() => void continueWithGoogle()}
        >
          {pending ? (
            <Spinner className="size-[1.125rem]" />
          ) : (
            <GoogleIcon className="size-[1.125rem]" />
          )}
          {pending ? "Redirecting" : "Continue with Google"}
        </Button>

        {error ? (
          <p role="alert" className="mt-3 text-[0.8125rem] text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}
