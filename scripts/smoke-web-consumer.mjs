import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const packageDir = join(repoRoot, "packages/web");
const fixtureDir = join(repoRoot, "fixtures/web-consumer");
const workRoot = join(tmpdir(), `learnui-web-consumer-${process.pid}`);
const consumerDir = join(workRoot, "consumer");
const packDir = join(workRoot, "pack");
const mutableOutput = new Set([
  "dist",
  "node_modules",
  "pnpm-lock.yaml"
]);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function getCssRule(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1];
}

function assertCssRuleIncludes(css, selector, declarations, message) {
  const rule = getCssRule(css, selector);
  assert(
    rule !== undefined && declarations.every((declaration) => rule.includes(declaration)),
    message
  );
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: consumerDir,
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

function listFiles(dir, base = dir) {
  return readdirSync(dir, {
    withFileTypes: true
  }).flatMap((entry) => {
    const absolutePath = join(dir, entry.name);
    const relativePath = relative(base, absolutePath);

    if (mutableOutput.has(relativePath.split("/")[0])) {
      return [];
    }

    if (entry.isDirectory()) {
      return listFiles(absolutePath, base);
    }

    return [relativePath];
  }).sort();
}

function hashConsumerFiles(dir) {
  const hash = createHash("sha256");

  for (const file of listFiles(dir)) {
    const absolutePath = join(dir, file);
    hash.update(file);
    hash.update("\0");
    hash.update(readFileSync(absolutePath));
    hash.update("\0");
  }

  return hash.digest("hex");
}

function findPackageRootFromEntry(entryPath) {
  let current = dirname(entryPath);

  while (current !== dirname(current)) {
    if (existsSync(join(current, "package.json"))) {
      return current;
    }

    current = dirname(current);
  }

  fail(`Unable to find package root for ${entryPath}`);
}

function assertSingleRuntime(packageName, consumerRequire, webEntryPath) {
  const consumerRuntime = realpathSync(consumerRequire.resolve(`${packageName}/package.json`));
  const webRequire = createRequire(webEntryPath);
  const webRuntime = realpathSync(webRequire.resolve(`${packageName}/package.json`));

  assert(
    consumerRuntime === webRuntime,
    `${packageName} resolved to multiple runtimes:\nconsumer: ${consumerRuntime}\n@learnui/web: ${webRuntime}`
  );
}

rmSync(workRoot, {
  recursive: true,
  force: true
});
mkdirSync(packDir, {
  recursive: true
});
cpSync(fixtureDir, consumerDir, {
  recursive: true
});

try {
  const packOutput = spawnSync("pnpm", [
    "--dir",
    packageDir,
    "pack",
    "--pack-destination",
    packDir,
    "--json"
  ], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  assert(
    packOutput.status === 0,
    `pnpm pack failed\n${packOutput.stdout}\n${packOutput.stderr}`
  );
  const [packed] = parsePackOutput(packOutput.stdout.trim());
  const tarballPath = packed.filename.startsWith("/")
    ? packed.filename
    : join(packageDir, packed.filename);

  const manifestPath = join(consumerDir, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.dependencies = {
    ...manifest.dependencies,
    "@learnui/web": `file:${tarballPath}`
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const beforeInstallHash = hashConsumerFiles(consumerDir);
  run("pnpm", [
    "install"
  ]);
  run("pnpm", [
    "typecheck"
  ]);
  run("pnpm", [
    "build"
  ]);
  const afterBuildHash = hashConsumerFiles(consumerDir);
  assert(beforeInstallHash === afterBuildHash, "Consumer source or config files changed during install/build");

  const consumerRequire = createRequire(join(consumerDir, "package.json"));
  const webEntryPath = consumerRequire.resolve("@learnui/web");
  const webPackageRoot = findPackageRootFromEntry(webEntryPath);
  assert(
    statSync(join(webPackageRoot, "dist/styles.css")).isFile(),
    "@learnui/web/styles did not install a CSS target"
  );
  assertSingleRuntime("react", consumerRequire, webEntryPath);
  assertSingleRuntime("react-dom", consumerRequire, webEntryPath);

  const builtCss = listFiles(join(consumerDir, "dist"))
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(join(consumerDir, "dist", file), "utf8"))
    .join("\n");
  assert(
    builtCss.includes("--learnui-color-accent") && builtCss.includes("#0071e3"),
    "Consumer production build is missing default LearnUI CSS tokens"
  );
  assert(
    builtCss.includes("#6750a4"),
    "Consumer production build is missing the fixture color override"
  );
  assert(builtCss.includes("Avenir Next"), "Consumer production build is missing the fixture font override");
  assert(builtCss.includes("18px"), "Consumer production build is missing the fixture control radius override");
  assert(builtCss.includes("28px"), "Consumer production build is missing the fixture surface radius override");
  assert(
    builtCss.includes("0 12px 32px"),
    "Consumer production build is missing the fixture surface shadow override"
  );
  assertCssRuleIncludes(
    builtCss,
    ".learnui-divider--horizontal",
    ["border-block-start-width:var(--lui-divider-thickness)", "width:100%"],
    "Consumer production build is missing default Divider styles"
  );
  assertCssRuleIncludes(
    builtCss,
    ".learnui-consumer-divider-override",
    [
      "border-block-start-color:var(--learnui-color-accent)",
      "border-block-start-width:4px"
    ],
    "Consumer production build is missing the Divider consumer override"
  );
  assertCssRuleIncludes(
    builtCss,
    ".learnui-spinner__indicator",
    ["animation:", "learnui-spinner-rotate", "border-radius:9999px"],
    "Consumer production build is missing default Spinner styles"
  );
  assertCssRuleIncludes(
    builtCss,
    ".learnui-consumer-spinner-override",
    ["color:var(--learnui-color-accent)", "height:32px", "width:32px"],
    "Consumer production build is missing the Spinner consumer override"
  );

  assertCssRuleIncludes(builtCss, ".learnui-badge", ["display:inline-block"],
    "Consumer production build is missing default Badge styles");
  assertCssRuleIncludes(builtCss, ".learnui-badge--solid", ["background-color:var(--lui-badge-color)"],
    "Consumer production build is missing solid Badge styles");
  assertCssRuleIncludes(builtCss, ".learnui-consumer-badge-override", ["border-radius:6px", "padding-inline:12px"],
    "Consumer production build is missing Badge consumer overrides");


  assertCssRuleIncludes(builtCss, ".learnui-card", ["display:flex", "flex-direction:column"], "Missing Card styles");
  assertCssRuleIncludes(builtCss, ".learnui-consumer-card-override", ["padding:28px"], "Missing Card override");
  console.log(`@learnui/web consumer smoke passed: ${relative(repoRoot, consumerDir)}`);
} finally {
  rmSync(workRoot, {
    recursive: true,
    force: true
  });
}
