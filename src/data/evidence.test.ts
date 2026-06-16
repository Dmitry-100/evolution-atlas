import { describe, expect, it } from "vitest";
import { EVIDENCE_MODULES, SCIENTIFIC_THEORY_EXPLAINER } from "./evidence";

describe("evidence data", () => {
  it("explains that scientific theory does not mean a casual guess", () => {
    expect(SCIENTIFIC_THEORY_EXPLAINER.titleRu).toMatch(/теори/i);
    expect(SCIENTIFIC_THEORY_EXPLAINER.bodyRu).toMatch(/объясн/i);
    expect(SCIENTIFIC_THEORY_EXPLAINER.bodyRu).toMatch(/провер/i);
    expect(SCIENTIFIC_THEORY_EXPLAINER.bodyRu).not.toMatch(/просто догадка|только догадка/i);
  });

  it("covers the major evidence families for evolution", () => {
    expect(EVIDENCE_MODULES.map((module) => module.id)).toEqual([
      "fossils",
      "molecular",
      "comparative-anatomy",
      "embryology",
      "biogeography",
      "observed-evolution",
    ]);

    for (const module of EVIDENCE_MODULES) {
      expect(module.titleRu.length).toBeGreaterThan(5);
      expect(module.summaryRu.length).toBeGreaterThan(60);
      expect(module.exampleRu.length).toBeGreaterThan(30);
      expect(module.source.url).toMatch(/^https?:\/\//);
    }
  });
});
