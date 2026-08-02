import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { createRasterAssetManifest } from "./scripts/asset-manifest.mjs";

const publicDirectory = fileURLToPath(new URL("./public", import.meta.url));

export default defineConfig(({ command }) => {
  const rasterAssetManifest =
    command === "build" ? createRasterAssetManifest(publicDirectory) : {};

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __ASSET_MANIFEST__: JSON.stringify(rasterAssetManifest),
    },
    build: {
      cssTarget: "safari13",
    },
    test: {
      include: ["src/**/*.test.ts"],
      exclude: ["legacy/**", "node_modules/**", "dist/**"],
      pool: "forks",
    },
  };
});
