import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../schema";

// Select only. Users are created and updated by Better Auth, not by our
// routers, so an insert schema here would describe a path that doesn't exist.
// Same reason there is no session.ts / account.ts / verification.ts: nothing
// outside Better Auth reads or writes those three, and `session` reaches
// procedures through the tRPC context, already typed.
export const userSelect = createSelectSchema(users);
export type UserSelect = z.infer<typeof userSelect>;

// What is safe to hand to a client — the avatar and name on a deal card, and
// nothing about verification state.
export const userPublic = userSelect.pick({
  id: true,
  name: true,
  image: true,
});
export type UserPublic = z.infer<typeof userPublic>;
