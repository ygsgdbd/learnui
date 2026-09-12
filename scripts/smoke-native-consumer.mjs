import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureTemplate = join(root, "fixtures", "native-expo");
const nativePackage = join(root, "packages", "native");
const smokeRoot = mkdtempSync(join(tmpdir(), "learnui-native-consumer-"));
const packDir = join(smokeRoot, "pack");
const consumerDir = join(smokeRoot, "consumer");

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    env: {
      ...process.env,
      CI: "1"
    },
    stdio: "inherit"
  });
}

function capture(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    env: {
      ...process.env,
      CI: "1"
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"]
  });
}

function readVersion(packageJsonPath) {
  return JSON.parse(readFileSync(packageJsonPath, "utf8")).version;
}

function collectInstalledVersions(packageName) {
  const versions = new Set();
  const directPackageJson = join(consumerDir, "node_modules", packageName, "package.json");

  if (existsSync(directPackageJson)) {
    versions.add(readVersion(directPackageJson));
  }

  const pnpmStore = join(consumerDir, "node_modules", ".pnpm");

  if (existsSync(pnpmStore)) {
    for (const entry of readdirSync(pnpmStore)) {
      const packageJsonPath = join(pnpmStore, entry, "node_modules", packageName, "package.json");

      if (existsSync(packageJsonPath)) {
        versions.add(readVersion(packageJsonPath));
      }
    }
  }

  return versions;
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

function assertIncludes(contents, expected, label) {
  if (!contents.includes(expected)) {
    throw new Error(`${label} must include ${expected}`);
  }
}

function assertMatches(contents, pattern, label) {
  if (!pattern.test(contents)) {
    throw new Error(`${label} must match ${pattern}`);
  }
}

function readExportOutput(directory) {
  return readdirSync(directory, { withFileTypes: true }).map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? readExportOutput(path) : readFileSync(path).toString("utf8").replaceAll("\0", "");
  }).join("\n");
}

