import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "amplify-codegen-temp/models",
      "amplify-codegen-temp/models/models",
      "src/ui-components/**",
      "node_modules",
      ".vscode",
      "amplify",
      ".devcontainer",
      "buid",
      "public",
      "infra",
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
  ...compat.config({
    root: true,
    env: {
      browser: true,
      es2023: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
    ],
    overrides: [
      {
        env: {
          node: true,
        },
        files: [".eslintrc.{js,cjs}"],
        parserOptions: {
          sourceType: "script",
        },
      },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: [
      "@typescript-eslint",
      "react",
      "react-hooks",
      "import",
      "simple-import-sort",
      "unused-imports",
      "boundaries",
    ],
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "processes", pattern: "src/processes/**" },
        { type: "pages", pattern: "src/pages/**" },
        { type: "features", pattern: "src/features/**" },
        { type: "entities", pattern: "src/entities/**" },
        { type: "shared", pattern: "src/shared/**" },
        { type: "extensions", pattern: "src/extensions/**" },
      ],
    },
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "unused-imports/no-unused-imports": "error",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/incompatible-library": "warn",
      "react-hooks/static-components": "warn", // render中のコンポーネント定義を警告レベルに
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: "app",
              allow: ["processes", "pages", "features", "entities", "shared"],
            },
            {
              from: "processes",
              allow: ["pages", "features", "entities", "shared"],
            },
            { from: "pages", allow: ["features", "entities", "shared"] },
            { from: "features", allow: ["entities", "shared"] },
            { from: "entities", allow: ["shared"] },
            { from: "shared", allow: ["shared"] },
          ],
          message:
            "依存方向は app -> processes -> pages -> features -> entities -> shared のみ許可されています",
        },
      ],
      "boundaries/no-private": [
        "error",
        {
          allowUncles: false,
          message:
            "features から app/pages/processes への依存は禁止されています",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.property.name='sort']",
          message:
            "Use Array.prototype.toSorted() instead of sort() to avoid mutation.",
        },
        {
          selector: "CallExpression[callee.property.name='reverse']",
          message:
            "Use Array.prototype.toReversed() instead of reverse() to avoid mutation.",
        },
        {
          selector: "CallExpression[callee.property.name='splice']",
          message:
            "Use Array.prototype.toSpliced() instead of splice() to avoid mutation.",
        },
        {
          selector: "CallExpression[callee.property.name='hasOwnProperty']",
          message: "Use Object.hasOwn() instead of hasOwnProperty().",
        },
      ],
      "max-lines-per-function": [
        "warn",
        {
          max: 220,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
    },
  }),
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    ignores: ["src/shared/lib/logger.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "console",
          property: "error",
          message:
            "Use logger.error from @shared/lib/logger instead of console.error in production code.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@mui/material",
              importNames: ["Button", "IconButton", "TextField"],
              message:
                "Use AppButton/AppIconButton from @/shared/ui/button or AppTextField from @/shared/ui/form instead.",
            },
            {
              name: "@mui/material/Button",
              message: "Use AppButton from @/shared/ui/button instead.",
            },
            {
              name: "@mui/material/IconButton",
              message: "Use AppIconButton from @/shared/ui/button instead.",
            },
            {
              name: "@mui/material/TextField",
              message: "Use AppTextField from @/shared/ui/form instead.",
            },
          ],
        },
      ],
    },
  },
  {
    // Discourage hard-coded hex color literals; prefer designTokenVar() from
    // src/shared/designSystem. Existing occurrences should be migrated
    // incrementally — kept as a warning (not error) to avoid blocking CI.
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/shared/designSystem/**",
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "src/__tests__/**",
      "src/**/__tests__/**",
      "src/ui-components/**",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
          message:
            "Avoid hard-coded hex color literals. Use designTokenVar() from @shared/designSystem instead.",
        },
      ],
    },
  },
  {
    files: [
      "src/shared/ui/button/AppButton.tsx",
      "src/shared/ui/button/AppIconButton.tsx",
      "src/shared/ui/form/AppTextField.tsx",
      "src/pages/preview/**/*.{ts,tsx,js,jsx}",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: [
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "playwright/**/*.spec.{ts,tsx}",
    ],
    rules: {
      "max-lines-per-function": "off",
      "no-restricted-properties": "off",
    },
  },
  {
    // Forbid the core/shell layers from depending on extensions. Extensions
    // register themselves via the manifest registry (src/extensions/index.ts).
    // The few well-known integration points (router, store apis, root
    // providers, navigation menu) opt out below.
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/processes/**/*.{ts,tsx}",
      "src/pages/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
      "src/entities/**/*.{ts,tsx}",
      "src/shared/**/*.{ts,tsx}",
      "src/widgets/**/*.{ts,tsx}",
      "src/router.tsx",
      "src/router/**/*.{ts,tsx}",
    ],
    ignores: [
      "src/router.tsx",
      "src/router/adminChildRoutes.tsx",
      "src/router/routePreloaders.ts",
      "src/app/apis/index.ts",
      "src/app/providers/AppRootProviders.tsx",
      "src/widgets/layout/header/NavigationMenu.tsx",
      "src/features/admin/layout/model/adminSplitPanelRegistry.ts",
      "src/pages/shift/management/index.tsx",
      "src/pages/shift/request/index.tsx",
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
      "src/__tests__/**",
      "src/**/__tests__/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@extensions/*", "src/extensions/*", "*/extensions/*"],
              message:
                "Core/shell layers must not depend on extensions. Add contributions to src/extensions/index.ts and let the registry wire them up.",
            },
          ],
        },
      ],
    },
  },
];
