import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  timeout: 30_000,
  // Parallel software-rendered WebGL backgrounds starve CI browser actions.
  workers: process.env.CI ? 1 : undefined,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: "disabled",
      // macOS and Linux rasterize the same fallback fonts differently. The
      // approved layout remains strict while allowing that platform noise.
      maxDiffPixelRatio: 0.1,
    },
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    // Keep decorative WebGL animation from starving browser actions on CI.
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 960 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 15"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: "corepack pnpm dev --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
});
