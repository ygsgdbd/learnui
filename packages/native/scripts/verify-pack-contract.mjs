import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parsePackResult(raw) {
  const lines = raw.trim().split(/\r?\n/);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const candidate = lines.slice(index).join("\n");
    try {
      const parsed = JSON.parse(candidate);
      return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
      // Lifecycle logs can precede pnpm's JSON payload.
    }
  }
  throw new Error("pnpm pack did not print a JSON result");
}

assert(pkg.type === "module", "@learnui/native must be ESM-only");
assert(Object.keys(pkg.exports).join(",") === ".,./styles", "exports must expose only root and ./styles");
assert(pkg.exports["."].types === "./lib/typescript/src/index.d.ts", "root export must expose declarations");
assert(pkg.exports["."]["react-native"] === "./src/index.ts", "root export must expose React Native source");
assert(pkg.exports["."].import === "./lib/module/index.js", "root export must expose Bob ESM fallback");
assert(pkg.exports["./styles"]["react-native"] === "./src/styles.css", "styles export must expose source CSS to Metro");
assert(pkg.exports["./styles"].style === "./src/styles.css", "styles export must expose CSS source to style-aware tools");
assert(pkg.exports["./styles"].default === "./lib/module/styles.css", "styles export must expose copied CSS fallback");
assert(
  JSON.stringify(pkg.files) ===
    JSON.stringify([
      "src",
      "lib",
      "!src/**/__tests__/**",
      "!src/**/__fixtures__/**",
      "!src/**/__mocks__/**",
      "!src/**/*.stories.*",
      "!src/**/*.test.*",
      "!src/**/*.spec.*",
      "README.md",
      "LICENSE"
    ]),
  "package files allowlist changed"
);

const peerNames = Object.keys(pkg.peerDependencies ?? {}).sort();
assert(
  JSON.stringify(peerNames) === JSON.stringify(["react", "react-native", "react-native-reanimated", "tailwindcss", "uniwind"]),
  "Native peer dependency contract changed"
);
assert(!pkg.peerDependencies["react-native-worklets"], "react-native-worklets must not be a direct peer until source imports it");
assert(pkg.peerDependenciesMeta?.["react-native-reanimated"]?.optional !== true, "Reanimated must not be optional");

for (const forbidden of ["expo", "expo-router", "@expo/metro-config", "react-native-worklets"]) {
  assert(!pkg.dependencies?.[forbidden], `${forbidden} must not be a public package dependency`);
}

const packDir = mkdtempSync(join(tmpdir(), "learnui-native-pack-"));
try {
  const raw = execFileSync("pnpm", ["pack", "--pack-destination", packDir, "--json"], {
    cwd: packageRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  });
  const packResult = parsePackResult(raw);
  const tarball = isAbsolute(packResult.filename) ? packResult.filename : join(packDir, packResult.filename);
  const entries = execFileSync("tar", ["-tf", tarball], { encoding: "utf8" })
    .trim()
    .split("\n")
    .sort();
  const entrySet = new Set(entries);

  for (const required of [
    "package/package.json",
    "package/README.md",
    "package/LICENSE",
    "package/src/index.ts",
    "package/src/styles.css",
    "package/lib/module/index.js",
    "package/lib/module/index.js.map",
    "package/lib/module/styles.css",
    "package/lib/typescript/src/index.d.ts",
    "package/lib/typescript/src/index.d.ts.map"
  ]) {
    assert(entrySet.has(required), `packed tarball is missing ${required}`);
  }

  for (const entry of entries) {
    assert(!entry.includes("/scripts/"), `packed tarball must not include scripts: ${entry}`);
    assert(!entry.includes("/fixtures/"), `packed tarball must not include fixtures: ${entry}`);
    assert(!entry.includes("/__tests__/"), `packed tarball must not include tests: ${entry}`);
    assert(!entry.endsWith("metro.config.cjs"), `packed tarball must not include Metro config: ${entry}`);
    assert(!entry.endsWith("app.json"), `packed tarball must not include Expo config: ${entry}`);
  }
} finally {
  rmSync(packDir, { force: true, recursive: true });
}
