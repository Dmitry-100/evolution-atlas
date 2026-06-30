import { describe, expect, it } from "vitest";
import { MASS_EXTINCTIONS } from "../data/extinctions";
import { getStageById, sortedStages } from "../data/lineage";
import {
  buildTimelineItems,
  getNearestStageForTimelineItem,
} from "./timelineItems";

describe("timeline items", () => {
  it("threads ancient mass extinctions into the deep-time sequence", () => {
    const items = buildTimelineItems(sortedStages, MASS_EXTINCTIONS);
    const extinctionIds = items
      .filter((item) => item.kind === "extinction")
      .map((item) => item.event.id);

    expect(extinctionIds).toEqual([
      "ordovician-silurian",
      "late-devonian",
      "permian-triassic",
      "triassic-jurassic",
      "cretaceous-paleogene",
    ]);
    expect(extinctionIds).not.toContain("holocene-anthropocene");
  });

  it("keeps extinction events in chronological arrow order", () => {
    const items = buildTimelineItems(sortedStages, MASS_EXTINCTIONS);
    const ids = items.map((item) => item.id);

    expect(ids.indexOf("therapsids")).toBeLessThan(
      ids.indexOf("extinction-permian-triassic"),
    );
    expect(ids.indexOf("extinction-permian-triassic")).toBeLessThan(
      ids.indexOf("cynodonts"),
    );
    expect(ids.indexOf("extinction-cretaceous-paleogene")).toBeLessThan(
      ids.indexOf("after-kpg"),
    );
  });

  it("uses the nearest biological stage for accumulated-trait context", () => {
    const items = buildTimelineItems(sortedStages, MASS_EXTINCTIONS);
    const permian = items.find(
      (item) =>
        item.kind === "extinction" && item.event.id === "permian-triassic",
    );

    expect(permian).toBeDefined();
    expect(getNearestStageForTimelineItem(sortedStages, permian!)).toEqual(
      getStageById("cynodonts"),
    );
  });
});
