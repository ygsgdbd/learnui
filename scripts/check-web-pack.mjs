import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const packageDir = join(repoRoot, "packages/web");
const manifestPath = join(packageDir, "package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const requiredPeers = [
  "react",
  "react-dom",
  "react-aria-components",
  "tailwindcss"
];
const requiredDistFiles = [
  "dist/index.js",
  "dist/index.js.map",
  "dist/index.d.ts",
  "dist/index.d.ts.map",
  "dist/styles.css",
  "dist/styles.d.ts",
  "dist/styles.d.ts.map"
];
const allowedMetadata = new Set([
  "package.json",
  "README.md",
  "LICENSE"
]);
const forbiddenPatterns = [
  /(^|\/)\.storybook(\/|$)/,
  /(^|\/)apps\//,
  /(^|\/)docs\//,
  /(^|\/)fixtures\//,
  /(^|\/)research\//,
  /(^|\/)src\//,
  /(^|\/)__fixtures__(\/|$)/,
  /(^|\/)__mocks__(\/|$)/,
  /(^|\/)__tests__(\/|$)/,
  /\.stories\./,
  /\.test\./,
  /\.spec\./,
  /(^|\/)tsconfig\./,
  /(^|\/)vite\.config\./
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    ...options
  });

  if (result.status !== 0) {
    fail(`${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  }

  return result.stdout.trim();
}

function parsePackOutput(output) {
  const arrayStart = output.indexOf("[");
  const objectStart = output.indexOf("{");
  const starts = [arrayStart, objectStart].filter((index) => index >= 0);
  const jsonStart = Math.min(...starts);
  assert(jsonStart >= 0, `Unable to parse pnpm pack output:\n${output}`);
  const parsed = JSON.parse(output.slice(jsonStart));
  return Array.isArray(parsed) ? parsed : [parsed];
}

assert(manifest.type === "module", "@learnui/web must be ESM-only");
assert(Array.isArray(manifest.files), "@learnui/web must declare a files allowlist");
assert(
  manifest.files.length === 1 && manifest.files[0] === "dist",
  '@learnui/web files allowlist must be exactly ["dist"]'
);
assert(
  JSON.stringify(Object.keys(manifest.exports)) === JSON.stringify([".", "./styles"]),
  '@learnui/web exports must contain only "." and "./styles"'
);
assert(!manifest.exports["./package.json"], "@learnui/web must not export package.json");
assert(!manifest.scripts?.postinstall, "@learnui/web must not mutate consumers in postinstall");
assert(!manifest.scripts?.preinstall, "@learnui/web must not mutate consumers in preinstall");
assert(!manifest.scripts?.prepare, "@learnui/web must not rely on prepare for consumers");
assert(
  Array.isArray(manifest.sideEffects) && manifest.sideEffects.includes("**/*.css"),
  "@learnui/web must mark CSS as a side effect"
);

for (const peer of requiredPeers) {
  assert(manifest.peerDependencies?.[peer], `${peer} must be a peer dependency`);
  assert(manifest.devDependencies?.[peer], `${peer} must be a development dependency`);
  assert(!manifest.dependencies?.[peer], `${peer} must not be bundled through dependencies`);
}

for (const file of requiredDistFiles) {
  assert(existsSync(join(packageDir, file)), `${file} is missing`);
}

const indexSource = readFileSync(join(packageDir, "src/index.ts"), "utf8");
assert(!/styles\.css|\.\/styles/.test(indexSource), "JavaScript root must not import CSS");

const packDir = join(tmpdir(), `learnui-web-pack-${process.pid}`);
rmSync(packDir, {
  recursive: true,
  force: true
});
mkdirSync(packDir, {
  recursive: true
});

try {
  const packOutput = run("pnpm", [
    "--dir",
    packageDir,
    "pack",
    "--pack-destination",
    packDir,
    "--json"
  ]);
  const [packed] = parsePackOutput(packOutput);
  const tarballPath = packed.filename.startsWith("/")
    ? packed.filename
    : join(packageDir, packed.filename);
  const files = run("tar", [
    "-tzf",
    tarballPath
  ]).split("\n").filter(Boolean);
  const normalizedFiles = files.map((file) => file.replace(/^package\//, ""));

  for (const file of normalizedFiles) {
    assert(
      file.startsWith("dist/") || allowedMetadata.has(file),
      `Unexpected file in @learnui/web tarball: ${file}`
    );
    assert(
      forbiddenPatterns.every((pattern) => !pattern.test(file)),
      `Forbidden file leaked into @learnui/web tarball: ${file}`
    );
  }

  for (const file of requiredDistFiles) {
    assert(normalizedFiles.includes(file), `${file} is missing from the tarball`);
  }

  const packageJsonInTarball = normalizedFiles.includes("package.json");
  assert(packageJsonInTarball, "package.json is missing from the tarball");
  console.log(`@learnui/web pack check passed: ${relative(repoRoot, tarballPath)}`);
} finally {
  rmSync(packDir, {
    recursive: true,
    force: true
  });
}
