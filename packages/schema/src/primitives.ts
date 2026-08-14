import { z } from "zod";

// Integer minor units (cents). The feedback board sums deal values on every
// render, and float addition drifts.
export const money = z.int().min(0);
export type Money = z.infer<typeof money>;

// A bare hostname — no protocol, no path, at least one dot. Normalisation of
// user input (stripping https://, www.) is the normalizeDomain job's business;
// this only decides what is accepted.
export const domain = z
  .string()
  .trim()
  .toLowerCase()
  .max(253)
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/,
    "Must be a domain like example.com",
  );
export type Domain = z.infer<typeof domain>;
