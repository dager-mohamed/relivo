import type { User } from "@repo/db";

const now = new Date("2026-08-15T09:00:00Z");

/** The signed-in user, until Better Auth lands and `ctx.session` is real. */
export const currentUser: User = {
  id: "usr_3f1c0a2e0000",
  name: "Moe Amaya",
  email: "moe@relivo.app",
  emailVerified: true,
  image: null,
  createdAt: now,
  updatedAt: now,
};
