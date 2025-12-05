module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    // "airbnb-base",
    // "airbnb-typescript",
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
    "import",
    "simple-import-sort",
    "unused-imports",
    "boundaries",
  ],
  ignorePatterns: ["src/ui-components/*"],
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
    "@typescript-eslint/no-unused-vars": "off",
    // Temporarily relax explicit any rule to reduce noise while we iteratively add types.
    // TODO: revert to 'error' and fix usages gradually.
    "@typescript-eslint/no-explicit-any": "warn",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
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
  },
};
