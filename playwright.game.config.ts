import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// A frozen production build prevents concurrent portal editing/HMR from resetting a game mid-test.
export default defineConfig({
  ...base,
  testMatch: "game.spec.ts",
  outputDir: ".deploy/game-test-results",
  use: { ...base.use, baseURL: "http://127.0.0.1:4180" },
  webServer: {
    command:
      "corepack pnpm exec vite preview --outDir .deploy/game-preview --host 127.0.0.1 --port 4180 --strictPort",
    url: "http://127.0.0.1:4180/game",
    reuseExistingServer: false,
  },
});
