#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const extensionsRoot = join(repoRoot, "src", "extensions");
const indexFile = join(extensionsRoot, "index.ts");

const name = process.argv[2];

if (!name) {
  console.error("Usage: node scripts/create-extension.mjs <kebab-case-name>");
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error(
    `Invalid extension name "${name}". Use kebab-case (e.g. my-feature).`,
  );
  process.exit(1);
}

const dir = join(extensionsRoot, name);
if (existsSync(dir)) {
  console.error(`Extension directory already exists: ${dir}`);
  process.exit(1);
}

const camel = name
  .split("-")
  .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
  .join("");
const manifestVar = `${camel}Manifest`;

mkdirSync(dir, { recursive: true });

const manifestSrc = `import type { ExtensionManifest } from "../_types";

export const ${manifestVar}: ExtensionManifest = {
  name: "${name}",
  // isEnabled: (derived) => !!derived?.someFlag,
  // routes: [],
  // adminRoutes: [],
  // menuItems: [],
  // providers: [],
  // rtkApis: [],
};
`;

writeFileSync(join(dir, "manifest.ts"), manifestSrc);
writeFileSync(
  join(dir, "README.md"),
  `# ${name}\n\nExtension module. See \`docs/EXTENSION_ARCHITECTURE.md\`.\n`,
);

// Register in src/extensions/index.ts.
const indexSrc = readFileSync(indexFile, "utf8");
const importLine = `import { ${manifestVar} } from "./${name}/manifest";`;
const importBlockMatch = indexSrc.match(
  /(import \{ [^}]+ \} from "\.\/[^"]+\/manifest";\n)+/,
);
let updated = indexSrc;
if (importBlockMatch) {
  const imports = importBlockMatch[0].trim().split("\n");
  imports.push(importLine);
  imports.sort();
  updated = updated.replace(importBlockMatch[0], imports.join("\n") + "\n");
}

const arrayMatch = updated.match(
  /(export const extensionManifests: ReadonlyArray<ExtensionManifest> = \[)([\s\S]*?)(\];)/,
);
if (arrayMatch) {
  const items = arrayMatch[2]
    .split("\n")
    .map((s) => s.trim().replace(/,$/, ""))
    .filter(Boolean);
  items.push(manifestVar);
  items.sort();
  const body = items.map((item) => `  ${item},`).join("\n");
  updated = updated.replace(
    arrayMatch[0],
    `${arrayMatch[1]}\n${body}\n${arrayMatch[3]}`,
  );
}

writeFileSync(indexFile, updated);

console.log(`Created extension "${name}":`);
console.log(`  - ${join("src/extensions", name, "manifest.ts")}`);
console.log(`  - ${join("src/extensions", name, "README.md")}`);
console.log(`  - Registered in src/extensions/index.ts`);
console.log("");
console.log("Next: edit manifest.ts to define routes/menuItems/etc.");
