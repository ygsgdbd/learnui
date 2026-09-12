import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scanRoots = ["apps/native-gallery", "fixtures/native-expo"];
const allowed = new Set(["@learnui/native", "@learnui/native/styles"]);
const importPattern = /@import\s+["']([^"']+)["']|from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g;
const violations = [];
const extensions = new Set([".css", ".ts", ".tsx"]);

function collectFiles(relativeDir, files = []) {
  for (const entry of readdirSync(join(root, relativeDir))) {
    if (["node_modules", "ios", "android", "dist", ".expo"].includes(entry)) continue;
    const relativePath = join(relativeDir, entry);
    const absolutePath = join(root, relativePath);
    const stat = statSync(absolutePath);
    if (stat.isDirectory()) {
      collectFiles(relativePath, files);
    } else if (extensions.has(extname(entry))) {
      files.push(relativePath);
    }
  }
  return files;
}

for (const scanRoot of scanRoots) {
  for (const file of collectFiles(scanRoot)) {
    const contents = readFileSync(join(root, file), "utf8");
    for (const match of contents.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2] ?? match[3];
      if (specifier?.startsWith("@learnui/native") && !allowed.has(specifier)) {
        violations.push(`${file}: ${specifier}`);
      }
    }
  }
}

if (violations.length > 0) {
  throw new Error(`Native consumers must import only public entries:\n${violations.join("\n")}`);
}
