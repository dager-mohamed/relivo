/**
 * Fixtures for building screens before the routers exist. Typed against the
 * real Drizzle select types, so a schema change breaks these at compile time
 * rather than letting a screen drift from the database.
 *
 * The `import type` matters: types erase at build, so nothing here pulls
 * drizzle-orm into the client bundle. Do not import the runtime zod schemas
 * from `@repo/db/zod` in this folder — that would.
 *
 * Delete a file the moment its screen reads from tRPC.
 */
export { workspace } from "./workspace";
export { companies } from "./companies";
export { people } from "./people";
export { dealStages, deals } from "./deals";
export { defaultFavorites } from "./favorites";
