import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["legacy/**", "node_modules/**", "dist/**"],
    pool: "forks",
  },
});
