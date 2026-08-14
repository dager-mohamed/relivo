import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import globals from "globals";

/**
 * Shared base config: TypeScript + Node. React packages extend ./react.js.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      // projectService turns on type-aware rules. tsconfigRootDir defaults to
      // cwd, which is the package root when turbo runs the lint script.
      parserOptions: { projectService: true },
      globals: { ...globals.node },
    },
    plugins: { turbo: turboPlugin },
    rules: {
      "turbo/no-undeclared-env-vars": "error",

      // The main bug class here: async is everywhere in workers and AI calls,
      // and a dropped promise fails silently. Both need type information.
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",

      // Match the tsconfig's noUnusedLocals, with an underscore escape hatch.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // Config files (eslint.config.js and friends) live outside any tsconfig,
    // so type-aware rules can't run on them.
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  // Must stay last: turns off every rule that would fight Prettier.
  eslintConfigPrettier,
  {
    ignores: ["dist/**", ".output/**", ".nitro/**", ".turbo/**"],
  },
];
