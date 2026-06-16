import { describe, expect, it } from "vitest";
import {
  ageMaToPosition,
  findNearestStage,
  formatAgeRu,
  sortStagesOldestFirst,
} from "./timeline";

describe("timeline math", () => {
  const stages = [
    { id: "sapiens", ageMa: 0.3 },
    { id: "tiktaalik", ageMa: 375 },
    { id: "eukaryotes", ageMa: 1800 },
    { id: "cell-lines", ageMa: 4000 },
  ];

  it("places older stages to the left and recent stages to the right on a logarithmic scale", () => {
    expect(ageMaToPosition(4000)).toBeLessThan(ageMaToPosition(375));
    expect(ageMaToPosition(375)).toBeLessThan(ageMaToPosition(0.3));
  });

  it("finds the nearest visible stage by rendered position", () => {
    expect(findNearestStage(stages, 0)?.id).toBe("cell-lines");
    expect(findNearestStage(stages, 1)?.id).toBe("sapiens");
  });

  it("formats Russian dates consistently", () => {
    expect(formatAgeRu(4000)).toBe("4 млрд лет назад");
    expect(formatAgeRu(375)).toBe("375 млн лет назад");
    expect(formatAgeRu(0.3)).toBe("300 тыс. лет назад");
  });

  it("sorts oldest first without mutating the input", () => {
    const sorted = sortStagesOldestFirst(stages);
    expect(sorted.map((stage) => stage.id)).toEqual([
      "cell-lines",
      "eukaryotes",
      "tiktaalik",
      "sapiens",
    ]);
    expect(stages[0]?.id).toBe("sapiens");
  });
});
