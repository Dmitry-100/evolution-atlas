import { describe, expect, it } from "vitest";
import { ERAS, STAGES, getStageById, primateStages } from "./lineage";

describe("lineage data", () => {
  it("contains a single typed stage set with source-backed image metadata", () => {
    expect(STAGES.length).toBeGreaterThanOrEqual(35);
    expect(ERAS.length).toBeGreaterThanOrEqual(6);

    const ids = new Set<string>();
    for (const stage of STAGES) {
      expect(ids.has(stage.id), `duplicate id ${stage.id}`).toBe(false);
      ids.add(stage.id);
      expect(stage.ageMa).toBeGreaterThanOrEqual(0);
      expect(stage.summaryRu.length).toBeGreaterThan(30);
      expect(stage.whyMattersRu.length).toBeGreaterThan(30);
      expect(stage.image.altRu.length).toBeGreaterThan(10);
      expect(stage.image.credit.length).toBeGreaterThan(2);
      expect(stage.image.src).toMatch(/^\/assets\/images\/source-backed\//);
      expect(stage.image.sourceUrl).toMatch(/^https?:\/\//);
      expect(stage.image.license).not.toMatch(/локальный проектный ассет/i);
      expect(stage.sources.length).toBeGreaterThan(0);
    }
  });

  it("uses early Cambrian chordate dating instead of the legacy 600 Ma label", () => {
    const chordates = getStageById("chordates");
    expect(chordates?.ageMa).toBeGreaterThanOrEqual(505);
    expect(chordates?.ageMa).toBeLessThanOrEqual(520);
  });

  it("marks primate-focused stages for the zoomed mode", () => {
    expect(primateStages.length).toBeGreaterThanOrEqual(10);
    expect(primateStages[0]?.id).toBe("early-primates");
    expect(primateStages.some((stage) => stage.id === "sapiens")).toBe(true);
  });
});
