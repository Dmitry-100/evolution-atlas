import { describe, expect, it } from "vitest";
import {
  CODON_DEMO,
  GENETICS_EVIDENCE,
  GENETICS_SOURCES,
  GENOME_COMPARISONS,
  MOLECULAR_MARKERS,
} from "./genetics";

describe("genetics education data", () => {
  it("keeps genome percentages contextual instead of naked similarity claims", () => {
    expect(GENOME_COMPARISONS.length).toBeGreaterThanOrEqual(5);
    expect(GENOME_COMPARISONS.map((item) => item.id)).toContain("human-chimp");
    expect(GENOME_COMPARISONS.map((item) => item.id)).toContain("human-banana");

    for (const item of GENOME_COMPARISONS) {
      expect(item.valueRu.length).toBeGreaterThan(1);
      expect(item.metricRu.length).toBeGreaterThan(35);
      expect(item.meaningRu.length).toBeGreaterThan(60);
      expect(item.cautionRu.length).toBeGreaterThan(45);
      expect(item.source.url).toMatch(/^https?:\/\//);
    }

    const banana = GENOME_COMPARISONS.find((item) => item.id === "human-banana");
    expect(banana?.cautionRu).toMatch(/не/i);
    expect(banana?.metricRu).toMatch(/ортолог/i);
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

  it("highlights molecular scars as concrete evidence markers", () => {
    expect(MOLECULAR_MARKERS.map((item) => item.id)).toEqual([
      "shared-code",
      "chromosome-2",
      "viral-fossils",
    ]);

    for (const marker of MOLECULAR_MARKERS) {
      expect(marker.titleRu.length).toBeGreaterThan(5);
      expect(marker.markerRu.length).toBeGreaterThan(12);
      expect(marker.explanationRu.length).toBeGreaterThan(60);
      expect(marker.confidence).toMatch(/solid|likely|debated/);
      expect(marker.source.url).toMatch(/^https?:\/\//);
    }
  });
});
