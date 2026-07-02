/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import appSource from "../App.tsx?raw";

const packageJson = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe("app bundle policy", () => {
  it("keeps the home atlas eager but lazy-loads non-home pages", () => {
    expect(appSource).toContain('import { AtlasPage } from "./pages/AtlasPage"');
    expect(appSource).toContain("BodyMapPage");
    expect(appSource).toContain("lazy(");
    expect(appSource).toContain("<Suspense");

    for (const pageName of [
      "AboutPage",
      "BodyMapPage",
      "ExtinctionsPage",
      "MaterialsPage",
      "SourcesPage",
      "TheoryPage",
      "DinosaursPage",
      "QuizPage",
      "OriginOfLifePage",
      "CladogramPage",
      "GeneticsPage",
      "PrimatesPage",
    ]) {
      expect(appSource).not.toMatch(
        new RegExp(`import \\\\{ ${pageName} \\\\} from "\\\\./pages/`),
      );
    }
  });

  it("handles unknown routes and render failures without a blank screen", () => {
    expect(appSource).toContain("RouteErrorBoundary");
    expect(appSource).toContain("NotFoundPage");
    expect(appSource).toContain('path="*"');
  });

  it("lazy-loads DarwinGuide so lineage data is not in the initial bundle", () => {
    expect(appSource).not.toMatch(
      /import \{ DarwinGuide \} from "\.\/components\/ai\/DarwinGuide"/,
    );
    expect(appSource).toContain("DarwinGuide");
    expect(appSource).toContain("lazy(");
  });

  it("does not ship the removed tab animation library in app dependencies", () => {
    expect(packageJson.dependencies).not.toHaveProperty("framer-motion");
  });
});
