import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

const externalPeers = [
  "react",
  "react-dom",
  "react-aria-components",
  "tailwindcss"
];

function isExternalPeer(id: string): boolean {
  return externalPeers.some((peer) => id === peer || id.startsWith(`${peer}/`));
}

function removeCssEntryChunk(entryName: string): Plugin {
  return {
    name: "learnui-remove-css-entry-chunk",
    generateBundle(_options, bundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type === "chunk" && output.name === entryName) {
          delete bundle[fileName];
        }
      }
    }
  };
}

function preserveEmptyEntrySourceMap(entryName: string, sourcePath: string): Plugin {
  return {
    name: "learnui-preserve-empty-entry-sourcemap",
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk" || output.name !== entryName) {
          continue;
        }

        if (output.map) {
          continue;
        }

        output.code = `${output.code}\n//# sourceMappingURL=${output.fileName}.map\n`;
        this.emitFile({
          type: "asset",
          fileName: `${output.fileName}.map`,
          source: JSON.stringify({
            version: 3,
            file: output.fileName,
            sources: [
              "../src/index.ts"
            ],
            sourcesContent: [
              readFileSync(sourcePath, "utf8")
            ],
            names: [],
            mappings: ""
          })
        });
      }
    }
  };
}

const configDir = dirname(fileURLToPath(import.meta.url));
const indexEntry = resolve(configDir, "src/index.ts");
const stylesEntry = resolve(configDir, "src/styles.css");

export default defineConfig({
  plugins: [
    tailwindcss(),
    removeCssEntryChunk("styles"),
    preserveEmptyEntrySourceMap("index", indexEntry)
  ],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: indexEntry,
        styles: stylesEntry
      },
      formats: [
        "es"
      ],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: "styles"
    },
    sourcemap: true,
    rolldownOptions: {
      external: isExternalPeer
    }
  }
});
