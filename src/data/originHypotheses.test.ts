import { describe, expect, it } from "vitest";
import { ORIGIN_HYPOTHESES, ORIGIN_SOURCES } from "./originHypotheses";

describe("origin of life hypotheses data", () => {
  it("covers the main competing origin-of-life scenarios", () => {
    expect(ORIGIN_HYPOTHESES.map((item) => item.id)).toEqual([
      "primordial-soup",
      "rna-world",
      "hydrothermal-vents",
      "metabolism-first",
      "lipid-world",
      "panspermia",
    ]);
  });

  it("keeps every hypothesis explanatory, falsifiable, and sourced", () => {
    const sourceLabels = new Set(ORIGIN_SOURCES.map((source) => source.label));

    for (const hypothesis of ORIGIN_HYPOTHESES) {
      expect(hypothesis.mechanismRu.length).toBeGreaterThan(60);
      expect(hypothesis.evidenceRu.length).toBeGreaterThan(60);
      expect(hypothesis.openQuestionRu.length).toBeGreaterThan(40);
      expect(hypothesis.sourceLabels.length).toBeGreaterThan(0);

      for (const label of hypothesis.sourceLabels) {
        expect(sourceLabels.has(label)).toBe(true);
      }
    }
  });
});
