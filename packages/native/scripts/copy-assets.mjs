import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const moduleOutput = join(packageRoot, "lib", "module");

mkdirSync(moduleOutput, { recursive: true });
copyFileSync(join(packageRoot, "src", "styles.css"), join(moduleOutput, "styles.css"));
