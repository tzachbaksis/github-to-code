import { defineConfig, type Plugin } from "vite";
import { resolve } from "path";
import { readdirSync, unlinkSync } from "fs";
import { viteStaticCopy } from "vite-plugin-static-copy";

// Determine which entry to build via env var (defaults to all via build script)
const entry = process.env.BUILD_ENTRY;

function contentConfig() {
  return defineConfig({
    build: {
      outDir: "dist",
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, "src/content/index.ts"),
        formats: ["iife"],
        name: "GithubToCode",
        fileName: () => "src/content/index.js",
      },
      rollupOptions: {
        output: {
          assetFileNames: "src/content/index.css",
        },
      },
    },
  });
}

function popupConfig() {
  return defineConfig({
    root: resolve(__dirname, "src/popup"),
    base: "./",
    build: {
      outDir: resolve(__dirname, "dist/src/popup"),
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(__dirname, "src/popup/index.html"),
        output: {
          entryFileNames: "popup.js",
          assetFileNames: (assetInfo) => {
            const name = assetInfo.names?.[0] ?? assetInfo.name ?? "";
            if (name.endsWith(".css")) return "style.css";
            return "[name][extname]";
          },
          inlineDynamicImports: true,
        },
      },
    },
  });
}

function serviceWorkerConfig() {
  return defineConfig({
    build: {
      outDir: "dist",
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, "src/background/service-worker.ts"),
        formats: ["iife"],
        name: "ServiceWorker",
        fileName: () => "src/background/service-worker.js",
      },
    },
  });
}

function staticConfig() {
  return defineConfig({
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: "virtual-empty",
      },
    },
    plugins: [
      {
        name: "virtual-empty",
        resolveId(id) {
          if (id === "virtual-empty") return id;
        },
        load(id) {
          if (id === "virtual-empty") return "";
        },
        closeBundle() {
          // Clean up the empty virtual chunk
          const assetsDir = resolve(__dirname, "dist/assets");
          try {
            for (const f of readdirSync(assetsDir)) {
              if (f.startsWith("virtual-empty")) {
                unlinkSync(resolve(assetsDir, f));
              }
            }
          } catch {
            // ignore
          }
        },
      } satisfies Plugin,
      viteStaticCopy({
        targets: [
          { src: "public/manifest.json", dest: "." },
          { src: "src/assets/logo/*", dest: "assets/logo" },
        ],
      }),
    ],
  });
}

const configs: Record<string, () => ReturnType<typeof defineConfig>> = {
  static: staticConfig,
  content: contentConfig,
  popup: popupConfig,
  "service-worker": serviceWorkerConfig,
};

export default entry && configs[entry] ? configs[entry]() : contentConfig();
