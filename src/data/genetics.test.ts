import { describe, expect, it } from "vitest";
import {
  CODON_DEMO,
  GENETICS_EVIDENCE,
  GENETICS_SOURCES,
  GENOME_COMPARISONS,
} from "./genetics";

describe("genetics education data", () => {
  it("keeps genome percentages contextual instead of naked similarity claims", () => {
    expect(GENOME_COMPARISONS.length).toBeGreaterThanOrEqual(4);
    expect(GENOME_COMPARISONS.map((item) => item.id)).toContain("human-chimp");

    for (const item of GENOME_COMPARISONS) {
      expect(item.valueRu.length).toBeGreaterThan(1);
      expect(item.metricRu.length).toBeGreaterThan(35);
      expect(item.meaningRu.length).toBeGreaterThan(60);
      expect(item.cautionRu.length).toBeGreaterThan(45);
      expect(item.source.url).toMatch(/^https?:\/\//);
    }
  });

  it("covers mechanisms, molecular evidence, and codon translation", () => {
    expect(GENETICS_EVIDENCE.map((item) => item.id)).toEqual([
      "shared-code",
      "rna-translation",
      "mutation-variation",
      "comparative-genomics",
      "chromosome-2",
      "viral-fossils",
    ]);

    expect(CODON_DEMO.some((codon) => codon.rnaRu === "AUG")).toBe(true);
    expect(CODON_DEMO.some((codon) => codon.aminoAcidRu.includes("стоп"))).toBe(true);
    expect(GENETICS_SOURCES.length).toBeGreaterThanOrEqual(8);
  });
});
