import { describe, expect, it } from "vitest";
import { getStageById, sortedStages } from "../data/lineage";
import { compareStages } from "./stageComparison";

describe("stage comparison", () => {
  it("compares two stages and extracts traits that appeared between them", () => {
    const chordates = getStageById("chordates");
    const sapiens = getStageById("sapiens");
    const comparison = compareStages(sortedStages, chordates!, sapiens!);

    expect(comparison.older.id).toBe("chordates");
    expect(comparison.younger.id).toBe("sapiens");
    expect(comparison.ageGapMa).toBeGreaterThan(500);
    expect(comparison.newTraits).toContain("язык");
    expect(comparison.newTraits).not.toContain("хорда");
  });
});
