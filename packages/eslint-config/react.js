import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

import { config as baseConfig } from "./base.js";

/**
 * Shared config for packages that use React.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: { ...globals.browser, ...globals.serviceworker },
    },
    settings: { react: { version: "detect" } },
    plugins: { "react-hooks": pluginReactHooks },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // Unnecessary with the modern JSX transform.
      "react/react-in-jsx-scope": "off",
      // TypeScript already covers this.
      "react/prop-types": "off",
    },
  },
];