try {
  run("pnpm", ["--filter", "@learnui/native", "run", "build"], root);
  mkdirSync(packDir, { recursive: true });

  const rawPack = capture("pnpm", ["pack", "--pack-destination", packDir, "--json"], nativePackage);
  const packResult = parsePackResult(rawPack);
  const tarball = isAbsolute(packResult.filename) ? packResult.filename : join(packDir, packResult.filename);

  cpSync(fixtureTemplate, consumerDir, { recursive: true });
  cpSync(tarball, join(consumerDir, "learnui-native.tgz"));

  run("pnpm", ["install"], consumerDir);

  const consumerGlobalCss = readFileSync(join(consumerDir, "global.css"), "utf8");
  assertIncludes(consumerGlobalCss, '@import "@learnui/native/styles";', "consumer global CSS");
  assertIncludes(consumerGlobalCss, "#6750a4", "consumer color override");
  assertIncludes(consumerGlobalCss, '"Avenir Next"', "consumer font override");
  assertIncludes(consumerGlobalCss, "--learnui-radius-control: 18px", "consumer control radius override");
  assertIncludes(consumerGlobalCss, "--learnui-radius-surface: 28px", "consumer surface radius override");
  assertIncludes(consumerGlobalCss, "--learnui-shadow-surface", "consumer surface shadow override");

  const installedStyles = readFileSync(
    join(consumerDir, "node_modules", "@learnui", "native", "src", "styles.css"),
    "utf8"
  );
  assertIncludes(installedStyles, '@source ".";', "installed package styles");
  assertIncludes(installedStyles, "--learnui-color-accent", "installed package styles");

  const consumerScreen = readFileSync(join(consumerDir, "app", "index.tsx"), "utf8");
  assertIncludes(consumerScreen, "bg-[--learnui-color-canvas]", "consumer screen");
  assertIncludes(consumerScreen, "text-[--learnui-color-foreground]", "consumer screen");
  assertIncludes(consumerScreen, "font-[--learnui-font-sans]", "consumer screen");
  assertIncludes(consumerScreen, "rounded-[--learnui-radius-control]", "consumer screen");
  assertIncludes(consumerScreen, "rounded-[--learnui-radius-surface]", "consumer screen");
  assertIncludes(consumerScreen, "shadow-[--learnui-shadow-surface]", "consumer screen");
  assertIncludes(consumerScreen, 'backgroundColor: "#123456"', "consumer style override");
  assertIncludes(consumerScreen, 'import { Badge, Divider, Spinner } from "@learnui/native";', "consumer public import");
  assertIncludes(consumerScreen, "<Badge>Pending review</Badge>", "consumer default Badge");
  assertIncludes(consumerScreen, 'variant="solid"', "consumer solid Badge");
  assertIncludes(consumerScreen, 'className="px-5"', "consumer Badge class override");
  assertIncludes(consumerScreen, "<Divider />", "consumer default Divider");
  assertIncludes(consumerScreen, 'borderTopColor: "#2468ac"', "consumer Divider override");
  assertIncludes(consumerScreen, '<Spinner label="Loading fixture" />', "consumer standalone Spinner");
  assertIncludes(consumerScreen, "isDecorative", "consumer decorative Spinner");
  assertIncludes(consumerScreen, 'height: 32', "consumer Spinner size override");

  run("pnpm", ["run", "typecheck"], consumerDir);
  run(
    "pnpm",
    ["exec", "expo", "export", "--platform", "ios", "--output-dir", "dist/ios", "--no-bytecode", "--no-minify"],
    consumerDir
  );
  run(
    "pnpm",
    ["exec", "expo", "export", "--platform", "android", "--output-dir", "dist/android", "--no-bytecode", "--no-minify"],
    consumerDir
  );

  for (const platform of ["ios", "android"]) {
    const exportOutput = readExportOutput(join(consumerDir, "dist", platform));
    assertIncludes(exportOutput, "text-[--lui-badge-solid-foreground]", `${platform} Badge solid styles`);
    assertIncludes(exportOutput, "bg-[--learnui-color-foreground]/10", `${platform} Badge default styles`);
    assertIncludes(exportOutput, "Pending review", `${platform} Badge text`);
    assertMatches(exportOutput, /borderRadius:\s*6/, `${platform} Badge style override`);
    assertIncludes(exportOutput, "px-5", `${platform} Badge class override`);
    assertIncludes(exportOutput, "#6750a4", `${platform} export color override`);
    assertIncludes(exportOutput, "Avenir Next", `${platform} export font override`);
    assertMatches(
      exportOutput,
      /"--learnui-radius-control":\s*(?:\([^)]*\)\s*=>|vars\s*=>)\s*18/,
      `${platform} export control radius override`
    );
    assertMatches(
      exportOutput,
      /"--learnui-radius-surface":\s*(?:\([^)]*\)\s*=>|vars\s*=>)\s*28/,
      `${platform} export surface radius override`
    );
    assertIncludes(exportOutput, "#6750a43d", `${platform} export surface shadow override`);
    assertIncludes(exportOutput, "#123456", `${platform} export consumer style override`);
    assertIncludes(exportOutput, "border-[--learnui-color-border]", `${platform} default Divider styles`);
    assertIncludes(exportOutput, "hairlineWidth", `${platform} Divider hairline weight`);
    assertIncludes(exportOutput, "#2468ac", `${platform} Divider color override`);
    assertMatches(
      exportOutput,
      /borderTopWidth:\s*4/,
      `${platform} Divider thickness override`
    );
    assertIncludes(exportOutput, "--learnui-color-accent", `${platform} Spinner accent token`);
    assertIncludes(exportOutput, "useCSSVariable", `${platform} Spinner token resolution`);
    assertIncludes(exportOutput, "borderRightColor", `${platform} Spinner native border color`);
    assertIncludes(exportOutput, "Loading fixture", `${platform} Spinner accessible label`);
    assertMatches(exportOutput, /height:\s*32/, `${platform} Spinner size override`);
  }

  for (const runtime of ["react", "react-native"]) {
    const runtimeVersions = collectInstalledVersions(runtime);
    if (runtimeVersions.size !== 1) {
      throw new Error(`${runtime} must resolve to one version, found ${[...runtimeVersions].join(", ") || "none"}`);
    }
  }

  for (const runtime of ["react", "react-native"]) {
    const nestedRuntime = join(consumerDir, "node_modules", "@learnui", "native", "node_modules", runtime);
    if (existsSync(nestedRuntime)) {
      throw new Error(`@learnui/native must not install nested ${runtime}`);
    }
  }

  const installedPackage = JSON.parse(
    readFileSync(join(consumerDir, "node_modules", "@learnui", "native", "package.json"), "utf8")
  );
  if (installedPackage.version !== "0.0.0") {
    throw new Error(`installed unexpected @learnui/native version ${installedPackage.version}`);
  }

  console.log(`Native consumer smoke passed with ${basename(tarball)}`);
} finally {
  rmSync(smokeRoot, { force: true, recursive: true });
}
