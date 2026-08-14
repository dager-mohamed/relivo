import IORedis from "ioredis";

const url = process.env.REDIS_URL;

if (!url) {
  throw new Error("REDIS_URL is not set. See .env.example at the repo root.");
}

// maxRetriesPerRequest: null is required by BullMQ — workers use blocking
// commands that ioredis would otherwise abort, killing the worker loop.
export const connection = new IORedis(url, {
  maxRetriesPerRequest: null,
});
