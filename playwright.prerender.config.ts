import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testDir: "./e2e-production",
  outputDir: ".deploy/prerender-test-results",
  workers: 2,
  use: { ...base.use, baseURL: "http://127.0.0.1:4181" },
  webServer: {
    command: "corepack pnpm preview --host 127.0.0.1 --port 4181 --strictPort",
    url: "http://127.0.0.1:4181",
    reuseExistingServer: false,
  },
});
