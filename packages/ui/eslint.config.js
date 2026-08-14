import { config } from "@repo/eslint-config/react";

export default [
  ...config,
  {
    // Written by the shadcn CLI and overwritten on every `add` — fixing lint
    // findings here would be undone the next time a component is installed.
    ignores: ["src/components/**"],
  },
];
