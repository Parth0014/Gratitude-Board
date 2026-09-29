import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const productDirectories = ["assets", "components"];
const hostComponents = new Set([
  "components/AppFooter.tsx",
  "components/AppMainMenu.tsx",
  "components/DebugCanvas.tsx",
  "components/TopErrorBoundary.tsx",
]);
const sourceFile = /\.(?:ts|tsx)$/;
const engineImport = /from\s+["']@excalidraw\//;

const walk = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory()
      ? walk(entryPath)
      : sourceFile.test(entry.name)
      ? [entryPath]
      : [];
  });

describe("vision studio architecture", () => {
  it("keeps product UI and asset providers independent of editor internals", () => {
    const violations = productDirectories.flatMap((directory) =>
      walk(path.join(appRoot, directory)).flatMap((file) =>
        engineImport.test(fs.readFileSync(file, "utf8")) &&
        !hostComponents.has(path.relative(appRoot, file).replaceAll("\\", "/"))
          ? [path.relative(appRoot, file)]
          : [],
      ),
    );

    expect(violations).toEqual([]);
  });
});
