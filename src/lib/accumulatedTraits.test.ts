import { describe, expect, it } from "vitest";
import { getStageById, sortedStages } from "../data/lineage";
import { getAccumulatedTraitGroups } from "./accumulatedTraits";

describe("accumulated traits", () => {
  it("collects inherited traits from older stages through the selected stage", () => {
    const sapiens = getStageById("sapiens");
    const groups = getAccumulatedTraitGroups(sortedStages, sapiens!);
    const traits = groups.flatMap((group) => group.traits);

    expect(traits).toContain("мембраны");
    expect(traits).toContain("хорда");
    expect(traits).toContain("язык");
    expect(traits).not.toContain("родственная ветвь");
  });

  it("grows as the selected stage moves forward in time", () => {
    const chordates = getStageById("chordates");
    const sapiens = getStageById("sapiens");

    const earlyCount = getAccumulatedTraitGroups(sortedStages, chordates!).reduce((sum, group) => sum + group.traits.length, 0);
    const lateCount = getAccumulatedTraitGroups(sortedStages, sapiens!).reduce((sum, group) => sum + group.traits.length, 0);

    expect(lateCount).toBeGreaterThan(earlyCount);
  });
});
