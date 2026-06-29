import { describe, expect, it } from "vitest";

import appSource from "../App.tsx?raw";

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
});
