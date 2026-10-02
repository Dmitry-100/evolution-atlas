import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { createRasterAssetManifest } from "./scripts/asset-manifest.mjs";

const publicDirectory = fileURLToPath(new URL("./public", import.meta.url));
const prerenderedPaths = new Set<string>(
  JSON.parse(
    readFileSync(
      new URL("./config/public-routes.json", import.meta.url),
      "utf8",
    ),
  ).map((route: { path: string }) => route.path),
);

export default defineConfig(({ command }) => {
  const rasterAssetManifest =
    command === "build" ? createRasterAssetManifest(publicDirectory) : {};

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "preview-prerendered-routes",
        configurePreviewServer(server) {
          // Match the extensionless route objects uploaded by deploy-yc.yml.
          server.middlewares.use((request, _response, next) => {
            const url = new URL(request.url ?? "/", "http://localhost");
            const path = url.pathname.replace(/\/$/, "");
            if (prerenderedPaths.has(path)) {
              request.url = `${path}/index.html${url.search}`;
            }
            next();
          });
        },
      },
    ],
    define: {
      __ASSET_MANIFEST__: JSON.stringify(rasterAssetManifest),
    },
    build: {
      manifest: true,
      cssTarget: "safari13",
    },
    test: {
      include: ["src/**/*.test.ts"],
      exclude: ["legacy/**", "node_modules/**", "dist/**"],
      pool: "forks",
    },
  };
});
