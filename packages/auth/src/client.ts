import { createAuthClient } from "better-auth/react";

// No baseURL: it defaults to the page's own origin, which is what a
// self-hosted deployment on an unknown domain needs.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
